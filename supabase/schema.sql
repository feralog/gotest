-- ============================================
-- GOTEST DATABASE SCHEMA
-- ============================================
-- Este script cria todas as tabelas e políticas necessárias
-- para o sistema de autenticação e progresso de quizzes

-- ============================================
-- 1. TABELA DE PERFIS DE USUÁRIO
-- ============================================
-- Estende a tabela auth.users do Supabase com informações adicionais

CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para busca rápida por username
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON public.user_profiles(username);

-- ============================================
-- 2. TABELA DE PROGRESSO POR MÓDULO
-- ============================================
-- Armazena o progresso geral do usuário em cada módulo/quiz

CREATE TABLE IF NOT EXISTS public.user_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    specialty TEXT NOT NULL, -- ex: "go", "cardiopneumo"
    subcategory TEXT, -- ex: "avc1", "avc2" (pode ser NULL)
    module_id TEXT NOT NULL, -- ex: "anatomia", "embrio"

    -- Controle de questões
    current_question_index INTEGER DEFAULT 0, -- Índice da próxima questão a responder
    total_questions INTEGER DEFAULT 0,
    questions_completed INTEGER DEFAULT 0, -- Questões respondidas pelo menos 1 vez

    -- Estatísticas
    correct_answers INTEGER DEFAULT 0,
    incorrect_answers INTEGER DEFAULT 0,
    completion_percentage DECIMAL(5,2) DEFAULT 0.00, -- 0 a 100

    -- Timestamps
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE, -- Quando completou 100%

    -- Constraint: cada usuário só tem 1 registro por módulo
    UNIQUE(user_id, specialty, subcategory, module_id)
);

-- Índices para busca rápida
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON public.user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_module ON public.user_progress(specialty, subcategory, module_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_completion ON public.user_progress(user_id, completion_percentage);

-- ============================================
-- 3. TABELA DE ESTATÍSTICAS POR QUESTÃO
-- ============================================
-- Armazena estatísticas detalhadas de cada questão individual

CREATE TABLE IF NOT EXISTS public.question_stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    specialty TEXT NOT NULL,
    subcategory TEXT,
    module_id TEXT NOT NULL,
    question_index INTEGER NOT NULL, -- Índice da questão no array JSON

    -- Estatísticas da questão
    times_seen INTEGER DEFAULT 0,
    times_correct INTEGER DEFAULT 0,
    times_incorrect INTEGER DEFAULT 0,

    -- Histórico
    first_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_answer_correct BOOLEAN, -- NULL se nunca respondeu

    -- Constraint: cada usuário só tem 1 registro por questão
    UNIQUE(user_id, specialty, subcategory, module_id, question_index)
);

-- Índices para busca rápida
CREATE INDEX IF NOT EXISTS idx_question_stats_user_id ON public.question_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_question_stats_module ON public.question_stats(specialty, subcategory, module_id);
CREATE INDEX IF NOT EXISTS idx_question_stats_question ON public.question_stats(user_id, specialty, subcategory, module_id, question_index);

-- ============================================
-- 4. FUNÇÃO: Atualizar timestamp automaticamente
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para user_profiles
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 5. FUNÇÃO: Criar perfil automaticamente ao registrar
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, username, display_name)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'display_name', SPLIT_PART(NEW.email, '@', 1))
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil quando novo usuário se registra
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 6. ROW LEVEL SECURITY (RLS) - SEGURANÇA
-- ============================================
-- Garante que usuários só acessem seus próprios dados

-- Ativar RLS em todas as tabelas
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_stats ENABLE ROW LEVEL SECURITY;

-- Políticas para user_profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
CREATE POLICY "Users can view their own profile"
    ON public.user_profiles
    FOR SELECT
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
CREATE POLICY "Users can update their own profile"
    ON public.user_profiles
    FOR UPDATE
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;
CREATE POLICY "Users can insert their own profile"
    ON public.user_profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Políticas para user_progress
DROP POLICY IF EXISTS "Users can view their own progress" ON public.user_progress;
CREATE POLICY "Users can view their own progress"
    ON public.user_progress
    FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own progress" ON public.user_progress;
CREATE POLICY "Users can insert their own progress"
    ON public.user_progress
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own progress" ON public.user_progress;
CREATE POLICY "Users can update their own progress"
    ON public.user_progress
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Políticas para question_stats
DROP POLICY IF EXISTS "Users can view their own question stats" ON public.question_stats;
CREATE POLICY "Users can view their own question stats"
    ON public.question_stats
    FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own question stats" ON public.question_stats;
CREATE POLICY "Users can insert their own question stats"
    ON public.question_stats
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own question stats" ON public.question_stats;
CREATE POLICY "Users can update their own question stats"
    ON public.user_progress
    FOR UPDATE
    USING (auth.uid() = user_id);

-- ============================================
-- 7. VIEWS ÚTEIS (OPCIONAL)
-- ============================================

-- View: Resumo de progresso por usuário
CREATE OR REPLACE VIEW user_progress_summary AS
SELECT
    up.user_id,
    u.username,
    COUNT(DISTINCT up.module_id) as total_modules_started,
    COUNT(DISTINCT CASE WHEN up.completion_percentage = 100 THEN up.module_id END) as modules_completed,
    AVG(up.completion_percentage) as avg_completion,
    SUM(up.correct_answers) as total_correct,
    SUM(up.incorrect_answers) as total_incorrect,
    MAX(up.last_activity) as last_activity
FROM public.user_progress up
JOIN public.user_profiles u ON u.id = up.user_id
GROUP BY up.user_id, u.username;

-- ============================================
-- 8. DADOS DE EXEMPLO (OPCIONAL - COMENTADO)
-- ============================================
-- Descomente para inserir dados de teste

/*
-- Inserir usuário de teste (você precisará fazer o registro normal via app)
-- Este é apenas um exemplo de como os dados ficam

INSERT INTO public.user_progress (user_id, specialty, subcategory, module_id, current_question_index, total_questions, questions_completed, completion_percentage)
VALUES
    ('uuid-do-usuario', 'go', 'avc1', 'anatomia', 15, 20, 15, 75.00),
    ('uuid-do-usuario', 'go', 'avc1', 'embrio', 5, 20, 5, 25.00);
*/

-- ============================================
-- FIM DO SCHEMA
-- ============================================

-- Verificar se tudo foi criado com sucesso
SELECT 'Schema criado com sucesso!' as status,
       'Tabelas: user_profiles, user_progress, question_stats' as tables,
       'RLS habilitado em todas as tabelas' as security;

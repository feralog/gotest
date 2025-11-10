-- ============================================
-- MIGRATION: Adicionar Campo selected_answer
-- ============================================
-- Execute este SQL no Supabase SQL Editor
-- Dashboard > Seu Projeto > SQL Editor > New Query

-- Adicionar a coluna selected_answer
ALTER TABLE public.question_stats
ADD COLUMN IF NOT EXISTS selected_answer INTEGER;

-- Verificar se foi criada
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'question_stats'
AND column_name = 'selected_answer';

-- Você deve ver:
-- column_name      | data_type | is_nullable
-- -----------------+-----------+-------------
-- selected_answer  | integer   | YES

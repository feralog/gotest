/**
 * ============================================
 * SUPABASE CONFIGURATION
 * ============================================
 *
 * Este arquivo contém a configuração do Supabase para autenticação e backend.
 *
 * IMPORTANTE: Após criar seu projeto no Supabase, você deve:
 * 1. Substituir SUPABASE_URL pelo URL do seu projeto
 * 2. Substituir SUPABASE_ANON_KEY pela sua anon/public key
 *
 * Encontre essas informações em: Supabase Dashboard > Settings > API
 */

// ============================================
// CONFIGURAÇÃO DO SUPABASE
// ============================================

const SUPABASE_URL = 'https://lhoioxybjlzgjsxlbbyf.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxob2lveHliamx6Z2pzeGxiYnlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3OTg5NjIsImV4cCI6MjA3ODM3NDk2Mn0.Ta2kvaFYBecb8jrSRlAjMTDkL3xp3Dh8nZrPGKufP-M'

// Inicializar cliente Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// ============================================
// AUTHENTICATION SERVICE
// ============================================

const AuthService = {
    /**
     * Registrar novo usuário
     * @param {string} email - Email do usuário
     * @param {string} password - Senha (mínimo 6 caracteres)
     * @param {string} username - Nome de usuário
     * @param {string} displayName - Nome completo para exibição
     */
    async signUp(email, password, username, displayName) {
        try {
            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        username: username,
                        display_name: displayName
                    }
                }
            })

            if (error) throw error

            return { success: true, user: data.user }
        } catch (error) {
            console.error('Erro no registro:', error)
            return { success: false, error: error.message }
        }
    },

    /**
     * Fazer login
     * @param {string} email - Email do usuário
     * @param {string} password - Senha
     */
    async signIn(email, password) {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password
            })

            if (error) throw error

            return { success: true, user: data.user, session: data.session }
        } catch (error) {
            console.error('Erro no login:', error)
            return { success: false, error: error.message }
        }
    },

    /**
     * Fazer logout
     */
    async signOut() {
        try {
            const { error } = await supabase.auth.signOut()
            if (error) throw error
            return { success: true }
        } catch (error) {
            console.error('Erro no logout:', error)
            return { success: false, error: error.message }
        }
    },

    /**
     * Obter usuário atual
     */
    async getCurrentUser() {
        try {
            const { data: { user }, error } = await supabase.auth.getUser()
            if (error) {
                // Não é um erro se não houver sessão ativa
                if (error.message.includes('session') || error.message.includes('Session')) {
                    return null
                }
                throw error
            }
            return user
        } catch (error) {
            // Erro esperado se não houver sessão
            return null
        }
    },

    /**
     * Verificar se está autenticado
     */
    async isAuthenticated() {
        const user = await this.getCurrentUser()
        return user !== null
    },

    /**
     * Obter perfil do usuário
     */
    async getUserProfile() {
        try {
            const user = await this.getCurrentUser()
            if (!user) return null

            const { data, error } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            if (error) throw error
            return data
        } catch (error) {
            console.error('Erro ao obter perfil:', error)
            return null
        }
    },

    /**
     * Atualizar perfil do usuário
     * @param {Object} updates - Dados a atualizar (username, display_name)
     */
    async updateProfile(updates) {
        try {
            const user = await this.getCurrentUser()
            if (!user) throw new Error('Usuário não autenticado')

            const { data, error } = await supabase
                .from('user_profiles')
                .update(updates)
                .eq('id', user.id)
                .select()
                .single()

            if (error) throw error
            return { success: true, data }
        } catch (error) {
            console.error('Erro ao atualizar perfil:', error)
            return { success: false, error: error.message }
        }
    },

    /**
     * Atualizar senha
     * @param {string} newPassword - Nova senha
     */
    async updatePassword(newPassword) {
        try {
            const { data, error } = await supabase.auth.updateUser({
                password: newPassword
            })

            if (error) throw error
            return { success: true }
        } catch (error) {
            console.error('Erro ao atualizar senha:', error)
            return { success: false, error: error.message }
        }
    },

    /**
     * Listener para mudanças de autenticação
     * @param {Function} callback - Função chamada quando auth muda
     */
    onAuthStateChange(callback) {
        return supabase.auth.onAuthStateChange((event, session) => {
            callback(event, session)
        })
    }
}

// ============================================
// DATA SYNC SERVICE
// ============================================

const DataSyncService = {
    /**
     * Salvar progresso de um módulo
     */
    async saveModuleProgress(specialty, subcategory, moduleId, progressData) {
        try {
            const user = await AuthService.getCurrentUser()
            if (!user) throw new Error('Usuário não autenticado')

            const { data, error } = await supabase
                .from('user_progress')
                .upsert({
                    user_id: user.id,
                    specialty: specialty,
                    subcategory: subcategory,
                    module_id: moduleId,
                    current_question_index: progressData.currentQuestionIndex,
                    total_questions: progressData.totalQuestions,
                    questions_completed: progressData.questionsCompleted,
                    correct_answers: progressData.correctAnswers,
                    incorrect_answers: progressData.incorrectAnswers,
                    completion_percentage: progressData.completionPercentage,
                    last_activity: new Date().toISOString(),
                    completed_at: progressData.completionPercentage >= 100 ? new Date().toISOString() : null
                }, {
                    onConflict: 'user_id,specialty,subcategory,module_id'
                })
                .select()

            if (error) throw error
            return { success: true, data }
        } catch (error) {
            console.error('Erro ao salvar progresso do módulo:', error)
            return { success: false, error: error.message }
        }
    },

    /**
     * Obter progresso de um módulo
     */
    async getModuleProgress(specialty, subcategory, moduleId) {
        try {
            const user = await AuthService.getCurrentUser()
            if (!user) return null

            const { data, error } = await supabase
                .from('user_progress')
                .select('*')
                .eq('user_id', user.id)
                .eq('specialty', specialty)
                .eq('subcategory', subcategory)
                .eq('module_id', moduleId)
                .single()

            if (error && error.code !== 'PGRST116') throw error // PGRST116 = not found
            return data
        } catch (error) {
            console.error('Erro ao obter progresso do módulo:', error)
            return null
        }
    },

    /**
     * Obter todo o progresso do usuário
     */
    async getAllProgress() {
        try {
            const user = await AuthService.getCurrentUser()
            if (!user) return []

            const { data, error } = await supabase
                .from('user_progress')
                .select('*')
                .eq('user_id', user.id)
                .order('last_activity', { ascending: false })

            if (error) throw error
            return data || []
        } catch (error) {
            console.error('Erro ao obter progresso:', error)
            return []
        }
    },

    /**
     * Salvar estatísticas de uma questão
     */
    async saveQuestionStats(specialty, subcategory, moduleId, questionIndex, stats) {
        try {
            const user = await AuthService.getCurrentUser()
            if (!user) throw new Error('Usuário não autenticado')

            const { data, error } = await supabase
                .from('question_stats')
                .upsert({
                    user_id: user.id,
                    specialty: specialty,
                    subcategory: subcategory,
                    module_id: moduleId,
                    question_index: questionIndex,
                    times_seen: stats.timesSeen,
                    times_correct: stats.timesCorrect,
                    times_incorrect: stats.timesIncorrect,
                    last_seen_at: new Date().toISOString(),
                    last_answer_correct: stats.lastAnswerCorrect
                }, {
                    onConflict: 'user_id,specialty,subcategory,module_id,question_index'
                })
                .select()

            if (error) throw error
            return { success: true, data }
        } catch (error) {
            console.error('Erro ao salvar estatísticas da questão:', error)
            return { success: false, error: error.message }
        }
    },

    /**
     * Obter estatísticas de questões de um módulo
     */
    async getQuestionStats(specialty, subcategory, moduleId) {
        try {
            const user = await AuthService.getCurrentUser()
            if (!user) return []

            const { data, error } = await supabase
                .from('question_stats')
                .select('*')
                .eq('user_id', user.id)
                .eq('specialty', specialty)
                .eq('subcategory', subcategory)
                .eq('module_id', moduleId)

            if (error) throw error
            return data || []
        } catch (error) {
            console.error('Erro ao obter estatísticas das questões:', error)
            return []
        }
    }
}

// Exportar para uso global
window.AuthService = AuthService
window.DataSyncService = DataSyncService

console.log('Supabase configurado com sucesso!')

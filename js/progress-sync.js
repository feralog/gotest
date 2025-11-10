/**
 * ============================================
 * PROGRESS SYNC - Sincronização de Progresso com Supabase
 * ============================================
 *
 * Este arquivo gerencia a sincronização do progresso do usuário
 * entre localStorage e Supabase
 */

// ============================================
// FUNÇÕES DE SINCRONIZAÇÃO
// ============================================

/**
 * Carrega progresso salvo no Supabase para um módulo
 * @param {string} specialty - ID da especialidade
 * @param {string} subcategory - ID da subcategoria (ou null)
 * @param {string} moduleId - ID do módulo
 * @returns {Object|null} Dados do progresso ou null se não existir
 */
async function loadProgressFromSupabase(specialty, subcategory, moduleId) {
    // Verificar se está autenticado
    if (!AuthState || !AuthState.isAuthenticated) {
        console.log('Usuário não autenticado - não carregando progresso do Supabase')
        return null
    }

    try {
        const progress = await DataSyncService.getModuleProgress(specialty, subcategory, moduleId)

        if (progress) {
            console.log('✅ Progresso carregado do Supabase:', progress)
            return progress
        } else {
            console.log('ℹ️ Nenhum progresso salvo no Supabase para este módulo')
            return null
        }
    } catch (error) {
        console.error('Erro ao carregar progresso do Supabase:', error)
        return null
    }
}

/**
 * Salva progresso no Supabase
 * @param {string} specialty - ID da especialidade
 * @param {string} subcategory - ID da subcategoria (ou null)
 * @param {string} moduleId - ID do módulo
 * @param {Object} progressData - Dados do progresso
 */
async function saveProgressToSupabase(specialty, subcategory, moduleId, progressData) {
    // Verificar se está autenticado
    if (!AuthState || !AuthState.isAuthenticated) {
        console.log('Usuário não autenticado - não salvando no Supabase')
        return
    }

    try {
        // Calcular estatísticas
        const totalQuestions = progressData.totalQuestions || currentQuestions.length
        const questionsCompleted = Object.keys(userAnswers).length
        const correctAnswers = progressData.correctAnswers || 0
        const incorrectAnswers = progressData.incorrectAnswers || 0
        const completionPercentage = (questionsCompleted / totalQuestions) * 100

        const data = {
            currentQuestionIndex: progressData.currentQuestionIndex || currentQuestionIndex,
            totalQuestions: totalQuestions,
            questionsCompleted: questionsCompleted,
            correctAnswers: correctAnswers,
            incorrectAnswers: incorrectAnswers,
            completionPercentage: Math.round(completionPercentage * 100) / 100 // 2 decimais
        }

        const result = await DataSyncService.saveModuleProgress(
            specialty,
            subcategory,
            moduleId,
            data
        )

        if (result.success) {
            console.log('✅ Progresso salvo no Supabase')
        } else {
            console.error('❌ Erro ao salvar progresso:', result.error)
        }
    } catch (error) {
        console.error('Erro ao salvar progresso no Supabase:', error)
    }
}

/**
 * Salva progresso automaticamente (debounced)
 */
let saveProgressTimeout = null
function autoSaveProgress() {
    // Cancela timeout anterior
    if (saveProgressTimeout) {
        clearTimeout(saveProgressTimeout)
    }

    // Agenda novo save após 2 segundos
    saveProgressTimeout = setTimeout(() => {
        if (currentModule && currentSpecialty) {
            saveProgressToSupabase(
                currentSpecialty,
                currentSubcategory || null,
                currentModule,
                {
                    currentQuestionIndex: currentQuestionIndex,
                    totalQuestions: currentQuestions.length,
                    correctAnswers: correctAnswers,
                    incorrectAnswers: incorrectAnswers
                }
            )
        }
    }, 2000) // Espera 2 segundos após última ação
}

/**
 * Pergunta ao usuário se quer continuar de onde parou
 * @param {Object} savedProgress - Progresso salvo
 * @returns {boolean} true se usuário quer continuar, false se quer recomeçar
 */
function askContinueOrRestart(savedProgress) {
    const questionNum = savedProgress.current_question_index + 1
    const totalQuestions = savedProgress.total_questions
    const percentage = Math.round(savedProgress.completion_percentage)

    const message = `Você tem progresso salvo neste módulo!\n\n` +
                   `Última questão: ${questionNum}/${totalQuestions} (${percentage}% completo)\n\n` +
                   `Deseja continuar de onde parou?\n\n` +
                   `Clique OK para CONTINUAR ou CANCELAR para RECOMEÇAR`

    return confirm(message)
}

// Exportar para uso global
window.loadProgressFromSupabase = loadProgressFromSupabase
window.saveProgressToSupabase = saveProgressToSupabase
window.autoSaveProgress = autoSaveProgress
window.askContinueOrRestart = askContinueOrRestart

console.log('Progress Sync carregado com sucesso!')

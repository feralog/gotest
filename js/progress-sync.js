/**
 * ============================================
 * PROGRESS SYNC - Sincronização com Supabase
 * ============================================
 * Gerencia o salvamento e carregamento de progresso do usuário
 */

/**
 * Carrega o progresso salvo de um módulo
 * @param {string} specialty - ID da especialidade (ex: 'go', 'cardiopneumo')
 * @param {string} subcategory - ID da subcategoria (ex: 'avc1', 'avc2', ou null)
 * @param {string} moduleId - ID do módulo (ex: 'anatomia', 'embrio')
 * @returns {Object|null} Objeto com progresso salvo ou null se não houver
 */
async function loadProgressFromSupabase(specialty, subcategory, moduleId) {
    // Verificar autenticação
    if (!AuthState || !AuthState.isAuthenticated) {
        return null
    }

    try {
        const progress = await DataSyncService.getModuleProgress(specialty, subcategory, moduleId)
        return progress
    } catch (error) {
        console.error('Erro ao carregar progresso:', error)
        return null
    }
}

/**
 * Salva o progresso atual do usuário
 * @param {string} specialty - ID da especialidade
 * @param {string} subcategory - ID da subcategoria (ou null)
 * @param {string} moduleId - ID do módulo
 * @param {Object} progressData - Dados do progresso
 */
async function saveProgressToSupabase(specialty, subcategory, moduleId, progressData) {
    // Verificar autenticação
    if (!AuthState || !AuthState.isAuthenticated) {
        return
    }

    try {
        const totalQuestions = progressData.totalQuestions || currentQuestions.length
        const questionsCompleted = Object.keys(userAnswers).length
        const completionPercentage = (questionsCompleted / totalQuestions) * 100

        const data = {
            currentQuestionIndex: progressData.currentQuestionIndex || currentQuestionIndex,
            totalQuestions: totalQuestions,
            questionsCompleted: questionsCompleted,
            correctAnswers: progressData.correctAnswers || 0,
            incorrectAnswers: progressData.incorrectAnswers || 0,
            completionPercentage: Math.round(completionPercentage * 100) / 100
        }

        await DataSyncService.saveModuleProgress(specialty, subcategory, moduleId, data)
    } catch (error) {
        console.error('Erro ao salvar progresso:', error)
    }
}

/**
 * Auto-save com debounce (aguarda 2 segundos sem atividade antes de salvar)
 */
let saveProgressTimeout = null
function autoSaveProgress() {
    // Limpa timer anterior
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
    }, 2000) // 2 segundos de debounce
}

/**
 * ============================================
 * SALVAMENTO DE RESPOSTAS INDIVIDUAIS
 * ============================================
 */

/**
 * Salva a resposta de uma questão específica
 * @param {string} specialty - ID da especialidade
 * @param {string} subcategory - ID da subcategoria (ou null)
 * @param {string} moduleId - ID do módulo
 * @param {number} questionIndex - Índice da questão (0, 1, 2, ...)
 * @param {number} selectedAnswer - Índice da resposta selecionada (0, 1, 2, 3)
 * @param {boolean} isCorrect - Se a resposta está correta
 */
async function saveQuestionAnswer(specialty, subcategory, moduleId, questionIndex, selectedAnswer, isCorrect) {
    // Verificar autenticação
    if (!AuthState || !AuthState.isAuthenticated) {
        return
    }

    try {
        // Buscar estatísticas existentes
        const allStats = await DataSyncService.getQuestionStats(specialty, subcategory, moduleId)
        const existingStat = allStats.find(s => s.question_index === questionIndex)

        // Preparar dados
        const stats = {
            timesSeen: (existingStat?.times_seen || 0) + 1,
            timesCorrect: (existingStat?.times_correct || 0) + (isCorrect ? 1 : 0),
            timesIncorrect: (existingStat?.times_incorrect || 0) + (isCorrect ? 0 : 1),
            lastAnswerCorrect: isCorrect,
            selectedAnswer: selectedAnswer
        }

        // Salvar no Supabase
        await DataSyncService.saveQuestionStats(
            specialty,
            subcategory,
            moduleId,
            questionIndex,
            stats
        )
    } catch (error) {
        console.error('Erro ao salvar resposta:', error)
    }
}

/**
 * Carrega todas as respostas salvas de um módulo
 * @param {string} specialty - ID da especialidade
 * @param {string} subcategory - ID da subcategoria (ou null)
 * @param {string} moduleId - ID do módulo
 * @returns {Object} Objeto com respostas {questionIndex: selectedAnswer}
 */
async function loadUserAnswers(specialty, subcategory, moduleId) {
    // Verificar autenticação
    if (!AuthState || !AuthState.isAuthenticated) {
        return {}
    }

    try {
        const stats = await DataSyncService.getQuestionStats(specialty, subcategory, moduleId)
        const answers = {}

        // Reconstruir userAnswers a partir das estatísticas
        stats.forEach(stat => {
            if (stat.selected_answer !== undefined && stat.selected_answer !== null) {
                answers[stat.question_index] = stat.selected_answer
            }
        })

        return answers
    } catch (error) {
        console.error('Erro ao carregar respostas:', error)
        return {}
    }
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
    const questionsAnswered = savedProgress.questions_completed || 0

    const message = `Você tem progresso salvo neste módulo!\n\n` +
                   `Última questão: ${questionNum}/${totalQuestions}\n` +
                   `Questões respondidas: ${questionsAnswered}\n` +
                   `Progresso: ${percentage}%\n\n` +
                   `Deseja continuar de onde parou?\n\n` +
                   `Clique OK para CONTINUAR ou CANCELAR para RECOMEÇAR`

    return confirm(message)
}

// ============================================
// EXPORTAR FUNÇÕES PARA USO GLOBAL
// ============================================
window.loadProgressFromSupabase = loadProgressFromSupabase
window.saveProgressToSupabase = saveProgressToSupabase
window.autoSaveProgress = autoSaveProgress
window.saveQuestionAnswer = saveQuestionAnswer
window.loadUserAnswers = loadUserAnswers
window.askContinueOrRestart = askContinueOrRestart

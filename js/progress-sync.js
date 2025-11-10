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
        console.log('⚠️ Usuário não autenticado - não há progresso para carregar')
        return null
    }

    try {
        console.log(`🔍 Carregando progresso: ${specialty}/${subcategory || 'sem-avc'}/${moduleId}`)

        const progress = await DataSyncService.getModuleProgress(specialty, subcategory, moduleId)

        if (progress) {
            console.log('✅ Progresso encontrado:', {
                questaoAtual: progress.current_question_index + 1,
                totalQuestoes: progress.total_questions,
                questoesRespondidas: progress.questions_completed,
                percentual: progress.completion_percentage + '%'
            })
            return progress
        } else {
            console.log('ℹ️ Nenhum progresso salvo encontrado')
            return null
        }
    } catch (error) {
        console.error('❌ Erro ao carregar progresso:', error)
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

        console.log(`💾 Salvando progresso: Questão ${data.currentQuestionIndex + 1}/${data.totalQuestions}, ${questionsCompleted} respondidas`)

        await DataSyncService.saveModuleProgress(specialty, subcategory, moduleId, data)

        console.log('✅ Progresso salvo com sucesso')
    } catch (error) {
        console.error('❌ Erro ao salvar progresso:', error)
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
        console.log('⚠️ Não autenticado - resposta não será salva')
        return
    }

    try {
        console.log(`💾 Salvando resposta: Q${questionIndex + 1} = Opção ${selectedAnswer} (${isCorrect ? 'CORRETA' : 'INCORRETA'})`)

        // Buscar estatísticas existentes
        const allStats = await DataSyncService.getQuestionStats(specialty, subcategory, moduleId)
        const existingStat = allStats.find(s => s.question_index === questionIndex)

        // Preparar dados
        const stats = {
            timesSeen: (existingStat?.times_seen || 0) + 1,
            timesCorrect: (existingStat?.times_correct || 0) + (isCorrect ? 1 : 0),
            timesIncorrect: (existingStat?.times_incorrect || 0) + (isCorrect ? 0 : 1),
            lastAnswerCorrect: isCorrect,
            selectedAnswer: selectedAnswer  // 🔑 CAMPO CHAVE!
        }

        console.log(`   └─ Stats:`, stats)

        // Salvar no Supabase
        const result = await DataSyncService.saveQuestionStats(
            specialty,
            subcategory,
            moduleId,
            questionIndex,
            stats
        )

        if (result.success) {
            console.log(`   ✅ Resposta da Q${questionIndex + 1} salva com sucesso`)
        } else {
            console.error(`   ❌ Erro ao salvar resposta:`, result.error)
        }
    } catch (error) {
        console.error('❌ Erro ao salvar resposta da questão:', error)
        console.error('   Stack:', error.stack)
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
        console.log('⚠️ Não autenticado - sem respostas para carregar')
        return {}
    }

    try {
        console.log(`🔍 Carregando respostas salvas: ${specialty}/${subcategory || 'sem-avc'}/${moduleId}`)

        const stats = await DataSyncService.getQuestionStats(specialty, subcategory, moduleId)
        const answers = {}
        let count = 0

        // Reconstruir userAnswers a partir das estatísticas
        stats.forEach(stat => {
            // Só adiciona se temos uma resposta selecionada salva
            if (stat.selected_answer !== undefined && stat.selected_answer !== null) {
                answers[stat.question_index] = stat.selected_answer
                count++
                console.log(`   ├─ Q${stat.question_index + 1}: Opção ${stat.selected_answer}`)
            }
        })

        if (count > 0) {
            console.log(`✅ ${count} resposta${count > 1 ? 's' : ''} carregada${count > 1 ? 's' : ''}`)
            console.log('   Respostas:', answers)
        } else {
            console.log('ℹ️ Nenhuma resposta salva encontrada')
        }

        return answers
    } catch (error) {
        console.error('❌ Erro ao carregar respostas:', error)
        console.error('   Stack:', error.stack)
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

console.log('✅ Progress Sync carregado com sucesso!')
console.log('   Funções disponíveis:')
console.log('   - loadProgressFromSupabase()')
console.log('   - saveProgressToSupabase()')
console.log('   - autoSaveProgress()')
console.log('   - saveQuestionAnswer()')
console.log('   - loadUserAnswers()')
console.log('   - askContinueOrRestart()')

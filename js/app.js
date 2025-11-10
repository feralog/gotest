/**
 * app.js - Lógica principal do aplicativo de quiz
 * 
 * Este arquivo contém a lógica principal do aplicativo, incluindo:
 * - Gerenciamento de telas e navegação
 * - Lógica do quiz (perguntas, respostas, pontuação)
 * - Timer e progresso
 */

// Variáveis globais
let currentUser = '';
let currentSpecialty = '';
let currentSubcategory = '';
let currentModule = '';
let currentQuestions = [];
let currentQuestionIndex = 0;
let correctAnswers = 0;
let incorrectAnswers = 0;
let quizStartTime = null;
let quizTimer = null;
let quizSeconds = 0;
let currentFileType = '';
let currentFileName = '';

// Variáveis de modo
let currentMode = 'quiz'; // 'quiz' ou 'mentor'
let questionConfirmed = {}; // Armazena se cada questão foi confirmada no modo mentor

// Novas variáveis para navegação livre
let userAnswers = {}; // Armazena as respostas do usuário {questionIndex: selectedIndex}
let questionStates = {}; // Armazena estados das questões {questionIndex: 'answered'|'current'|'unanswered'}

// Variáveis para navegação com scroll
let navScrollOffset = 0; // Offset atual do scroll de navegação
let visibleButtonsCount = 10; // Quantidade de botões visíveis (calculado dinamicamente)

// Elementos DOM
const screens = {
    specialtySelection: document.getElementById('specialty-selection-screen'),
    subcategorySelection: document.getElementById('subcategory-selection-screen'),
    modeSelection: document.getElementById('mode-selection-screen'),
    quiz: document.getElementById('quiz-screen'),
    review: document.getElementById('review-screen'),
    resumosSelection: document.getElementById('resumos-selection-screen'),
    guiasSelection: document.getElementById('guias-selection-screen'),
    fileReading: document.getElementById('file-reading-screen')
};

// Inicialização
document.addEventListener('DOMContentLoaded', init);

/**
 * Inicializa o aplicativo
 */
async function init() {
    try {
        // Define o título do quiz
        document.title = quizConfig.title;

        // Carrega as questões
        await loadAllQuestions();
        console.log('Questões carregadas com sucesso');

        // NÃO mostra nenhuma tela automaticamente - auth.js vai controlar isso
        // showSpecialtySelection(); // ← REMOVIDO

        // Configura os event listeners
        setupEventListeners();

        // Não popula a lista inicialmente - será feito após seleção da especialidade

    } catch (error) {
        console.error('Erro ao inicializar o aplicativo:', error);
        alert('Ocorreu um erro ao carregar o aplicativo. Por favor, recarregue a página.');
    }
}

/**
 * Configura todos os event listeners
 */
function setupEventListeners() {
    // Specialty selection
    document.getElementById('go-specialty-btn').addEventListener('click', () => selectSpecialty('go'));
    document.getElementById('cardio-specialty-btn').addEventListener('click', () => selectSpecialty('cardio'));
    document.getElementById('tc-specialty-btn').addEventListener('click', () => selectSpecialty('tc'));
    document.getElementById('ped-specialty-btn').addEventListener('click', () => selectSpecialty('ped'));
    document.getElementById('clinica-specialty-btn').addEventListener('click', () => selectSpecialty('clinica'));
    document.getElementById('ligaCardio-specialty-btn').addEventListener('click', () => selectSpecialty('ligaCardio'));

    // Subcategory screen buttons
    document.getElementById('subcategory-resumos-btn').addEventListener('click', showResumosSelection);
    document.getElementById('subcategory-guias-btn').addEventListener('click', showGuiasSelection);

    // Mode selection
    document.getElementById('quiz-mode-btn').addEventListener('click', () => selectMode('quiz'));
    document.getElementById('mentor-mode-btn').addEventListener('click', () => selectMode('mentor'));
    document.getElementById('mode-back-btn').addEventListener('click', showSubcategorySelection);

    // Back buttons
    document.getElementById('resumos-back-btn').addEventListener('click', showSubcategorySelection);
    document.getElementById('guias-back-btn').addEventListener('click', showSubcategorySelection);
    document.getElementById('file-back-btn').addEventListener('click', handleFileBack);
    document.getElementById('subcategory-back-btn').addEventListener('click', showSpecialtySelection);

    // Quiz
    document.getElementById('quit-quiz-btn').addEventListener('click', quitQuiz);
    document.getElementById('finish-quiz-btn').addEventListener('click', finishQuiz);
    document.getElementById('next-question-btn').addEventListener('click', nextQuestion);
    document.getElementById('previous-question-btn').addEventListener('click', previousQuestion);
    document.getElementById('confirm-answer-btn').addEventListener('click', confirmAnswer);

    // Modal de zoom de imagem
    const modal = document.getElementById('image-modal');
    const modalClose = document.getElementById('modal-close');
    modalClose.addEventListener('click', () => {
        modal.classList.remove('active');
    });
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });

    // Review
    document.getElementById('retry-module-btn').addEventListener('click', () => startQuiz(currentModule));
    document.getElementById('return-to-modules-btn').addEventListener('click', showSubcategorySelection);

    // Configura o salvamento automático
    window.addEventListener('beforeunload', saveUserData);
}

/**
 * Mostra a tela de seleção de especialidade
 */
function showSpecialtySelection() {
    hideAllScreens();
    screens.specialtySelection.classList.remove('d-none');
}

/**
 * Seleciona uma especialidade e vai para o menu da especialidade
 */
function selectSpecialty(specialtyId) {
    currentSpecialty = specialtyId;
    currentUser = 'Usuário';

    // Always show subcategory selection (with tabs) for all specialties
    showSubcategorySelection();
}

/**
 * Mostra a tela de seleção de subcategoria com tabs (aplicado para TODAS as especialidades)
 */
function showSubcategorySelection() {
    hideAllScreens();
    screens.subcategorySelection.classList.remove('d-none');

    const specialty = quizConfig.specialties[currentSpecialty];
    if (!specialty) {
        showSpecialtySelection();
        return;
    }

    // Mapeia ícones por especialidade
    const specialtyIcons = {
        'go': '🤰',
        'cardio': '❤️',
        'tc': '✂️',
        'ped': '👶',
        'clinica': '👨‍⚕️',
        'ligaCardio': '💓'
    };

    // Atualiza o ícone e título
    const icon = specialtyIcons[currentSpecialty] || '📚';
    document.getElementById('subcategory-specialty-icon').textContent = icon;
    document.getElementById('subcategory-specialty-title').textContent = specialty.name;

    // Atualiza o subtítulo
    if (specialty.hasSubcategories) {
        document.getElementById('subcategory-specialty-subtitle').textContent = 'Selecione uma subcategoria para acessar os módulos';
    } else {
        document.getElementById('subcategory-specialty-subtitle').textContent = `${specialty.modules.length} módulos disponíveis`;
    }

    // Mostra/esconde botões de Resumos e Guias baseado na especialidade
    const subcategoryResumosBtn = document.getElementById('subcategory-resumos-btn');
    const subcategoryGuiasBtn = document.getElementById('subcategory-guias-btn');

    if (specialty.hasResumos) {
        subcategoryResumosBtn.classList.remove('d-none');
    } else {
        subcategoryResumosBtn.classList.add('d-none');
    }

    if (specialty.hasGuias) {
        subcategoryGuiasBtn.classList.remove('d-none');
    } else {
        subcategoryGuiasBtn.classList.add('d-none');
    }

    // Popula as tabs de subcategoria
    const tabsContainer = document.getElementById('subcategory-tabs');
    const tabContentsContainer = document.getElementById('subcategory-tab-contents');
    tabsContainer.innerHTML = '';
    tabContentsContainer.innerHTML = '';

    let subcategories;

    // Se a especialidade tem subcategorias, usa elas
    if (specialty.hasSubcategories && specialty.subcategories) {
        subcategories = Object.values(specialty.subcategories);
    } else {
        // Se não tem subcategorias, cria uma única subcategoria "Módulos"
        subcategories = [{
            id: 'modules',
            name: 'Módulos',
            modules: specialty.modules || []
        }];
    }

    subcategories.forEach((subcategory, index) => {
        // Cria tab trigger
        const tabButton = document.createElement('button');
        tabButton.className = 'tab-trigger' + (index === 0 ? ' active' : '');
        tabButton.textContent = subcategory.name;
        tabButton.dataset.tabId = subcategory.id;
        tabButton.addEventListener('click', () => switchTab(subcategory.id));
        tabsContainer.appendChild(tabButton);

        // Cria tab content
        const tabContent = document.createElement('div');
        tabContent.className = 'tab-content' + (index === 0 ? ' active' : '');
        tabContent.dataset.tabId = subcategory.id;
        tabContent.style.maxWidth = '900px';
        tabContent.style.margin = '0 auto';
        tabContent.innerHTML = `
            <div class="module-grid">
                ${subcategory.modules.map(module => {
                    const questions = getModuleQuestions(module.id);
                    const questionCount = questions.length;
                    return `
                        <div class="card" style="cursor: pointer;" onclick="showModeSelection('${module.id}')">
                            <div class="card-body">
                                <h5 class="card-title" style="color: #000000; font-weight: 600;">
                                    <i class="fas fa-graduation-cap me-2"></i>${module.name}
                                </h5>
                                <p class="card-text" style="color: #6b7280; font-size: 0.875rem;">
                                    ${questionCount} questões disponíveis
                                </p>
                                <button class="btn btn-module-start w-100">Iniciar Quiz</button>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
        tabContentsContainer.appendChild(tabContent);
    });

    // Seleciona primeira subcategoria por padrão
    if (subcategories.length > 0) {
        currentSubcategory = subcategories[0].id;
    }
}

// Função auxiliar para trocar de tab
function switchTab(tabId) {
    currentSubcategory = tabId;

    // Atualiza triggers
    document.querySelectorAll('.tab-trigger').forEach(trigger => {
        if (trigger.dataset.tabId === tabId) {
            trigger.classList.add('active');
        } else {
            trigger.classList.remove('active');
        }
    });

    // Atualiza contents
    document.querySelectorAll('.tab-content').forEach(content => {
        if (content.dataset.tabId === tabId) {
            content.classList.add('active');
        } else {
            content.classList.remove('active');
        }
    });
}

/**
 * Mostra a tela de seleção de modo
 * @param {string} moduleId - ID do módulo selecionado
 */
function showModeSelection(moduleId) {
    currentModule = moduleId;
    hideAllScreens();
    screens.modeSelection.classList.remove('d-none');

    // Atualiza o título com o nome do módulo
    let moduleConfig = null;
    if (currentSpecialty && quizConfig.specialties[currentSpecialty]) {
        const specialty = quizConfig.specialties[currentSpecialty];

        if (specialty.hasSubcategories && currentSubcategory && specialty.subcategories[currentSubcategory]) {
            moduleConfig = specialty.subcategories[currentSubcategory].modules.find(m => m.id === moduleId);
        } else if (specialty.modules) {
            moduleConfig = specialty.modules.find(m => m.id === moduleId);
        }
    }

    const title = moduleConfig ? moduleConfig.name : moduleId;
    document.getElementById('mode-module-title').textContent = title;
}

/**
 * Seleciona o modo e inicia o quiz
 * @param {string} mode - 'quiz' ou 'mentor'
 */
function selectMode(mode) {
    currentMode = mode;
    startQuiz(currentModule);
}

/**
 * Inicia o quiz para um módulo específico
 * @param {string} module - ID do módulo
 */
async function startQuiz(module) {
    currentModule = module;

    // Obtém as questões do módulo
    currentQuestions = getModuleQuestions(module);

    if (currentQuestions.length === 0) {
        console.error('No questions found for module:', module);
        alert('Erro: Nenhuma questão encontrada para este módulo. Verifique se o arquivo JSON foi carregado corretamente.');
        return;
    }

    // ============================================
    // VERIFICA PROGRESSO SALVO NO SUPABASE
    // ============================================
    let savedProgress = null;
    let shouldContinue = false;

    if (typeof loadProgressFromSupabase === 'function' && AuthState && AuthState.isAuthenticated) {
        savedProgress = await loadProgressFromSupabase(currentSpecialty, currentSubcategory || null, module);

        if (savedProgress && savedProgress.current_question_index > 0) {
            // Tem progresso salvo, perguntar se quer continuar
            shouldContinue = askContinueOrRestart(savedProgress);
        }
    }

    // Reinicia as variáveis do quiz
    if (shouldContinue && savedProgress) {
        // CONTINUAR de onde parou
        currentQuestionIndex = savedProgress.current_question_index;
        correctAnswers = savedProgress.correct_answers || 0;
        incorrectAnswers = savedProgress.incorrect_answers || 0;

        console.log(`✅ Continuando do progresso salvo - Questão ${currentQuestionIndex + 1}`);
        console.log(`🔄 Carregando respostas anteriores...`);

        // Carrega as respostas salvas
        if (typeof loadUserAnswers === 'function' && AuthState?.isAuthenticated) {
            userAnswers = await loadUserAnswers(currentSpecialty, currentSubcategory || null, module);
            console.log(`📊 userAnswers carregado:`, userAnswers);
            console.log(`   Total de respostas: ${Object.keys(userAnswers).length}`);
        } else {
            console.log(`⚠️ loadUserAnswers não disponível ou usuário não autenticado`);
            userAnswers = {};
        }
    } else {
        // RECOMEÇAR do zero
        currentQuestionIndex = 0;
        correctAnswers = 0;
        incorrectAnswers = 0;
        userAnswers = {};
        console.log(`🆕 Iniciando quiz do zero`);
    }

    // Reinicia os dados de navegação livre
    questionStates = {};
    questionConfirmed = {};
    navScrollOffset = 0;

    // Inicializa estados das questões
    for (let i = 0; i < currentQuestions.length; i++) {
        // Marca como respondida se já temos uma resposta salva
        questionStates[i] = (userAnswers[i] !== undefined) ? 'answered' : 'unanswered';
        questionConfirmed[i] = false;
    }
    questionStates[currentQuestionIndex] = 'current';

    // Mostra a tela do quiz
    showQuizScreen();

    // Inicia o timer
    startTimer();

    // Gera a navegação de questões
    generateQuestionNavigation();

    // Carrega a questão (pode ser a primeira ou a salva)
    loadQuestion();
}

/**
 * Calcula quantos botões de navegação cabem na tela
 */
function calculateVisibleButtons() {
    const container = document.querySelector('.question-nav-scroll');
    if (!container) return 10;

    const containerWidth = container.offsetWidth;
    const buttonWidth = 40; // largura do botão
    const gap = 8; // espaço entre botões

    // Calcula quantos botões cabem
    const count = Math.floor((containerWidth + gap) / (buttonWidth + gap));

    // Mínimo de 5, máximo de 15
    return Math.max(5, Math.min(15, count));
}

/**
 * Gera a barra de navegação das questões
 */
function generateQuestionNavigation() {
    const navWrapper = document.querySelector('.question-nav-wrapper');
    navWrapper.innerHTML = '';

    // Remove event listeners antigos (se existirem)
    const leftArrow = document.getElementById('nav-arrow-left');
    const rightArrow = document.getElementById('nav-arrow-right');
    const newLeftArrow = leftArrow.cloneNode(true);
    const newRightArrow = rightArrow.cloneNode(true);
    leftArrow.parentNode.replaceChild(newLeftArrow, leftArrow);
    rightArrow.parentNode.replaceChild(newRightArrow, rightArrow);

    for (let i = 0; i < currentQuestions.length; i++) {
        const btn = document.createElement('button');
        btn.className = 'question-nav-btn';
        btn.textContent = i + 1;
        btn.dataset.questionIndex = i;

        btn.addEventListener('click', () => navigateToQuestion(i));

        navWrapper.appendChild(btn);
    }

    // Adiciona event listeners para as setas de navegação
    document.getElementById('nav-arrow-left').addEventListener('click', scrollNavLeft);
    document.getElementById('nav-arrow-right').addEventListener('click', scrollNavRight);

    // Calcula quantos botões cabem na tela
    visibleButtonsCount = calculateVisibleButtons();

    // Inicializa o scroll
    updateNavigationScroll();
    updateNavigationStates();
}

// Recalcula visibilidade quando a janela é redimensionada
window.addEventListener('resize', () => {
    if (currentQuestions.length > 0) {
        visibleButtonsCount = calculateVisibleButtons();
        updateNavigationScroll();
    }
});

/**
 * Scroll da navegação para a esquerda
 */
function scrollNavLeft() {
    const scrollAmount = Math.max(1, Math.floor(visibleButtonsCount * 0.7)); // 70% dos botões visíveis
    navScrollOffset = Math.max(0, navScrollOffset - scrollAmount);
    updateNavigationScroll();
}

/**
 * Scroll da navegação para a direita
 */
function scrollNavRight() {
    const scrollAmount = Math.max(1, Math.floor(visibleButtonsCount * 0.7)); // 70% dos botões visíveis
    const maxOffset = Math.max(0, currentQuestions.length - visibleButtonsCount);
    navScrollOffset = Math.min(maxOffset, navScrollOffset + scrollAmount);
    updateNavigationScroll();
}

/**
 * Atualiza o scroll da navegação
 * @param {boolean} animate - Se deve animar o scroll
 */
function updateNavigationScroll(animate = false) {
    const navButtons = document.querySelectorAll('.question-nav-btn');

    navButtons.forEach((btn, index) => {
        if (index >= navScrollOffset && index < navScrollOffset + visibleButtonsCount) {
            btn.style.display = 'flex';
        } else {
            btn.style.display = 'none';
        }
    });

    updateScrollArrows();
}

/**
 * Rola automaticamente a barra de navegação para acompanhar a questão atual
 * @param {number} questionIndex - Índice da questão atual
 */
function autoScrollToQuestion(questionIndex) {
    let targetOffset;

    // Calcula o offset máximo possível (para não deixar espaço vazio no final)
    const maxOffset = Math.max(0, currentQuestions.length - visibleButtonsCount);

    // Se a questão atual está no início (antes de encher a barra), mostra desde o início
    if (questionIndex < visibleButtonsCount) {
        targetOffset = 0;
    }
    // Se a questão atual está no meio, coloca ela como primeira visível
    else if (questionIndex < maxOffset) {
        targetOffset = questionIndex;
    }
    // Se está perto do fim, fixa no final
    else {
        targetOffset = maxOffset;
    }

    // Se já está no offset correto, não faz nada
    if (navScrollOffset === targetOffset) {
        return;
    }

    // Anima o scroll suavemente
    const startOffset = navScrollOffset;
    const distance = targetOffset - startOffset;
    const duration = 300; // 300ms de animação
    const startTime = performance.now();

    function animateScroll(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function (ease-out)
        const easeProgress = 1 - Math.pow(1 - progress, 3);

        // Calcula o offset atual
        navScrollOffset = Math.round(startOffset + (distance * easeProgress));

        // Atualiza a visualização
        updateNavigationScroll();

        // Continua a animação se não terminou
        if (progress < 1) {
            requestAnimationFrame(animateScroll);
        }
    }

    requestAnimationFrame(animateScroll);
}

/**
 * Atualiza o estado das setas de scroll
 */
function updateScrollArrows() {
    const leftArrow = document.getElementById('nav-arrow-left');
    const rightArrow = document.getElementById('nav-arrow-right');

    if (!leftArrow || !rightArrow) return;

    leftArrow.disabled = navScrollOffset === 0;
    rightArrow.disabled = navScrollOffset >= currentQuestions.length - visibleButtonsCount;
}

/**
 * Atualiza os estados visuais da navegação
 */
function updateNavigationStates() {
    const navButtons = document.querySelectorAll('.question-nav-btn');

    navButtons.forEach((btn, index) => {
        btn.className = 'question-nav-btn';

        if (questionStates[index] === 'current') {
            btn.classList.add('current');
        } else if (questionStates[index] === 'answered') {
            btn.classList.add('answered');
        }
    });

    // Atualiza contador de respondidas
    const answeredCount = Object.keys(userAnswers).length;
    document.getElementById('answered-count').textContent = `Respondidas: ${answeredCount}/${currentQuestions.length}`;
}

/**
 * Navega para uma questão específica
 * @param {number} questionIndex - Índice da questão
 */
function navigateToQuestion(questionIndex) {
    // Atualiza estados
    questionStates[currentQuestionIndex] = userAnswers[currentQuestionIndex] !== undefined ? 'answered' : 'unanswered';
    questionStates[questionIndex] = 'current';
    currentQuestionIndex = questionIndex;

    // Carrega a questão
    loadQuestion();

    // Rola a barra de navegação para acompanhar a questão atual
    autoScrollToQuestion(questionIndex);

    // Atualiza navegação
    updateNavigationStates();

    // ✅ SALVA PROGRESSO AUTOMATICAMENTE
    if (typeof autoSaveProgress === 'function') {
        autoSaveProgress();
    }
}

/**
 * Avança para a próxima questão sem exigir resposta
 */
function nextQuestion() {
    // Verifica se não estamos na última questão
    if (currentQuestionIndex < currentQuestions.length - 1) {
        navigateToQuestion(currentQuestionIndex + 1);
    }
}

/**
 * Volta para a questão anterior
 */
function previousQuestion() {
    // Verifica se não estamos na primeira questão
    if (currentQuestionIndex > 0) {
        navigateToQuestion(currentQuestionIndex - 1);
    }
}

/**
 * Atualiza o estado dos botões de navegação do quiz (Anterior/Confirmar/Próxima/Finalizar)
 */
function updateQuizNavigationButtons() {
    const previousBtn = document.getElementById('previous-question-btn');
    const confirmBtn = document.getElementById('confirm-answer-btn');
    const nextBtn = document.getElementById('next-question-btn');
    const finishBtn = document.getElementById('finish-quiz-btn');

    // Botão Anterior: desabilitado na primeira questão
    if (currentQuestionIndex === 0) {
        previousBtn.disabled = true;
    } else {
        previousBtn.disabled = false;
    }

    // Botão Confirmar: apenas no modo mentor, quando há resposta selecionada e não confirmada
    if (currentMode === 'mentor' && userAnswers[currentQuestionIndex] !== undefined && !questionConfirmed[currentQuestionIndex]) {
        confirmBtn.classList.remove('d-none');
    } else {
        confirmBtn.classList.add('d-none');
    }

    // Botões Próxima/Finalizar
    if (currentQuestionIndex === currentQuestions.length - 1) {
        // Última questão: mostra botão Finalizar
        nextBtn.classList.add('d-none');
        finishBtn.classList.remove('d-none');
    } else {
        // Outras questões: mostra botão Próxima
        nextBtn.classList.remove('d-none');
        finishBtn.classList.add('d-none');
    }
}

/**
 * Mostra a tela do quiz
 */
function showQuizScreen() {
    hideAllScreens();
    screens.quiz.classList.remove('d-none');

    // Define o título do quiz baseado na especialidade atual
    let moduleConfig = null;
    if (currentSpecialty && quizConfig.specialties[currentSpecialty]) {
        const specialty = quizConfig.specialties[currentSpecialty];

        // Check if specialty has subcategories
        if (specialty.hasSubcategories && currentSubcategory && specialty.subcategories[currentSubcategory]) {
            moduleConfig = specialty.subcategories[currentSubcategory].modules.find(m => m.id === currentModule);
        } else if (specialty.modules) {
            moduleConfig = specialty.modules.find(m => m.id === currentModule);
        }
    }

    const title = moduleConfig ? moduleConfig.name : currentModule;

    document.getElementById('quiz-title').textContent = title;

    // Reinicia o contador de respostas (agora usa answered-count)
    document.getElementById('answered-count').textContent = `Respondidas: 0/${currentQuestions.length}`;
}

/**
 * Carrega uma questão
 */
function loadQuestion() {
    const question = currentQuestions[currentQuestionIndex];

    if (!question) {
        console.error('No question found at index:', currentQuestionIndex);
        return;
    }

    displayQuestion(question);

    // Atualiza o número da questão
    document.getElementById('question-number').textContent = `Questão ${currentQuestionIndex + 1}/${currentQuestions.length}`;

    // Atualiza o tipo da questão
    document.getElementById('question-type').textContent = question.type === 'conteudista' ? 'Conteudista' : 'Raciocínio';

    // Atualiza contador de respostas
    const answeredCount = Object.keys(userAnswers).length;
    document.getElementById('answered-count').textContent = `Respondidas: ${answeredCount}/${currentQuestions.length}`;

    // Controles específicos de modo
    const explanationContainer = document.getElementById('mentor-explanation-container');

    if (currentMode === 'mentor') {
        // Modo Mentor
        if (questionConfirmed[currentQuestionIndex]) {
            // Questão já confirmada - mostra explicação
            explanationContainer.classList.remove('d-none');
            document.getElementById('mentor-explanation-text').textContent = question.explanation;

            // Reaplica cores nas opções
            applyMentorColors();
        } else {
            // Questão não confirmada - oculta explicação
            explanationContainer.classList.add('d-none');
        }
    } else {
        // Modo Quiz - oculta explicação
        explanationContainer.classList.add('d-none');
    }

    // Se a questão já foi respondida, pré-seleciona a resposta
    if (userAnswers[currentQuestionIndex] !== undefined) {
        const selectedIndex = userAnswers[currentQuestionIndex];
        console.log(`🔵 Q${currentQuestionIndex + 1} já foi respondida: Opção ${selectedIndex}`);

        const optionButtons = document.querySelectorAll('.option-btn');
        console.log(`   Total de botões encontrados: ${optionButtons.length}`);

        if (optionButtons[selectedIndex]) {
            optionButtons[selectedIndex].classList.add('selected');
            console.log(`   ✅ Botão ${selectedIndex} marcado como selecionado`);
        } else {
            console.log(`   ❌ Botão ${selectedIndex} não encontrado!`);
        }
    } else {
        console.log(`⚪ Q${currentQuestionIndex + 1} ainda não foi respondida`);
    }
}

/**
 * Exibe uma questão na tela
 * @param {Object} question - Objeto da questão
 */
function displayQuestion(question) {
    // Exibe o texto da questão
    document.getElementById('question-text').textContent = question.question;

    // Exibe a imagem se existir
    const imageContainer = document.getElementById('question-image-container');
    const imageElement = document.getElementById('question-image');

    if (question.image) {
        imageElement.src = question.image;
        imageContainer.classList.remove('d-none');

        // Adiciona event listener para zoom
        imageElement.onclick = function() {
            const modal = document.getElementById('image-modal');
            const modalImg = document.getElementById('modal-image');
            modal.classList.add('active');
            modalImg.src = this.src;
        };
    } else {
        imageContainer.classList.add('d-none');
        imageElement.src = '';
        imageElement.onclick = null;
    }

    // Limpa o container de opções
    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = '';

    // Adiciona as opções (SEM radio buttons)
    question.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.className = 'option-btn';
        button.dataset.option = index;
        button.dataset.index = index;
        button.textContent = option;

        button.addEventListener('click', () => handleAnswer(index));

        optionsContainer.appendChild(button);
    });

    // Mostra o container de questão
    document.getElementById('question-container').classList.remove('d-none');

    // Atualiza estado dos botões de navegação
    updateQuizNavigationButtons();
}

/**
 * Manipula a resposta do usuário
 * @param {number} selectedIndex - Índice da opção selecionada
 */
function handleAnswer(selectedIndex) {
    // No modo mentor, não permite mudar resposta após confirmar
    if (currentMode === 'mentor' && questionConfirmed[currentQuestionIndex]) {
        return;
    }

    // Remove seleção anterior
    const optionButtons = document.querySelectorAll('.option-btn');
    optionButtons.forEach(btn => btn.classList.remove('selected'));

    // Marca a nova seleção
    optionButtons[selectedIndex].classList.add('selected');

    // Armazena a resposta do usuário
    userAnswers[currentQuestionIndex] = selectedIndex;
    console.log(`📝 Q${currentQuestionIndex + 1}: Usuário selecionou opção ${selectedIndex}`);

    // Salva a resposta no Supabase (individual question tracking)
    if (typeof saveQuestionAnswer === 'function' && AuthState?.isAuthenticated) {
        const question = currentQuestions[currentQuestionIndex];
        const isCorrect = selectedIndex === question.correctIndex;
        console.log(`💾 Salvando resposta no Supabase...`);
        saveQuestionAnswer(
            currentSpecialty,
            currentSubcategory || null,
            currentModule,
            currentQuestionIndex,
            selectedIndex,
            isCorrect
        );
    } else {
        console.log(`⚠️ saveQuestionAnswer não disponível ou usuário não autenticado`);
    }

    // Atualiza estado da questão (apenas no modo quiz)
    if (currentMode === 'quiz') {
        questionStates[currentQuestionIndex] = 'answered';
        updateNavigationStates();
    }

    // Atualiza contador de respostas
    const answeredCount = Object.keys(userAnswers).length;
    document.getElementById('answered-count').textContent = `Respondidas: ${answeredCount}/${currentQuestions.length}`;

    // Atualiza botões de navegação (inclui botão confirmar do modo mentor)
    updateQuizNavigationButtons();

    // ✅ SALVA PROGRESSO AUTOMATICAMENTE
    if (typeof autoSaveProgress === 'function') {
        autoSaveProgress();
    }
}

/**
 * Confirma a resposta no modo mentor
 */
function confirmAnswer() {
    if (userAnswers[currentQuestionIndex] === undefined) {
        alert('Por favor, selecione uma resposta antes de confirmar.');
        return;
    }

    const question = currentQuestions[currentQuestionIndex];
    const userAnswer = userAnswers[currentQuestionIndex];
    const isCorrect = userAnswer === question.correctIndex;

    // Marca a questão como confirmada
    questionConfirmed[currentQuestionIndex] = true;
    questionStates[currentQuestionIndex] = 'answered';

    // Aplica cores nas opções
    applyMentorColors();

    // Mostra explicação
    document.getElementById('mentor-explanation-container').classList.remove('d-none');
    document.getElementById('mentor-explanation-text').textContent = question.explanation;

    // Atualiza botões de navegação
    updateQuizNavigationButtons();
    updateNavigationStates();
}

/**
 * Aplica cores corretas/incorretas no modo mentor
 */
function applyMentorColors() {
    const question = currentQuestions[currentQuestionIndex];
    const userAnswer = userAnswers[currentQuestionIndex];
    const optionButtons = document.getElementById('options-container').querySelectorAll('.option-btn');

    optionButtons.forEach((btn, index) => {
        // Remove classes anteriores
        btn.classList.remove('selected', 'mentor-correct', 'mentor-incorrect', 'mentor-disabled');

        if (index === question.correctIndex) {
            // Resposta correta em verde
            btn.classList.add('mentor-correct');
        } else if (index === userAnswer) {
            // Resposta do usuário (incorreta) em vermelho
            btn.classList.add('mentor-incorrect');
        } else {
            // Outras opções desabilitadas
            btn.classList.add('mentor-disabled');
        }
    });
}

/**
 * Finaliza o quiz e mostra a tela de revisão
 */
function finishQuiz() {
    stopTimer();
    calculateFinalResults();
    showReviewScreen();
}

/**
 * Abandona o quiz atual e volta para a seleção de subcategorias
 */
function quitQuiz() {
    if (confirm('Tem certeza que deseja sair do quiz? Seu progresso será salvo.')) {
        stopTimer();
        showSubcategorySelection();
    }
}

/**
 * Calcula os resultados finais do quiz
 */
function calculateFinalResults() {
    correctAnswers = 0;
    incorrectAnswers = 0;

    // Conta respostas corretas e incorretas
    for (let i = 0; i < currentQuestions.length; i++) {
        if (userAnswers[i] !== undefined) {
            const question = currentQuestions[i];
            if (userAnswers[i] === question.correctIndex) {
                correctAnswers++;
            } else {
                incorrectAnswers++;
            }
        }
    }
}

/**
 * Mostra a tela de revisão completa
 */
function showReviewScreen() {
    hideAllScreens();
    screens.review.classList.remove('d-none');

    // Calcula a pontuação
    const totalQuestions = correctAnswers + incorrectAnswers;
    const scorePercentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

    // Atualiza elementos da tela de revisão
    document.getElementById('final-score-circle').textContent = `${scorePercentage}%`;
    document.getElementById('final-correct-count').textContent = correctAnswers;
    document.getElementById('final-incorrect-count').textContent = incorrectAnswers;
    document.getElementById('final-total-time').textContent = formatTime(quizSeconds);
    document.getElementById('final-score-percentage').textContent = `${scorePercentage}%`;

    // Determina nível de desempenho
    let performanceLevel = '';
    if (scorePercentage >= 90) {
        performanceLevel = 'Excelente';
    } else if (scorePercentage >= 80) {
        performanceLevel = 'Muito Bom';
    } else if (scorePercentage >= 70) {
        performanceLevel = 'Bom';
    } else if (scorePercentage >= 60) {
        performanceLevel = 'Regular';
    } else {
        performanceLevel = 'Precisa Melhorar';
    }
    document.getElementById('performance-level').textContent = performanceLevel;

    // Gera a revisão das questões
    generateQuestionReview();
}

/**
 * Gera a revisão detalhada de todas as questões
 */
function generateQuestionReview() {
    const container = document.getElementById('review-questions-container');
    container.innerHTML = '';

    currentQuestions.forEach((question, index) => {
        const userAnswer = userAnswers[index];
        const isCorrect = userAnswer === question.correctIndex;
        const wasAnswered = userAnswer !== undefined;

        const questionDiv = document.createElement('div');
        questionDiv.className = 'review-question';

        questionDiv.innerHTML = `
            <div class="review-question-header">
                <div class="d-flex justify-content-between align-items-center w-100">
                    <div class="d-flex align-items-center">
                        <div class="question-result-icon ${isCorrect ? 'correct' : 'incorrect'} me-3">
                            ${isCorrect ? '✓' : '✗'}
                        </div>
                        <div>
                            <h5 class="mb-1">Questão ${index + 1}</h5>
                            <small class="text-muted">${question.type === 'conteudista' ? 'Conteudista' : 'Raciocínio'}</small>
                        </div>
                    </div>
                    <div class="text-end">
                        ${wasAnswered ? (isCorrect ? '<span class="badge bg-success">Correta</span>' : '<span class="badge bg-danger">Incorreta</span>') : '<span class="badge bg-secondary">Não Respondida</span>'}
                    </div>
                </div>
            </div>

            <div class="question-content">
                <p class="fw-bold mb-3">${question.question}</p>

                ${question.image ? `
                    <div class="text-center mb-3">
                        <img src="${question.image}" alt="Imagem da questão ${index + 1}" class="img-fluid question-image" style="max-height: 400px; border-radius: 8px;">
                    </div>
                ` : ''}

                <div class="review-options">
                    ${question.options.map((option, optIndex) => {
                        let classes = 'review-option';

                        if (optIndex === question.correctIndex) {
                            classes += ' correct-answer';
                        }

                        if (optIndex === userAnswer) {
                            classes += ' user-answer';
                            if (!isCorrect) {
                                classes += ' incorrect';
                            }
                        }

                        return `<div class="${classes}">
                            ${optIndex === userAnswer ? '<i class="fas fa-arrow-right me-2"></i>' : ''}
                            ${optIndex === question.correctIndex ? '<i class="fas fa-check text-success me-2"></i>' : ''}
                            ${option}
                        </div>`;
                    }).join('')}
                </div>

                <div class="review-explanation">
                    <h6><i class="fas fa-lightbulb me-2"></i>Explicação</h6>
                    <p class="mb-0">${question.explanation}</p>
                </div>
            </div>
        `;

        container.appendChild(questionDiv);
    });
}

/**
 * Mapeamento de arquivos de resumos e guias por especialidade
 */
const specialtyFiles = {
    go: {
        avc1: {
            resumos: [
                { file: '1exame.md', title: 'Exame Ginecológico', icon: 'file-medical' },
                { file: '2ciclomenstrual.md', title: 'Ciclo Menstrual', icon: 'calendar-alt' },
                { file: '3embrio.md', title: 'Embriologia', icon: 'baby' },
                { file: '4desenvolvimentopuberal.md', title: 'Desenvolvimento Puberal', icon: 'user-graduate' }
            ],
            guias: [
                { file: '1exame.md', title: 'Exame Ginecológico', icon: 'file-medical' },
                { file: '2ciclomenstrual.md', title: 'Ciclo Menstrual', icon: 'calendar-alt' },
                { file: '3embrio.md', title: 'Embriologia', icon: 'baby' },
                { file: '4desenvolvimento_puberal.md', title: 'Desenvolvimento Puberal', icon: 'user-graduate' }
            ]
        },
        avc2: {
            resumos: [
                { file: 'Citologia Oncotica Resumo.txt', title: 'Citologia Oncótica', icon: 'microscope' },
                { file: 'Vulvovaginitesresumo.txt', title: 'Vulvovaginites', icon: 'notes-medical' },
                { file: 'ISTs e DIPA Resumo.txt', title: 'ISTs e DIPA', icon: 'virus' },
                { file: 'Trabalho de Parto e Parto Resumo.txt', title: 'Trabalho de Parto e Parto', icon: 'baby' },
                { file: 'Puerperio e Amamentacao Resumo.txt', title: 'Puerpério e Amamentação', icon: 'heart' }
            ],
            guias: [
                { file: 'Citologia Oncotica Guia.txt', title: 'Citologia Oncótica', icon: 'microscope' },
                { file: 'Vulvovaginites Guia.txt', title: 'Vulvovaginites', icon: 'notes-medical' },
                { file: 'ISTs e DIPA Guia.txt', title: 'ISTs e DIPA', icon: 'virus' },
                { file: 'Trabalho de Parto e Parto Guia.txt', title: 'Trabalho de Parto e Parto', icon: 'baby' },
                { file: 'Puerperio Normal e Amamentacao Guia.txt', title: 'Puerpério e Amamentação', icon: 'heart' }
            ]
        }
    },
    cardio: {
        resumos: [],
        guias: []
    },
    tc: {
        resumos: [],
        guias: []
    },
    clinica: {
        resumos: [],
        guias: []
    }
};

/**
 * Popula a lista de resumos baseado na especialidade
 */
function populateResumosList() {
    const resumosList = document.getElementById('resumos-list');
    resumosList.innerHTML = '';

    if (!currentSpecialty || !specialtyFiles[currentSpecialty]) {
        resumosList.innerHTML = '<div class="alert alert-info">Nenhum resumo disponível para esta especialidade.</div>';
        return;
    }

    // Get files based on subcategory if applicable
    let files = [];
    const specialtyData = specialtyFiles[currentSpecialty];

    if (currentSubcategory && specialtyData[currentSubcategory]) {
        files = specialtyData[currentSubcategory].resumos || [];
    } else if (specialtyData.resumos) {
        files = specialtyData.resumos;
    }

    if (files.length === 0) {
        resumosList.innerHTML = '<div class="alert alert-info">Nenhum resumo disponível para esta especialidade.</div>';
        return;
    }

    files.forEach(fileInfo => {
        const button = document.createElement('button');
        button.className = 'list-group-item list-group-item-action';
        button.innerHTML = `<i class="fas fa-${fileInfo.icon} me-2"></i>${fileInfo.title}`;
        button.addEventListener('click', () => loadFile('resumos', fileInfo.file));
        resumosList.appendChild(button);
    });
}

/**
 * Popula a lista de guias baseado na especialidade
 */
function populateGuiasList() {
    const guiasList = document.getElementById('guias-list');
    guiasList.innerHTML = '';

    if (!currentSpecialty || !specialtyFiles[currentSpecialty]) {
        guiasList.innerHTML = '<div class="alert alert-info">Nenhum guia disponível para esta especialidade.</div>';
        return;
    }

    // Get files based on subcategory if applicable
    let files = [];
    const specialtyData = specialtyFiles[currentSpecialty];

    if (currentSubcategory && specialtyData[currentSubcategory]) {
        files = specialtyData[currentSubcategory].guias || [];
    } else if (specialtyData.guias) {
        files = specialtyData.guias;
    }

    if (files.length === 0) {
        guiasList.innerHTML = '<div class="alert alert-info">Nenhum guia disponível para esta especialidade.</div>';
        return;
    }

    files.forEach(fileInfo => {
        const button = document.createElement('button');
        button.className = 'list-group-item list-group-item-action';
        button.innerHTML = `<i class="fas fa-${fileInfo.icon} me-2"></i>${fileInfo.title}`;
        button.addEventListener('click', () => loadFile('guias', fileInfo.file));
        guiasList.appendChild(button);
    });
}

/**
 * Mostra a tela de seleção de resumos
 */
function showResumosSelection() {
    hideAllScreens();
    screens.resumosSelection.classList.remove('d-none');
    populateResumosList();
}

/**
 * Mostra a tela de seleção de guias
 */
function showGuiasSelection() {
    hideAllScreens();
    screens.guiasSelection.classList.remove('d-none');
    populateGuiasList();
}

/**
 * Carrega um arquivo para leitura
 * @param {string} type - Tipo do arquivo ('resumos' ou 'guias')
 * @param {string} filename - Nome do arquivo
 */
async function loadFile(type, filename) {
    try {
        currentFileType = type;
        currentFileName = filename;

        // Mapeamento de caminhos por especialidade e subcategoria
        const specialtyPaths = {
            go: {
                avc1: {
                    resumos: 'subjects/GO/AVC 1/GOResumos',
                    guias: 'subjects/GO/AVC 1/GOGuias'
                },
                avc2: {
                    resumos: 'subjects/GO/AVC 2/GOResumos',
                    guias: 'subjects/GO/AVC 2/GOGuias'
                }
            },
            cardio: {
                resumos: 'subjects/CardioPneumo/CardioPneumoResumos',
                guias: 'subjects/CardioPneumo/CardioPneumoGuias'
            },
            tc: {
                resumos: 'subjects/TecnicasCirurgicas/TCResumos',
                guias: 'subjects/TecnicasCirurgicas/TCGuias'
            },
            clinica: {
                resumos: 'subjects/ClinicaCirurgica/ClinicaCirurgicaResumos',
                guias: 'subjects/ClinicaCirurgica/ClinicaCirurgicaGuias'
            }
        };

        // Obtém o caminho correto baseado na especialidade e subcategoria
        let basePath;

        if (currentSubcategory && specialtyPaths[currentSpecialty]?.[currentSubcategory]) {
            basePath = specialtyPaths[currentSpecialty][currentSubcategory][type];
        } else if (specialtyPaths[currentSpecialty]?.[type]) {
            basePath = specialtyPaths[currentSpecialty][type];
        }

        if (!basePath) {
            throw new Error('Especialidade ou tipo de arquivo inválido');
        }

        const response = await fetch(`${basePath}/${filename}`);

        if (!response.ok) {
            throw new Error(`Erro ao carregar arquivo: ${response.status}`);
        }

        const content = await response.text();

        // Converte markdown para HTML simples
        const htmlContent = convertMarkdownToHTML(content);

        // Exibe o arquivo
        showFileReading(type, filename, htmlContent);

    } catch (error) {
        console.error('Erro ao carregar arquivo:', error);
        alert('Erro ao carregar o arquivo. Verifique se o arquivo existe.');
    }
}

/**
 * Converte markdown básico para HTML
 * @param {string} markdown - Conteúdo em markdown
 * @returns {string} HTML convertido
 */
function convertMarkdownToHTML(markdown) {
    let html = markdown;

    // Remove carriage returns
    html = html.replace(/\r/g, '');

    // Process tables first (before other processing)
    html = processMarkdownTables(html);

    // Headers (must be done in order from h6 to h1)
    html = html.replace(/^###### (.*$)/gim, '<h6>$1</h6>');
    html = html.replace(/^##### (.*$)/gim, '<h5>$1</h5>');
    html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // Horizontal rules
    html = html.replace(/^---\s*$/gim, '<hr>');

    // Bold and italic (order matters) - improved to avoid conflict with lists
    html = html.replace(/\*\*\*((?!\s).+?(?<!\s))\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*((?!\s).+?(?<!\s))\*\*/g, '<strong>$1</strong>');
    // Only match italic if not at start of line (to avoid conflict with lists)
    html = html.replace(/([^\n])\*((?!\s).+?(?<!\s))\*/g, '$1<em>$2</em>');

    // Code (inline and blocks)
    html = html.replace(/```[\s\S]*?```/g, (match) => {
        return '<pre><code>' + match.replace(/```/g, '').trim() + '</code></pre>';
    });
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');

    // Process lists BEFORE line break conversion
    const lines = html.split('\n');
    let inList = false;
    let listType = '';
    const processedLines = [];

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        const trimmedLine = line.trim();

        // Check for unordered list
        if (trimmedLine.match(/^[\*\-\+] /)) {
            if (!inList) {
                processedLines.push('<ul>');
                inList = true;
                listType = 'ul';
            } else if (listType !== 'ul') {
                processedLines.push('</ol><ul>');
                listType = 'ul';
            }
            processedLines.push('<li>' + trimmedLine.replace(/^[\*\-\+] /, '') + '</li>');
        }
        // Check for ordered list
        else if (trimmedLine.match(/^\d+\. /)) {
            if (!inList) {
                processedLines.push('<ol>');
                inList = true;
                listType = 'ol';
            } else if (listType !== 'ol') {
                processedLines.push('</ul><ol>');
                listType = 'ol';
            }
            processedLines.push('<li>' + trimmedLine.replace(/^\d+\. /, '') + '</li>');
        }
        // Not a list item
        else {
            if (inList) {
                processedLines.push(listType === 'ul' ? '</ul>' : '</ol>');
                inList = false;
                listType = '';
            }
            processedLines.push(line);
        }
    }

    if (inList) {
        processedLines.push(listType === 'ul' ? '</ul>' : '</ol>');
    }

    html = processedLines.join('\n');

    // Line breaks and paragraphs
    html = html.replace(/\n\s*\n/g, '</p><p>');
    html = html.replace(/\n/g, '<br>');

    // Wrap in paragraphs
    html = '<p>' + html + '</p>';

    // Clean up
    html = html.replace(/<p><\/p>/g, '');
    html = html.replace(/<p><br><\/p>/g, '');
    html = html.replace(/<br><\/p>/g, '</p>');
    html = html.replace(/<p><br>/g, '<p>');
    html = html.replace(/<p><h([1-6])>/g, '<h$1>');
    html = html.replace(/<\/h([1-6])><\/p>/g, '</h$1>');
    html = html.replace(/<p><hr><\/p>/g, '<hr>');
    html = html.replace(/<p><ul>/g, '<ul>');
    html = html.replace(/<\/ul><\/p>/g, '</ul>');
    html = html.replace(/<p><ol>/g, '<ol>');
    html = html.replace(/<\/ol><\/p>/g, '</ol>');
    html = html.replace(/<p><pre>/g, '<pre>');
    html = html.replace(/<\/pre><\/p>/g, '</pre>');
    html = html.replace(/<p><table>/g, '<table>');
    html = html.replace(/<\/table><\/p>/g, '</table>');

    return html;
}

/**
 * Processa tabelas markdown e converte para HTML
 * @param {string} text - Texto com possíveis tabelas markdown
 * @returns {string} Texto com tabelas convertidas para HTML
 */
function processMarkdownTables(text) {
    const lines = text.split('\n');
    const result = [];
    let inTable = false;
    let tableRows = [];
    let alignments = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Detect table rows (lines with |)
        if (line.includes('|') && line.split('|').length > 2) {
            if (!inTable) {
                inTable = true;
                tableRows = [];
            }

            // Check if this is an alignment row (contains only |, :, -, and spaces)
            if (line.match(/^[\|\:\-\s]+$/)) {
                // Parse alignments
                alignments = line.split('|').map(cell => {
                    const trimmed = cell.trim();
                    if (trimmed.startsWith(':') && trimmed.endsWith(':')) return 'center';
                    if (trimmed.endsWith(':')) return 'right';
                    return 'left';
                });
                continue; // Skip alignment row
            }

            tableRows.push(line);
        } else {
            if (inTable) {
                // End of table, process accumulated rows
                result.push(convertTableToHTML(tableRows, alignments));
                inTable = false;
                tableRows = [];
                alignments = [];
            }
            result.push(line);
        }
    }

    // Handle table at end of file
    if (inTable && tableRows.length > 0) {
        result.push(convertTableToHTML(tableRows, alignments));
    }

    return result.join('\n');
}

/**
 * Converte linhas de tabela markdown para HTML
 * @param {string[]} rows - Array de linhas da tabela
 * @param {string[]} alignments - Array de alinhamentos
 * @returns {string} HTML da tabela
 */
function convertTableToHTML(rows, alignments) {
    if (rows.length === 0) return '';

    let html = '<table class="table table-striped table-hover">';

    // Header row
    if (rows.length > 0) {
        html += '<thead><tr>';
        const headerCells = rows[0].split('|').filter(cell => cell.trim() !== '');
        headerCells.forEach((cell, index) => {
            const align = alignments[index] || 'left';
            const alignAttr = align !== 'left' ? ` style="text-align: ${align}"` : '';
            html += `<th${alignAttr}>${cell.trim()}</th>`;
        });
        html += '</tr></thead>';
    }

    // Body rows
    if (rows.length > 1) {
        html += '<tbody>';
        for (let i = 1; i < rows.length; i++) {
            html += '<tr>';
            const cells = rows[i].split('|').filter(cell => cell.trim() !== '');
            cells.forEach((cell, index) => {
                const align = alignments[index] || 'left';
                const alignAttr = align !== 'left' ? ` style="text-align: ${align}"` : '';
                html += `<td${alignAttr}>${cell.trim()}</td>`;
            });
            html += '</tr>';
        }
        html += '</tbody>';
    }

    html += '</table>';
    return html;
}

/**
 * Mostra a tela de leitura de arquivo
 * @param {string} type - Tipo do arquivo
 * @param {string} filename - Nome do arquivo
 * @param {string} content - Conteúdo HTML
 */
function showFileReading(type, filename, content) {
    hideAllScreens();
    screens.fileReading.classList.remove('d-none');

    // Define o título baseado no arquivo
    const titles = {
        '1exame.md': 'Exame Ginecológico',
        '2ciclomenstrual.md': 'Ciclo Menstrual',
        '3embrio.md': 'Embriologia',
        '4desenvolvimentopuberal.md': 'Desenvolvimento Puberal',
        '4desenvolvimento_puberal.md': 'Desenvolvimento Puberal'
    };

    const title = titles[filename] || filename.replace('.md', '');
    document.getElementById('file-title').textContent = title;

    // Define a cor do cabeçalho
    const header = document.getElementById('file-header');
    header.className = `card-header text-white ${type === 'resumos' ? 'bg-info' : 'bg-success'}`;

    // Exibe o conteúdo
    document.getElementById('file-content').innerHTML = content;
}

/**
 * Manipula o botão voltar da tela de arquivo
 */
function handleFileBack() {
    if (currentFileType === 'resumos') {
        showResumosSelection();
    } else if (currentFileType === 'guias') {
        showGuiasSelection();
    } else {
        showSpecialtySelection();
    }
}

/**
 * Esconde todas as telas
 */
function hideAllScreens() {
    Object.values(screens).forEach(screen => {
        screen.classList.add('d-none');
    });
}

/**
 * Inicia o timer do quiz
 */
function startTimer() {
    quizStartTime = new Date();
    quizSeconds = 0;
    
    // Atualiza o timer a cada segundo
    quizTimer = setInterval(() => {
        quizSeconds++;
        document.getElementById('timer').innerHTML = `<i class="fas fa-clock me-1"></i>${formatTime(quizSeconds)}`;
    }, 1000);
}

/**
 * Para o timer do quiz
 */
function stopTimer() {
    clearInterval(quizTimer);
}

/**
 * Formata o tempo em segundos para o formato MM:SS
 * @param {number} seconds - Tempo em segundos
 * @returns {string} Tempo formatado
 */
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Embaralha um array (algoritmo Fisher-Yates)
 * @param {Array} array - Array a ser embaralhado
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

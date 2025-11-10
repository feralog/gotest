/**
 * data.js - Gerenciamento de dados e carregamento das questões
 * 
 * Este arquivo é responsável por:
 * - Carregar os dados das questões de cada módulo
 * - Gerenciar o armazenamento local dos dados do usuário
 * - Fornecer funções para acessar e manipular os dados
 */

// Objeto para armazenar as questões de todos os módulos
const questionsData = {};

// Objeto para armazenar os dados do usuário
let userData = {
    username: '',
    progress: {},
    lastSession: null
};

/**
 * Inicializa o objeto questionsData com os módulos configurados
 */
function initializeQuestionsData() {
    // Inicializa para todos os módulos de todas as especialidades
    Object.values(quizConfig.specialties).forEach(specialty => {
        let modules = [];

        // Check if specialty has subcategories
        if (specialty.hasSubcategories && specialty.subcategories) {
            // Get modules from all subcategories
            Object.values(specialty.subcategories).forEach(subcategory => {
                if (subcategory.modules) {
                    modules.push(...subcategory.modules);
                }
            });
        } else if (specialty.modules) {
            // Get modules directly from specialty
            modules = specialty.modules;
        }

        modules.forEach(module => {
            questionsData[module.id] = [];

            // Inicializa o progresso para este módulo se não existir
            if (!userData.progress[module.id]) {
                userData.progress[module.id] = {};
            }
        });
    });
}

/**
 * Carrega as questões de todos os módulos
 * @returns {Promise} Promise que resolve quando todos os dados são carregados
 */
function loadAllQuestions() {
    // Inicializa o objeto de dados
    initializeQuestionsData();

    // Cria um array de promessas para carregar cada módulo de todas as especialidades
    const allModules = [];
    Object.values(quizConfig.specialties).forEach(specialty => {
        // Check if specialty has subcategories
        if (specialty.hasSubcategories && specialty.subcategories) {
            // Get modules from all subcategories
            Object.values(specialty.subcategories).forEach(subcategory => {
                if (subcategory.modules) {
                    allModules.push(...subcategory.modules);
                }
            });
        } else if (specialty.modules) {
            // Get modules directly from specialty
            allModules.push(...specialty.modules);
        }
    });

    const promises = allModules.map(module => {
        // CORREÇÃO: Remove a barra inicial para buscar arquivos na mesma pasta
        return fetch(`${module.file}.json`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                questionsData[module.id] = data;
                initializeQuestionProgress(module.id);
                console.log(`Módulo ${module.id} carregado com sucesso`);
            })
            .catch(error => {
                console.error(`Erro ao carregar o módulo ${module.id}:`, error);
                alert(`Erro ao carregar o módulo ${module.name}. Verifique se o arquivo ${module.file}.json existe.`);
            });
    });

    return Promise.all(promises);
}

/**
 * Inicializa o progresso para as questões de um módulo específico
 * @param {string} module - ID do módulo
 */
function initializeQuestionProgress(module) {
    // Para cada questão no módulo, verifica se já existe progresso
    questionsData[module].forEach((question, index) => {
        const questionId = `${module}_${index}`;
        
        // Se não existir progresso para esta questão, inicializa
        if (!userData.progress[module][questionId]) {
            userData.progress[module][questionId] = {
                seen: 0,
                correct: 0,
                incorrect: 0,
                lastSeen: null
            };
        }
    });
}

/**
 * Salva os dados do usuário no localStorage
 */
function saveUserData() {
    // Atualiza a data da última sessão
    userData.lastSession = new Date().toISOString();
    
    // Salva no localStorage
    localStorage.setItem(quizConfig.storageKey, JSON.stringify(userData));
}

/**
 * Carrega os dados do usuário do localStorage
 * @returns {boolean} True se os dados foram carregados com sucesso, false caso contrário
 */
function loadUserData() {
    const savedData = localStorage.getItem(quizConfig.storageKey);
    
    if (savedData) {
        try {
            const parsedData = JSON.parse(savedData);
            
            // Verifica se os dados têm a estrutura esperada
            if (parsedData.username && parsedData.progress) {
                userData = parsedData;
                return true;
            }
        } catch (error) {
            console.error('Erro ao carregar dados do usuário:', error);
        }
    }
    
    return false;
}

/**
 * Define o nome de usuário
 * @param {string} username - Nome de usuário
 */
function setUsername(username) {
    userData.username = username;
    saveUserData();
}

/**
 * Obtém o nome de usuário atual
 * @returns {string} Nome de usuário
 */
function getUsername() {
    return userData.username;
}

/**
 * Obtém as questões de um módulo específico
 * @param {string} module - ID do módulo
 * @returns {Array} Array de questões do módulo
 */
function getModuleQuestions(module) {
    return questionsData[module] || [];
}

/**
 * Obtém o progresso de um módulo específico
 * @param {string} module - ID do módulo
 * @returns {Object} Objeto com o progresso do módulo
 */
function getModuleProgress(module) {
    return userData.progress[module] || {};
}

/**
 * Calcula a porcentagem de progresso de um módulo
 * @param {string} module - ID do módulo
 * @returns {number} Porcentagem de progresso (0-100)
 */
function calculateModuleProgress(module) {
    const progress = getModuleProgress(module);
    const questions = getModuleQuestions(module);
    
    if (questions.length === 0) return 0;
    
    let correctCount = 0;
    let totalQuestions = questions.length;
    
    // Conta quantas questões foram respondidas corretamente pelo menos uma vez
    questions.forEach((_, index) => {
        const questionId = `${module}_${index}`;
        if (progress[questionId] && progress[questionId].correct > 0) {
            correctCount++;
        }
    });
    
    return Math.round((correctCount / totalQuestions) * 100);
}

/**
 * Calcula o progresso geral dos módulos da especialidade atual
 * @returns {number} Porcentagem de progresso geral (0-100)
 */
function calculateOverallProgress() {
    if (!currentSpecialty || !quizConfig.specialties[currentSpecialty]) {
        return 0;
    }

    const specialty = quizConfig.specialties[currentSpecialty];
    let moduleIds = [];

    // Get module IDs based on specialty structure
    if (specialty.hasSubcategories && currentSubcategory && specialty.subcategories[currentSubcategory]) {
        // Get modules from current subcategory
        moduleIds = specialty.subcategories[currentSubcategory].modules.map(module => module.id);
    } else if (specialty.modules) {
        // Get modules directly from specialty
        moduleIds = specialty.modules.map(module => module.id);
    }

    let totalProgress = 0;

    moduleIds.forEach(module => {
        totalProgress += calculateModuleProgress(module);
    });

    return moduleIds.length > 0 ? Math.round(totalProgress / moduleIds.length) : 0;
}

/**
 * Atualiza o progresso de uma questão específica
 * @param {string} module - ID do módulo
 * @param {number} questionIndex - Índice da questão
 * @param {boolean} isCorrect - Se a resposta foi correta
 */
function updateQuestionProgress(module, questionIndex, isCorrect) {
    const questionId = `${module}_${questionIndex}`;
    const now = new Date();
    
    // Se não existir progresso para esta questão, inicializa
    if (!userData.progress[module][questionId]) {
        userData.progress[module][questionId] = {
            seen: 0,
            correct: 0,
            incorrect: 0,
            lastSeen: null
        };
    }
    
    // Atualiza o progresso
    const questionProgress = userData.progress[module][questionId];
    questionProgress.seen++;
    
    if (isCorrect) {
        questionProgress.correct++;
    } else {
        questionProgress.incorrect++;
    }
    
    questionProgress.lastSeen = now.toISOString();
    
    // Salva os dados atualizados
    saveUserData();
}

/**
 * Limpa todos os dados do usuário
 */
function clearUserData() {
    userData = {
        username: '',
        progress: {},
        lastSession: null
    };

    // Inicializa o progresso para cada módulo de todas as especialidades
    Object.values(quizConfig.specialties).forEach(specialty => {
        let modules = [];

        // Check if specialty has subcategories
        if (specialty.hasSubcategories && specialty.subcategories) {
            // Get modules from all subcategories
            Object.values(specialty.subcategories).forEach(subcategory => {
                if (subcategory.modules) {
                    modules.push(...subcategory.modules);
                }
            });
        } else if (specialty.modules) {
            // Get modules directly from specialty
            modules = specialty.modules;
        }

        modules.forEach(module => {
            userData.progress[module.id] = {};
        });
    });

    localStorage.removeItem(quizConfig.storageKey);
}

// Configura o salvamento automático a cada 10 segundos
setInterval(saveUserData, 10000);

// Configura o salvamento ao fechar a página
window.addEventListener('beforeunload', saveUserData);

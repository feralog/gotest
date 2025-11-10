/**
 * ============================================
 * AUTHENTICATION MANAGER
 * ============================================
 *
 * Este arquivo gerencia toda a lógica de autenticação,
 * navegação da sidebar e integração com Supabase.
 */

// ============================================
// STATE MANAGEMENT
// ============================================

const AuthState = {
    currentUser: null,
    currentProfile: null,
    isAuthenticated: false
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    console.log('Auth.js inicializado')

    // Verificar se está autenticado
    await checkAuthStatus()

    // Setup event listeners
    setupAuthListeners()
    setupSidebarListeners()
    setupProfileListeners()
})

// ============================================
// AUTH STATUS CHECK
// ============================================

async function checkAuthStatus() {
    try {
        const user = await AuthService.getCurrentUser()

        if (user) {
            // Usuário está autenticado
            AuthState.currentUser = user
            AuthState.isAuthenticated = true

            // Carregar perfil
            AuthState.currentProfile = await AuthService.getUserProfile()

            // Mostrar sidebar e ir para tela de especialidades
            showSidebar()
            showScreen('specialty-selection-screen')

            console.log('✅ Usuário autenticado:', user.email)
        } else {
            // Usuário não autenticado - mostrar tela de login
            hideSidebar()
            showScreen('auth-screen')

            console.log('ℹ️ Usuário não autenticado - mostrando tela de login')
        }
    } catch (error) {
        // Erro ao verificar sessão (esperado se não houver sessão)
        console.log('ℹ️ Nenhuma sessão ativa - mostrando tela de login')
        hideSidebar()
        showScreen('auth-screen')
    }
}

// ============================================
// AUTH EVENT LISTENERS
// ============================================

function setupAuthListeners() {
    // Login e Register agora são inline no HTML

    // Logout Button
    const logoutBtn = document.getElementById('logout-btn')
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout)
    }
}

// Login e Register handlers estão inline no HTML

// ============================================
// LOGOUT HANDLER
// ============================================

async function handleLogout() {
    if (!confirm('Deseja realmente sair?')) return

    const result = await AuthService.signOut()

    if (result.success) {
        // Resetar state
        AuthState.currentUser = null
        AuthState.currentProfile = null
        AuthState.isAuthenticated = false

        // Esconder sidebar e mostrar tela de auth
        hideSidebar()
        showScreen('auth-screen')

        showAuthAlert('Você saiu da sua conta.', 'info')
    } else {
        alert('Erro ao fazer logout')
    }
}

// ============================================
// SIDEBAR MANAGEMENT
// ============================================

function setupSidebarListeners() {
    // Toggle Sidebar
    const sidebarToggle = document.getElementById('sidebar-toggle')
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', toggleSidebar)
    }

    // Specialty buttons
    const specialtyButtons = document.querySelectorAll('.sidebar-item[data-specialty]')
    specialtyButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const specialty = e.currentTarget.getAttribute('data-specialty')
            handleSpecialtyNavigation(specialty)
        })
    })

    // Home button
    const homeBtn = document.getElementById('sidebar-home-btn')
    if (homeBtn) {
        homeBtn.addEventListener('click', () => {
            showScreen('specialty-selection-screen')
        })
    }

    // Profile button
    const profileBtn = document.getElementById('sidebar-profile-btn')
    if (profileBtn) {
        profileBtn.addEventListener('click', () => {
            showProfileScreen()
        })
    }
}

function showSidebar() {
    const sidebar = document.getElementById('sidebar')
    const mainContent = document.getElementById('main-content')

    if (sidebar && mainContent) {
        sidebar.classList.remove('d-none')
        mainContent.classList.add('with-sidebar')

        // Atualizar nome do usuário na sidebar
        updateSidebarUserInfo()
    }
}

function hideSidebar() {
    const sidebar = document.getElementById('sidebar')
    const mainContent = document.getElementById('main-content')

    if (sidebar && mainContent) {
        sidebar.classList.add('d-none')
        mainContent.classList.remove('with-sidebar', 'with-sidebar-collapsed')
    }
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar')
    const mainContent = document.getElementById('main-content')

    if (sidebar && mainContent) {
        sidebar.classList.toggle('collapsed')

        if (sidebar.classList.contains('collapsed')) {
            mainContent.classList.remove('with-sidebar')
            mainContent.classList.add('with-sidebar-collapsed')
        } else {
            mainContent.classList.remove('with-sidebar-collapsed')
            mainContent.classList.add('with-sidebar')
        }
    }
}

function updateSidebarUserInfo() {
    const usernameEl = document.getElementById('sidebar-username')

    if (usernameEl && AuthState.currentProfile) {
        usernameEl.textContent = AuthState.currentProfile.display_name || AuthState.currentProfile.username || 'Usuário'
    }
}

function handleSpecialtyNavigation(specialty) {
    // Esta função será integrada com o app.js existente
    // Por enquanto, apenas mostra a tela de especialidade
    showScreen('specialty-selection-screen')

    // Disparar evento customizado que app.js pode escutar
    const event = new CustomEvent('sidebarSpecialtySelected', {
        detail: { specialty }
    })
    document.dispatchEvent(event)
}

// ============================================
// PROFILE SCREEN MANAGEMENT
// ============================================

function setupProfileListeners() {
    // Profile Form
    const profileForm = document.getElementById('profile-form')
    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileUpdate)
    }

    // Password Form
    const passwordForm = document.getElementById('password-form')
    if (passwordForm) {
        passwordForm.addEventListener('submit', handlePasswordUpdate)
    }

    // Back button
    const backBtn = document.getElementById('profile-back-btn')
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            showScreen('specialty-selection-screen')
        })
    }
}

async function showProfileScreen() {
    // Carregar dados do perfil
    await loadProfileData()

    // Carregar estatísticas
    await loadProfileStats()

    // Mostrar tela
    showScreen('profile-screen')
}

async function loadProfileData() {
    if (!AuthState.currentUser) return

    // Email
    document.getElementById('profile-email').textContent = AuthState.currentUser.email || '-'

    // Perfil
    const profile = await AuthService.getUserProfile()
    if (profile) {
        AuthState.currentProfile = profile

        document.getElementById('profile-username').textContent = profile.username || '-'
        document.getElementById('profile-display-name').value = profile.display_name || ''
        document.getElementById('profile-new-username').value = profile.username || ''
    }
}

async function loadProfileStats() {
    try {
        const allProgress = await DataSyncService.getAllProgress()

        if (allProgress && allProgress.length > 0) {
            // Módulos iniciados
            const modulesStarted = allProgress.length
            document.getElementById('profile-modules-started').textContent = modulesStarted

            // Módulos completos (100%)
            const modulesCompleted = allProgress.filter(p => p.completion_percentage >= 100).length
            document.getElementById('profile-modules-completed').textContent = modulesCompleted

            // Progresso médio
            const avgCompletion = allProgress.reduce((sum, p) => sum + (p.completion_percentage || 0), 0) / modulesStarted
            document.getElementById('profile-avg-completion').textContent = Math.round(avgCompletion) + '%'
        } else {
            document.getElementById('profile-modules-started').textContent = '0'
            document.getElementById('profile-modules-completed').textContent = '0'
            document.getElementById('profile-avg-completion').textContent = '0%'
        }
    } catch (error) {
        console.error('Erro ao carregar estatísticas:', error)
    }
}

async function handleProfileUpdate(e) {
    e.preventDefault()

    const displayName = document.getElementById('profile-display-name').value.trim()
    const username = document.getElementById('profile-new-username').value.trim()

    showProfileAlert('Salvando alterações...', 'info')

    const result = await AuthService.updateProfile({
        display_name: displayName,
        username: username
    })

    if (result.success) {
        showProfileAlert('Perfil atualizado com sucesso!', 'success')
        AuthState.currentProfile = result.data
        updateSidebarUserInfo()
    } else {
        showProfileAlert('Erro ao atualizar perfil: ' + result.error, 'danger')
    }
}

async function handlePasswordUpdate(e) {
    e.preventDefault()

    const newPassword = document.getElementById('profile-new-password').value
    const confirmPassword = document.getElementById('profile-confirm-password').value

    if (!newPassword || !confirmPassword) {
        showProfileAlert('Preencha ambos os campos de senha!', 'warning')
        return
    }

    if (newPassword !== confirmPassword) {
        showProfileAlert('As senhas não coincidem!', 'danger')
        return
    }

    if (newPassword.length < 6) {
        showProfileAlert('A senha deve ter no mínimo 6 caracteres!', 'danger')
        return
    }

    showProfileAlert('Alterando senha...', 'info')

    const result = await AuthService.updatePassword(newPassword)

    if (result.success) {
        showProfileAlert('Senha alterada com sucesso!', 'success')

        // Limpar campos
        document.getElementById('profile-new-password').value = ''
        document.getElementById('profile-confirm-password').value = ''
    } else {
        showProfileAlert('Erro ao alterar senha: ' + result.error, 'danger')
    }
}

// ============================================
// SCREEN MANAGEMENT
// ============================================

function showScreen(screenId) {
    // Esconder todas as telas
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.add('d-none')
    })

    // Mostrar tela específica
    const screen = document.getElementById(screenId)
    if (screen) {
        screen.classList.remove('d-none')
    }
}

// ============================================
// ALERT HELPERS
// ============================================

// showAuthAlert agora está inline no HTML

function showProfileAlert(message, type = 'info') {
    const alert = document.getElementById('profile-alert')
    const alertMessage = document.getElementById('profile-alert-message')

    if (alert && alertMessage) {
        alert.className = `alert alert-${type} alert-dismissible fade show mt-3`
        alertMessage.textContent = message

        // Auto-hide após 5 segundos
        setTimeout(() => {
            alert.classList.remove('show')
        }, 5000)
    }
}

// ============================================
// EXPORT AUTH STATE (para uso em app.js)
// ============================================

window.AuthState = AuthState
window.showScreen = showScreen

console.log('Auth.js carregado com sucesso!')

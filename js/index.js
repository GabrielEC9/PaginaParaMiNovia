// js/index.js
import { requireAuth, getUserProfile, logout } from './auth.js'

document.addEventListener('DOMContentLoaded', async () => {
  const mainContent = document.getElementById('main-content')
  const adminMenu = document.getElementById('admin-menu')
  const userMenu = document.getElementById('user-menu')
  const logoutBtn = document.getElementById('logout-btn')

  // Ocultar todo mientras valida
  mainContent.hidden = true

  try {
    // 🔐 Verificar sesión
    const user = await requireAuth()
    if (!user) return

    // 👤 Obtener perfil
    const profile = await getUserProfile()
    if (!profile) {
      window.location.href = 'login.html'
      return
    }

    // 🎭 Mostrar menú según rol
    if (profile.role === 'admin') {
      adminMenu.classList.remove('hidden')
    } else {
      userMenu.classList.remove('hidden')
    }

    // Mostrar contenido
    mainContent.hidden = false

    // Logout
    logoutBtn.addEventListener('click', logout)

  } catch (err) {
    console.error('Error en index:', err)
    window.location.href = 'login.html'
  }
})

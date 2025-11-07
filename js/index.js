// js/index.js
import { requireAuth, getUserProfile, logout } from './auth.js'

document.addEventListener('DOMContentLoaded', async () => {
  const mainContent = document.getElementById('main-content')
  const adminMenu = document.getElementById('admin-menu')
  const userMenu = document.getElementById('user-menu')

  try {
    // Oculta el contenido principal hasta verificar sesión
    if (mainContent) mainContent.hidden = true

    // Verifica sesión
    const user = await requireAuth()
    if (!user) return  // ya redirigió a login

    // Obtiene perfil
    const perfil = await getUserProfile()
    if (!perfil) {
      console.error('No se pudo obtener perfil')
      return
    }

    // Muestra menú según rol
    if (perfil.role === 'admin') {
      adminMenu?.classList.remove('hidden')
    } else {
      userMenu?.classList.remove('hidden')
    }

    // Muestra contenido principal
    if (mainContent) mainContent.hidden = false

    // Configura logout
    const logoutBtn = document.getElementById('logout-btn')
    if (logoutBtn) logoutBtn.addEventListener('click', () => logout())

  } catch (err) {
    console.error('Error al cargar página:', err)
    window.location.href = 'login.html'
  }
})

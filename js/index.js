// js/index.js
import { supabase } from './supabaseClient.js'
import { requireAuth, getUserProfile, logout } from './auth.js'

document.addEventListener('DOMContentLoaded', async () => {
  const mainContent = document.getElementById('main-content')
  const adminMenu = document.getElementById('admin-menu')
  const userMenu = document.getElementById('user-menu')

  // Verifica sesión
  const user = await requireAuth()
  if (!user) return  // ya redirigió a login si no hay usuario

  // Obtiene perfil
  const perfil = await getUserProfile()
  if (!perfil) return

  // Muestra menú según rol
  if (perfil.rol === 'admin') {
    adminMenu.classList.remove('hidden')
  } else {
    userMenu.classList.remove('hidden')
  }

  // Mostrar el contenido principal
  mainContent.hidden = false

  // Configura logout
  const logoutBtn = document.getElementById('logout-btn')
  if (logoutBtn) logoutBtn.addEventListener('click', () => logout())
})

// js/index.js
import { supabase } from './supabaseClient.js'
import { requireAuth, getUserProfile, logout } from './auth.js'

document.addEventListener('DOMContentLoaded', async () => {
  // Oculta ambos menús inicialmente
  const adminMenu = document.getElementById('admin-menu')
  const userMenu = document.getElementById('user-menu')
  adminMenu.classList.add('hidden')
  userMenu.classList.add('hidden')

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

  // Opcional: mostrar bienvenida si quieres
  const bienvenida = document.getElementById('bienvenida')
  if (bienvenida) {
    bienvenida.textContent = perfil.nombre ? `Bienvenido(a), ${perfil.nombre} 🐞` : 'Bienvenido(a) 🐞'
  }

  // Configura logout
  const logoutBtn = document.getElementById('logout-btn')
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => logout())
  }
})

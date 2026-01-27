import { getSessionUser, getUserProfile, logout } from './auth.js'

document.addEventListener('DOMContentLoaded', async () => {
  const mainContent = document.getElementById('main-content')
  const adminMenu = document.getElementById('admin-menu')
  const userMenu = document.getElementById('user-menu')
  const logoutBtn = document.getElementById('logout-btn')

  mainContent.hidden = true

  // ⏳ Esperar un tick a que Supabase hidrate sesión
  await new Promise(r => setTimeout(r, 50))

  const user = await getSessionUser()
  if (!user) {
    window.location.replace('login.html')
    return
  }

  const profile = await getUserProfile(user.id)
  if (!profile) {
    window.location.replace('login.html')
    return
  }

  if (profile.role === 'admin') {
    adminMenu.classList.remove('hidden')
  } else {
    userMenu.classList.remove('hidden')
  }

  mainContent.hidden = false
  logoutBtn.addEventListener('click', logout)
})

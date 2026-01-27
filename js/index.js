// js/index.js
import { requireAuth, getUserProfile, logout } from './auth.js'

document.addEventListener('DOMContentLoaded', async () => {
  const mainContent = document.getElementById('main-content')
  const adminMenu = document.getElementById('admin-menu')
  const userMenu = document.getElementById('user-menu')
  const logoutBtn = document.getElementById('logout-btn')

  mainContent.hidden = true

  const user = await requireAuth()
  if (!user) return

  const profile = await getUserProfile()
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


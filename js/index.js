// js/index.js
import { onAuthReady, logout } from './auth.js'
import { supabase } from './supabaseClient.js'

document.addEventListener('DOMContentLoaded', () => {
  const main = document.getElementById('main-content')
  const adminMenu = document.getElementById('admin-menu')
  const userMenu = document.getElementById('user-menu')
  const logoutBtn = document.getElementById('logout-btn')

  main.hidden = true

  onAuthReady(async (session) => {
    if (!session) {
      window.location.href = 'login.html'
      return
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (error || !profile) {
      window.location.href = 'login.html'
      return
    }

    if (profile.role === 'admin') {
      adminMenu.classList.remove('hidden')
    } else {
      userMenu.classList.remove('hidden')
    }

    main.hidden = false
    logoutBtn.addEventListener('click', logout)
  })
})

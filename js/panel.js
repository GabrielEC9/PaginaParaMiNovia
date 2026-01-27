import { supabase } from './supabaseClient.js'
import { logout } from './auth.js'

document.addEventListener('DOMContentLoaded', async () => {
  const main = document.getElementById('main-content')
  const adminMenu = document.getElementById('admin-menu')
  const userMenu = document.getElementById('user-menu')
  const logoutBtn = document.getElementById('logout-btn')

  logoutBtn?.addEventListener('click', async () => {
    await logout()
  })

  const { data, error } = await supabase.auth.getSession()

  if (error || !data.session) {
    window.location.href = 'login.html'
    return
  }

  const session = data.session

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (profileError || !profile) {
    await supabase.auth.signOut()
    window.location.href = 'login.html'
    return
  }

  if (profile.role === 'admin') {
    adminMenu?.classList.remove('hidden')
  } else {
    userMenu?.classList.remove('hidden')
  }

  main.hidden = false
})

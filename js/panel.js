import { supabase } from './supabaseClient.js'

document.addEventListener('DOMContentLoaded', async () => {
  const main = document.getElementById('main-content')
  const adminMenu = document.getElementById('admin-menu')
  const userMenu = document.getElementById('user-menu')

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    window.location.replace('index.html') // vuelve al gate
    return
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (profile.role === 'admin') {
    adminMenu.classList.remove('hidden')
  } else {
    userMenu.classList.remove('hidden')
  }

  main.hidden = false
})

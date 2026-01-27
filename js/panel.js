import { supabase } from './supabaseClient.js'

document.addEventListener('DOMContentLoaded', async () => {
  const main = document.getElementById('main-content')
  const adminMenu = document.getElementById('admin-menu')
  const userMenu = document.getElementById('user-menu')

  // 🔒 Verificar sesión UNA SOLA VEZ
  const { data, error } = await supabase.auth.getSession()

  if (error || !data.session) {
    window.location.replace('login.html')
    return
  }

  const session = data.session

  // 👤 Obtener perfil
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (profileError || !profile) {
    console.error(profileError)
    await supabase.auth.signOut()
    window.location.replace('login.html')
    return
  }

  // 🎭 Mostrar menú según rol
  if (profile.role === 'admin') {
    adminMenu?.classList.remove('hidden')
  } else {
    userMenu?.classList.remove('hidden')
  }

  // ✅ Mostrar panel SOLO cuando todo esté listo
  main.hidden = false
})

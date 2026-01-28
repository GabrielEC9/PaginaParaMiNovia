import { supabase } from './supabaseClient.js'
import { logout } from './auth.js'

document.addEventListener('DOMContentLoaded', async () => {
  const main = document.getElementById('main-content')
  const adminMenu = document.getElementById('admin-menu')
  const userMenu = document.getElementById('user-menu')
  const logoutBtn = document.getElementById('logout-btn')

  // Evento de cerrar sesión
  logoutBtn?.addEventListener('click', async () => {
    await logout()
    window.location.replace('login.html')
  })

  // Obtener sesión actual
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()

  if (sessionError || !session) {
    // Si no hay sesión, redirigir a login
    window.location.href = 'login.html'
    return
  }

  try {
    // Obtener el perfil del usuario
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (profileError || !profile) throw profileError || new Error('Perfil no encontrado')

    // Ocultar ambos menús por seguridad
    adminMenu?.classList.add('hidden')
    userMenu?.classList.add('hidden')

    // Mostrar solo el menú correspondiente
    if (profile.role === 'admin') {
      adminMenu?.classList.remove('hidden')
    } else {
      userMenu?.classList.remove('hidden')
    }

    // Mostrar el contenido principal
    main.hidden = false
  } catch (err) {
    console.error('Error cargando perfil:', err)
    await supabase.auth.signOut()
    window.location.href = 'login.html'
  }
})

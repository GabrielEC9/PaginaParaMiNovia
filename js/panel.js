import { supabase } from './supabaseClient.js'
import { logout } from './auth.js'

document.addEventListener('DOMContentLoaded', async () => {
  const main = document.getElementById('main-content')
  const adminMenu = document.getElementById('admin-menu')
  const userMenu = document.getElementById('user-menu')
  const logoutBtn = document.getElementById('logout-btn')

  // Ocultar ambos menús al inicio
  adminMenu?.classList.add('hidden')
  userMenu?.classList.add('hidden')
  main.hidden = true

  // Evento de cerrar sesión
  logoutBtn?.addEventListener('click', async () => {
    await logout()
    window.location.replace('login.html')
  })

  // Obtener la sesión actual
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

  if (sessionError || !sessionData.session) {
    window.location.href = 'login.html'
    return
  }

  const user = sessionData.session.user

  try {
    // Obtener el perfil desde la tabla profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || !profile.role) {
      throw profileError || new Error('Perfil no encontrado o rol inválido')
    }

    // Debug: ver qué rol llega
    console.log('Rol del usuario:', profile.role)

    // Mostrar solo el menú correspondiente
    const role = profile.role.trim().toLowerCase()
    if (role === 'admin') {
      adminMenu.classList.remove('hidden')
      userMenu.classList.add('hidden')
    } else if (role === 'user') {
      userMenu.classList.remove('hidden')
      adminMenu.classList.add('hidden')
    } else {
      adminMenu.classList.add('hidden')
      userMenu.classList.add('hidden')
      console.warn('Rol desconocido:', profile.role)
    }

    // Mostrar contenedor principal
    main.hidden = false
  } catch (err) {
    console.error('Error cargando perfil:', err)
    await supabase.auth.signOut()
    window.location.href = 'login.html'
  }
})

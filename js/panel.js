import { supabase } from './supabaseClient.js'
import { logout } from './auth.js'

document.addEventListener('DOMContentLoaded', async () => {
  const main = document.getElementById('main-content')
  const adminMenu = document.getElementById('admin-menu')
  const userMenu = document.getElementById('user-menu')
  const logoutBtn = document.getElementById('logout-btn')

  // Ocultar ambos menús por seguridad
  adminMenu?.classList.add('hidden')
  userMenu?.classList.add('hidden')
  main.hidden = true

  // Evento de cerrar sesión
  logoutBtn?.addEventListener('click', async () => {
    await logout()
    window.location.replace('login.html')
  })

  // Obtener usuario activo
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    window.location.href = 'login.html'
    return
  }

  try {
    // Obtener perfil desde la tabla profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || !profile.role) {
      throw profileError || new Error('Perfil no encontrado o rol inválido')
    }

    // Mostrar el menú según el rol (asegurando minúsculas)
    const role = profile.role.toLowerCase()
    if (role === 'admin') {
      adminMenu.classList.remove('hidden')
    } else if (role === 'user') {
      userMenu.classList.remove('hidden')
    } else {
      console.warn('Rol desconocido:', profile.role)
    }

    // Finalmente mostrar el contenedor principal
    main.hidden = false
  } catch (err) {
    console.error('Error cargando perfil:', err)
    await supabase.auth.signOut()
    window.location.href = 'login.html'
  }
})

import { supabase } from './supabaseClient.js'
import { logout } from './auth.js'

document.addEventListener('DOMContentLoaded', async () => {
  const main = document.getElementById('main-content')
  const menuContainer = document.getElementById('menu-container')
  const logoutBtn = document.getElementById('logout-btn')

  main.hidden = true

  logoutBtn?.addEventListener('click', async () => {
    await logout()
    window.location.replace('login.html')
  })

  // Espera a que la sesión exista antes de generar el menú
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
  if (sessionError || !sessionData.session) {
    window.location.href = 'login.html'
    return
  }

  const user = sessionData.session.user

  try {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || !profile.role) {
      throw profileError || new Error('Perfil no encontrado o rol inválido')
    }

    const role = profile.role.trim().toLowerCase()
    console.log('Rol detectado:', role)

    // Generar el menú según el rol
    const buttons = []
    if (role === 'admin') {
      buttons.push(
        { text: '📸 Álbum', href: 'album.html' },
        { text: '💌 Frases', href: 'frases.html' },
        { text: '🐞 Curiosidades', href: 'curiosidades.html' },
        { text: '🛍️ Tienda', href: 'tienda.html' },
        { text: '🎁 Recompensas', href: 'recompensas.html' },
        { text: '✏️ Subir contenido', href: 'admin-form.html' },
        { text: '🔔 Notificaciones', href: 'notificaciones.html' }
      )
    } else if (role === 'user') {
      buttons.push(
        { text: '📸 Álbum', href: 'album.html' },
        { text: '💌 Frases', href: 'frases.html' },
        { text: '🐞 Curiosidades', href: 'curiosidades.html' },
        { text: '🛍️ Tienda', href: 'tienda.html' },
        { text: '🎁 Recompensas', href: 'recompensas.html' }
      )
    } else {
      throw new Error('Rol desconocido')
    }

    // Limpiar menú existente y crear botones
    menuContainer.innerHTML = ''
    buttons.forEach(btn => {
      const a = document.createElement('a')
      a.href = btn.href
      a.className = 'btn-ladybug floating-card'
      a.textContent = btn.text
      menuContainer.appendChild(a)
    })

    // Mostrar contenedor principal
    main.hidden = false
  } catch (err) {
    console.error('Error cargando perfil:', err)
    await supabase.auth.signOut()
    window.location.href = 'login.html'
  }
})


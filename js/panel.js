import { supabase } from './supabaseClient.js'
import { logout } from './auth.js'

// Función para esperar que la sesión esté lista
async function waitForSession(maxRetries = 50, delayMs = 50) {
  for (let i = 0; i < maxRetries; i++) {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) return session
    await new Promise(r => setTimeout(r, delayMs))
  }
  return null
}

document.addEventListener('DOMContentLoaded', async () => {
  const main = document.getElementById('main-content')
  const menuContainer = document.getElementById('menu-container')
  const logoutBtn = document.getElementById('logout-btn')

  // Inicialmente ocultar todo
  main.hidden = true
  menuContainer.innerHTML = ''

  // Cerrar sesión
  logoutBtn?.addEventListener('click', async () => {
    await logout()
    window.location.replace('login.html')
  })

  // Esperar a que la sesión exista
  const session = await waitForSession()
  if (!session) {
    window.location.href = 'login.html'
    return
  }

  const user = session.user

  try {
    // Obtener rol del usuario desde profiles
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

    // Definir botones según rol
    let buttons = []
    if (role === 'admin') {
      buttons = [
        { text: '📸 Álbum', href: 'album.html' },
        { text: '💌 Frases', href: 'frases.html' },
        { text: '🐞 Curiosidades', href: 'curiosidades.html' },
        { text: '🛍️ Tienda', href: 'tienda.html' },
        { text: '🎁 Recompensas', href: 'recompensas.html' },
        { text: '✏️ Subir contenido', href: 'admin-form.html' },
        { text: '🔔 Notificaciones', href: 'notificaciones.html' }
      ]
    } else if (role === 'user') {
      buttons = [
        { text: '📸 Álbum', href: 'album.html' },
        { text: '💌 Frases', href: 'frases.html' },
        { text: '🐞 Curiosidades', href: 'curiosidades.html' },
        { text: '🛍️ Tienda', href: 'tienda.html' },
        { text: '🎁 Recompensas', href: 'recompensas.html' }
      ]
    } else {
      throw new Error('Rol desconocido')
    }

    // Crear botones dinámicamente
    buttons.forEach(btn => {
      const a = document.createElement('a')
      a.href = btn.href
      a.className = 'btn-ladybug floating-card'
      a.textContent = btn.text
      menuContainer.appendChild(a)
    })

    // Mostrar el contenido principal
    main.hidden = false
  } catch (err) {
    console.error('Error cargando perfil:', err)
    await supabase.auth.signOut()
    window.location.href = 'login.html'
  }
})

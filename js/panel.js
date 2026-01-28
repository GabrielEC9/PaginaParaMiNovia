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

  // Obtener sesión
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

    // Limpiar contenedor
    menuContainer.innerHTML = ''

    if (role === 'user') {
      // ----- Mensaje de bienvenida -----
      const saludo = document.createElement('p')
      saludo.className = 'intro-text'
      saludo.innerHTML = '¡Hola mi amor! 💖<br>Bienvenida a nuestra página de recuerdos juntos.'
      menuContainer.appendChild(saludo)

      // ----- Secciones con explicación y botones -----
      const sections = [
        {
          title: '📸 Álbum',
          text: 'Aquí puedes ver y subir nuestras fotos favoritas juntos.',
          href: 'album.html'
        },
        {
          title: '💌 Frases',
          text: 'Pequeños mensajes y frases que compartimos.',
          href: 'frases.html'
        },
        {
          title: '🐞 Curiosidades',
          text: 'Datos curiosos o momentos divertidos que queremos recordar.',
          href: 'curiosidades.html'
        },
        {
          title: '🛍️ Tienda',
          text: 'Nuestra tienda especial para pequeñas sorpresas.',
          href: 'tienda.html'
        },
        {
          title: '🎁 Recompensas',
          text: 'Recompensas y regalos que hemos compartido.',
          href: 'recompensas.html'
        }
      ]

      sections.forEach(section => {
        // Texto de la sección
        const secText = document.createElement('p')
        secText.className = 'section-text'
        secText.textContent = section.text
        menuContainer.appendChild(secText)

        // Botón de la sección
        const a = document.createElement('a')
        a.href = section.href
        a.className = 'btn-ladybug floating-card'
        a.textContent = section.title
        menuContainer.appendChild(a)
      })

    } else if (role === 'admin') {
      // Botones del admin sin mensajes
      const buttons = [
        { text: '📸 Álbum', href: 'album.html' },
        { text: '💌 Frases', href: 'frases.html' },
        { text: '🐞 Curiosidades', href: 'curiosidades.html' },
        { text: '🛍️ Tienda', href: 'tienda.html' },
        { text: '🎁 Recompensas', href: 'recompensas.html' },
        { text: '✏️ Subir contenido', href: 'admin-form.html' },
        { text: '🔔 Notificaciones', href: 'notificaciones.html' }
      ]

      const buttonsContainer = document.createElement('div')
      buttonsContainer.className = 'buttons-grid'

      buttons.forEach(btn => {
        const a = document.createElement('a')
        a.href = btn.href
        a.className = 'btn-ladybug floating-card'
        a.textContent = btn.text
        buttonsContainer.appendChild(a)
      })

      menuContainer.appendChild(buttonsContainer)

    } else {
      throw new Error('Rol desconocido')
    }

    // Mostrar contenido principal
    main.hidden = false

  } catch (err) {
    console.error('Error cargando perfil:', err)
    await supabase.auth.signOut()
    window.location.href = 'login.html'
  }
})

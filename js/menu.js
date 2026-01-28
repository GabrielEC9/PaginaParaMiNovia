import { supabase } from './supabaseClient.js'
import { logout } from './auth.js'

document.addEventListener('DOMContentLoaded', async () => {
  const menu = document.getElementById('menu-links')
  const logoutBtn = document.getElementById('logout-btn')

  logoutBtn?.addEventListener('click', async () => {
    await logout()
    window.location.replace('login.html')
  })

  const { data: sessionData } = await supabase.auth.getSession()
  if (!sessionData?.session) {
    window.location.href = 'login.html'
    return
  }

  const user = sessionData.session.user

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (error || !profile) {
    await supabase.auth.signOut()
    window.location.href = 'login.html'
    return
  }

  const role = profile.role

  const links = [
    { text: '🐞Inicio', href: 'panel.html' },
    { text: '📸 Álbum', href: 'album.html' },
    { text: '💌 Frases', href: 'frases.html' },
    { text: '❓ Curiosidades', href: 'curiosidades.html' },
    { text: '🛍️ Tienda', href: 'tienda.html' },
    { text: '🎁 Recompensas', href: 'recompensas.html' }
  ]

  if (role === 'admin') {
    links.push(
      { text: '✏️ Subir contenido', href: 'admin-form.html' },
      { text: '🔔 Notificaciones', href: 'notificaciones.html' }
    )
  }

  menu.innerHTML = ''
  links.forEach(link => {
    const a = document.createElement('a')
    a.href = link.href
    a.textContent = link.text
    a.className = 'menu-btn'
    menu.appendChild(a)
  })
})

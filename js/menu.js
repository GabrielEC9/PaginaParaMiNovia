import { supabase } from './supabaseClient.js'
import { logout } from './auth.js'

document.addEventListener('DOMContentLoaded', async () => {
  const menu = document.getElementById('menu-links')
  const logoutBtn = document.getElementById('logout-btn')
  const toggleBtn = document.getElementById('menu-toggle')

const overlay = document.getElementById('menu-overlay')

/* ===== TOGGLE MENU ===== */
toggleBtn?.addEventListener('click', () => {
  const isOpen = menu.classList.toggle('open')
  overlay.classList.toggle('active', isOpen)
})

/* ===== CERRAR TOCANDO FUERA ===== */
overlay?.addEventListener('click', () => {
  menu.classList.remove('open')
  overlay.classList.remove('active')
})

  /* ===== LOGOUT ===== */
  logoutBtn?.addEventListener('click', async () => {
    await logout()
    window.location.replace('login.html')
  })

  /* ===== SESIÓN ===== */
  const { data: sessionData } = await supabase.auth.getSession()
  if (!sessionData?.session) {
    window.location.href = 'login.html'
    return
  }

  const user = sessionData.session.user

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = profile?.role || 'user'

  /* ===== LINKS ===== */
  const links = [
    { text: '🏠 Inicio', href: 'panel.html' },
    { text: '📸 Álbum', href: 'album.html' },
    { text: '💌 Frases', href: 'frases.html' },
    { text: '❓ Curiosidades', href: 'curiosidades.html' },
    { text: '🛍️ Tienda', href: 'tienda.html' },
    { text: '🎁 Recompensas', href: 'recompensas.html' },
    { text: '👀 🤔', href: 'chambeando.html' }
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

a.addEventListener('click', () => {
  menu.classList.remove('open')
  overlay.classList.remove('active')
})

    menu.appendChild(a)
  })

  const currentPage = window.location.pathname.split('/').pop()
  menu.querySelectorAll('.menu-btn').forEach(btn => {
    if (btn.getAttribute('href') === currentPage) {
      btn.classList.add('active')
    }
  })
})

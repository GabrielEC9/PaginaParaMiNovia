import { supabase } from './supabaseClient.js'
import { logout } from './auth.js'

document.addEventListener('DOMContentLoaded', async () => {
  const menu = document.getElementById('menu-links')
  const logoutBtn = document.getElementById('logout-btn')
  const toggleBtn = document.getElementById('menu-toggle')

const overlay = document.getElementById('menu-overlay')
const closeBtn = document.getElementById('close-menu')
const itemsContainer = menu.querySelector('.menu-items')
const anniversaryEl = document.getElementById('anniversary-countdown')

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

/* ===== BOTON CERRAR ===== */
closeBtn?.addEventListener('click', () => {
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
    { text: '💎 Cosas Gustan de Ti', href: 'gustan.html' },
    { text: '🛍️ Tienda', href: 'tienda.html' },
    { text: '🎁 Recompensas', href: 'recompensas.html' },
    { text: '😱😱😱😱', href: 'chambeando.html' }
  ]

  if (role === 'admin') {
    links.push(
      { text: '✏️ Subir contenido', href: 'admin-form.html' },
      { text: 'Pruebas', href: 'gustan.html' },
      { text: '🔔 Notificaciones', href: 'notificaciones.html' }
    )
  }

itemsContainer.innerHTML = ''
  links.forEach(link => {
    const a = document.createElement('a')
    a.href = link.href
    a.textContent = link.text
    a.className = 'menu-btn'

a.addEventListener('click', () => {
  menu.classList.remove('open')
  overlay.classList.remove('active')
})

    itemsContainer.appendChild(a)
  })

  const currentPage = window.location.pathname.split('/').pop()
  menu.querySelectorAll('.menu-btn').forEach(btn => {
    if (btn.getAttribute('href') === currentPage) {
      btn.classList.add('active')
    }
  })
  
  /* ===== CONTADOR ANIVERSARIO ===== */

function updateAnniversaryCountdown() {

  if (!anniversaryEl) return

  const targetDate = new Date('2027-02-25T00:00:00')
  const now = new Date()

  let diff = targetDate - now

  // SI YA LLEGÓ
  if (diff <= 0) {
    anniversaryEl.textContent = '0 meses, 0 días y 0 horas'
    return
  }

  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(hours / 24)

  const remainingHours = hours % 24
  const months = Math.floor(days / 30)
  const remainingDays = days % 30

  anniversaryEl.textContent =
    `${months} meses, ${remainingDays} días y ${remainingHours} horas`
}

updateAnniversaryCountdown()

setInterval(updateAnniversaryCountdown, 1000 * 60)
})

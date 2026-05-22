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
    { text: '📜 Recuerdos', href: 'recuerdos.html' }
  ]

  if (role === 'admin') {
    links.push(
      { text: '✏️ Subir contenido', href: 'admin-form.html' },
      //{ text: 'Pruebas', href: 'recuerdos.html' },
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

  const now = new Date()
  const target = new Date(2027, 1, 25, 0, 0, 0)

  // SI YA LLEGÓ
  if (now >= target) {
    anniversaryEl.textContent = '0 meses, 0 días y 0 horas'
    return
  }

  // CALCULO REAL
  let months =
    (target.getFullYear() - now.getFullYear()) * 12 +
    (target.getMonth() - now.getMonth())

  let testDate = new Date(now)
  testDate.setMonth(testDate.getMonth() + months)

  // SI SE PASÓ
  if (testDate > target) {
    months--

    testDate = new Date(now)
    testDate.setMonth(testDate.getMonth() + months)
  }

  // RESTANTE
  const diffMs = target - testDate

  const days = Math.floor(
    diffMs / (1000 * 60 * 60 * 24)
  )

  const hours = Math.floor(
    (diffMs / (1000 * 60 * 60)) % 24
  )

  anniversaryEl.textContent =
    `${months} meses, ${days} días y ${hours} horas`
}

updateAnniversaryCountdown()

setInterval(updateAnniversaryCountdown, 1000 * 60)
})

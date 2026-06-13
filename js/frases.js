import { supabase } from './supabaseClient.js'

document.addEventListener('DOMContentLoaded', async () => {
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    window.location.href = 'login.html'
    return
  }

  const contenedor = document.getElementById('phrases-list')
  const pagination = document.getElementById('pagination')

  const limit = 20
  let currentPage = 1

  let frases = []
  let idsDesbloqueadas = []

  // ===================== CARGA DE DATOS =====================
  async function loadData() {

    const { data: frasesData, error: frasesError } = await supabase
      .from('content')
      .select('id, title, text, created_at')
      .eq('content_type', 'frase')

    if (frasesError) {
      console.error(frasesError)
      return
    }

    frases = frasesData.sort((a, b) => Number(b.id) - Number(a.id))

    const { data: desbloqueos, error: unlocksError } = await supabase
      .from('unlocks')
      .select('content_id')
      .eq('user_id', user.id)

    if (unlocksError) {
      console.error(unlocksError)
      return
    }

    idsDesbloqueadas = desbloqueos.map(d => d.content_id)

    renderPage(currentPage)
    renderPagination()
  }

  // ===================== RENDER FRASES =====================
  function renderPage(page) {
    contenedor.innerHTML = ''

    const start = (page - 1) * limit
    const end = start + limit

    const pageItems = frases.slice(start, end)

    pageItems.forEach(frase => {
      const card = document.createElement('div')
      card.classList.add('frase-card')

      const desbloqueada = idsDesbloqueadas.includes(frase.id)

      if (desbloqueada) {
        card.classList.add('frase-unlocked')

        const h3 = document.createElement('h3')
        h3.textContent = frase.title

        const p = document.createElement('p')
        p.textContent = frase.text

        card.appendChild(h3)
        card.appendChild(p)

      } else {
        card.classList.add('frase-locked')

        const lockDiv = document.createElement('div')
        lockDiv.classList.add('ladybug-lock')

        const lockIcon = document.createElement('span')
        lockIcon.classList.add('lock-icon')
        lockIcon.textContent = '🔒'

        lockDiv.appendChild(lockIcon)
        card.appendChild(lockDiv)

        const btn = document.createElement('button')
        btn.classList.add('btn-unlock')
        btn.dataset.id = frase.id
        btn.textContent = 'Desbloquear'

        card.appendChild(btn)
      }

      contenedor.appendChild(card)
    })
  }

  // ===================== PAGINACIÓN =====================
  function renderPagination() {
    pagination.innerHTML = ''

    const totalPages = Math.ceil(frases.length / limit)

    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement('button')
      btn.textContent = i

      if (i === currentPage) btn.classList.add('active')

      btn.addEventListener('click', () => {
        currentPage = i
        renderPage(currentPage)
        renderPagination()
      })

      pagination.appendChild(btn)
    }
  }

  // ===================== DESBLOQUEO =====================
  contenedor.addEventListener('click', async (e) => {
    const btn = e.target.closest('.btn-unlock')
    if (!btn) return

    btn.disabled = true
    const card = btn.closest('.frase-card')
    const contentId = btn.dataset.id

    const { error } = await supabase
      .from('unlocks')
      .insert({ user_id: user.id, content_id: contentId })

    if (error) {
      console.error(error)
      btn.disabled = false
      return
    }

    idsDesbloqueadas.push(Number(contentId))

    const frase = frases.find(f => f.id == contentId)

    card.classList.remove('frase-locked')
    card.classList.add('frase-unlocked')

    card.querySelector('.ladybug-lock')?.remove()
    btn.remove()

    const h3 = document.createElement('h3')
    h3.textContent = frase.title

    const p = document.createElement('p')
    p.textContent = frase.text

    card.appendChild(h3)
    card.appendChild(p)
  })

  loadData()
})
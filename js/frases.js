import { supabase } from './supabaseClient.js'

document.addEventListener('DOMContentLoaded', async () => {
  // =========================
  // 1. Auth
  // =========================
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    window.location.href = 'login.html'
    return
  }

  const contenedor = document.getElementById('phrases-list')
  contenedor.innerHTML = ''

  // =========================
  // 2. Traer frases
  // =========================
  const { data: frases, error: frasesError } = await supabase
    .from('content')
    .select('id, title, text, created_at')
    .eq('content_type', 'frase')
    .order('created_at', { ascending: true })

  if (frasesError) {
    console.error('Error frases:', frasesError)
    return
  }

  // =========================
  // 3. Traer desbloqueos
  // =========================
  const { data: desbloqueos, error: unlocksError } = await supabase
    .from('unlocks')
    .select('content_id')
    .eq('user_id', user.id)

  if (unlocksError) {
    console.error('Error unlocks:', unlocksError)
    return
  }

  const idsDesbloqueadas = desbloqueos.map(d => d.content_id)

  // =========================
  // 4. Render tarjetas
  // =========================
  frases.forEach(frase => {
    const card = document.createElement('div')
    card.classList.add('frase-card')

    const desbloqueada = idsDesbloqueadas.includes(frase.id)

    if (desbloqueada) {
      card.classList.add('unlocked')

      const h3 = document.createElement('h3')
      h3.textContent = frase.title

      const p = document.createElement('p')
      p.textContent = frase.text

      card.appendChild(h3)
      card.appendChild(p)
    } else {
      card.classList.add('locked')

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

  // =========================
  // 5. Evento desbloquear
  // =========================
  contenedor.addEventListener('click', async (e) => {
    const btn = e.target.closest('.btn-unlock')
    if (!btn) return

    btn.disabled = true
    const card = btn.closest('.frase-card')
    const contentId = btn.dataset.id

    const { error } = await supabase
      .from('unlocks')
      .insert({
        user_id: user.id,
        content_id: contentId
      })

    if (error) {
      console.error(error)
      btn.disabled = false
      return
    }

    // =========================
    // 6. Renderizar desbloqueada sin romper el CSS
    // =========================
    const frase = frases.find(f => f.id == contentId)

    card.classList.remove('locked')
    card.classList.add('unlocked')

    // Eliminar elementos de bloqueo, pero no tocar ::before
    card.querySelector('.ladybug-lock')?.remove()
    btn.remove()

    const h3 = document.createElement('h3')
    h3.textContent = frase.title

    const p = document.createElement('p')
    p.textContent = frase.text

    card.appendChild(h3)
    card.appendChild(p)
  })
})

import { supabase } from './supabaseClient.js'

document.addEventListener('DOMContentLoaded', async () => {

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    window.location.href = 'login.html'
    return
  }

  const contenedor = document.getElementById('phrases-list')
  contenedor.innerHTML = '' 

  const { data: gustan, error } = await supabase
    .from('content')
    .select('id, title, text, created_at')
    .eq('content_type', 'gustan')

  if (error) {
    console.error('Error al cargar:', error)
    return
  }

  gustan.sort((a, b) => Number(b.id) - Number(a.id))

  const { data: desbloqueos } = await supabase
    .from('unlocks')
    .select('content_id')
    .eq('user_id', user.id)

  const idsDesbloqueadas = desbloqueos.map(d => d.content_id)

  gustan.forEach(item => {
    const card = document.createElement('div')
    card.classList.add('curiosidad-card')

    const desbloqueada = idsDesbloqueadas.includes(item.id)

    if (desbloqueada) {
      card.classList.add('frase-unlocked')

      const h3 = document.createElement('h3')
      h3.textContent = item.title

      const p = document.createElement('p')
      p.textContent = item.text

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
      btn.dataset.id = item.id
      btn.textContent = 'Descubrir'

      card.appendChild(btn)
    }

    contenedor.appendChild(card)
  })

  // DESBLOQUEO
  contenedor.addEventListener('click', async (e) => {
    const btn = e.target.closest('.btn-unlock')
    if (!btn) return

    btn.disabled = true
    const card = btn.closest('.curiosidad-card')
    const contentId = btn.dataset.id

    const { error } = await supabase
      .from('unlocks')
      .insert({ user_id: user.id, content_id: contentId })

    if (error) {
      console.error('Error al desbloquear:', error)
      btn.disabled = false
      return
    }

    const item = gustan.find(f => f.id == contentId)

    card.classList.remove('frase-locked')
    card.classList.add('frase-unlocked')

    card.querySelector('.ladybug-lock')?.remove()
    btn.remove()

    const h3 = document.createElement('h3')
    h3.textContent = item.title

    const p = document.createElement('p')
    p.textContent = item.text

    card.appendChild(h3)
    card.appendChild(p)
  })
})
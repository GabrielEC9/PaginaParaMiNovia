import { supabase } from './supabaseClient.js'

document.addEventListener('DOMContentLoaded', async () => {
  // =========================
  // 1. Verificar usuario
  // =========================
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    window.location.href = 'login.html'
    return
  }

  const contenedor = document.getElementById('phrases-list')
  contenedor.innerHTML = '' // limpiar contenedor

  // =========================
  // 2. Traer curiosidades
  // =========================
  const { data: curiosidades, error: curiosidadesError } = await supabase
    .from('content')
    .select('id, title, text, created_at')
    .eq('content_type', 'curiosidad')

  if (curiosidadesError) {
    console.error('Error al cargar curiosidades:', curiosidadesError)
    return
  }

  // =========================
  // Ordenar descendente: última curiosidad primero
  // =========================
  curiosidades.sort((a, b) => Number(b.id) - Number(a.id))

  // =========================
  // 3. Traer desbloqueos del usuario
  // =========================
  const { data: desbloqueos, error: unlocksError } = await supabase
    .from('unlocks')
    .select('content_id')
    .eq('user_id', user.id)

  if (unlocksError) {
    console.error('Error al cargar desbloqueos:', unlocksError)
    return
  }

  const idsDesbloqueadas = desbloqueos.map(d => d.content_id)

  // =========================
  // 4. Renderizar tarjetas
  // =========================
  curiosidades.forEach(curiosidad => {
    const card = document.createElement('div')
    card.classList.add('curiosidad-card')

    const desbloqueada = idsDesbloqueadas.includes(curiosidad.id)

    if (desbloqueada) {
      card.classList.add('frase-unlocked') // mantiene el estilo de Frases
      const h3 = document.createElement('h3')
      h3.textContent = curiosidad.title
      const p = document.createElement('p')
      p.textContent = curiosidad.text
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
      btn.dataset.id = curiosidad.id
      btn.textContent = 'Desbloquear'
      card.appendChild(btn)
    }

    // ✅ Agregar al contenedor
    contenedor.appendChild(card)
  })

  // =========================
  // 5. Evento para desbloquear
  // =========================
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

    // =========================
    // 6. Renderizar carta desbloqueada
    // =========================
    const curiosidad = curiosidades.find(f => f.id == contentId)
    card.classList.remove('frase-locked')
    card.classList.add('frase-unlocked')

    // eliminar lock y botón
    card.querySelector('.ladybug-lock')?.remove()
    btn.remove()

    const h3 = document.createElement('h3')
    h3.textContent = curiosidad.title
    const p = document.createElement('p')
    p.textContent = curiosidad.text
    card.appendChild(h3)
    card.appendChild(p)
  })
})

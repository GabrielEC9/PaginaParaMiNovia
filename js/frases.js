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
      card.innerHTML = `
        <h3>${frase.title || '💌 Frase del día'}</h3>
        <p>${frase.text}</p>
      `
    } else {
      card.classList.add('locked')
      card.innerHTML = `
        <div class="ladybug-lock">
          <span class="lock-icon">🔒</span>
        </div>
        <button class="btn-ladybug small btn-unlock" data-id="${frase.id}">
          Desbloquear
        </button>
      `
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

    // Animación + render sin reload
    card.classList.remove('locked')
    card.classList.add('unlocked')
    card.innerHTML = `
      <h3>💌 Frase del día</h3>
      <p>${frases.find(f => f.id == contentId).text}</p>
    `
  })
})

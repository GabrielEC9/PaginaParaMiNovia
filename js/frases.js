document.addEventListener('DOMContentLoaded', async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    window.location.href = 'login.html'
    return
  }

  const contenedor = document.getElementById('frases-container')

  const { data: frases } = await supabase
    .from('frases')
    .select('*')
    .order('fecha', { ascending: true })

  const { data: desbloqueadas } = await supabase
    .from('frases_desbloqueadas')
    .select('id_frase')
    .eq('id_usuario', user.id)

  const idsDesbloqueadas = desbloqueadas?.map(f => f.id_frase) || []

  frases.forEach(frase => {
    const bloque = document.createElement('div')
    bloque.classList.add('frase-card')

    const desbloqueada = idsDesbloqueadas.includes(frase.id)
    if (desbloqueada) {
      bloque.innerHTML = `
        <h3>Día ${frase.dia}</h3>
        <p>${frase.texto}</p>
      `
    } else {
      bloque.innerHTML = `
        <div class="bloqueo">
          <p>🔒 Día ${frase.dia}</p>
          <button class="btn-ladybug small" data-id="${frase.id}">Desbloquear</button>
        </div>
      `
    }

    contenedor.appendChild(bloque)
  })

  contenedor.addEventListener('click', async (e) => {
    if (e.target.tagName === 'BUTTON') {
      const idFrase = e.target.dataset.id
      await supabase.from('frases_desbloqueadas').insert({
        id_usuario: user.id,
        id_frase: idFrase,
        fecha: new Date()
      })
      alert('Frase desbloqueada 🐞')
      contenedor.innerHTML = ''
      location.reload()
    }
  })
})

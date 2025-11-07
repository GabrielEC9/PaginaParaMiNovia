document.addEventListener('DOMContentLoaded', async () => {
  // Verificar sesión
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    window.location.href = 'login.html'
    return
  }

  const contenedor = document.getElementById('curiosidades-container')

  // Obtener todas las curiosidades
  const { data: curiosidades } = await supabase
    .from('curiosidades')
    .select('*')
    .order('fecha', { ascending: false })

  // Obtener cuáles el usuario ya leyó o marcó
  const { data: interacciones } = await supabase
    .from('curiosidades_usuarios')
    .select('id_curiosidad, leida, favorita')
    .eq('id_usuario', user.id)

  const leidas = new Set(interacciones?.filter(i => i.leida).map(i => i.id_curiosidad))
  const favoritas = new Set(interacciones?.filter(i => i.favorita).map(i => i.id_curiosidad))

  // Mostrar curiosidades
  curiosidades.forEach(c => {
    const card = document.createElement('div')
    card.classList.add('curiosidad-card')

    card.innerHTML = `
      <h3>${c.titulo}</h3>
      <p>${c.descripcion}</p>
      <div class="acciones">
        <button class="btn-ladybug small leer-btn" data-id="${c.id}">
          ${leidas.has(c.id) ? '✅ Leída' : '📖 Marcar como leída'}
        </button>
        <button class="btn-ladybug small fav-btn" data-id="${c.id}">
          ${favoritas.has(c.id) ? '💖 Favorita' : '🤍 Favorito'}
        </button>
      </div>
    `
    contenedor.appendChild(card)
  })

  // Eventos de botones
  contenedor.addEventListener('click', async (e) => {
    const idCur = e.target.dataset.id
    if (!idCur) return

    const tipo = e.target.classList.contains('leer-btn') ? 'leida' :
                 e.target.classList.contains('fav-btn') ? 'favorita' : null
    if (!tipo) return

    // Ver si ya hay registro
    const { data: existe } = await supabase
      .from('curiosidades_usuarios')
      .select('*')
      .eq('id_usuario', user.id)
      .eq('id_curiosidad', idCur)
      .maybeSingle()

    if (existe) {
      await supabase.from('curiosidades_usuarios')
        .update({ [tipo]: !existe[tipo] })
        .eq('id_usuario', user.id)
        .eq('id_curiosidad', idCur)
    } else {
      await supabase.from('curiosidades_usuarios')
        .insert({ id_usuario: user.id, id_curiosidad: idCur, [tipo]: true })
    }

    alert(`Curiosidad actualizada (${tipo}) 🐞`)
    contenedor.innerHTML = ''
    location.reload()
  })
})

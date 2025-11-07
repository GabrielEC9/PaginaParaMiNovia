document.addEventListener('DOMContentLoaded', async () => {
  // Verificar sesión
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    window.location.href = 'login.html'
    return
  }

  // Verificar si es admin
  const { data: usuario } = await supabase
    .from('usuarios')
    .select('rol')
    .eq('id', user.id)
    .maybeSingle()

  if (usuario?.rol !== 'admin') {
    alert('Acceso restringido 🐞')
    window.location.href = 'index.html'
    return
  }

  const contPublicaciones = document.getElementById('lista-publicaciones')
  const contNotificaciones = document.getElementById('lista-notificaciones')

  // Mostrar publicaciones
  const { data: publicaciones } = await supabase
    .from('publicaciones')
    .select('*')
    .order('fecha', { ascending: false })

  publicaciones.forEach(pub => {
    const card = document.createElement('div')
    card.classList.add('pub-card')

    card.innerHTML = `
      <h3>${pub.tipo === 'frase' ? '💌 Frase' : '✨ Curiosidad'}</h3>
      <p>${pub.texto}</p>
      <small>${new Date(pub.fecha).toLocaleDateString()}</small>
    `
    contPublicaciones.appendChild(card)
  })

  // Mostrar notificaciones
  const { data: notificaciones } = await supabase
    .from('notificaciones')
    .select('*')
    .order('fecha', { ascending: false })

  if (!notificaciones || notificaciones.length === 0) {
    contNotificaciones.innerHTML = '<p>No hay notificaciones nuevas 🐞</p>'
  } else {
    notificaciones.forEach(noti => {
      const item = document.createElement('div')
      item.classList.add('noti-item')
      item.innerHTML = `
        <p>${noti.mensaje}</p>
        <small>${new Date(noti.fecha).toLocaleString()}</small>
        <button class="btn-ladybug" data-id="${noti.id}">Marcar como leída</button>
      `
      contNotificaciones.appendChild(item)
    })
  }

  // Marcar notificación como leída
  contNotificaciones.addEventListener('click', async e => {
    if (e.target.tagName === 'BUTTON') {
      const id = e.target.dataset.id
      await supabase.from('notificaciones').delete().eq('id', id)
      e.target.parentElement.remove()
    }
  })
})

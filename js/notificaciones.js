document.addEventListener('DOMContentLoaded', async () => {
  // Verificar sesión
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    window.location.href = 'login.html'
    return
  }

  const contenedor = document.getElementById('notificaciones-container')

  // Obtener notificaciones del usuario
  const { data: notificaciones } = await supabase
    .from('notificaciones_usuario')
    .select('*')
    .eq('id_usuario', user.id)
    .order('fecha', { ascending: false })

  if (!notificaciones || notificaciones.length === 0) {
    contenedor.innerHTML = '<p>No tienes notificaciones 🐞</p>'
    return
  }

  notificaciones.forEach(noti => {
    const card = document.createElement('div')
    card.classList.add('noti-card')

    card.innerHTML = `
      <p>${noti.mensaje}</p>
      <small>${new Date(noti.fecha).toLocaleString()}</small>
      <button class="btn-ladybug" data-id="${noti.id}">Marcar como leída</button>
    `
    contenedor.appendChild(card)
  })

  // Marcar como leída
  contenedor.addEventListener('click', async e => {
    if (e.target.tagName === 'BUTTON') {
      const id = e.target.dataset.id
      await supabase.from('notificaciones_usuario').delete().eq('id', id)
      e.target.parentElement.remove()
    }
  })
})

document.addEventListener('DOMContentLoaded', async () => {
  // Obtener usuario actual
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    window.location.href = 'login.html'
    return
  }

  const nombreEl = document.getElementById('perfil-nombre')
  const correoEl = document.getElementById('perfil-correo')
  const rolEl = document.getElementById('perfil-rol')
  const ladybugsEl = document.getElementById('perfil-ladybugs')
  const rachaEl = document.getElementById('perfil-racha')
  const editarBtn = document.getElementById('editar-nombre-btn')

  // Obtener información extendida del usuario
  const { data: infoUsuario } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!infoUsuario) {
    nombreEl.textContent = 'Error cargando datos'
    return
  }

  // Mostrar información
  nombreEl.textContent = infoUsuario.nombre || '(sin nombre)'
  correoEl.textContent = user.email
  rolEl.textContent = infoUsuario.rol === 'admin' ? 'Administrador' : 'Usuario'
  ladybugsEl.textContent = infoUsuario.ladybugs || 0
  rachaEl.textContent = `${infoUsuario.racha_actual || 0} días`

  // Permitir editar nombre
  editarBtn.addEventListener('click', async () => {
    const nuevoNombre = prompt('Escribe tu nuevo nombre:')
    if (!nuevoNombre) return

    const { error } = await supabase
      .from('usuarios')
      .update({ nombre: nuevoNombre })
      .eq('id', user.id)

    if (error) {
      alert('Error actualizando nombre 🐞')
    } else {
      nombreEl.textContent = nuevoNombre
      alert('Nombre actualizado con éxito 🎉')
    }
  })
})

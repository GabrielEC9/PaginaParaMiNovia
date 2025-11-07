document.addEventListener('DOMContentLoaded', async () => {
  // Verificar sesión
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    window.location.href = 'login.html'
    return
  }

  // Verificar si el rol del usuario es admin
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

  const selectTipo = document.getElementById('tipo-publicacion')
  const inputTexto = document.getElementById('texto-publicacion')
  const inputFecha = document.getElementById('fecha-publicacion')
  const botonGuardar = document.getElementById('btn-guardar')

  botonGuardar.addEventListener('click', async () => {
    const tipo = selectTipo.value
    const texto = inputTexto.value.trim()
    const fecha = inputFecha.value

    if (!tipo || !texto || !fecha) {
      alert('Por favor completa todos los campos 🐞')
      return
    }

    // Insertar en la tabla de publicaciones
    const { error } = await supabase.from('publicaciones').insert({
      tipo: tipo,
      texto: texto,
      fecha: fecha,
      id_admin: user.id
    })

    if (error) {
      console.error(error)
      alert('Error al guardar publicación 🐞')
      return
    }

    alert('Publicación guardada con éxito 🐞💌')
    inputTexto.value = ''
    inputFecha.value = ''
  })
})

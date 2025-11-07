document.addEventListener('DOMContentLoaded', async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    window.location.href = 'login.html'
    return
  }

  const fileInput = document.getElementById('foto-input')
  const uploadBtn = document.getElementById('subir-foto-btn')
  const albumContainer = document.getElementById('album-container')

  async function cargarAlbum() {
    const { data: fotos, error } = await supabase
      .from('album')
      .select('*')
      .order('fecha', { ascending: false })

    albumContainer.innerHTML = ''

    if (error || !fotos?.length) {
      albumContainer.innerHTML = '<p>No hay fotos aún 🐞</p>'
      return
    }

    fotos.forEach(foto => {
      const div = document.createElement('div')
      div.classList.add('foto-card')
      div.innerHTML = `
        <img src="${foto.url}" alt="foto subida" class="foto-item">
        <p class="foto-user">${foto.usuario}</p>
      `
      albumContainer.appendChild(div)
    })
  }

  uploadBtn.addEventListener('click', async () => {
    const file = fileInput.files[0]
    if (!file) return

    const filePath = `${user.id}/${Date.now()}_${file.name}`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('fotos')
      .upload(filePath, file)

    if (uploadError) {
      alert('Error al subir la foto.')
      return
    }

    const { data: publicUrl } = supabase.storage
      .from('fotos')
      .getPublicUrl(filePath)

    await supabase.from('album').insert({
      usuario: user.email,
      url: publicUrl.publicUrl,
      fecha: new Date()
    })

    await supabase.from('notificaciones').insert({
      tipo: 'foto',
      mensaje: `${user.email} subió una nueva foto.`,
      fecha: new Date()
    })

    alert('Foto subida correctamente 🐞')
    fileInput.value = ''
    cargarAlbum()
  })

  cargarAlbum()
})

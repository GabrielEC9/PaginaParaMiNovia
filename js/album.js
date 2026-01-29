document.addEventListener('DOMContentLoaded', async () => {

  // 🔐 Verificar sesión
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    window.location.href = 'login.html'
    return
  }

  // 📌 Elementos del DOM
  const fileInput = document.getElementById('photo-upload')
  const descriptionInput = document.getElementById('photo-description')
  const uploadForm = document.getElementById('upload-form')
  const albumContainer = document.getElementById('album-grid')

  // 📸 Cargar fotos del álbum
  async function cargarAlbum() {
    const { data: fotos, error } = await supabase
      .from('album')
      .select('*')
      .order('uploaded_at', { ascending: false })

    albumContainer.innerHTML = ''

    if (error || !fotos.length) {
      albumContainer.innerHTML = '<p>No hay fotos aún 🐞</p>'
      return
    }

    fotos.forEach(foto => {
      const div = document.createElement('div')
      div.classList.add('foto-card')
      div.innerHTML = `
        <img src="${foto.image_url}" class="foto-item" />
        ${foto.description ? `<p class="foto-desc">${foto.description}</p>` : ''}
      `
      albumContainer.appendChild(div)
    })
  }

  // ⬆️ Subir nueva foto
  uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault()

    const file = fileInput.files[0]
    if (!file) return

    const description = descriptionInput.value.trim()

    const filePath = `${user.id}/${Date.now()}_${file.name}`

    // 📤 Subir imagen a Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('fotos')
      .upload(filePath, file)

    if (uploadError) {
      alert('Error al subir la foto 😢')
      return
    }

    // 🌐 Obtener URL pública
    const { data } = supabase.storage
      .from('fotos')
      .getPublicUrl(filePath)

    // 🧾 Guardar registro en la BD
    await supabase.from('album').insert({
      user_id: user.id,
      image_url: data.publicUrl,
      description: description || null
    })

    // 🧹 Limpiar formulario
    fileInput.value = ''
    descriptionInput.value = ''

    cargarAlbum()
  })

  // 🚀 Inicial
  cargarAlbum()
})

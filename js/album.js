import { supabase } from './supabaseClient.js'

document.addEventListener('DOMContentLoaded', async () => {

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    window.location.href = 'login.html'
    return
  }

  const fileInput = document.getElementById('photo-upload')
  const descriptionInput = document.getElementById('photo-description')
  const uploadForm = document.getElementById('upload-form')
  const albumContainer = document.getElementById('album-grid')
  const message = document.getElementById('upload-message')

  // 📸 Cargar álbum
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

      // 🗑️ Botón solo si es el dueño
      const botonBorrar =
        foto.user_id === user.id
          ? `
            <button 
              class="btn-delete"
              data-id="${foto.id}"
              data-url="${foto.image_url}"
              data-owner="${foto.user_id}"
            >
              🗑️ Borrar
            </button>
          `
          : ''

      div.innerHTML = `
        <div class="foto-img-box">
          <img src="${foto.image_url}" class="foto-item" />
        </div>

        ${foto.description ? `<p class="foto-desc">${foto.description}</p>` : ''}

        ${botonBorrar}
      `

      albumContainer.appendChild(div)
    })

    activarBorrado()
  }

  // 🗑️ Borrar foto
  function activarBorrado() {
    document.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', async () => {

        const ownerId = btn.dataset.owner

        // 🚫 Seguridad extra (por si alguien fuerza el botón)
        if (ownerId !== user.id) {
          alert('❌ No puedes borrar esta foto porque no la subiste tú')
          return
        }

        if (!confirm('¿Seguro que quieres borrar esta foto? 🐞')) return

        const photoId = btn.dataset.id
        const imageUrl = btn.dataset.url
        const filePath = imageUrl.split('/fotos/')[1]

        // 1️⃣ Storage
        const { error: storageError } = await supabase
          .storage
          .from('fotos')
          .remove([filePath])

        if (storageError) {
          alert('Error al borrar la imagen')
          return
        }

        // 2️⃣ Base de datos
        const { error: dbError } = await supabase
          .from('album')
          .delete()
          .eq('id', photoId)

        if (dbError) {
          alert('Error al borrar el registro')
          return
        }

        // 3️⃣ UI
        btn.closest('.foto-card').remove()
      })
    })
  }

  // ⬆️ Subir foto
  uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault()

    const file = fileInput.files[0]
    if (!file) return

    const description = descriptionInput.value.trim()
    const filePath = `${user.id}/${Date.now()}_${file.name}`

    const { error: uploadError } = await supabase.storage
      .from('fotos')
      .upload(filePath, file)

    if (uploadError) {
      alert('Error al subir la foto 😢')
      return
    }

    const { data } = supabase.storage
      .from('fotos')
      .getPublicUrl(filePath)

    await supabase.from('album').insert({
      user_id: user.id,
      image_url: data.publicUrl,
      description: description || null
    })

    message.textContent = '✅ Foto subida exitosamente'
    message.className = 'upload-message success'

    setTimeout(() => {
      message.textContent = ''
      message.className = 'upload-message'
    }, 3000)

    fileInput.value = ''
    descriptionInput.value = ''

    cargarAlbum()
  })

  cargarAlbum()
})

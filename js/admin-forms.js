import { supabase } from './supabaseClient.js'

document.addEventListener('DOMContentLoaded', async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    window.location.href = 'login.html'
    return
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    alert('Acceso restringido 🐞')
    window.location.href = 'index.html'
    return
  }

  const form = document.getElementById('admin-form')
  
  // Crear un div para mensajes si no existe
  let messageBox = document.getElementById('upload-message')
  if (!messageBox) {
    messageBox = document.createElement('div')
    messageBox.id = 'upload-message'
    messageBox.className = 'upload-message'
    form.appendChild(messageBox)
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault()

    const tipo = document.getElementById('tipo').value
    const titulo = document.getElementById('titulo').value.trim()
    const texto = document.getElementById('descripcion').value.trim()

    if (!tipo || !texto) {
      messageBox.textContent = 'Completa los campos obligatorios 🐞'
      messageBox.className = 'upload-message error'
      return
    }

    const { error } = await supabase
      .from('content')
      .insert({
        admin_id: user.id,
        content_type: tipo,
        title: titulo || null,
        text: texto
      })

    if (error) {
      console.error(error)
      messageBox.textContent = 'Error al subir contenido 🐞'
      messageBox.className = 'upload-message error'
      return
    }

    messageBox.textContent = 'Contenido subido con amor 💌'
    messageBox.className = 'upload-message success'
    form.reset()

    // Opcional: desaparece después de 3 segundos
    setTimeout(() => {
      messageBox.className = 'upload-message'
    }, 3000)
  })
})

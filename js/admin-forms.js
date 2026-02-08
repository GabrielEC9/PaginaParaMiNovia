import { supabase } from './supabaseClient.js'

document.addEventListener('DOMContentLoaded', async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    window.location.href = 'login.html'
    return
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (error || profile.role !== 'admin') {
    alert('Acceso restringido 🐞')
    window.location.href = 'index.html'
    return
  }

  const form = document.getElementById('admin-form')

  form.addEventListener('submit', async (e) => {
    e.preventDefault()

    const tipo = document.getElementById('tipo').value
    const titulo = document.getElementById('titulo').value.trim()
    const texto = document.getElementById('descripcion').value.trim()

    if (!tipo || !texto) {
      alert('Completa los campos obligatorios 🐞')
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
      alert('Error al subir contenido 🐞')
      return
    }

    alert('Contenido subido correctamente 🐞💖')
    form.reset()
  })
})

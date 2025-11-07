document.addEventListener('DOMContentLoaded', async () => {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    window.location.href = 'login.html'
    return
  }

  const { data: perfil } = await supabase
    .from('usuarios')
    .select('nombre, rol')
    .eq('id_auth', user.id)
    .single()

  const bienvenida = document.getElementById('bienvenida')
  if (perfil?.nombre) {
    bienvenida.textContent = `Bienvenido(a), ${perfil.nombre} 🐞`
  } else {
    bienvenida.textContent = 'Bienvenido(a) 🐞'
  }

  const adminBtns = document.querySelectorAll('.admin-only')
  adminBtns.forEach(btn => {
    if (perfil?.rol === 'admin') {
      btn.style.display = 'inline-block'
    } else {
      btn.style.display = 'none'
    }
  })
})

document.getElementById('logout-btn').addEventListener('click', async () => {
  await supabase.auth.signOut()
  window.location.href = 'login.html'
})

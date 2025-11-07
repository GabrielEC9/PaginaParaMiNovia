const form = document.getElementById('login-form')
const emailInput = document.getElementById('email')
const passwordInput = document.getElementById('password')
const errorMsg = document.getElementById('error-msg')

form.addEventListener('submit', async (e) => {
  e.preventDefault()

  const email = emailInput.value.trim()
  const password = passwordInput.value.trim()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    errorMsg.textContent = 'Correo o contraseña incorrectos.'
    errorMsg.style.display = 'block'
    return
  }

  const { user } = data
  if (!user) return

  const { data: perfil } = await supabase
    .from('usuarios')
    .select('rol')
    .eq('id_auth', user.id)
    .single()

  if (perfil?.rol === 'admin') {
    window.location.href = 'admin-panel.html'
  } else {
    window.location.href = 'index.html'
  }
})

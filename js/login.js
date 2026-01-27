import { supabase } from './supabaseClient.js'

const form = document.getElementById('login-form')
const errorMsg = document.getElementById('error-msg')

form.addEventListener('submit', async (e) => {
  e.preventDefault()

  const email = form.email.value.trim()
  const password = form.password.value.trim()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    errorMsg.textContent = 'Correo o contraseña incorrectos'
    errorMsg.style.display = 'block'
    return
  }

  window.location.replace('panel.html')
})

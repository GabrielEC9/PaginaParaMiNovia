import { supabase } from './supabaseClient.js'

const form = document.getElementById('login-form')
const errorMsg = document.getElementById('error-msg')

form.addEventListener('submit', async (e) => {
  e.preventDefault()

  const email = document.getElementById('email').value.trim()
  const password = document.getElementById('password').value.trim()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    errorMsg.textContent = 'Correo o contraseña incorrectos'
    errorMsg.style.display = 'block'
  }
  // 🚫 NO redirect aquí
})

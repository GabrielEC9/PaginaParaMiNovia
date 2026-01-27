import { supabase } from './supabaseClient.js'

const form = document.getElementById('login-form')
const emailInput = document.getElementById('email')
const passwordInput = document.getElementById('password')
const errorMsg = document.getElementById('error-msg')

form.addEventListener('submit', async (e) => {
  e.preventDefault()

  const { error } = await supabase.auth.signInWithPassword({
    email: emailInput.value.trim(),
    password: passwordInput.value.trim()
  })

  if (error) {
    errorMsg.textContent = 'Correo o contraseña incorrectos'
    errorMsg.style.display = 'block'
    return
  }

  window.location.replace('index.html')
})

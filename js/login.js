// js/login.js
import { supabase } from './supabaseClient.js'

const form = document.getElementById('login-form')
const emailInput = document.getElementById('email')
const passwordInput = document.getElementById('password')
const errorMsg = document.getElementById('error-msg')

form.addEventListener('submit', async (e) => {
  e.preventDefault()

  const email = emailInput.value.trim()
  const password = passwordInput.value.trim()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    errorMsg.textContent = 'Correo o contraseña incorrectos'
    errorMsg.style.display = 'block'
    return
  }

  // ✅ SIEMPRE ir al index
  window.location.href = 'index.html'
})

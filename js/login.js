// js/login.js
import { supabase } from './supabaseClient.js'
import { onAuthReady } from './auth.js'

const form = document.getElementById('login-form')
const errorMsg = document.getElementById('error-msg')

form.addEventListener('submit', async (e) => {
  e.preventDefault()

  const email = email.value.trim()
  const password = password.value.trim()

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    errorMsg.textContent = 'Credenciales incorrectas'
    errorMsg.style.display = 'block'
  }
})

// 🔑 SOLO cuando Supabase confirma sesión
onAuthReady((session) => {
  if (session) {
    window.location.href = 'index.html'
  }
})

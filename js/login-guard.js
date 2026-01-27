// js/login-guard.js
import { supabase } from './supabaseClient.js'

document.addEventListener('DOMContentLoaded', async () => {
  const { data: { session } } = await supabase.auth.getSession()

  // Si YA hay sesión, no tiene sentido estar en login
  if (session) {
    window.location.href = 'index.html'
  }
})

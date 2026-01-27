import { supabase } from './supabaseClient.js'

let resolved = false

supabase.auth.onAuthStateChange((_event, session) => {
  if (resolved) return
  resolved = true

  if (session) {
    window.location.href = '/panel.html'
  } else {
    window.location.href = '/login.html'
  }
})

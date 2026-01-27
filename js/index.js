import { supabase } from './supabaseClient.js'

let resolved = false

supabase.auth.onAuthStateChange((_event, session) => {
  if (resolved) return
  resolved = true

  if (session) {
    window.location.replace('panel.html')
  } else {
    window.location.replace('login.html')
  }
})

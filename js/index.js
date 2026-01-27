import { supabase } from './supabaseClient.js'

supabase.auth.onAuthStateChange((_event, session) => {
  if (session) {
    window.location.replace('panel.html')
  } else {
    window.location.replace('login.html')
  }
})

// js/auth.js
import { supabase } from './supabaseClient.js'

let authResolved = false

export function onAuthReady(callback) {
  const { data: listener } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      if (authResolved) return
      authResolved = true
      callback(session)
    }
  )
  return listener
}

export async function logout() {
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error('Error al cerrar sesión:', error)
  }
}

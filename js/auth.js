// js/auth.js
import { supabase } from './supabaseClient.js'

// Espera a que Supabase cargue la sesión real
export function waitForAuth() {
  return new Promise((resolve) => {
    supabase.auth.onAuthStateChange((_event, session) => {
      resolve(session)
    })
  })
}

// 🔐 Requiere sesión
export async function requireAuth() {
  const session = await waitForAuth()

  if (!session) {
    window.location.replace('login.html')
    return null
  }

  return session.user
}

// 👤 Perfil
export async function getUserProfile() {
  const session = await waitForAuth()
  if (!session) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  if (error) {
    console.error(error)
    return null
  }

  return data
}

// 🚪 Logout
export async function logout() {
  await supabase.auth.signOut()
  window.location.replace('login.html')
}

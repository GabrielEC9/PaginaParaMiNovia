// js/auth.js
import { supabase } from './supabaseClient.js'

// 🔐 Requiere sesión 
export async function requireAuth() {
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    window.location.href = 'login.html'
    return null
  }

  return session.user
}

// 👤 Obtiene perfil desde public.profiles
export async function getUserProfile() {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  if (error) {
    console.error('Error obteniendo perfil:', error)
    return null
  }

  return data
}

// 🚪 Logout
export async function logout() {
  await supabase.auth.signOut()
  window.location.href = 'login.html'
}

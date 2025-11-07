// js/auth.js
import { supabase } from './supabaseClient.js'

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) return null
  return data.user
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    window.location.href = 'login.html'
    return null
  }
  return user
}

export async function getUserProfile() {
  const user = await getCurrentUser()
  if (!user) return null
  const { data } = await supabase.from('usuarios').select('*').eq('id_auth', user.id).single()
  return data
}

export async function isAdmin() {
  const profile = await getUserProfile()
  return profile?.rol === 'admin'
}

export async function redirectByRole() {
  const profile = await getUserProfile()
  if (!profile) return
  if (profile.rol === 'admin') window.location.href = 'admin-panel.html'
  else window.location.href = 'index.html'
}

export async function logout() {
  await supabase.auth.signOut()
  window.location.href = 'login.html'
}

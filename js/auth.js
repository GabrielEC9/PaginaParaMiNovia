// js/auth.js
import { supabase } from './supabaseClient.js'

// Obtiene el usuario actual
export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) return null
  return data.user
}

// Requiere sesión, redirige a login si no hay usuario
export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    window.location.href = 'login.html'
    return null
  }
  return user
}

// Obtiene perfil desde la tabla profiles
export async function getUserProfile() {
  const user = await getCurrentUser()
  if (!user) return null
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  if (error) return null
  return data
}

// Retorna true si el usuario es admin
export async function isAdmin() {
  const profile = await getUserProfile()
  return profile?.role === 'admin'
}

// Redirige según rol
export async function redirectByRole() {
  const profile = await getUserProfile()
  if (!profile) return
  if (profile.role === 'admin') window.location.href = 'admin-panel.html'
  else window.location.href = 'index.html'
}

// Cierra sesión
export async function logout() {
  await supabase.auth.signOut()
  window.location.href = 'login.html'
}

import { supabase } from './supabaseClient.js'

async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) return null
  return data.user
}

async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    window.location.href = 'login.html'
    return
  }
  return user
}

async function getUserProfile() {
  const user = await getCurrentUser()
  if (!user) return null
  const { data } = await supabase.from('usuarios').select('*').eq('id', user.id).single()
  return data
}

async function isAdmin() {
  const profile = await getUserProfile()
  return profile?.rol === 'admin'
}

async function redirectByRole() {
  const profile = await getUserProfile()
  if (!profile) return
  if (profile.rol === 'admin') window.location.href = 'admin-panel.html'
  else window.location.href = 'index.html'
}

async function logout() {
  await supabase.auth.signOut()
  window.location.href = 'login.html'
}

window.auth = {
  getCurrentUser,
  requireAuth,
  getUserProfile,
  isAdmin,
  redirectByRole,
  logout
}

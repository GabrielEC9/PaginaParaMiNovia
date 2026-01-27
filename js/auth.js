import { supabase } from './supabaseClient.js'

// 🔐 SOLO verifica, NO redirige
export async function getSessionUser() {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.user || null
}

export async function getUserProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Perfil error:', error)
    return null
  }

  return data
}

export async function logout() {
  await supabase.auth.signOut()
  window.location.replace('login.html')
}

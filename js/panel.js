import { supabase } from './supabaseClient.js'
import { logout } from './auth.js'

document.addEventListener('DOMContentLoaded', async () => {
  // Botón de logout
  const logoutBtn = document.getElementById('logout-btn')
  logoutBtn?.addEventListener('click', async () => {
    await logout()
    window.location.replace('login.html')
  })

  try {
    // Obtener sesión
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !sessionData.session) {
      window.location.href = 'login.html'
      return
    }

    const user = sessionData.session.user

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || !profile.role) {
      throw profileError || new Error('Perfil no encontrado o rol inválido')
    }

    console.log('Usuario autenticado con rol:', profile.role)

  } catch (err) {
    console.error('Error al verificar sesión:', err)
    await supabase.auth.signOut()
    window.location.href = 'login.html'
  }
})

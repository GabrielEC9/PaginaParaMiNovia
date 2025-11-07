import { supabase } from './supabaseClient.js'
import { auth } from './auth.js'

async function obtenerPerfilUsuario() {
  const perfil = await auth.getUserProfile()
  return perfil
}

async function actualizarSaldo(nuevoSaldo) {
  const user = await auth.getCurrentUser()
  if (!user) return null
  const { data, error } = await supabase
    .from('usuarios')
    .update({ saldo_bugs: nuevoSaldo })
    .eq('id', user.id)
    .select()
  return { data, error }
}

async function agregarBugs(cantidad) {
  const perfil = await obtenerPerfilUsuario()
  const nuevoSaldo = (perfil.saldo_bugs || 0) + cantidad
  return await actualizarSaldo(nuevoSaldo)
}

async function restarBugs(cantidad) {
  const perfil = await obtenerPerfilUsuario()
  if ((perfil.saldo_bugs || 0) < cantidad) return { error: 'Saldo insuficiente' }
  const nuevoSaldo = perfil.saldo_bugs - cantidad
  return await actualizarSaldo(nuevoSaldo)
}

async function desbloquearPublicacion(tipo, id_publicacion) {
  const user = await auth.getCurrentUser()
  if (!user) return null
  const { data, error } = await supabase
    .from('desbloqueos')
    .insert([{ id_usuario: user.id, id_publicacion, tipo }])
  return { data, error }
}

async function verificarDesbloqueo(tipo, id_publicacion) {
  const user = await auth.getCurrentUser()
  if (!user) return false
  const { data } = await supabase
    .from('desbloqueos')
    .select('id')
    .eq('id_usuario', user.id)
    .eq('id_publicacion', id_publicacion)
    .eq('tipo', tipo)
  return data && data.length > 0
}

async function actualizarRacha(dias, ultimaFecha) {
  const user = await auth.getCurrentUser()
  if (!user) return null
  const { data, error } = await supabase
    .from('usuarios')
    .update({ racha_dias: dias, ultima_recompensa: ultimaFecha })
    .eq('id', user.id)
    .select()
  return { data, error }
}

window.userUtils = {
  obtenerPerfilUsuario,
  actualizarSaldo,
  agregarBugs,
  restarBugs,
  desbloquearPublicacion,
  verificarDesbloqueo,
  actualizarRacha
}

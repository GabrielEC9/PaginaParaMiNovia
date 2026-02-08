import { supabase } from './supabaseClient.js'

document.addEventListener('DOMContentLoaded', async () => {
  const contenedor = document.getElementById('notificaciones-container')

  // ─────────────────────────────────────────────
  // 1️⃣ Fechas: inicio y fin del mes actual
  // ─────────────────────────────────────────────
  const now = new Date()
  const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()

  const finMes = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59
  ).toISOString()

  // ─────────────────────────────────────────────
  // 2️⃣ Consulta: TODAS las compras del mes
  // ─────────────────────────────────────────────
  const { data: compras, error } = await supabase
    .from('compras')
    .select(`
      id,
      created_at,
      total,
      usuario:profiles(username),
      items:compra_items(nombre, cantidad)
    `)
    .gte('created_at', inicioMes)
    .lte('created_at', finMes)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error cargando notificaciones:', error)
    contenedor.innerHTML = '<p>Error al cargar las compras</p>'
    return
  }

  if (!compras || compras.length === 0) {
    contenedor.innerHTML = '<p>No hay compras este mes</p>'
    return
  }

  // ─────────────────────────────────────────────
  // 3️⃣ Render
  // ─────────────────────────────────────────────
  compras.forEach(compra => {
    const usuario =
      compra.usuario?.username || 'Cuenta invitada'

    const fecha = new Date(compra.created_at)
      .toLocaleDateString('es-MX')

    const items = compra.items && compra.items.length > 0
      ? compra.items
          .map(i => `${i.nombre} ×${i.cantidad}`)
          .join(', ')
      : 'Sin detalle de productos'

    const div = document.createElement('div')
    div.classList.add('notificacion')

    div.innerHTML = `
      <p><strong>Usuario:</strong> ${usuario}</p>
      <p><strong>Compró:</strong> ${items}</p>
      <p><strong>Fecha:</strong> ${fecha}</p>
      <p><strong>Total:</strong> $${compra.total}</p>
    `

    contenedor.appendChild(div)
  })
})

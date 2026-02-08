import { supabase } from './supabaseClient.js'

document.addEventListener('DOMContentLoaded', async () => {
  // ─────────────────────────────────────────────
  // 1️⃣ Verificar sesión
  // ─────────────────────────────────────────────
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    window.location.href = '/login.html'
    return
  }

  // ─────────────────────────────────────────────
  // 2️⃣ Verificar que sea admin
  // ─────────────────────────────────────────────
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError || profile.role !== 'admin') {
    window.location.href = '/'
    return
  }

  const contenedor = document.getElementById('notifications-list')
  if (!contenedor) {
    console.error('No existe #notifications-list en el HTML')
    return
  }

  contenedor.innerHTML = ''

  // ─────────────────────────────────────────────
  // 3️⃣ Filtro: mes actual
  // ─────────────────────────────────────────────
  const ahora = new Date()
  const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1)
  const inicioMesSiguiente = new Date(
    ahora.getFullYear(),
    ahora.getMonth() + 1,
    1
  )

  // ─────────────────────────────────────────────
  // 4️⃣ Obtener TODAS las compras del mes
  // ─────────────────────────────────────────────
  const { data: purchases, error } = await supabase
    .from('purchases')
    .select(`
      id,
      total_bugs_spent,
      purchase_date,
      buyer:profiles!purchases_user_id_fkey!inner (
        username
      ),
      purchase_items (
        quantity,
        store_items (
          name
        )
      )
    `)
    .gte('purchase_date', inicioMes.toISOString())
    .lt('purchase_date', inicioMesSiguiente.toISOString())
    .order('purchase_date', { ascending: false })

  if (error) {
    console.error('Error cargando compras:', error)
    contenedor.innerHTML = '<p class="empty-text">Error al cargar compras ❌</p>'
    return
  }

  if (!purchases || purchases.length === 0) {
    contenedor.innerHTML = '<p class="empty-text">No hay compras este mes 🐞</p>'
    return
  }

  // ─────────────────────────────────────────────
  // 5️⃣ Render
  // ─────────────────────────────────────────────
  purchases.forEach(purchase => {
    const card = document.createElement('div')
    card.className = 'purchase-card'

    const itemsHTML = purchase.purchase_items
      .map(item => `• ${item.store_items.name} × ${item.quantity}`)
      .join('<br>')

    card.innerHTML = `
      <h3>🛍️ ${purchase.buyer.username}</h3>
      <p class="items">${itemsHTML}</p>
      <p class="bugs">🐞 Bugs usados: <strong>${purchase.total_bugs_spent}</strong></p>
      <small>${new Date(purchase.purchase_date).toLocaleString()}</small>
    `

    contenedor.appendChild(card)
  })
})

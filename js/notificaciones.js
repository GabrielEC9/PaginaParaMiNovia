import { supabase } from './supabaseClient.js'

document.addEventListener('DOMContentLoaded', async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    window.location.href = '/login.html'
    return
  }

  // Obtener perfil
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, username')
    .eq('id', user.id)
    .single()

  if (profile.role !== 'admin') {
    window.location.href = '/'
    return
  }

  const contenedor = document.getElementById('notifications-list')
  contenedor.innerHTML = ''

  // Obtener compras con detalle
  const { data: purchases, error } = await supabase
    .from('purchases')
    .select(`
      id,
      total_bugs_spent,
      purchase_date,
      profiles ( username ),
      purchase_items (
        quantity,
        store_items ( name )
      )
    `)
    .order('purchase_date', { ascending: false })

  if (error || !purchases || purchases.length === 0) {
    contenedor.innerHTML = '<p class="empty-text">No hay compras registradas 🐞</p>'
    return
  }

  purchases.forEach(purchase => {
    const card = document.createElement('div')
    card.className = 'purchase-card'

    const itemsHTML = purchase.purchase_items
      .map(item => `• ${item.store_items.name} × ${item.quantity}`)
      .join('<br>')

    card.innerHTML = `
      <h3>🛍️ ${purchase.profiles.username}</h3>
      <p class="items">${itemsHTML}</p>
      <p class="bugs">🐞 Bugs usados: <strong>${purchase.total_bugs_spent}</strong></p>
      <small>${new Date(purchase.purchase_date).toLocaleString()}</small>
    `

    contenedor.appendChild(card)
  })
})

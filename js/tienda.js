import { supabase } from './supabaseClient.js'

document.addEventListener('DOMContentLoaded', async () => {

  /* ===============================
     AUTH
  =============================== */
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    window.location.href = '/login.html'
    return
  }

  /* ===============================
     ELEMENTOS
  =============================== */
  const storeGrid     = document.getElementById('store-items')
  const bugsSpan      = document.getElementById('user-bugs')
  const messageBox    = document.getElementById('store-message')

  const cartPanel     = document.getElementById('cart-panel')
  const cartItemsBox  = document.getElementById('cart-items')
  const cartTotalSpan = document.getElementById('cart-total')
  const cartBuyBtn    = document.getElementById('buy-btn')
  const cartToggle    = document.getElementById('cart-toggle')

const cartOverlay = document.getElementById('cart-overlay')

cartToggle.onclick = () => {
  cartPanel.classList.toggle('open')
  cartOverlay.classList.toggle('active')
}

cartOverlay.onclick = () => {
  cartPanel.classList.remove('open')
  cartOverlay.classList.remove('active')
}

  let userBugs = 0
  const cart = new Map() 

  /* ===============================
     PERFIL
  =============================== */
  const { data: profile } = await supabase
    .from('profiles')
    .select('bugs')
    .eq('id', user.id)
    .single()

  userBugs = profile?.bugs || 0
  bugsSpan.textContent = userBugs

  /* ===============================
     PRODUCTOS
  =============================== */
  const { data: items } = await supabase
    .from('store_items')
    .select('*')
    .eq('available', true)
    .order('cost', { ascending: true })

  /* ===============================
     RENDER PRODUCTOS
  =============================== */
  items.forEach(item => {
    let quantity = 0

    const card = document.createElement('div')
    card.className = 'frase-card unlocked store-card'

    card.innerHTML = `
      <img src="${item.image_url || '/img/default.png'}" class="store-img">
      <h3>${item.name}</h3>
      <p>${item.description || ''}</p>
      <p class="precio">🐞 ${item.cost}</p>

      <div class="qty-controls">
        <button class="qty-btn minus">−</button>
        <span class="qty-value">0</span>
        <button class="qty-btn plus">+</button>
      </div>

      <button class="btn-ladybug small"><span>Agregar</span></button>
    `

    const qtyValue = card.querySelector('.qty-value')
    const minusBtn = card.querySelector('.minus')
    const plusBtn  = card.querySelector('.plus')
    const addBtn   = card.querySelector('.btn-ladybug')

    plusBtn.onclick = () => {
      if (quantity < 9) {
        quantity++
        qtyValue.textContent = quantity
      }
    }

    minusBtn.onclick = () => {
      if (quantity > 0) {
        quantity--
        qtyValue.textContent = quantity
      }
    }

    addBtn.onclick = () => {
      if (quantity === 0) {
        showMessage('Selecciona al menos 1 🐞', true)
        return
      }

      cart.set(item.id, { item, quantity })
      renderCart()

      card.classList.add('selected')
      cartPanel.classList.add('open')
    }

    storeGrid.appendChild(card)
  })

  /* ===============================
     RENDER CARRITO
  =============================== */
  function renderCart() {
    cartItemsBox.innerHTML = ''
    let total = 0

    cart.forEach(({ item, quantity }, id) => {
      const cost = item.cost * quantity
      total += cost

      const row = document.createElement('div')
      row.className = 'cart-row'
      row.innerHTML = `
        <span>${item.name} × ${quantity}</span>
        <span>🐞 ${cost}</span>
        <button class="remove">✕</button>
      `

      row.querySelector('.remove').onclick = () => {
        cart.delete(id)
        renderCart()
      }

      cartItemsBox.appendChild(row)
    })

    cartTotalSpan.textContent = total
  }

  /* ===============================
     COMPRAR 
  =============================== */
  cartBuyBtn.onclick = async () => {

    if (cart.size === 0) {
      showMessage('El carrito está vacío 🛒', true)
      return
    }

    const itemsArray = [...cart.values()]

    const total = itemsArray.reduce(
      (sum, e) => sum + e.item.cost * e.quantity,
      0
    )

    if (total > userBugs) {
      showMessage('No tienes suficientes bugs 🐞', true)
      return
    }

    /* REGISTRAR COMPRA */
    const { data: purchase, error: purchaseError } = await supabase
      .from('purchases')
      .insert({
        user_id: user.id,
        total_bugs_spent: total
      })
      .select()
      .single()

    if (purchaseError) {
      showMessage('Error al registrar la compra ❌', true)
      return
    }

    /* REGISTRAR ITEMS */
    const purchaseItems = itemsArray.map(e => ({
      purchase_id: purchase.id,
      item_id: e.item.id,
      quantity: e.quantity
    }))

    const { error: itemsError } = await supabase
      .from('purchase_items')
      .insert(purchaseItems)

    if (itemsError) {
      showMessage('Error al guardar los productos ❌', true)
      return
    }

    /* ACTUALIZAR BUGS */
    const newBugs = userBugs - total

    const { error: bugsError } = await supabase
      .from('profiles')
      .update({ bugs: newBugs })
      .eq('id', user.id)

    if (bugsError) {
      showMessage('Error al actualizar bugs ❌', true)
      return
    }

    /* LIMPIAR UI */
    userBugs = newBugs
    bugsSpan.textContent = userBugs

    cart.clear()
    renderCart()

    document.querySelectorAll('.store-card').forEach(c => {
      c.classList.remove('selected')
      c.querySelector('.qty-value').textContent = '0'
    })

    cartPanel.classList.remove('open')

  showMessage('Pedido recibido')

  }

  /* ===============================
     MENSAJES
  =============================== */
  function showMessage(text, error = false) {
    messageBox.textContent = text
    messageBox.classList.toggle('error', error)
    messageBox.classList.add('show')
    setTimeout(() => messageBox.classList.remove('show'), 3500)
  }
})

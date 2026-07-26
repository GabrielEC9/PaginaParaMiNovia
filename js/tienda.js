import { supabase } from './supabaseClient.js'

const COUPON_MAX_SUBTOTAL = 5000 // por encima de esto, no se pueden usar cupones

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
  const cartBuyBtn    = document.getElementById('buy-btn')
  const cartToggle    = document.getElementById('cart-toggle')

  const couponSelect  = document.getElementById('coupon-select')
  const couponHint    = document.getElementById('coupon-hint')
  const subtotalSpan  = document.getElementById('cart-subtotal')
  const discountLine  = document.getElementById('discount-line')
  const discountSpan  = document.getElementById('cart-discount')
  const cartTotalSpan = document.getElementById('cart-total')

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
  let codigosDisponibles = []

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
     CUPONES DISPONIBLES
  =============================== */
  async function loadCoupons() {
    const { data } = await supabase
      .from('codigos_descuento')
      .select('*')
      .eq('user_id', user.id)
      .eq('usado', false)

    codigosDisponibles = data || []
    renderCouponOptions()
  }

  function renderCouponOptions() {
    couponSelect.innerHTML = '<option value="">Sin cupón</option>'
    codigosDisponibles.forEach(c => {
      const label = c.descuento_tipo === 'porcentaje'
        ? `${c.codigo} — ${c.valor}% de descuento`
        : `${c.codigo} — ${c.valor} bugs de descuento`
      const opt = document.createElement('option')
      opt.value = c.id
      opt.textContent = label
      couponSelect.appendChild(opt)
    })
  }

  function getSelectedCoupon() {
    const id = couponSelect.value
    if (!id) return null
    return codigosDisponibles.find(c => String(c.id) === String(id)) || null
  }

  // Restricción 2 (no acumular) ya queda resuelta solo por ser un <select> de una sola opción.
  // Restricción 3: por encima de COUPON_MAX_SUBTOTAL no se puede aplicar ningún cupón.
  function computeDiscount(subtotal) {
    const blocked = subtotal > COUPON_MAX_SUBTOTAL
    if (blocked) return { coupon: null, discount: 0, blocked: true }

    const coupon = getSelectedCoupon()
    if (!coupon) return { coupon: null, discount: 0, blocked: false }

    let discount = coupon.descuento_tipo === 'porcentaje'
      ? Math.round(subtotal * (coupon.valor / 100))
      : coupon.valor

    discount = Math.min(discount, subtotal) // nunca deja el total en negativo

    return { coupon, discount, blocked: false }
  }

  couponSelect.addEventListener('change', renderCart)

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
        ${
    item.discount_active
      ? `
        <div class="store-offer">
          <span class="offer-badge">🔥 OFERTA</span>
          <p class="precio-original">🐞 ${item.original_cost}</p>
          <p class="precio">🐞 ${item.cost}</p>
        </div>
      `
      : `
        <p class="precio">🐞 ${item.cost}</p>
      `
  }

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
    let subtotal = 0

    cart.forEach(({ item, quantity }, id) => {
      const cost = item.cost * quantity
      subtotal += cost

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

    const { discount, blocked } = computeDiscount(subtotal)

    subtotalSpan.textContent = subtotal

    if (blocked) {
      couponSelect.disabled = true
      couponSelect.value = ''
      couponHint.textContent = `Los cupones no aplican a compras mayores a ${COUPON_MAX_SUBTOTAL} 🐞`
      couponHint.classList.add('show')
    } else {
      couponSelect.disabled = false
      couponHint.classList.remove('show')
    }

    if (discount > 0) {
      discountLine.classList.add('show')
      discountSpan.textContent = discount
    } else {
      discountLine.classList.remove('show')
    }

    const total = subtotal - discount
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

    const subtotal = itemsArray.reduce(
      (sum, e) => sum + e.item.cost * e.quantity,
      0
    )

    const { coupon, discount, blocked } = computeDiscount(subtotal)
    const cuponAUsar = blocked ? null : coupon // por seguridad, ignora cualquier cupón si se pasó del límite
    const total = subtotal - discount

    if (total > userBugs) {
      showMessage('No tienes suficientes bugs 🐞', true)
      return
    }

    /* REGISTRAR COMPRA */
    const { data: purchase, error: purchaseError } = await supabase
      .from('purchases')
      .insert({
        user_id: user.id,
        total_bugs_spent: total,
        total_original: subtotal,
        codigo_descuento_id: cuponAUsar ? cuponAUsar.id : null
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

    /* MARCAR CUPÓN COMO USADO (restricción 1: un solo uso) */
    if (cuponAUsar) {
      await supabase
        .from('codigos_descuento')
        .update({ usado: true, purchase_id: purchase.id })
        .eq('id', cuponAUsar.id)
    }

    /* LIMPIAR UI */
    userBugs = newBugs
    bugsSpan.textContent = userBugs

    cart.clear()
    await loadCoupons() // refresca la lista: el cupón usado ya no aparece
    renderCart()

    document.querySelectorAll('.store-card').forEach(c => {
      c.classList.remove('selected')
      c.querySelector('.qty-value').textContent = '0'
    })

    cartPanel.classList.remove('open')

    showMessage(cuponAUsar ? `Pedido recibido con ${cuponAUsar.codigo} aplicado 🎉` : 'Pedido recibido')
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

  /* ===============================
     INIT
  =============================== */
  await loadCoupons()
  renderCart()
})
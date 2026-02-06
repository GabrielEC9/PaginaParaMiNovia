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
  const storeGrid = document.getElementById('store-items')
  const bugsSpan = document.getElementById('user-bugs')
  const messageBox = document.getElementById('store-message')

  let userBugs = 0
  let cart = new Map() // itemId -> cost

  /* ===============================
     OBTENER PERFIL
  =============================== */
  const { data: profile } = await supabase
    .from('profiles')
    .select('bugs')
    .eq('id', user.id)
    .single()

  userBugs = profile.bugs || 0
  bugsSpan.textContent = userBugs

  /* ===============================
     OBTENER PRODUCTOS
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
    const card = document.createElement('div')
    card.className = 'frase-card unlocked store-card'

    card.innerHTML = `
      <img src="${item.image_url || '/img/default.png'}" class="store-img">
      <h3>${item.name}</h3>
      <p>${item.description || ''}</p>
      <p class="precio">🐞 ${item.cost}</p>
      <button class="btn-ladybug small">Agregar</button>
    `

    const btn = card.querySelector('button')

    btn.addEventListener('click', () => {
      if (cart.has(item.id)) {
        cart.delete(item.id)
        btn.textContent = 'Agregar'
        card.classList.remove('selected')
      } else {
        cart.set(item.id, item.cost)
        btn.textContent = 'Quitar'
        card.classList.add('selected')
      }
    })

    storeGrid.appendChild(card)
  })

  /* ===============================
     BOTÓN COMPRAR
  =============================== */
  const buyBtn = document.createElement('button')
  buyBtn.className = 'btn-ladybug'
  buyBtn.textContent = 'Comprar 🛍️'
  storeGrid.after(buyBtn)

  buyBtn.addEventListener('click', async () => {
    if (cart.size === 0) {
      showMessage('Selecciona al menos un objeto 🐞', true)
      return
    }

    const total = [...cart.values()].reduce((a, b) => a + b, 0)

    if (total > userBugs) {
      showMessage('No tienes suficientes bugs 🐞', true)
      return
    }

    /* ===============================
       REGISTRAR COMPRA
    =============================== */
    const { data: purchase, error } = await supabase
      .from('purchases')
      .insert({
        user_id: user.id,
        total_bugs_spent: total
      })
      .select()
      .single()

    if (error) {
      console.error(error)
      showMessage('Error al procesar la compra 🐞', true)
      return
    }

    const itemsToInsert = [...cart.keys()].map(id => ({
      purchase_id: purchase.id,
      item_id: id,
      quantity: 1
    }))

    await supabase.from('purchase_items').insert(itemsToInsert)

    /* ===============================
       ACTUALIZAR BUGS
    =============================== */
    userBugs -= total
    await supabase
      .from('profiles')
      .update({ bugs: userBugs })
      .eq('id', user.id)

    bugsSpan.textContent = userBugs
    cart.clear()

    document.querySelectorAll('.store-card').forEach(c => {
      c.classList.remove('selected')
      c.querySelector('button').textContent = 'Agregar'
    })

    showMessage('¡Compra realizada con éxito! 🐞🛍️')
  })

  /* ===============================
     MENSAJES
  =============================== */
  function showMessage(text, error = false) {
    messageBox.textContent = text
    messageBox.classList.toggle('error', error)
    messageBox.classList.add('show')

    setTimeout(() => {
      messageBox.classList.remove('show')
    }, 3000)
  }
})

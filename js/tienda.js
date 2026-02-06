import { supabase } from './supabaseClient.js'

document.addEventListener('DOMContentLoaded', async () => {
  // Verificar sesión
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    window.location.href = 'login.html'
    return
  }

  const contenedor = document.getElementById('tienda-container')
  const botonComprar = document.getElementById('comprar-btn')
  const saldoSpan = document.getElementById('saldo-bugs')

  // Obtener saldo del usuario
  const { data: perfil } = await supabase
    .from('usuarios')
    .select('bugs')
    .eq('id', user.id)
    .maybeSingle()

  let saldo = perfil?.bugs || 0
  saldoSpan.textContent = saldo

  // Obtener objetos disponibles
  const { data: objetos } = await supabase
    .from('tienda')
    .select('*')
    .order('precio', { ascending: true })

  // Mostrar objetos
  objetos.forEach(obj => {
    const card = document.createElement('div')
    card.classList.add('objeto-card')

    card.innerHTML = `
      <img src="${obj.imagen}" alt="${obj.nombre}" class="objeto-img">
      <h3>${obj.nombre}</h3>
      <p>${obj.descripcion}</p>
      <p class="precio">💰 ${obj.precio} bugs</p>
      <input type="checkbox" class="seleccion" data-id="${obj.id}" data-precio="${obj.precio}">
    `
    contenedor.appendChild(card)
  })

  // Botón de compra
  botonComprar.addEventListener('click', async () => {
    const seleccionados = Array.from(document.querySelectorAll('.seleccion:checked'))
    if (seleccionados.length === 0) {
      alert('Selecciona al menos un objeto 🐞')
      return
    }

    const total = seleccionados.reduce((suma, el) => suma + parseInt(el.dataset.precio), 0)
    if (total > saldo) {
      alert('No tienes suficientes bugs para esta compra 🐞')
      return
    }

    const ids = seleccionados.map(el => el.dataset.id)

    // Guardar compra
    const { error } = await supabase.from('compras').insert({
      id_usuario: user.id,
      objetos: ids, // array
      total: total,
      fecha: new Date().toISOString()
    })

    if (error) {
      console.error(error)
      alert('Error al realizar la compra 🐞')
      return
    }

    // Descontar saldo
    saldo -= total
    await supabase.from('usuarios').update({ bugs: saldo }).eq('id', user.id)
    saldoSpan.textContent = saldo

    alert('Compra realizada con éxito 🛍️🐞')
    document.querySelectorAll('.seleccion').forEach(cb => (cb.checked = false))
  })
})

document.addEventListener('DOMContentLoaded', async () => {
  // Verificar sesión
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    window.location.href = 'login.html'
    return
  }

  const nombre = document.getElementById('nombre-usuario')
  const saldoSpan = document.getElementById('saldo-bugs')
  const rachaSpan = document.getElementById('racha-dias')
  const botonReclamar = document.getElementById('btn-reclamar')

  // Obtener usuario
  const { data: usuario } = await supabase
    .from('usuarios')
    .select('nombre, bugs')
    .eq('id', user.id)
    .maybeSingle()

  nombre.textContent = usuario?.nombre || 'Usuario'
  let saldo = usuario?.bugs || 0
  saldoSpan.textContent = saldo

  // Verificar racha actual
  const { data: racha } = await supabase
    .from('recompensas')
    .select('*')
    .eq('id_usuario', user.id)
    .order('fecha', { ascending: false })
    .limit(1)
    .maybeSingle()

  const hoy = new Date().toISOString().split('T')[0]
  let diasRacha = 0
  let ultimaFecha = null

  if (racha) {
    ultimaFecha = racha.fecha.split('T')[0]
    diasRacha = racha.racha_dias || 0
  }

  rachaSpan.textContent = diasRacha

  // Verificar si ya reclamó hoy
  if (ultimaFecha === hoy) {
    botonReclamar.disabled = true
    botonReclamar.textContent = 'Ya reclamaste hoy 🐞'
  }

  botonReclamar.addEventListener('click', async () => {
    if (ultimaFecha === hoy) {
      alert('Ya reclamaste tu recompensa diaria 🐞')
      return
    }

    let nuevaRacha = 1
    let hoyDate = new Date(hoy)
    let ayerDate = new Date(hoyDate)
    ayerDate.setDate(hoyDate.getDate() - 1)
    const ayerStr = ayerDate.toISOString().split('T')[0]

    if (ultimaFecha === ayerStr) {
      nuevaRacha = diasRacha + 1
    }

    let recompensa = 5 // base
    if (nuevaRacha % 10 === 0) recompensa = 30 // bono cada 10 días

    // Insertar nueva recompensa
    const { error } = await supabase.from('recompensas').insert({
      id_usuario: user.id,
      fecha: new Date().toISOString(),
      cantidad: recompensa,
      racha_dias: nuevaRacha
    })

    if (error) {
      console.error(error)
      alert('Error al reclamar recompensa 🐞')
      return
    }

    // Actualizar saldo
    saldo += recompensa
    await supabase.from('usuarios').update({ bugs: saldo }).eq('id', user.id)

    saldoSpan.textContent = saldo
    rachaSpan.textContent = nuevaRacha
    botonReclamar.disabled = true
    botonReclamar.textContent = 'Ya reclamaste hoy 🐞'

    alert(`¡Felicidades! Ganaste ${recompensa} bugs 🐞`)
  })
})

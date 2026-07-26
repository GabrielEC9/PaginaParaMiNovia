import { supabase } from './supabaseClient.js'
 
const CODE_PREFIX = 'DESC' 
 
function generateCode() {
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `${CODE_PREFIX}-${rand}`
}
 
function pickWeighted(premios) {
  const total = premios.reduce((sum, p) => sum + p.peso, 0)
  let rand = Math.random() * total
  for (const p of premios) {
    if (rand < p.peso) return p
    rand -= p.peso
  }
  return premios[premios.length - 1]
}
 
document.addEventListener('DOMContentLoaded', async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    window.location.href = '/login.html'
    return
  }
 
  const boletosSpan = document.getElementById('user-boletos')
  const spinBtn = document.getElementById('spin-btn')
  const wheel = document.getElementById('wheel')
  const messageBox = document.getElementById('roulette-message')
  const legend = document.getElementById('premios-legend')
 
  const modal = document.getElementById('result-modal')
  const resultImage = document.getElementById('result-image')
  const resultText = document.getElementById('result-text')
  const resultClose = document.getElementById('result-close')
 
  let boletosDisponibles = []
  let premiosActivos = []
  let currentRotation = 0
 
  resultClose.addEventListener('click', () => modal.classList.add('hidden'))
 
  /* ================= CARGAR BOLETOS DEL USUARIO ================= */
  async function loadBoletos() {
    const { data } = await supabase
      .from('boletos')
      .select('id')
      .eq('user_id', user.id)
      .eq('estado', 'disponible')
 
    boletosDisponibles = data || []
    boletosSpan.textContent = boletosDisponibles.length
    spinBtn.disabled = boletosDisponibles.length === 0
 
    if (boletosDisponibles.length === 0) {
      messageBox.textContent = 'No tienes boletos disponibles. Consíguelos completando tu racha de recompensas.'
      messageBox.className = 'reward-message'
    } else {
      messageBox.textContent = ''
      messageBox.className = 'reward-message'
    }
  }
 
  /* ================= CARGAR PREMIOS ACTIVOS Y DIBUJAR RULETA ================= */
  async function loadPremios() {
    const { data } = await supabase
      .from('ruleta_premios')
      .select('*')
      .eq('activo', true)
 
    premiosActivos = data || []
    drawWheel(premiosActivos)
    drawLegend(premiosActivos)
  }
 
  function colorForTipo(tipo) {
    if (tipo === 'bugs') return '#ff1f1f'
    if (tipo === 'descuento') return '#ffb400'
    return '#dcdcdc' 
  }
 
  function drawWheel(premios) {
    if (premios.length === 0) {
      wheel.style.background = '#dcdcdc'
      return
    }
    const slice = 360 / premios.length
    const stops = premios.map((p, i) => {
      const color = colorForTipo(p.tipo)
      return `${color} ${i * slice}deg ${(i + 1) * slice}deg`
    })
    wheel.style.background = `conic-gradient(${stops.join(', ')})`
  }
 
  function drawLegend(premios) {
    legend.innerHTML = ''
    const total = premios.reduce((sum, p) => sum + p.peso, 0)
 
    // más difícil (peso más bajo) primero
    const ordenados = [...premios].sort((a, b) => a.peso - b.peso)
 
    ordenados.forEach(p => {
      const prob = total ? ((p.peso / total) * 100).toFixed(1) : '0.0'
      const item = document.createElement('div')
      item.classList.add('premio-item')
      item.innerHTML = `
        <span class="premio-dot" style="background:${colorForTipo(p.tipo)}"></span>
        <span class="premio-nombre">${p.nombre}</span>
        <span class="premio-prob">${prob}%</span>
      `
      legend.appendChild(item)
    })
  }
 
  /* ================= GIRAR ================= */
  spinBtn.addEventListener('click', async () => {
    if (boletosDisponibles.length === 0 || premiosActivos.length === 0) return
 
    spinBtn.disabled = true
    const boleto = boletosDisponibles[0]
    const premio = pickWeighted(premiosActivos)
 
    currentRotation += 1440 + Math.floor(Math.random() * 360)
    wheel.style.transform = `rotate(${currentRotation}deg)`
 
    setTimeout(async () => {
      await resolveSpin(boleto, premio)
    }, 3200) 
  })
 
  async function resolveSpin(boleto, premio) {
    await supabase
      .from('boletos')
      .update({ estado: 'usado' })
      .eq('id', boleto.id)
 
    await supabase
      .from('ruleta_giros')
      .insert({ user_id: user.id, boleto_id: boleto.id, premio_id: premio.id })
 
    if (premio.tipo === 'bugs') {
      const { data: profile } = await supabase
        .from('profiles')
        .select('bugs')
        .eq('id', user.id)
        .single()
 
      await supabase
        .from('profiles')
        .update({ bugs: (profile?.bugs ?? 0) + premio.valor })
        .eq('id', user.id)
 
      showResult(premio, `¡Ganaste ${premio.valor} bugs! 🐞`)
    }
 
    else if (premio.tipo === 'descuento') {
      const codigo = premio.codigo || generateCode() 
 
      await supabase
        .from('codigos_descuento')
        .insert({
          user_id: user.id,
          codigo,
          descuento_tipo: premio.descuento_tipo,
          valor: premio.valor
        })
 
      await supabase
        .from('ruleta_premios')
        .update({ activo: false })
        .eq('id', premio.id)
 
      showResult(premio, `¡Ganaste un código de descuento: ${codigo}! 🎉 Revísalo en tu perfil.`)
    }
 
    else {
      showResult(premio, 'Esta vez no hubo suerte, ¡inténtalo con tu próximo boleto! 💔')
    }
 
    await loadBoletos()
    await loadPremios()
    spinBtn.disabled = boletosDisponibles.length === 0
  }
 
  function showResult(premio, text) {
    resultImage.src = premio.image_url || ''
    resultImage.style.display = premio.image_url ? 'block' : 'none'
    resultText.textContent = text
    modal.classList.remove('hidden')
  }
 
  /* ================= INIT ================= */
  await loadBoletos()
  await loadPremios()
})
 
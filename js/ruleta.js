import { supabase } from './supabaseClient.js'

const CODE_PREFIX = 'DESC'

const WHEEL_PALETTE = [
  '#F4C6D7', // rosa suave
  '#F9D5A7', // durazno
  '#FFF1A8', // amarillo pastel
  '#CDECCF', // verde menta
  '#BFE3E1', // aqua suave
  '#C9D7F5', // azul pastel
  '#DCCEF5', // lila
  '#F0C8E8', // rosa/lila
  '#F7C9C9', // coral claro
  '#D7E8C8', // verde lima suave
  '#F6D8C1', // crema melocotón
  '#D9E1F2'  // azul grisáceo pastel
]

function generateCode() {
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `${CODE_PREFIX}-${rand}`
}

function pickWeighted(premios) {
  const total = premios.reduce((sum, p) => sum + Number(p.peso ?? 1), 0)
  if (total <= 0) return premios[premios.length - 1]

  let rand = Math.random() * total
  for (const p of premios) {
    const peso = Number(p.peso ?? 1)
    if (rand < peso) return p
    rand -= peso
  }
  return premios[premios.length - 1]
}

function colorForPremio(p) {
  return WHEEL_PALETTE[(Number(p.id) || 0) % WHEEL_PALETTE.length]
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
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
  let wheelOrder = []
  let wheelSegments = []

  resultClose.addEventListener('click', () => {
    modal.classList.add('hidden')
  })

  function showResult(premio, text) {
    resultImage.src = premio.image_url || ''
    resultImage.style.display = premio.image_url ? 'block' : 'none'
    resultText.textContent = text
    modal.classList.remove('hidden')
  }

function drawWheel(premios) {
  if (!premios || premios.length === 0) {
    wheel.style.background = '#dcdcdc'
    wheel.innerHTML = ''
    wheelOrder = []
    wheelSegments = []
    return
  }

  wheelOrder = shuffle(premios)
  wheelSegments = []

  const total = wheelOrder.reduce((sum, p) => sum + Number(p.peso ?? 1), 0)
  let current = 0
  const stops = []

  wheelOrder.forEach((p) => {
    const weight = Number(p.peso ?? 1)
    const size = 360 * (weight / total)

    const start = current
    const end = current + size

    wheelSegments.push({
      id: p.id,
      start,
      end,
    })

    stops.push(`${colorForPremio(p)} ${start}deg ${end}deg`)
    current = end
  })

  wheel.style.background = `conic-gradient(from -90deg, ${stops.join(', ')})`
  renderSeparators()
}

function renderSeparators() {
  wheel.querySelectorAll('.wheel-separator').forEach(el => el.remove())

  wheelSegments.forEach((segment, index) => {
    if (index === wheelSegments.length - 1) return

    const line = document.createElement('span')
    line.className = 'wheel-separator'
    line.style.transform = `translate(-50%, -50%) rotate(${segment.end - 90}deg)`
    wheel.appendChild(line)
  })
}

  function drawLegend(premios) {
    legend.innerHTML = ''
    const total = premios.reduce((sum, p) => sum + Number(p.peso ?? 1), 0)

    const ordenados = [...premios].sort((a, b) => Number(a.peso ?? 1) - Number(b.peso ?? 1))

    ordenados.forEach((p) => {
      const prob = total ? ((Number(p.peso ?? 1) / total) * 100).toFixed(1) : '0.0'
      const item = document.createElement('div')
      item.classList.add('premio-item')
      item.innerHTML = `
        <span class="premio-dot" style="background:${colorForPremio(p)}"></span>
        <span class="premio-nombre">${p.nombre}</span>
        <span class="premio-prob">${prob}%</span>
      `
      legend.appendChild(item)
    })
  }

  function getTargetAngleForPremio(premio) {
    const segment = wheelSegments.find(s => s.id === premio.id)
    if (!segment) return null

    const size = segment.end - segment.start
    const safeMargin = Math.min(2, Math.max(0.35, size * 0.18))

    const min = segment.start + safeMargin
    const max = segment.end - safeMargin

    if (max <= min) {
      return (segment.start + segment.end) / 2
    }

    return min + Math.random() * (max - min)
  }

  function getRotationDeltaToAngle(targetAngle) {
    const currentMod = ((currentRotation % 360) + 360) % 360
    const desiredMod = ((360 - (targetAngle % 360)) + 360) % 360
    return (desiredMod - currentMod + 360) % 360
  }

  async function loadBoletos() {
    const { data, error } = await supabase
      .from('boletos')
      .select('id')
      .eq('user_id', user.id)
      .eq('estado', 'disponible')

    if (error) {
      console.error('Error cargando boletos:', error)
      boletosDisponibles = []
    } else {
      boletosDisponibles = data || []
    }

    boletosSpan.textContent = boletosDisponibles.length
    spinBtn.disabled = boletosDisponibles.length === 0 || premiosActivos.length === 0

    if (boletosDisponibles.length === 0) {
      messageBox.textContent = 'No tienes boletos disponibles. Consíguelos completando tu racha de recompensas.'
    } else {
      messageBox.textContent = ''
    }
    messageBox.className = 'reward-message'
  }

  async function loadPremios() {
    const { data, error } = await supabase
      .from('ruleta_premios')
      .select('*')
      .eq('activo', true)

    if (error) {
      console.error('Error cargando premios:', error)
      premiosActivos = []
    } else {
      premiosActivos = data || []
    }

    drawWheel(premiosActivos)
    drawLegend(premiosActivos)
    spinBtn.disabled = boletosDisponibles.length === 0 || premiosActivos.length === 0
  }

  spinBtn.addEventListener('click', async () => {
    if (boletosDisponibles.length === 0 || premiosActivos.length === 0) return

    spinBtn.disabled = true

    const boleto = boletosDisponibles[0]
    const premio = pickWeighted(premiosActivos)

    const targetAngle = getTargetAngleForPremio(premio)
    if (targetAngle === null) {
      spinBtn.disabled = false
      return
    }

    const extraTurns = 1440 + Math.floor(Math.random() * 720)
    const delta = getRotationDeltaToAngle(targetAngle) + extraTurns

    currentRotation += delta
    wheel.style.transform = `rotate(${currentRotation}deg)`

    setTimeout(async () => {
      await resolveSpin(boleto, premio)
    }, 3200)
  })

  async function resolveSpin(boleto, premio) {
    try {
      const { error: boletoError } = await supabase
        .from('boletos')
        .update({ estado: 'usado' })
        .eq('id', boleto.id)

      if (boletoError) throw boletoError

      const { error: giroError } = await supabase
        .from('ruleta_giros')
        .insert({
          user_id: user.id,
          boleto_id: boleto.id,
          premio_id: premio.id
        })

      if (giroError) throw giroError

      if (premio.tipo === 'bugs') {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('bugs')
          .eq('id', user.id)
          .single()

        if (profileError) throw profileError

        const nuevaCantidad = (profile?.bugs ?? 0) + Number(premio.valor ?? 0)

        const { error: updateError } = await supabase
          .from('profiles')
          .update({ bugs: nuevaCantidad })
          .eq('id', user.id)

        if (updateError) throw updateError

        showResult(premio, `¡Ganaste ${premio.valor} bugs! 🐞`)
      } else if (premio.tipo === 'descuento') {
        const codigo = premio.codigo || generateCode()

        const { error: codigoError } = await supabase
          .from('codigos_descuento')
          .insert({
            user_id: user.id,
            codigo,
            descuento_tipo: premio.descuento_tipo,
            valor: premio.valor
          })

        if (codigoError) throw codigoError

        const { error: premioError } = await supabase
          .from('ruleta_premios')
          .update({ activo: false })
          .eq('id', premio.id)

        if (premioError) throw premioError

        showResult(premio, `¡Ganaste un código de descuento: ${codigo}! 🎉 Revísalo en tu perfil.`)
      } else {
        showResult(premio, 'Esta vez no hubo suerte, ¡inténtalo con tu próximo boleto! 💔')
      }

      await loadBoletos()
      await loadPremios()
    } catch (error) {
      console.error('Error resolviendo el giro:', error)
      messageBox.textContent = 'Ocurrió un error al registrar el giro. Intenta de nuevo.'
    } finally {
      spinBtn.disabled = boletosDisponibles.length === 0 || premiosActivos.length === 0
    }
  }

  await loadBoletos()
  await loadPremios()
})
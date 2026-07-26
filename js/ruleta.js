import { supabase } from './supabaseClient.js'

const CODE_PREFIX = 'DESC'
const WHEEL_SEPARATOR = 0.55

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

  const total = premios.reduce(
    (sum,p)=>sum + Number(p.peso ?? 1),
    0
  )


  let rand = Math.random()*total


  for(const p of premios){

    const peso = Number(p.peso ?? 1)

    if(rand < peso)
      return p

    rand -= peso

  }


  return premios[premios.length-1]

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
  const canvas = document.getElementById('wheelCanvas')
const ctx = canvas.getContext('2d')

const SIZE = canvas.width
const CENTER = SIZE / 2
const OUTER_RADIUS = SIZE/2 - 8

const RING_SIZE = 28

const RADIUS = OUTER_RADIUS - RING_SIZE
  const messageBox = document.getElementById('roulette-message')
  const legend = document.getElementById('premios-legend')

  const modal = document.getElementById('result-modal')
  const resultImage = document.getElementById('result-image')
  const resultText = document.getElementById('result-text')
  const resultClose = document.getElementById('result-close')

  let boletosDisponibles = []
  let premiosActivos = []
let currentRotation = -Math.PI / 2
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

  function drawWheel() {

    if (!wheelOrder.length) return

    
    wheelSegments = []

    const totalPeso = wheelOrder.reduce(
        (s, p) => s + Number(p.peso ?? 1),
        0
    )

    ctx.clearRect(0, 0, SIZE, SIZE)

  // ==========================================
// BORDE ROJO ESTILO MARIQUITA
// ==========================================

// círculo rojo exterior

ctx.beginPath()

ctx.arc(
    CENTER,
    CENTER,
    OUTER_RADIUS,
    0,
    Math.PI*2
)

ctx.fillStyle="#e51c23"

ctx.fill()


// borde negro fino exterior

ctx.beginPath()

ctx.arc(
    CENTER,
    CENTER,
    OUTER_RADIUS,
    0,
    Math.PI*2
)

ctx.lineWidth=8
ctx.strokeStyle="#111"

ctx.stroke()



// lunares negros

ctx.fillStyle="#111"

const dots = 18


for(let i=0;i<dots;i++){

    const angle =
        i*Math.PI*2/dots


    const x =
        CENTER+
        Math.cos(angle)*(OUTER_RADIUS-15)


    const y =
        CENTER+
        Math.sin(angle)*(OUTER_RADIUS-15)


    ctx.beginPath()

    ctx.arc(
        x,
        y,
        7,
        0,
        Math.PI*2
    )

    ctx.fill()

}


// ==========================================
// CÍRCULO BLANCO INTERIOR
// ==========================================

ctx.beginPath()

ctx.arc(
    CENTER,
    CENTER,
    RADIUS,
    0,
    Math.PI * 2
)

ctx.fillStyle = "#ffffff"

ctx.fill()


    let startAngle = -Math.PI / 2

    console.log("ORDEN VISUAL:")
wheelOrder.forEach((p, i)=>{
    console.log(i, p.id, p.nombre)
})

    wheelOrder.forEach((premio) => {

        const peso = Number(premio.peso ?? 1)

        const arc = (peso / totalPeso) * Math.PI * 2

        const endAngle = startAngle + arc

        wheelSegments.push({

            id: premio.id,

            start: startAngle,

            end: endAngle

        })

        console.log(
 "DIBUJANDO:",
 premio.id,
 premio.nombre,
 startAngle,
 endAngle
)

        // COLOR DEL SECTOR
        ctx.beginPath()
        ctx.moveTo(CENTER, CENTER)

        ctx.arc(
            CENTER,
            CENTER,
            RADIUS,
            startAngle,
            endAngle
        )

        ctx.closePath()

        ctx.fillStyle = colorForPremio(premio)

        ctx.fill()

        // BORDE
        ctx.lineWidth = 3
        ctx.strokeStyle = "#111"

        ctx.stroke()

        // TEXTO

        const middle = (startAngle + endAngle) / 2

        ctx.save()

        ctx.translate(CENTER, CENTER)

        ctx.rotate(middle)

        ctx.textAlign = "right"

        ctx.fillStyle = "#222"

        ctx.font = "bold 22px Arial"

        ctx.fillText(

            premio.nombre,

            RADIUS - 35,

            8

        )

        ctx.restore()

        startAngle = endAngle

    })

    // CENTRO

    ctx.beginPath()

    ctx.arc(

        CENTER,

        CENTER,

        28,

        0,

        Math.PI * 2

    )

    ctx.fillStyle = "#111"

    ctx.fill()

canvas.style.transform =
`rotate(${currentRotation}rad)`

canvas.style.transformOrigin = "center center"
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

function getTargetAngleForPremio(premio){

    const segment=
        wheelSegments.find(
            s=>s.id===premio.id
        )

    if(!segment)
        return null

    const center=
        (segment.start+
        segment.end)/2

    const size=
        segment.end-
        segment.start

    const offset=
        (Math.random()-0.5)*
        Math.min(size*0.25,0.10)

    console.log("TARGET", premio.nombre, center)
return center

}

function getRotationDeltaToAngle(target){

    const TWO_PI = Math.PI * 2

    const current =
        currentRotation % TWO_PI


    let delta =
        (-Math.PI / 2 - target) - current


    while(delta < 0){
        delta += TWO_PI
    }


    return delta

}

async function animateWheel(finalRotation){

    return new Promise(resolve=>{

        const duration = 9000

        const start = performance.now()

        const initial = currentRotation

        const distance = finalRotation-initial

        function animate(now){

            let t=(now-start)/duration

            if(t>1)t=1

            /*
                Curva tipo ruleta real
            */

            const ease=
                1-Math.pow(1-t,5)

            currentRotation=
                initial+
                distance*ease

canvas.style.transform =
`rotate(${currentRotation}rad)`
canvas.style.transformOrigin = "center center"

            if(t<1){

                requestAnimationFrame(animate)

            }else{

                currentRotation=finalRotation

                console.log(
  "ROTACION FINAL:",
  finalRotation,
  "GRADOS:",
  finalRotation * 180 / Math.PI
)

                canvas.style.transform=
                `rotate(${currentRotation}rad)`

                resolve()

            }

        }

        requestAnimationFrame(animate)

    })

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

if (wheelOrder.length === 0) {
    wheelOrder = shuffle(premiosActivos)
}

    }

    drawWheel() 
    drawLegend(premiosActivos)
    spinBtn.disabled = boletosDisponibles.length === 0 || premiosActivos.length === 0
  }

  spinBtn.addEventListener('click', async () => {
    if (boletosDisponibles.length === 0 || premiosActivos.length === 0) return

    spinBtn.disabled = true

    const boleto = boletosDisponibles[0]
    const premio = pickWeighted(wheelOrder)
    console.log("PREMIO ELEGIDO:", premio.nombre, premio.id)
console.log("SEGMENTO:", wheelSegments.find(s => s.id === premio.id))

    const targetAngle = getTargetAngleForPremio(premio)
    if (targetAngle === null) {
      spinBtn.disabled = false
      return
    }

    const extraTurns = ( Math.PI*2*6 ) + Math.random()*(Math.PI*2*4)
    const delta = getRotationDeltaToAngle(targetAngle) + extraTurns

const finalRotation = currentRotation + delta

await animateWheel(finalRotation)

console.log("TERMINO GIRO, PREMIO REAL:", premio.nombre)

await resolveSpin(boleto,premio)
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
        
        const codigo = premio.codigo

        if (!codigo) {
    throw new Error("Este premio no tiene código configurado")
}

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
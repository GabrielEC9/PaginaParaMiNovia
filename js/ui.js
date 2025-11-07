function aplicarEstiloLadybugBotones() {
  document.querySelectorAll('button, .btn').forEach(boton => {
    boton.style.transition = 'all 0.3s ease'
    boton.addEventListener('mouseover', () => {
      boton.style.backgroundColor = '#e60023'
      boton.style.color = 'white'
      boton.style.boxShadow = '0 0 10px rgba(230,0,35,0.6)'
      boton.style.backgroundImage = 'radial-gradient(black 10%, transparent 11%)'
      boton.style.backgroundSize = '10px 10px'
    })
    boton.addEventListener('mouseout', () => {
      boton.style.backgroundImage = 'none'
      boton.style.boxShadow = 'none'
      boton.style.backgroundColor = ''
      boton.style.color = ''
    })
  })
}

function renderTarjetasConSombra(selector) {
  document.querySelectorAll(selector).forEach(card => {
    card.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'
    card.style.borderRadius = '12px'
    card.style.padding = '10px'
    card.style.backgroundColor = 'white'
    card.style.transition = 'transform 0.2s ease'
    card.addEventListener('mouseover', () => {
      card.style.transform = 'scale(1.03)'
    })
    card.addEventListener('mouseout', () => {
      card.style.transform = 'scale(1)'
    })
  })
}

function ajustarImagenesAlbum(selector) {
  document.querySelectorAll(selector).forEach(img => {
    img.style.objectFit = 'cover'
    img.style.width = '100%'
    img.style.height = '200px'
    img.style.borderRadius = '10px'
  })
}

function animarDesbloqueo(elemento) {
  elemento.style.transition = 'all 0.4s ease'
  elemento.style.transform = 'rotateY(180deg)'
  setTimeout(() => {
    elemento.style.backgroundColor = '#e60023'
    elemento.style.backgroundImage = 'radial-gradient(black 10%, transparent 11%)'
    elemento.style.backgroundSize = '10px 10px'
    elemento.style.color = 'white'
    elemento.textContent = '🐞'
    elemento.style.transform = 'rotateY(0deg)'
  }, 400)
}

function mostrarToast(mensaje) {
  const toast = document.createElement('div')
  toast.textContent = mensaje
  toast.style.position = 'fixed'
  toast.style.bottom = '20px'
  toast.style.left = '50%'
  toast.style.transform = 'translateX(-50%)'
  toast.style.background = '#e60023'
  toast.style.color = 'white'
  toast.style.padding = '10px 20px'
  toast.style.borderRadius = '8px'
  toast.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)'
  toast.style.zIndex = '9999'
  document.body.appendChild(toast)
  setTimeout(() => toast.remove(), 2500)
}

window.ui = {
  aplicarEstiloLadybugBotones,
  renderTarjetasConSombra,
  ajustarImagenesAlbum,
  animarDesbloqueo,
  mostrarToast
}

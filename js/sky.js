document.addEventListener('DOMContentLoaded', () => {

  const body = document.body

  const hour = new Date().getHours()

  body.classList.remove(
    'sky-sunrise',
    'sky-day',
    'sky-sunset',
    'sky-night'
  )

  if (hour >= 5 && hour < 7) {

    body.classList.add('sky-sunrise')
  }

  else if (hour >= 7 && hour < 17) {

    body.classList.add('sky-day')
  }

  else if (hour >= 17 && hour < 19) {

    body.classList.add('sky-sunset')
  }

  else {

    body.classList.add('sky-night')
  }

})
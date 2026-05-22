import { supabase } from './supabaseClient.js'

document.addEventListener('DOMContentLoaded', async () => {

  /* ======================================================
     VERIFICAR SESIÓN
  ====================================================== */

  const { data: sessionData } = await supabase.auth.getSession()

  if (!sessionData?.session) {
    window.location.href = 'login.html'
    return
  }

  /* ======================================================
     ELEMENTOS
  ====================================================== */

  const grid = document.getElementById('recuerdos-grid')

  const modal = document.getElementById('recuerdo-modal')

  const contenido = document.getElementById('recuerdo-completo')

  const cerrarBtn = document.getElementById('cerrar-recuerdo')

  /* ======================================================
     RECUERDOS
  ====================================================== */

  const recuerdos = [

    {
      title: 'Carta de Amor 💕',

      preview:
        'El 29 de agosto de 2022, entre las tres y las seis de la tarde, me dirigía al CECyT 6...',

      content: `
        <article class="love-letter">

          <h1>Una carta de amor 💕</h1>

          <p>
            El 29 de agosto de 2022, entre las tres y las seis de la tarde, me dirigía al CECyT 6 con un propósito claro: encontrar un lugar para realizar mi servicio social.
          </p>

          <p>
            Mientras esperaba afuera de los laboratorios, algo llamó mi atención. A lo lejos, con cubrebocas puesto y sin cruzar miradas con nadie, había una figura que me resultaba extrañamente familiar.
          </p>

          <p>
            Tras unos segundos de duda, lo pensé con claridad:
            <strong>“Es una de las trillizas…”</strong>
          </p>

          <p>
            Antes de irme, reuní valor y me acerqué:
            <br>
            — <em>Holaaa… ¿Cinthia, Brenda o Paola?</em>
            <br>
            — <em>Cinthia</em> —respondió sin dudar.
          </p>

          <p>
            Conversamos un rato antes de despedirnos. De regreso a casa, una alegría inesperada llenaba mi pecho: volver a verla después de tantos años.
          </p>

          <p>
            Esa misma noche, a las <strong>8:37 pm</strong>, le envié un mensaje por Messenger.
          </p>

          <p>
            Lo que comenzó como un simple reencuentro se transformó en días de pláticas interminables.
          </p>

          <p>
            Sin darme cuenta, la amistad se convirtió en amor.
          </p>

          <p>
            Me enamoré de esa chica tímida, de su risa en clase, de sus noches haciendo tareas y de su forma tan auténtica de ser.
          </p>

          <p>
            En febrero de 2023 planeé declararme. Pero la vida tenía otros planes.
          </p>

          <p>
            El <strong>25 de febrero de 2023</strong> fuimos a los museos del centro.
          </p>

          <p>
            En la Alameda Central, mientras mi corazón latía con fuerza, tomé la decisión:
            <strong>“Es ahora o nunca.”</strong>
          </p>

          <p>
            Le confesé lo que sentía.
          </p>

          <p>
            Sin darnos cuenta… nos convertimos en novios.
          </p>

          <p>
            Hoy, <strong>25 de febrero de 2026</strong>, cumplimos <strong>tres años</strong> de novios.
          </p>

          <p class="signature">
            Con todo mi cariño,<br>
            yo 🐞
          </p>

        </article>
      `
    },

    {
      title: 'Primer Beso 💋',

      preview:
        'Un mes después de iniciar mi noviazgo con ella, la cita en el parque Lindavista se convirtió en un recuerdo imborrable...',

      content: `
        <article class="love-letter">

          <h1>Recuerdo de nuestro Primer Beso</h1>

          <p>
            Un mes después de iniciar mi noviazgo con ella, la cita en el parque Lindavista se convirtió en un hito imborrable.
          </p>

          <p>
            Recuerdo estar nervioso, a pesar de que ella ya era mi novia.
          </p>

          <p>
            Recuerdo lo hermosa que se veía. Su belleza se grabó en mi memoria mientras platicábamos.
          </p>

          <p>
            En aquel instante, mi anhelo de besarla era inmenso, pero el temor me paralizaba.
          </p>

          <p>
            Cada vez que ella me decía que no a algo, yo le daba un beso furtivo en el cachete.
          </p>

          <p>
            Cuando finalmente tomé la valentía de acercarme a ella y darle un beso, sentí algo inusual.
          </p>

          <p>
            Durante más minutos repetiríamos el juego una y otra vez; ambos no queríamos parar de besarnos.
          </p>

          <p>
            Recordaré cada detalle de ese momento, de nuestro primer beso...
            <span style="color:red;">
              el primer beso del amor verdadero.
            </span>
          </p>

          <p class="signature">
            Con todo mi cariño,<br>
            ~Gabriel
          </p>

        </article>
      `
    }

  ]

  /* ======================================================
     CREAR CARDS
  ====================================================== */

  recuerdos.forEach(recuerdo => {

    const card = document.createElement('div')

    card.className = 'recuerdo-card'

    card.innerHTML = `
      <h2>${recuerdo.title}</h2>

      <p class="recuerdo-preview">
        ${recuerdo.preview}
      </p>
    `

    /* ABRIR MODAL */

    card.addEventListener('click', () => {

      contenido.innerHTML = recuerdo.content

      modal.style.display = 'flex'

      document.body.style.overflow = 'hidden'
    })

    grid.appendChild(card)
  })

  /* ======================================================
     CERRAR MODAL
  ====================================================== */

  cerrarBtn.addEventListener('click', () => {

    modal.style.display = 'none'

    document.body.style.overflow = 'auto'
  })

  /* CERRAR AFUERA */

  modal.addEventListener('click', e => {

    if (e.target === modal) {

      modal.style.display = 'none'

      document.body.style.overflow = 'auto'
    }
  })

})
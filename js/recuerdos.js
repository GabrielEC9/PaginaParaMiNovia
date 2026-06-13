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
        Conversamos un rato antes de despedirnos. De regreso a casa, una alegría inesperada llenaba mi pecho: volver a verla después de tantos años. Una casualidad hermosa que nos colocó en el mismo lugar, al mismo tiempo.
      </p>

      <p>
        Esa misma noche, a las <strong>8:37 pm</strong>, le envié un mensaje por Messenger.
      </p>

      <p>
        Lo que comenzó como un simple reencuentro se transformó en días de pláticas interminables: desde los “buenos días” a las cinco de la mañana, hasta los “buenas noches” cerca de la medianoche.
      </p>

      <p>
        Sin darme cuenta, la amistad se convirtió en amor. No tuve que fingir ni cambiar. Éramos simplemente nosotros… y eso fue suficiente.
      </p>

      <p>
        Me enamoré de esa chica tímida, de su risa en clase, de sus noches haciendo tareas, de su gusto por Minecraft, de su forma de contarme sus días, de su manera tan auténtica de ser.
      </p>

      <p>
        Con el tiempo, el chat no fue suficiente. Necesitaba verla. Estar cerca de ella.
      </p>

      <p>
        Jugábamos Crash Bandicoot CTR, veíamos TikToks, reíamos, comíamos y compartíamos tiempo juntos, mientras poco a poco conocía a su familia.
      </p>

      <p>
        En febrero de 2023 planeé declararme. Pero la vida tenía otros planes.
      </p>

      <p>
        El <strong>14 de febrero</strong> le regalé unas pequeñas rosas tejidas a mano. No eran grandes, pero llevaban todo lo que sentía.
      </p>

      <p>
        Mis planes fueron frustrados…
        <strong>bellamente frustrados.</strong>
      </p>

      <p>
        El <strong>25 de febrero de 2023</strong> fuimos a los museos del centro. Billetes, monedas y exposiciones perdían importancia frente a su presencia.
      </p>

      <p>
        En la Alameda Central, mientras mi corazón latía con fuerza, tomé la decisión:
        <strong>“Es ahora o nunca.”</strong>
      </p>

      <p>
        Le confesé lo que sentía. Ella bajó la mirada, sonrojada, y también confesó lo suyo.
      </p>

      <p>
        Sin darnos cuenta… nos convertimos en novios.
      </p>

      <p>
        Tomé su mano.
        — <em>Se siente raro</em> —me dijo.
        Y sonreí.
      </p>

      <p>
        Desde entonces hemos compartido salidas, viajes, visitas, risas y momentos que guardo todos conmigo.
      </p>

      <p>
        <em>
          "No fue hasta encontrarte que comprendí que mi corazón había estado esperando en silencio toda una vida."
        </em>
      </p>

      <p>
        Yo solo quería volver a hablar con esa amiga. Pero la vida me enseñó que el amor puede surgir de los lugares más inesperados.
      </p>

      <p>
        Hoy, <strong>25 de febrero de 2026</strong>, cumplimos <strong>tres años</strong> de novios.
      </p>

      <p>
        Esta carta es para ti. Para recordarte cómo me enamoré de ti.
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
    'Un mes después de iniciar mi noviazgo con ella, la cita en el parque Lindavista se convirtió en un hito imborrable...',

  content: `
    <article class="love-letter">

      <h1>Recuerdo de nuestro Primer Beso</h1>

      <p>
        Un mes después de iniciar mi noviazgo con ella, la cita en el parque Lindavista se convirtió en un hito imborrable. Recuerdo estar nervioso, a pesar de que ella ya era mi novia; siempre sentía una dulce inquietud al salir con ella, y aquel día no fue la excepción. Al llegar a la plaza, nos dirigimos al Starbucks del segundo piso, ubicado estratégicamente en la esquina. Evoco el momento en que le ofrecí mi bebida favorita, un Matcha, para que la probara; recuerdo ordenarlo y, al poco tiempo, nos acomodamos en una de las mesas.
      </p>

      <p>
        Recuerdo lo hermosa que se veía. Su belleza, eterna e inmutable, se grabó en mi memoria mientras platicábamos. Ella era tan tímida, tan nerviosa, tan hermosa como siempre. En aquel instante, mi anhelo de besarla era inmenso, pero el temor me paralizaba. Fue entonces cuando hice un pequeño juego con ella, una tierna travesura que, para mi sorpresa, me siguió. Cada vez que ella me decía que no a algo, yo le daba un beso furtivo en el cachete. Recuerdo la emoción creciente con cada beso, la forma en que mi corazón se aceleraba, acercándome más y más a sus labios, con la esperanza de poder besarla. La celeridad de mi pulso rivalizaba con la del día en que le declaré mi amor.
      </p>

      <p>
        Cuando finalmente tomé la valentía de acercarme a ella y darle un beso, recuerdo ese momento. Sentí algo inusual. Recuerdo terminar de besarla, tocarle su muslo y percibir que estaba temblando, probablemente de nerviosismo. Fue entonces cuando me di cuenta de que, al igual que yo, ella también sentía lo mismo. Durante más minutos, repetiríamos el juego una y otra y otra y otra vez; ambos no queríamos parar de besarnos. Al terminar y volver a nuestra plática, recordaré cada detalle de ese momento, de nuestro primer beso...
        <span style="color: red;">
          el primer beso del amor verdadero.
        </span>
      </p>

      <p class="signature">
        Con todo mi cariño,<br>
        ~Gabriel
      </p>

    </article>
  `
},

{
  title: 'Nuestra Primera Salida 🌳💖',

  preview:
    'Después de declararme, la semana siguiente viviríamos nuestra primera salida oficialmente como novios en el Ecoparque Acoatl...',

  content: `
    <article class="love-letter">

      <h1>Nuestra Primera Salida 🌳💖</h1>

      <p>
        Después de declararme, la semana siguiente viviríamos nuestra primera salida oficialmente como novios. Recuerdo aquel día en el Ecoparque Acoatl como uno de los recuerdos más tranquilos y hermosos de nuestra historia.
      </p>

      <p>
        No existía un plan elaborado ni una lista de lugares por recorrer; bastaba simplemente con caminar junto a ella, explorar cada rincón del parque y disfrutar la extraña felicidad de poder tomar su mano sabiendo que ahora éramos novios.
      </p>

      <p>
        Recuerdo recorrer con ella cada sendero, mirar los árboles, el lago y las estructuras del lugar mientras hablábamos de cualquier cosa. Todo parecía distinto aquel día, como si el mundo entero hubiera adquirido una calma especial únicamente por estar a su lado.
      </p>

      <p>
        Nuestra visita nos llevó también al museo, aquel lugar de arquitectura tan peculiar y elegante que parecía sacado de otro sitio.
      </p>

      <p>
        Después caminaríamos hacia las enormes canchas, inmensas a nuestros ojos, mientras seguíamos avanzando sin prisa alguna.
      </p>

      <p>
        Más tarde llegaríamos al reloj solar, aquella gigantesca estructura que se elevaba sobre nosotros y que, por unos instantes, nos hizo detenernos simplemente para admirarla.
      </p>

      <p>
        Recuerdo verla caminar junto a mí, tan tímida, tan tranquila, tan hermosa como siempre. Aquel día no necesitábamos nada más; ni planes extravagantes, ni conversaciones extraordinarias. Bastaba únicamente con estar juntos.
      </p>

      <p>
        Pero el momento que más permanece grabado en mi memoria llegaría después.
      </p>

      <p>
        Cerca del lago, bajo la sombra de un árbol que nos protegía del sol, nos recostaríamos sobre el césped. Recuerdo el instante exacto en que ella apoyó su cabeza sobre mi pecho.
      </p>

      <p>
        Mi corazón latía con fuerza, tan rápido como el día en que le confesé mis sentimientos, mientras yo acariciaba lentamente su cabello.
      </p>

      <p>
        Recuerdo el suave aroma de su pelo moviéndose con el viento, el sonido relajante de las hojas sobre nosotros y aquella paz indescriptible que sentía al verla descansar sobre mí.
      </p>

      <p>
        Poco a poco comenzaría a quedarse dormida, mientras el tiempo parecía detenerse únicamente para nosotros.
      </p>

      <p>
        <span style="color: red;">
          Hasta el día de hoy, recordaré aquel instante como uno de los momentos más hermosos y puros que he vivido a su lado.
        </span>
      </p>

      <p class="signature">
        Con todo mi cariño,<br>
        ~Gabriel
      </p>

    </article>
  `
},

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
import { supabase } from './supabaseClient.js'

const CYCLE_DAYS = 14
const BOLETO_IMAGE = '/imagenes/boleto.png'

document.addEventListener('DOMContentLoaded', async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    window.location.href = '/login.html'
    return
  }

  const bugsSpan = document.getElementById('user-bugs')
  const streakSpan = document.getElementById('user-streak')
  const messageBox = document.getElementById('reward-message')
  const rewardsGrid = document.getElementById('rewards-grid')
  const container = document.querySelector('.rewards-container')

  messageBox.textContent = ''
  messageBox.className = 'reward-message'

  /* ================= PERFIL ================= */
  const { data: profile } = await supabase
    .from('profiles')
    .select('bugs, streak_days, last_claim, lost_streak, streak_lost_at, streak_recovered')
    .eq('id', user.id)
    .single()

  let bugs = profile.bugs ?? 0
  let streak = profile.streak_days ?? 0
  const lastClaimStr = profile.last_claim ?? null

  bugsSpan.textContent = bugs
  streakSpan.textContent = streak

  /* ================= FECHAS ================= */
  function getLocalDateString(date = new Date()) {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }

  const todayStr = getLocalDateString()
  const yesterdayStr = getLocalDateString(new Date(Date.now() - 864e5))

  /* ================= LÓGICA DE RACHA ================= */
  const alreadyClaimedToday = lastClaimStr === todayStr
  const claimedYesterday = lastClaimStr === yesterdayStr

  let streakBroken = false
  let canClaimNow = false

  if (!lastClaimStr) {
    streakBroken = true
    streak = 0
    canClaimNow = true
  } else if (alreadyClaimedToday) {
    canClaimNow = false
  } else if (claimedYesterday) {
    canClaimNow = true
  } else {
    streakBroken = true
    streak = 0
    canClaimNow = true
  }

  /* ===== GUARDAR RACHA PERDIDA ===== */
  if (streakBroken && profile.streak_days > 0 && !profile.streak_lost_at) {
    await supabase
      .from('profiles')
      .update({
        lost_streak: profile.streak_days,
        streak_lost_at: todayStr,
        streak_days: 0,
        streak_recovered: false
      })
      .eq('id', user.id)

    streakSpan.textContent = 0
  }

  /* ================= RECUPERAR RACHA ================= */
  const lostDate = profile.streak_lost_at?.slice(0, 10)

  const canRecover =
    profile.lost_streak > 0 &&
    (lostDate === todayStr || lostDate === yesterdayStr) &&
    !profile.streak_recovered

  const recoverCost = profile.lost_streak * 3 || 50

  if (canRecover) {

    // ¿tiene un pase de racha gratis sin usar, ganado en la ruleta?
    const { data: pases } = await supabase
      .from('racha_gratis')
      .select('id')
      .eq('user_id', user.id)
      .eq('usado', false)
      .limit(1)

    const pase = pases && pases[0] ? pases[0] : null

    async function recoverWithPase() {
      await supabase
        .from('racha_gratis')
        .update({ usado: true, used_at: new Date().toISOString() })
        .eq('id', pase.id)

      await supabase
        .from('profiles')
        .update({
          streak_days: profile.lost_streak,
          lost_streak: 0,
          streak_lost_at: null,
          streak_recovered: true,
          last_claim: todayStr
        })
        .eq('id', user.id)

      messageBox.textContent = '¡Racha recuperada gratis con tu pase! 🎉'
      messageBox.className = 'reward-message completed'
      setTimeout(() => location.reload(), 1200)
    }

    async function recoverWithBugs() {
      if (bugs < recoverCost) {
        alert('No tienes suficientes bugs')
        return
      }

      await supabase
        .from('profiles')
        .update({
          bugs: bugs - recoverCost,
          streak_days: profile.lost_streak,
          lost_streak: 0,
          streak_lost_at: null,
          streak_recovered: true,
          last_claim: todayStr
        })
        .eq('id', user.id)

      messageBox.textContent = '¡Racha recuperada con éxito!'
      messageBox.className = 'reward-message completed'
      setTimeout(() => location.reload(), 1200)
    }

    if (pase) {
      // dos opciones para elegir: gratis con el pase, o pagando con bugs como siempre
      const recoverGroup = document.createElement('div')
      recoverGroup.classList.add('recover-options')

      const freeBtn = document.createElement('button')
      freeBtn.classList.add('recover-btn', 'free')
      freeBtn.textContent = 'Recuperar racha (GRATIS 🎟️)'
      freeBtn.addEventListener('click', recoverWithPase)

      const bugsBtn = document.createElement('button')
      bugsBtn.classList.add('recover-btn')
      bugsBtn.textContent = `Recuperar racha ( - ${recoverCost} )`
      bugsBtn.addEventListener('click', recoverWithBugs)

      recoverGroup.appendChild(freeBtn)
      recoverGroup.appendChild(bugsBtn)
      container.appendChild(recoverGroup)

    } else {
      // solo la opción de pagar con bugs, como antes
      const recoverBtn = document.createElement('button')
      recoverBtn.classList.add('recover-btn')
      recoverBtn.textContent = `Recuperar racha ( - ${recoverCost} )`
      recoverBtn.addEventListener('click', recoverWithBugs)
      container.appendChild(recoverBtn)
    }
  }

  /* ================= DÍAS ================= */

  const realDay = alreadyClaimedToday ? streak : streak + 1

  const activeDay = streakBroken
    ? 1
    : ((realDay - 1) % CYCLE_DAYS) + 1

  let nextDayForTomorrow =
    (!streakBroken && alreadyClaimedToday && !canClaimNow)
      ? ((activeDay % CYCLE_DAYS) + 1)
      : null

  /* ================= HELPER: dar boleto al usuario ================= */
  async function giveBoleto() {
    await supabase
      .from('boletos')
      .insert({ user_id: user.id, origen: 'racha' })
  }

  /* ================= HELPER: contenido visual de una tarjeta ================= */
  function rewardInnerHTML(r, { locked = false, disponibleManana = false } = {}) {
    if (locked && r.reward_boleto) {
      return `
        <div class="reward-day">Día ${r.day_number}</div>
        <div class="reward-bugs">🎟️ Premio especial</div>
      `
    }

    if (disponibleManana) {
      return `
        <div class="reward-day">Día ${r.day_number}</div>
        <div class="reward-bugs">${r.reward_boleto ? '🎟️ Premio especial - ' : ''}Disponible mañana</div>
      `
    }

    if (locked) {
      return `
        <div class="reward-day">Día ${r.day_number}</div>
        <div class="reward-bugs">🔒</div>
      `
    }

    // desbloqueado o ya reclamado
    if (r.reward_boleto) {
      return `
        <div class="reward-day">Día ${r.day_number}</div>
        <img class="reward-boleto-img" src="${BOLETO_IMAGE}" alt="Boleto especial" />
        <div class="reward-bugs">🐞 ${r.reward_bugs} + 🎟️ Boleto</div>
      `
    }

    return `
      <div class="reward-day">Día ${r.day_number}</div>
      <div class="reward-bugs">🐞 ${r.reward_bugs}</div>
    `
  }

  /* ================= RECOMPENSAS ================= */
  const { data: rewards } = await supabase
    .from('daily_rewards')
    .select('*')
    .order('day_number')

  rewardsGrid.innerHTML = ''

  rewards.forEach(r => {
    const card = document.createElement('div')
    card.classList.add('reward-card')
    if (r.reward_boleto) card.classList.add('special')

    if (r.day_number < activeDay || (r.day_number === activeDay && alreadyClaimedToday)) {
      card.classList.add('claimed')
      card.innerHTML = rewardInnerHTML(r)
    }

    else if (!streakBroken && r.day_number === activeDay && canClaimNow) {
      card.classList.add('unlocked', 'clickable')
      card.innerHTML = rewardInnerHTML(r)
      card.addEventListener('click', async () => {
        const reward = r.reward_bugs

        await supabase
          .from('profiles')
          .update({
            bugs: bugs + reward,
            streak_days: realDay,
            last_claim: todayStr
          })
          .eq('id', user.id)

        if (r.reward_boleto) await giveBoleto()

        messageBox.textContent = r.reward_boleto
          ? `✔ Día ${activeDay} completado - ¡Ganaste un boleto! 🎟️`
          : `✔ Día ${activeDay} completado`
        messageBox.className = 'reward-message completed'
        setTimeout(() => location.reload(), 800)
      })
    }

    else if (!streakBroken && alreadyClaimedToday && !canClaimNow && r.day_number === nextDayForTomorrow) {
      card.classList.add('locked', 'next')
      card.innerHTML = rewardInnerHTML(r, { disponibleManana: true })
    }

    else if (streakBroken && r.day_number === 1 && canClaimNow) {
      card.classList.add('unlocked', 'clickable')
      card.innerHTML = rewardInnerHTML(r)
      card.addEventListener('click', async () => {
        const reward = r.reward_bugs

        await supabase
          .from('profiles')
          .update({
            bugs: bugs + reward,
            streak_days: 1,
            last_claim: todayStr
          })
          .eq('id', user.id)

        if (r.reward_boleto) await giveBoleto()

        messageBox.textContent = r.reward_boleto
          ? `✔ Día 1 completado - ¡Ganaste un boleto! 🎟️`
          : `✔ Día 1 completado`
        messageBox.className = 'reward-message completed'
        setTimeout(() => location.reload(), 800)
      })
    }

    else {
      card.classList.add('locked')
      card.innerHTML = rewardInnerHTML(r, { locked: true })
    }

    rewardsGrid.appendChild(card)
  })
})
import { supabase } from './supabaseClient.js'

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
  const canRecover =
    profile.lost_streak > 0 &&
    profile.streak_lost_at === yesterdayStr &&
    !profile.streak_recovered

  const recoverCost = profile.lost_streak * 10 || 50

  if (canRecover) {
    const recoverBtn = document.createElement('button')
    recoverBtn.textContent = `💖 Recuperar racha (-${recoverCost} 🐞)`
    recoverBtn.classList.add('recover-btn')

  recoverBtn.addEventListener('click', async () => {
    if (bugs < recoverCost) {
      alert('No tienes suficientes bugs 🐞')
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

    messageBox.textContent = '💖 ¡Racha recuperada con éxito!'
    messageBox.className = 'reward-message completed'

    setTimeout(() => location.reload(), 1200)
  })
  container.appendChild(recoverBtn)
}

  /* ================= DÍAS ================= */

  const realDay = alreadyClaimedToday ? streak : streak + 1

  const activeDay = streakBroken
    ? 1
    : ((realDay - 1) % 10) + 1

  let nextDayForTomorrow =
    (!streakBroken && alreadyClaimedToday && !canClaimNow)
      ? ((activeDay % 10) + 1)
      : null

  /* ================= RECOMPENSAS ================= */
  const { data: rewards } = await supabase
    .from('daily_rewards')
    .select('*')
    .order('day_number')

  rewardsGrid.innerHTML = ''

  rewards.forEach(r => {
    const card = document.createElement('div')
    card.classList.add('reward-card')

    if (r.day_number < activeDay || (r.day_number === activeDay && alreadyClaimedToday)) {
      card.classList.add('claimed')
      card.innerHTML = `
        <div class="reward-day">Día ${r.day_number}</div>
        <div class="reward-bugs">🐞 ${r.reward_bugs}</div>
      `
    }

    else if (!streakBroken && r.day_number === activeDay && canClaimNow) {
      card.classList.add('unlocked', 'clickable')
      card.innerHTML = `
        <div class="reward-day">Día ${r.day_number}</div>
        <div class="reward-bugs">🐞 ${r.reward_bugs}</div>
      `
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

        messageBox.textContent = `✔ Día ${activeDay} completado`
        messageBox.className = 'reward-message completed'
        setTimeout(() => location.reload(), 800)
      })
    }

    else if (!streakBroken && alreadyClaimedToday && !canClaimNow && r.day_number === nextDayForTomorrow) {
      card.classList.add('locked', 'next')
      card.innerHTML = `
        <div class="reward-day">Día ${r.day_number}</div>
        <div class="reward-bugs">Disponible mañana</div>
      `
    }

    else if (streakBroken && r.day_number === 1 && canClaimNow) {
      card.classList.add('unlocked', 'clickable')
      card.innerHTML = `
        <div class="reward-day">Día 1</div>
        <div class="reward-bugs">🐞 ${r.reward_bugs}</div>
      `
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

        messageBox.textContent = `✔ Día 1 completado`
        messageBox.className = 'reward-message completed'
        setTimeout(() => location.reload(), 800)
      })
    }

    else {
      card.classList.add('locked')
      card.innerHTML = `
        <div class="reward-day">Día ${r.day_number}</div>
        <div class="reward-bugs">🔒</div>
      `
    }

    rewardsGrid.appendChild(card)
  })
})
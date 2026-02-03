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

  messageBox.textContent = ''
  messageBox.className = 'reward-message'

  /* ================= PERFIL ================= */
  const { data: profile } = await supabase
    .from('profiles')
    .select('bugs, streak_days, last_claim')
    .eq('id', user.id)
    .single()

  let bugs = profile.bugs ?? 0
  let streak = profile.streak_days ?? 0
  let lastClaim = profile.last_claim ? new Date(profile.last_claim) : null

  bugsSpan.textContent = bugs
  streakSpan.textContent = streak

  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterdayStart = new Date(todayStart)
  yesterdayStart.setDate(yesterdayStart.getDate() - 1)

  /* ========== VALIDAR RACHA Y TIEMPO DE ESPERA ========== */
  let alreadyClaimedToday = false
  let streakBroken = false
  let canClaimNow = false

  if (lastClaim) {
    // Fecha sin hora para comparación de racha
    const lastClaimDateOnly = new Date(lastClaim.getFullYear(), lastClaim.getMonth(), lastClaim.getDate())
    alreadyClaimedToday = lastClaimDateOnly.getTime() === todayStart.getTime()

    // Racha rota si no reclamó ayer ni hoy
    if (lastClaimDateOnly.getTime() !== todayStart.getTime() && lastClaimDateOnly.getTime() !== yesterdayStart.getTime()) {
      streakBroken = true
      streak = 0
    }

    // CORRECCIÓN: Se puede reclamar si ya pasó el siguiente día calendario
    canClaimNow = lastClaimDateOnly.getTime() < todayStart.getTime()
  } else {
    streakBroken = true
    streak = 0
    canClaimNow = true
  }

  // Día activo hoy
  const activeDay = streakBroken ? 1 : (!alreadyClaimedToday ? streak + 1 : streak)

  // Día que estará "Disponible mañana"
  let nextDayForTomorrow = (!streakBroken && alreadyClaimedToday && !canClaimNow) ? activeDay + 1 : null
  if (nextDayForTomorrow && nextDayForTomorrow > 10) nextDayForTomorrow = 1

  /* ================= RECOMPENSAS ================= */
  const { data: rewards } = await supabase
    .from('daily_rewards')
    .select('*')
    .order('day_number')

  rewardsGrid.innerHTML = ''

  rewards.forEach(r => {
    const card = document.createElement('div')
    card.classList.add('reward-card')

    /* ===== YA RECLAMADO ===== */
    if (!streakBroken && r.day_number < activeDay) {
      card.classList.add('claimed')
      card.innerHTML = `
        <div class="reward-day">Día ${r.day_number}</div>
        <div class="reward-bugs">🐞 ${r.reward_bugs}</div>
      `
    }

    /* ===== HOY DISPONIBLE ===== */
    else if (!streakBroken && r.day_number === activeDay && (!alreadyClaimedToday || canClaimNow)) {
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
            streak_days: activeDay,
            last_claim: now.toISOString()
          })
          .eq('id', user.id)

        messageBox.textContent = `✔ Día ${activeDay} completado`
        messageBox.className = 'reward-message completed'
        setTimeout(() => location.reload(), 800)
      })
    }

    /* ===== DISPONIBLE MAÑANA ===== */
    else if (!streakBroken && alreadyClaimedToday && !canClaimNow && r.day_number === nextDayForTomorrow) {
      card.classList.add('locked', 'next')
      card.innerHTML = `
        <div class="reward-day">Día ${r.day_number}</div>
        <div class="reward-bugs">Disponible mañana</div>
      `
    }

    /* ===== PRIMER DÍA SI SE ROMPE LA RACHA ===== */
    else if (streakBroken && r.day_number === 1) {
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
            last_claim: now.toISOString()
          })
          .eq('id', user.id)

        messageBox.textContent = `✔ Día 1 completado`
        messageBox.className = 'reward-message completed'
        setTimeout(() => location.reload(), 800)
      })
    }

    /* ===== BLOQUEADO ===== */
    else if (!card.classList.contains('unlocked') && !card.classList.contains('claimed')) {
      card.classList.add('locked')
      card.innerHTML = `
        <div class="reward-day">Día ${r.day_number}</div>
        <div class="reward-bugs">🔒</div>
      `
    }

    rewardsGrid.appendChild(card)
  })
})

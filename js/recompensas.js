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
  let lastClaim = profile.last_claim

  bugsSpan.textContent = bugs
  streakSpan.textContent = streak

  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]

  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  /* ========== VALIDAR RACHA ========== */
  let alreadyClaimedToday = lastClaim === todayStr

  // ❌ si no reclamó ayer ni hoy → racha rota
  let streakBroken = lastClaim && lastClaim !== todayStr && lastClaim !== yesterdayStr
  if (streakBroken) streak = 0

  // Día activo hoy o mañana
  const nextDay = streakBroken ? 1 : (alreadyClaimedToday ? streak + 1 : streak + 1)
  if (nextDay > 10) nextDay = 1

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
    if (r.day_number <= streak && !streakBroken) {
      card.classList.add('claimed')
      card.innerHTML = `
        <div class="reward-day">Día ${r.day_number}</div>
        <div class="reward-bugs">🐞 ${r.reward_bugs}</div>
      `
    }

    /* ===== HOY DISPONIBLE ===== */
    else if (r.day_number === nextDay && !alreadyClaimedToday && !streakBroken) {
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
            streak_days: nextDay,
            last_claim: todayStr
          })
          .eq('id', user.id)

        messageBox.textContent = `✔ Día ${nextDay} completado`
        messageBox.className = 'reward-message completed'

        setTimeout(() => location.reload(), 800)
      })
    }

    /* ===== MAÑANA ===== */
    else if (alreadyClaimedToday && r.day_number === nextDay && !streakBroken) {
      card.classList.add('locked', 'next')
      card.innerHTML = `
        <div class="reward-day">Día ${r.day_number}</div>
        <div class="reward-bugs">Disponible mañana</div>
      `
    }

    /* ===== PRIMER DIA SI SE ROMPE LA RACHA ===== */
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
            last_claim: todayStr
          })
          .eq('id', user.id)

        messageBox.textContent = `✔ Día 1 completado`
        messageBox.className = 'reward-message completed'

        setTimeout(() => location.reload(), 800)
      })
    }

    /* ===== BLOQUEADO ===== */
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

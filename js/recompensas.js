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

  /* ===============================
     PERFIL
  =============================== */
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('bugs, streak_days, last_claim')
    .eq('id', user.id)
    .single()

  if (error) {
    console.error(error)
    return
  }

  let bugs = profile.bugs ?? 0
  let streak = profile.streak_days ?? 0
  let lastClaim = profile.last_claim

  bugsSpan.textContent = bugs
  streakSpan.textContent = streak

  const todayStr = new Date().toISOString().split('T')[0]
  const alreadyClaimedToday = lastClaim === todayStr

  /* ===============================
     DÍA ACTIVO REAL
  =============================== */
  let activeDay = alreadyClaimedToday ? streak : streak + 1
  if (activeDay > 10) activeDay = 1

  /* ===============================
     RECOMPENSAS
  =============================== */
  const { data: rewards } = await supabase
    .from('daily_rewards')
    .select('*')
    .order('day_number')

  rewardsGrid.innerHTML = ''

  rewards.forEach(r => {
    const card = document.createElement('div')
    card.classList.add('reward-card')

    /* ========== YA RECLAMADO ========== */
    if (
      r.day_number < activeDay ||
      (alreadyClaimedToday && r.day_number === activeDay)
    ) {
      card.classList.add('claimed')
      card.innerHTML = `
        <div class="reward-day">Día ${r.day_number}</div>
        <div class="reward-bugs">🐞 ${r.reward_bugs}</div>
        ${
          alreadyClaimedToday && r.day_number === activeDay
            ? `<div class="reward-timer"></div>`
            : ''
        }
      `

      // ⏳ contador SOLO en el día reclamado hoy
      if (alreadyClaimedToday && r.day_number === activeDay) {
        const timerEl = card.querySelector('.reward-timer')
        startCountdown(timerEl, lastClaim)
      }
    }

    /* ========== DESBLOQUEADO ========== */
    else if (r.day_number === activeDay && !alreadyClaimedToday) {
      card.classList.add('unlocked', 'clickable')
      card.innerHTML = `
        <div class="reward-day">Día ${r.day_number}</div>
        <div class="reward-bugs">🐞 ${r.reward_bugs}</div>
      `

      card.addEventListener('click', async () => {
        const reward = r.reward_bugs

        const { error } = await supabase
          .from('profiles')
          .update({
            bugs: bugs + reward,
            streak_days: activeDay,
            last_claim: todayStr
          })
          .eq('id', user.id)

        if (error) {
          console.error(error)
          messageBox.textContent = '❌ Error al reclamar recompensa'
          return
        }

        messageBox.textContent = `✔ Día ${activeDay} reclamado`
        messageBox.className = 'reward-message completed'

        setTimeout(() => location.reload(), 800)
      })
    }

    /* ========== BLOQUEADO ========== */
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

/* ===================================
   CONTADOR REAL 24 HORAS
=================================== */
function startCountdown(container, lastClaimDate) {
  const base = new Date(lastClaimDate)
  base.setHours(0, 0, 0, 0)
  const unlockTime = base.getTime() + 24 * 60 * 60 * 1000

  const interval = setInterval(() => {
    const diff = unlockTime - Date.now()

    if (diff <= 0) {
      container.textContent = '✨ Disponible mañana'
      clearInterval(interval)
      return
    }

    const h = Math.floor(diff / 1000 / 60 / 60)
    const m = Math.floor((diff / 1000 / 60) % 60)
    const s = Math.floor((diff / 1000) % 60)

    container.textContent = `⏳ ${h}h ${m}m ${s}s`
  }, 1000)
}

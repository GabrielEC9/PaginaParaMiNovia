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

  // limpiar mensaje
  messageBox.className = 'reward-message'
  messageBox.textContent = ''

  // ===============================
  // PERFIL
  // ===============================
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('bugs, streak_days, last_claim')
    .eq('id', user.id)
    .single()

  if (error) {
    console.error(error)
    return
  }

  let bugs = profile.bugs || 0
  let streak = profile.streak_days || 0
  let lastClaim = profile.last_claim

  bugsSpan.textContent = bugs
  streakSpan.textContent = streak

  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]

  // ===============================
  // RECOMPENSAS
  // ===============================
  const { data: rewards } = await supabase
    .from('daily_rewards')
    .select('*')
    .order('day_number')

  let activeDay = streak + 1
  if (activeDay > 10) activeDay = 1

  rewardsGrid.innerHTML = ''

  rewards.forEach(r => {
    const card = document.createElement('div')
    card.classList.add('reward-card')

    if (r.day_number < activeDay) {
      card.classList.add('claimed')
      card.innerHTML = `
        <div class="reward-day">Día ${r.day_number}</div>
        <div class="reward-bugs">🐞 ${r.reward_bugs}</div>
        <div class="reward-icon">✔</div>
      `
    }

    else if (r.day_number === activeDay) {
      card.classList.add('unlocked')

      card.innerHTML = `
        <div class="reward-day">Día ${r.day_number}</div>
        <div class="reward-bugs">🐞 ${r.reward_bugs}</div>
        <div class="reward-timer"></div>
      `

      // ⏱️ contador si ya reclamó hoy
      if (lastClaim) {
        startCountdown(card.querySelector('.reward-timer'), lastClaim)
      }

      // 👉 CLICK PARA RECLAMAR
      if (lastClaim !== todayStr) {
        card.classList.add('clickable')

        card.addEventListener('click', async () => {
          const reward = r.reward_bugs

          const { error: updateError } = await supabase
            .from('profiles')
            .update({
              bugs: bugs + reward,
              streak_days: activeDay,
              last_claim: todayStr
            })
            .eq('id', user.id)

          if (updateError) {
            console.error(updateError)
            messageBox.textContent = '❌ Error al reclamar recompensa'
            return
          }

          // ✅ MENSAJE ÚNICO
          messageBox.textContent = `✔ Día ${activeDay} completado`
          messageBox.className = 'reward-message completed'

          setTimeout(() => location.reload(), 900)
        })
      }
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

/* ===================================
   CONTADOR 24 HORAS
=================================== */
function startCountdown(container, lastClaimDate) {
  const last = new Date(lastClaimDate)
  last.setHours(0, 0, 0, 0)
  const unlockTime = last.getTime() + 24 * 60 * 60 * 1000

  const interval = setInterval(() => {
    const now = Date.now()
    const diff = unlockTime - now

    if (diff <= 0) {
      container.textContent = '✨ Disponible para reclamar'
      clearInterval(interval)
      return
    }

    const h = Math.floor(diff / 1000 / 60 / 60)
    const m = Math.floor((diff / 1000 / 60) % 60)
    const s = Math.floor((diff / 1000) % 60)

    container.textContent = `⏳ ${h}h ${m}m ${s}s`
  }, 1000)
}

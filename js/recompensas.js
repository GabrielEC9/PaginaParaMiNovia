import { supabase } from './supabaseClient.js'

document.addEventListener('DOMContentLoaded', async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    window.location.href = '/login.html'
    return
  }

  const bugsSpan = document.getElementById('user-bugs')
  const streakSpan = document.getElementById('user-streak')
  const claimBtn = document.getElementById('claim-reward-btn')
  const messageBox = document.getElementById('reward-message')
  const rewardsGrid = document.getElementById('rewards-grid')

  // 🔄 limpiar estado visual del mensaje (importante)
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
    } else if (r.day_number === activeDay) {
      card.classList.add('unlocked')
    }

    card.innerHTML = `
      <div class="reward-day">Día ${r.day_number}</div>
      <div class="reward-bugs">🐞 ${r.reward_bugs}</div>
      <div class="reward-timer"></div>
    `

    rewardsGrid.appendChild(card)

    // ⏱️ contador solo para el día activo
    if (r.day_number === activeDay && lastClaim) {
      startCountdown(card.querySelector('.reward-timer'), lastClaim)
    }
  })

  // ===============================
  // YA RECLAMÓ HOY
  // ===============================
  if (lastClaim === todayStr) {
    claimBtn.disabled = true
    claimBtn.textContent = 'Ya reclamaste hoy 🐞'
    return
  }

  // ===============================
  // RECLAMAR
  // ===============================
  claimBtn.addEventListener('click', async () => {
    let newStreak = 1

    if (lastClaim) {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]

      if (lastClaim === yesterdayStr) {
        newStreak = streak + 1
      }
    }

    if (newStreak > 10) newStreak = 1

    const rewardRow = rewards.find(r => r.day_number === newStreak)
    const reward = rewardRow ? rewardRow.reward_bugs : 5

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        bugs: bugs + reward,
        streak_days: newStreak,
        last_claim: todayStr
      })
      .eq('id', user.id)

    if (updateError) {
      console.error(updateError)
      messageBox.textContent = '❌ Error al reclamar recompensa'
      return
    }

    // ✅ MENSAJE DE DÍA COMPLETADO
    messageBox.textContent = `✔ Día ${newStreak} completado`
    messageBox.classList.add('completed')

    claimBtn.disabled = true
    claimBtn.textContent = 'Ya reclamaste hoy 🐞'

    // recargar para actualizar grid y racha
    setTimeout(() => location.reload(), 900)
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

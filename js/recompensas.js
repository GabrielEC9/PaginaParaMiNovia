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

  const today = new Date().toISOString().split('T')[0]

  // ===============================
  // RECOMPENSAS (tabla daily_rewards)
  // ===============================
  const { data: rewards } = await supabase
    .from('daily_rewards')
    .select('*')
    .order('day_number')

  // Día activo según racha
  let activeDay = streak + 1
  if (activeDay > 10) activeDay = 1

  // ===============================
  // RENDER GRID
  // ===============================
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
    `

    rewardsGrid.appendChild(card)
  })

  // ===============================
  // YA RECLAMÓ HOY
  // ===============================
  if (lastClaim === today) {
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

    // Reinicio al llegar a 10
    if (newStreak > 10) newStreak = 1

    const rewardRow = rewards.find(r => r.day_number === newStreak)
    const reward = rewardRow ? rewardRow.reward_bugs : 5

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        bugs: bugs + reward,
        streak_days: newStreak,
        last_claim: today
      })
      .eq('id', user.id)

    if (updateError) {
      console.error(updateError)
      messageBox.textContent = '❌ Error al reclamar recompensa'
      return
    }

    messageBox.textContent = `🎉 Ganaste ${reward} bugs`
    claimBtn.disabled = true
    claimBtn.textContent = 'Ya reclamaste hoy 🐞'

    // Recargar para actualizar grid
    setTimeout(() => location.reload(), 800)
  })
})

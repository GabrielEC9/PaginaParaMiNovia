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

  // Obtener perfil
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

  // Ya reclamó hoy
  if (lastClaim === today) {
    claimBtn.disabled = true
    claimBtn.textContent = 'Ya reclamaste hoy 🐞'
    return
  }

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

    // Obtener recompensa según racha
    const { data: rewardRow } = await supabase
      .from('daily_rewards')
      .select('reward_bugs')
      .eq('day_number', newStreak)
      .maybeSingle()

    const reward = rewardRow?.reward_bugs || 5

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

    bugs += reward
    streak = newStreak

    bugsSpan.textContent = bugs
    streakSpan.textContent = streak

    claimBtn.disabled = true
    claimBtn.textContent = 'Ya reclamaste hoy 🐞'
    messageBox.textContent = `🎉 Ganaste ${reward} bugs`

  })
})

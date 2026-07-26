import { supabase } from './supabaseClient.js'

const AVATAR_BUCKET = 'avatars'
const DEFAULT_AVATAR = '/imagenes/avatar-default.png'
const MAX_AVATAR_MB = 3

document.addEventListener('DOMContentLoaded', async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    window.location.href = '/login.html'
    return
  }

  const avatarImg      = document.getElementById('avatar-img')
  const avatarEditBtn  = document.getElementById('avatar-edit-btn')
  const avatarInput    = document.getElementById('avatar-input')
  const usernameEl     = document.getElementById('profile-username')
  const memberSinceEl  = document.getElementById('profile-member-since')
  const bugsEl         = document.getElementById('profile-bugs')
  const streakEl       = document.getElementById('profile-streak')
  const boletosEl      = document.getElementById('profile-boletos')
  const messageBox     = document.getElementById('profile-message')
  const codesAvailableBox = document.getElementById('codes-available')
  const codesUsedBox      = document.getElementById('codes-used')

  function showMessage(text, error = false) {
    messageBox.textContent = text
    messageBox.classList.toggle('error', error)
    messageBox.classList.add('show')
    setTimeout(() => messageBox.classList.remove('show'), 3500)
  }

  function formatDate(dateStr) {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  /* ================= DATOS DEL PERFIL ================= */
  async function loadProfile() {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('username, bugs, streak_days, created_at, avatar_url')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('Error cargando perfil:', error)
      return
    }

    usernameEl.textContent = profile.username
    memberSinceEl.textContent = `Miembro desde ${formatDate(profile.created_at)}`
    bugsEl.textContent = profile.bugs ?? 0
    streakEl.textContent = profile.streak_days ?? 0
    avatarImg.src = profile.avatar_url || DEFAULT_AVATAR
  }

  /* ================= BOLETOS DISPONIBLES ================= */
  async function loadBoletos() {
    const { data, error } = await supabase
      .from('boletos')
      .select('id')
      .eq('user_id', user.id)
      .eq('estado', 'disponible')

    if (error) {
      console.error('Error cargando boletos:', error)
      return
    }

    boletosEl.textContent = (data || []).length
  }

  /* ================= CÓDIGOS DE DESCUENTO ================= */
  function renderCodeCard(c) {
    const label = c.descuento_tipo === 'porcentaje'
      ? `${c.valor}% de descuento`
      : `${c.valor} bugs de descuento`

    const card = document.createElement('div')
    card.className = `code-card ${c.usado ? 'used' : 'available'}`
    card.innerHTML = `
      <span class="code-name">${c.codigo}</span>
      <span class="code-label">${label}</span>
      <span class="code-status">${c.usado ? 'Usado ✔' : 'Disponible'}</span>
    `
    return card
  }

  async function loadCodes() {
    const { data, error } = await supabase
      .from('codigos_descuento')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error cargando códigos:', error)
      return
    }

    const codigos = data || []
    const disponibles = codigos.filter(c => !c.usado)
    const usados = codigos.filter(c => c.usado)

    codesAvailableBox.innerHTML = disponibles.length
      ? ''
      : '<p class="codes-empty">Aún no tienes descuentos disponibles.</p>'
    disponibles.forEach(c => codesAvailableBox.appendChild(renderCodeCard(c)))

    codesUsedBox.innerHTML = usados.length
      ? ''
      : '<p class="codes-empty">Aún no has usado ningún descuento.</p>'
    usados.forEach(c => codesUsedBox.appendChild(renderCodeCard(c)))
  }

  /* ================= FOTO DE PERFIL ================= */
  avatarEditBtn.addEventListener('click', () => avatarInput.click())

  avatarInput.addEventListener('change', async () => {
    const file = avatarInput.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      showMessage('El archivo debe ser una imagen', true)
      return
    }

    if (file.size > MAX_AVATAR_MB * 1024 * 1024) {
      showMessage(`La imagen no debe pesar más de ${MAX_AVATAR_MB}MB`, true)
      return
    }

    avatarEditBtn.disabled = true

    try {
      const ext = file.name.split('.').pop()
      const path = `${user.id}/avatar.${ext}`

      const { error: uploadError } = await supabase
        .storage
        .from(AVATAR_BUCKET)
        .upload(path, file, { upsert: true })

      if (uploadError) {
        console.error(uploadError)
        showMessage('Error al subir la imagen ❌', true)
        return
      }

      const { data: publicUrlData } = supabase
        .storage
        .from(AVATAR_BUCKET)
        .getPublicUrl(path)

      // se le agrega un timestamp para evitar que el navegador muestre la foto vieja en caché
      const finalUrl = `${publicUrlData.publicUrl}?t=${Date.now()}`

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: finalUrl })
        .eq('id', user.id)

      if (updateError) {
        console.error(updateError)
        showMessage('Error al guardar la foto ❌', true)
        return
      }

      avatarImg.src = finalUrl
      showMessage('Foto de perfil actualizada 📸')

    } finally {
      avatarEditBtn.disabled = false
      avatarInput.value = ''
    }
  })

  /* ================= INIT ================= */
  await loadProfile()
  await loadBoletos()
  await loadCodes()
})
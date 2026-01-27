import { supabase } from './supabaseClient.js'

const { data } = await supabase.auth.getSession()

if (data.session) {
  window.location.replace('panel.html')
} else {
  window.location.replace('login.html')
}

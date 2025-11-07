// js/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://wunrnfpsjmlgjpllkgyu.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6In...'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

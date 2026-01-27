// js/supabaseClient.js
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

export const supabase = createClient(
  'https://wunrnfpsjmlgjpllkgyu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1bnJuZnBzam1sZ2pwbGxrZ3l1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NzMzOTMsImV4cCI6MjA3ODA0OTM5M30.OnifOkyhTlFE8sYeU3mJF0qe5efQFoO05bC_h7hnqxk'
)
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('[supabase.js] URL:', supabaseUrl ? '✓ (present)' : '✗ (missing)')
console.log('[supabase.js] Key:', supabaseKey ? '✓ (present)' : '✗ (missing)')

if (!supabaseUrl || !supabaseKey) {
  console.error('[supabase.js] ERROR: Missing Supabase credentials!')
  console.error('[supabase.js] Check Netlify environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

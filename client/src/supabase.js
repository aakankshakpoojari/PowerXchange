import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Create client without realtime to avoid WebSocket 403 errors
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Manually disconnect realtime if it auto-connects
if (supabase.channel) {
  try {
    supabase.realtime.disconnect()
  } catch (e) {
    // Ignore if realtime not available
  }
}  
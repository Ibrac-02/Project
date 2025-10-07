
 import { createClient } from '@supabase/supabase-js'

 // Vite exposes env vars via import.meta.env and requires VITE_ prefix
 const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
 const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

 if (!supabaseUrl) {
   throw new Error('Missing VITE_SUPABASE_URL. Define it in your .env or Vercel project settings.')
 }

 if (!supabaseKey) {
   throw new Error('Missing VITE_SUPABASE_ANON_KEY. Define it in your .env or Vercel project settings.')
 }

 const supabase = createClient(supabaseUrl, supabaseKey)

 export default supabase

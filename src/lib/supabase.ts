import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL as string,
  import.meta.env.VITE_SUPABASE_ANON_KEY as string,
)

// Bucket names
export const BUCKET_AVATARS  = import.meta.env.VITE_SUPABASE_AVATAR_BUCKET  as string
export const BUCKET_PRODUCTS = import.meta.env.VITE_SUPABASE_PRODUCT_BUCKET as string

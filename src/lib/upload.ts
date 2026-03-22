/**
 * Supabase Storage upload utilities.
 * Each bucket is PUBLIC — uploaded files get a permanent public URL.
 */
import { supabase } from './supabase'

const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB
const ALLOWED_TYPES  = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

function uniqueFilename(file: File): string {
  const ext = file.name.split('.').pop() ?? 'jpg'
  return `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
}

export type UploadResult = { url: string; error: null } | { url: null; error: string }

/**
 * Upload a single image file to the specified Supabase bucket/folder.
 * Returns the permanent public URL on success, or an error string on failure.
 */
export async function uploadImage(
  file: File,
  bucket: string,
  folder: string,
): Promise<UploadResult> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { url: null, error: 'Chỉ chấp nhận JPG, PNG, WebP, GIF' }
  }
  if (file.size > MAX_SIZE_BYTES) {
    return { url: null, error: 'Ảnh tối đa 5 MB' }
  }

  const path = `${folder}/${uniqueFilename(file)}`

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, file, { contentType: file.type, upsert: false })

  if (uploadError) {
    return { url: null, error: uploadError.message }
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return { url: data.publicUrl, error: null }
}

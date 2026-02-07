import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.warn("Supabase Storage: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing.");
}

export const supabaseAdmin = url && serviceRoleKey ? createClient(url, serviceRoleKey, { auth: { persistSession: false } }) : null;

export const STORAGE_BUCKET = "uploads";

/** 업로드 후 공개 URL 반환 */
export function getStoragePublicUrl(path: string): string {
  if (!url) return path;
  const clean = path.startsWith("/") ? path.slice(1) : path;
  return `${url}/storage/v1/object/public/${STORAGE_BUCKET}/${clean}`;
}

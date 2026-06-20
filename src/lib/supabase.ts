import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * هل تم ضبط مفاتيح Supabase؟
 * إن لم تُضبط، يعمل التطبيق في «وضع المعاينة» ببيانات تجريبية محلية.
 */
export const isSupabaseConfigured = Boolean(
  url && anonKey && !url.includes('your-project-ref') && !anonKey.includes('your-anon'),
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url!, anonKey!, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null;

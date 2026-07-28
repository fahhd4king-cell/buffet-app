import { createClient, SupabaseClient } from '@supabase/supabase-js';

// قيم ثابتة ومباشرة لضمان نجاح الاتصال بدون أخطاء البيئة
const supabaseUrl = 'https://nvoavtmtiyvvmjqojua.supabase.co';
const supabaseAnonKey = 'sb_publishable_cpVyL8MaD25fv1GTk5XB1A_PdQbxpOt';

export const isSupabaseConfigured = (): boolean => {
  return true;
};

// Singleton instance for Supabase client
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Helper to safely get user ID or anonymous session ID
export const getCurrentUserId = async (): Promise<string | null> => {
  if (!supabase) {
    const cached = localStorage.getItem('buffet_anon_user_id');
    if (cached) return cached;
    const newId = `anon_${Math.random().toString(36).substring(2, 10)}`;
    localStorage.setItem('buffet_anon_user_id', newId);
    return newId;
  }
  try {
    const { data } = await supabase.auth.getUser();
    if (data?.user?.id) return data.user.id;
    
    // Fallback to local session token or anonymous user ID
    let anonId = localStorage.getItem('buffet_anon_user_id');
    if (!anonId) {
      anonId = `anon_${Math.random().toString(36).substring(2, 10)}`;
      localStorage.setItem('buffet_anon_user_id', anonId);
    }
    return anonId;
  } catch (err) {
    console.warn('Error getting Supabase auth user:', err);
    return localStorage.getItem('buffet_anon_user_id') || 'anon_guest';
  }
};
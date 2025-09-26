import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
}

// Validate that supabaseUrl is a valid URL
try {
  new URL(supabaseUrl);
} catch (error) {
  throw new Error(`Invalid VITE_SUPABASE_URL: "${supabaseUrl}". Please provide a valid URL (e.g., https://your-project-id.supabase.co)`);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Data keys for different types of shared data
export const DATA_KEYS = {
  USERS: 'users',
  PENDING_USERS: 'pending_users',
  GAME_REGISTRATION: 'game_registration',
  HOUSE_RULES: 'house_rules',
  LOCATION: 'location',
  WHATSAPP_GROUP_URL: 'whatsapp_group_url',
  GALLERY: 'gallery'
} as const;

export type DataKey = typeof DATA_KEYS[keyof typeof DATA_KEYS];

// Generic function to get data from Supabase
export async function getSharedData<T>(key: DataKey): Promise<T | null> {
  try {
    const { data, error } = await supabase
      .from('app_data')
      .select('data')
      .eq('id', key)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error(`Error fetching ${key}:`, error);
      return null;
    }

    return data?.data || null;
  } catch (error) {
    console.error(`Error fetching ${key}:`, error);
    return null;
  }
}

// Generic function to set data in Supabase
export async function setSharedData<T>(key: DataKey, data: T): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('app_data')
      .upsert({
        id: key,
        data: data
      });

    if (error) {
      console.error(`Error setting ${key}:`, error);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`Error setting ${key}:`, error);
    return false;
  }
}

// Subscribe to real-time changes for a specific data key
export function subscribeToDataChanges<T>(
  key: DataKey,
  callback: (data: T) => void
) {
  return supabase
    .channel(`app_data_${key}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'app_data',
        filter: `id=eq.${key}`
      },
      (payload) => {
        if (payload.new && 'data' in payload.new) {
          callback(payload.new.data as T);
        }
      }
    )
    .subscribe();
}
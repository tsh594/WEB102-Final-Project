import { createClient } from '@supabase/supabase-js';

const validateEnv = () => {
  if (!import.meta.env.VITE_SUPABASE_URL) {
    throw new Error('VITE_SUPABASE_URL environment variable is not set');
  }
  if (!import.meta.env.VITE_SUPABASE_KEY) {
    throw new Error('VITE_SUPABASE_KEY environment variable is not set');
  }
};

validateEnv();

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

const defaultOptions = {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false, // Changed to false
    flowType: 'pkce',
  },
  global: {
    headers: {
      'X-Client-Info': 'medical-forum/v1.0',
    },
  },
};

export const supabase = createClient(supabaseUrl, supabaseKey, defaultOptions);

/**
 * Health check function to verify connection
 */
export const checkSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .limit(1);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Supabase connection check failed:', error);
    return false;
  }
};

// Optional: Initialize connection check on import
checkSupabaseConnection().then(connected => {
  if (!connected) {
    console.error('Failed to establish Supabase connection');
  }
});

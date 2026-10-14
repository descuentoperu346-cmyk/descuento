import { createClient } from '@supabase/supabase-js';
import { config } from './config';

/**
 * Cliente exclusivo del Servidor para comunicarse con Supabase.
 * Este cliente NUNCA se entrega ni se importa en el navegador.
 */
export const serverSupabase = createClient(
  config.supabaseUrl,
  config.supabaseAnonKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  }
);

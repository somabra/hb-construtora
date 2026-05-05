import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.PUBLIC_SUPABASE_URL;
const key = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  throw new Error(
    'Faltam variáveis PUBLIC_SUPABASE_URL e/ou PUBLIC_SUPABASE_ANON_KEY no .env'
  );
}

export const supabase = createClient(url, key);

import { createServerClient, parseCookieHeader, type CookieOptionsWithName } from '@supabase/ssr';
import type { AstroCookies } from 'astro';

const url = import.meta.env.PUBLIC_SUPABASE_URL;
const key = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  throw new Error('Faltam PUBLIC_SUPABASE_URL e/ou PUBLIC_SUPABASE_ANON_KEY no .env');
}

export function createSupabaseServerClient(cookies: AstroCookies, headers: Headers) {
  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return parseCookieHeader(headers.get('cookie') ?? '').map(c => ({
          name: c.name,
          value: c.value ?? '',
        }));
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }: { name: string; value: string; options: CookieOptionsWithName }) => {
          cookies.set(name, value, {
            ...options,
            path: options.path ?? '/',
          });
        });
      },
    },
  });
}

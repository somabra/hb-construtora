export const prerender = false;

import type { APIRoute } from 'astro';
import { createSupabaseServerClient } from '../../../lib/supabase-server';

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const form = await request.formData();
  const email = String(form.get('email') ?? '');
  const password = String(form.get('password') ?? '');
  const next = String(form.get('next') ?? '/admin');

  const supabase = createSupabaseServerClient(cookies, request.headers);
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const msg = error.message.toLowerCase().includes('invalid') ? 'invalid' : 'erro';
    return redirect(`/admin/login?error=${msg}&next=${encodeURIComponent(next)}`, 302);
  }

  return redirect(next, 302);
};

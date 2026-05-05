import { defineMiddleware } from 'astro:middleware';
import { createSupabaseServerClient } from './lib/supabase-server';

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, cookies, request, redirect } = context;

  // Só interfere em rotas /admin (exceto login)
  if (!url.pathname.startsWith('/admin')) return next();

  const supabase = createSupabaseServerClient(cookies, request.headers);
  const { data: { user } } = await supabase.auth.getUser();

  // Login page é livre
  if (url.pathname === '/admin/login') {
    if (user) return redirect('/admin', 302);
    return next();
  }

  // Resto exige sessão
  if (!user) {
    const next_ = encodeURIComponent(url.pathname + url.search);
    return redirect(`/admin/login?next=${next_}`, 302);
  }

  // Anexa o cliente autenticado pro uso nas rotas
  context.locals.supabase = supabase;
  context.locals.user = user;
  return next();
});

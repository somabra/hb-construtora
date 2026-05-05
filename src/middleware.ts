import { defineMiddleware } from 'astro:middleware';
import { createSupabaseServerClient } from './lib/supabase-server';

const PUBLIC_API_PATHS = new Set(['/api/auth/signin']);

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, cookies, request, redirect } = context;
  const { pathname } = url;

  const isAdminPage = pathname.startsWith('/admin');
  const isProtectedApi =
    (pathname.startsWith('/api/admin') ||
      pathname.startsWith('/api/auth/signout') ||
      pathname.startsWith('/api/leads') ||
      pathname === '/api/publish') &&
    !PUBLIC_API_PATHS.has(pathname);

  if (!isAdminPage && !isProtectedApi) return next();

  const supabase = createSupabaseServerClient(cookies, request.headers);
  const { data: { user } } = await supabase.auth.getUser();

  // Login page é livre (mas redireciona pro /admin se já logado)
  if (pathname === '/admin/login') {
    if (user) return redirect('/admin', 302);
    return next();
  }

  if (!user) {
    if (isProtectedApi) {
      return new Response(JSON.stringify({ error: 'unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const next_ = encodeURIComponent(pathname + url.search);
    return redirect(`/admin/login?next=${next_}`, 302);
  }

  context.locals.supabase = supabase;
  context.locals.user = user;
  return next();
});

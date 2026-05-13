export const prerender = false;

import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ locals }) => {
  if (!locals.user) return new Response('Unauthorized', { status: 401 });

  const hookUrl = import.meta.env.VERCEL_DEPLOY_HOOK;
  if (!hookUrl) {
    return new Response('VERCEL_DEPLOY_HOOK não configurado.', { status: 500 });
  }

  try {
    const res = await fetch(hookUrl, { method: 'POST' });
    if (!res.ok) {
      const txt = await res.text();
      return new Response(`Vercel respondeu ${res.status}: ${txt}`, { status: 502 });
    }
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response('Falha ao chamar Vercel: ' + (err as Error).message, { status: 502 });
  }
};

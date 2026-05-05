export const prerender = false;

import type { APIRoute } from 'astro';

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const MAX_BYTES = 5 * 1024 * 1024; // 5MB

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.supabase || !locals.user) return new Response('Unauthorized', { status: 401 });
  const sb = locals.supabase;

  const form = await request.formData();
  const file = form.get('file') as File | null;
  const folder = String(form.get('folder') ?? 'misc').replace(/[^a-z0-9_/-]/gi, '');

  if (!file) return json({ error: 'Arquivo ausente' }, 400);
  if (!ALLOWED.includes(file.type)) return json({ error: 'Tipo não permitido' }, 400);
  if (file.size > MAX_BYTES) return json({ error: 'Arquivo > 5MB' }, 400);

  const ext = file.name.split('.').pop()?.toLowerCase() || 'webp';
  const filename = `${crypto.randomUUID()}.${ext}`;
  const path = `${folder}/${filename}`;

  const { error } = await sb.storage.from('site-media').upload(path, file, {
    contentType: file.type,
    cacheControl: '31536000',
    upsert: false,
  });
  if (error) return json({ error: error.message }, 500);

  return json({ path });
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

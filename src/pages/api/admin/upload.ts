export const prerender = false;

import type { APIRoute } from 'astro';

const ALLOWED_IMAGE = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const ALLOWED_VIDEO = ['video/mp4', 'video/webm', 'video/quicktime'];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;   // 5MB
const MAX_VIDEO_BYTES = 60 * 1024 * 1024;  // 60MB

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.supabase || !locals.user) return new Response('Unauthorized', { status: 401 });
  const sb = locals.supabase;

  const form = await request.formData();
  const file = form.get('file') as File | null;
  const folder = String(form.get('folder') ?? 'misc').replace(/[^a-z0-9_/-]/gi, '');

  if (!file) return json({ error: 'Arquivo ausente' }, 400);

  const isVideo = ALLOWED_VIDEO.includes(file.type);
  const isImage = ALLOWED_IMAGE.includes(file.type);
  if (!isVideo && !isImage) return json({ error: 'Tipo não permitido' }, 400);

  const limit = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
  if (file.size > limit) {
    const mb = Math.floor(limit / 1024 / 1024);
    return json({ error: `Arquivo > ${mb}MB` }, 400);
  }

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

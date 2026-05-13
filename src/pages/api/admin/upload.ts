export const prerender = false;

import type { APIRoute } from 'astro';

const ALLOWED_IMAGE = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const ALLOWED_VIDEO = ['video/mp4', 'video/webm', 'video/quicktime'];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;   // 5MB
const MAX_VIDEO_BYTES = 60 * 1024 * 1024;  // 60MB

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'video/quicktime': 'mov',
};

function sniffMime(bytes: Uint8Array): string | null {
  const b = bytes;
  // JPEG
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'image/jpeg';
  // PNG
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return 'image/png';
  // WebP — RIFF....WEBP
  if (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
      b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) return 'image/webp';
  // AVIF — ftypavif/ftypheic etc.
  if (b[4] === 0x66 && b[5] === 0x74 && b[6] === 0x79 && b[7] === 0x70) {
    const brand = String.fromCharCode(b[8], b[9], b[10], b[11]);
    if (brand === 'avif' || brand === 'avis') return 'image/avif';
    if (brand === 'mp42' || brand === 'isom' || brand === 'iso2' || brand === 'mp41') return 'video/mp4';
    if (brand === 'qt  ') return 'video/quicktime';
  }
  // WebM (EBML)
  if (b[0] === 0x1a && b[1] === 0x45 && b[2] === 0xdf && b[3] === 0xa3) return 'video/webm';
  return null;
}

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.supabase || !locals.user) return new Response('Unauthorized', { status: 401 });
  const sb = locals.supabase;

  const form = await request.formData();
  const file = form.get('file') as File | null;
  const folderRaw = String(form.get('folder') ?? 'misc');
  const folder = folderRaw
    .split('/')
    .map(seg => seg.replace(/[^a-z0-9_-]/gi, ''))
    .filter(Boolean)
    .slice(0, 3)
    .join('/') || 'misc';

  if (!file) return json({ error: 'Arquivo ausente' }, 400);

  const declaredType = file.type;
  const isVideoDeclared = ALLOWED_VIDEO.includes(declaredType);
  const isImageDeclared = ALLOWED_IMAGE.includes(declaredType);
  if (!isVideoDeclared && !isImageDeclared) return json({ error: 'Tipo não permitido' }, 400);

  const limit = isVideoDeclared ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
  if (file.size > limit) {
    const mb = Math.floor(limit / 1024 / 1024);
    return json({ error: `Arquivo > ${mb}MB` }, 400);
  }

  const headBuffer = await file.slice(0, 16).arrayBuffer();
  const sniffed = sniffMime(new Uint8Array(headBuffer));
  if (!sniffed || ![...ALLOWED_IMAGE, ...ALLOWED_VIDEO].includes(sniffed)) {
    return json({ error: 'Conteúdo do arquivo não confere com o tipo declarado.' }, 400);
  }

  const ext = MIME_TO_EXT[sniffed] ?? 'bin';
  const filename = `${crypto.randomUUID()}.${ext}`;
  const path = `${folder}/${filename}`;

  const { error } = await sb.storage.from('site-media').upload(path, file, {
    contentType: sniffed,
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

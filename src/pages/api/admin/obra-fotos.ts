export const prerender = false;

import type { APIRoute } from 'astro';
import { backRedirect, reorderRow } from '../../../lib/admin-helpers';

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.supabase || !locals.user) return new Response('Unauthorized', { status: 401 });
  const sb = locals.supabase;
  const form = await request.formData();
  const action = String(form.get('_action') ?? '');
  const obraId = String(form.get('obra_id') ?? '');

  if (action === 'add') {
    const path = String(form.get('path') ?? '').trim();
    const alt  = String(form.get('alt') ?? '').trim() || null;
    if (!obraId || !path) return backRedirect(`/admin/obras/${obraId}?error=campos`);
    const { data: max } = await sb.from('obra_fotos').select('position').eq('obra_id', obraId).order('position', { ascending: false }).limit(1).maybeSingle();
    await sb.from('obra_fotos').insert({ obra_id: obraId, path, alt, position: (max?.position ?? -1) + 1 });
    return backRedirect(`/admin/obras/${obraId}?saved=1`);
  }

  if (action === 'delete') {
    const id = String(form.get('id') ?? '');
    if (id) await sb.from('obra_fotos').delete().eq('id', id);
    return backRedirect(`/admin/obras/${obraId}`);
  }

  if (action === 'reorder') {
    const id = String(form.get('id') ?? '');
    const dir = (form.get('dir') === 'up' ? 'up' : 'down') as 'up' | 'down';
    if (id) await reorderRow(sb, 'obra_fotos', id, dir, { column: 'obra_id', value: obraId });
    return backRedirect(`/admin/obras/${obraId}`);
  }

  return backRedirect(`/admin/obras/${obraId}`);
};

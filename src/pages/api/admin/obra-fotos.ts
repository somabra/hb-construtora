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
    if (!obraId) return backRedirect(`/admin/obras?error=campos`);
    const inserts: { obra_id: string; path: string; alt: string | null; position: number }[] = [];
    const { data: max } = await sb.from('obra_fotos').select('position').eq('obra_id', obraId).order('position', { ascending: false }).limit(1).maybeSingle();
    let pos = (max?.position ?? -1) + 1;
    for (let i = 0; i <= 2; i++) {
      const path = String(form.get(`path_${i}`) ?? '').trim();
      const alt  = String(form.get(`alt_${i}`) ?? '').trim() || null;
      if (path) inserts.push({ obra_id: obraId, path, alt, position: pos++ });
    }
    if (inserts.length === 0) return backRedirect(`/admin/obras/${obraId}?error=campos`);
    await sb.from('obra_fotos').insert(inserts);
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

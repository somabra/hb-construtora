export const prerender = false;

import type { APIRoute } from 'astro';
import { backRedirect, reorderRow } from '../../../lib/admin-helpers';

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.supabase || !locals.user) return new Response('Unauthorized', { status: 401 });
  const sb = locals.supabase;
  const form = await request.formData();
  const action = String(form.get('_action') ?? '');

  function fields() {
    return {
      titulo:      String(form.get('titulo') ?? '').trim(),
      local:       String(form.get('local') ?? '').trim() || null,
      cover_path:  String(form.get('cover_path') ?? '').trim() || null,
      enabled:     form.get('enabled') === 'true',
    };
  }

  if (action === 'create') {
    const payload = fields();
    if (!payload.titulo) return backRedirect('/admin/obras?error=campos');
    const { data: max } = await sb.from('obras').select('position').order('position', { ascending: false }).limit(1).maybeSingle();
    const { data: nova, error } = await sb.from('obras').insert({ ...payload, position: (max?.position ?? -1) + 1 }).select('id').single();
    if (error) return backRedirect(`/admin/obras?error=${encodeURIComponent(error.message)}`);
    return backRedirect(`/admin/obras/${nova.id}`);
  }

  if (action === 'update') {
    const id = String(form.get('id') ?? '');
    if (!id) return backRedirect('/admin/obras');
    await sb.from('obras').update(fields()).eq('id', id);
    return backRedirect(`/admin/obras/${id}?saved=1`);
  }

  if (action === 'delete') {
    const id = String(form.get('id') ?? '');
    if (id) await sb.from('obras').delete().eq('id', id);
    return backRedirect('/admin/obras');
  }

  if (action === 'reorder') {
    const id = String(form.get('id') ?? '');
    const dir = (form.get('dir') === 'up' ? 'up' : 'down') as 'up' | 'down';
    if (id) await reorderRow(sb, 'obras', id, dir);
    return backRedirect('/admin/obras');
  }

  return backRedirect('/admin/obras');
};

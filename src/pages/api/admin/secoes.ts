export const prerender = false;

import type { APIRoute } from 'astro';
import { backRedirect, reorderRow } from '../../../lib/admin-helpers';

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.supabase || !locals.user) return new Response('Unauthorized', { status: 401 });
  const sb = locals.supabase;
  const form = await request.formData();
  const action = String(form.get('_action') ?? '');
  const id = String(form.get('id') ?? '');

  if (action === 'reorder' && id) {
    const dir = (form.get('dir') === 'up' ? 'up' : 'down') as 'up' | 'down';
    await reorderRow(sb, 'site_sections', id, dir);
  } else if (action === 'toggle' && id) {
    const { data: row } = await sb.from('site_sections').select('enabled').eq('id', id).maybeSingle();
    if (row) await sb.from('site_sections').update({ enabled: !row.enabled }).eq('id', id);
  }

  return backRedirect('/admin/secoes');
};

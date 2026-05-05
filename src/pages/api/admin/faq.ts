export const prerender = false;

import type { APIRoute } from 'astro';
import { backRedirect, reorderRow } from '../../../lib/admin-helpers';

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.supabase || !locals.user) return new Response('Unauthorized', { status: 401 });
  const sb = locals.supabase;
  const form = await request.formData();
  const action = String(form.get('_action') ?? '');

  if (action === 'create') {
    const pergunta = String(form.get('pergunta') ?? '').trim();
    const resposta = String(form.get('resposta') ?? '').trim();
    const enabled = form.get('enabled') === 'true';
    if (!pergunta || !resposta) return backRedirect('/admin/faq?error=campos');

    const { data: max } = await sb.from('faq_items').select('position').order('position', { ascending: false }).limit(1).maybeSingle();
    const position = (max?.position ?? -1) + 1;
    await sb.from('faq_items').insert({ pergunta, resposta, enabled, position });
    return backRedirect('/admin/faq');
  }

  if (action === 'update') {
    const id = String(form.get('id') ?? '');
    const pergunta = String(form.get('pergunta') ?? '').trim();
    const resposta = String(form.get('resposta') ?? '').trim();
    const enabled = form.get('enabled') === 'true';
    if (!id || !pergunta || !resposta) return backRedirect('/admin/faq?error=campos');
    await sb.from('faq_items').update({ pergunta, resposta, enabled }).eq('id', id);
    return backRedirect('/admin/faq');
  }

  if (action === 'delete') {
    const id = String(form.get('id') ?? '');
    if (id) await sb.from('faq_items').delete().eq('id', id);
    return backRedirect('/admin/faq');
  }

  if (action === 'reorder') {
    const id = String(form.get('id') ?? '');
    const dir = (form.get('dir') === 'up' ? 'up' : 'down') as 'up' | 'down';
    if (id) await reorderRow(sb, 'faq_items', id, dir);
    return backRedirect('/admin/faq');
  }

  return backRedirect('/admin/faq');
};

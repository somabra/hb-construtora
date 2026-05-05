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
      slug:            String(form.get('slug') ?? '').trim(),
      titulo:          String(form.get('titulo') ?? '').trim(),
      descricao:       String(form.get('descricao') ?? '').trim(),
      longa_descricao: String(form.get('longa_descricao') ?? '').trim() || null,
      cta_text:        String(form.get('cta_text') ?? '').trim() || null,
      form_value:      String(form.get('form_value') ?? '').trim() || null,
      imagem_path:     String(form.get('imagem_path') ?? '').trim() || null,
      enabled:         form.get('enabled') === 'true',
    };
  }

  if (action === 'create') {
    const payload = fields();
    if (!payload.titulo || !payload.slug || !payload.descricao) return backRedirect('/admin/servicos?error=campos');
    const { data: max } = await sb.from('servicos').select('position').order('position', { ascending: false }).limit(1).maybeSingle();
    await sb.from('servicos').insert({ ...payload, position: (max?.position ?? -1) + 1 });
    return backRedirect('/admin/servicos');
  }

  if (action === 'update') {
    const id = String(form.get('id') ?? '');
    if (!id) return backRedirect('/admin/servicos');
    await sb.from('servicos').update(fields()).eq('id', id);
    return backRedirect('/admin/servicos');
  }

  if (action === 'delete') {
    const id = String(form.get('id') ?? '');
    if (id) await sb.from('servicos').delete().eq('id', id);
    return backRedirect('/admin/servicos');
  }

  if (action === 'reorder') {
    const id = String(form.get('id') ?? '');
    const dir = (form.get('dir') === 'up' ? 'up' : 'down') as 'up' | 'down';
    if (id) await reorderRow(sb, 'servicos', id, dir);
    return backRedirect('/admin/servicos');
  }

  return backRedirect('/admin/servicos');
};

export const prerender = false;

import type { APIRoute } from 'astro';
import { backRedirect } from '../../../lib/admin-helpers';

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.supabase || !locals.user) return new Response('Unauthorized', { status: 401 });
  const sb = locals.supabase;
  const form = await request.formData();
  const key = String(form.get('key') ?? '');

  let value: Record<string, unknown> | unknown[] | null = null;

  switch (key) {
    case 'hero': {
      const externalUrl = String(form.get('video_url_external') ?? '').trim();
      const uploadedPath = String(form.get('video_path') ?? '').trim();
      const legacy = String(form.get('video_url') ?? '').trim();
      const videoUrl = externalUrl || uploadedPath || legacy;
      value = {
        eyebrow:     String(form.get('eyebrow') ?? ''),
        titulo_html: String(form.get('titulo_html') ?? ''),
        paragrafo:   String(form.get('paragrafo') ?? ''),
        video_url:   videoUrl,
        cta_text:    String(form.get('cta_text') ?? ''),
      };
      break;
    }

    case 'sobre': {
      const paragrafosTexto = String(form.get('paragrafos') ?? '');
      const paragrafos = paragrafosTexto.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
      const stats = [0, 1, 2, 3].map(i => ({
        prefix: String(form.get(`stat_prefix_${i}`) ?? ''),
        target: Number(form.get(`stat_target_${i}`) ?? 0),
        suffix: String(form.get(`stat_suffix_${i}`) ?? ''),
        label:  String(form.get(`stat_label_${i}`)  ?? ''),
      })).filter(s => s.label);
      value = {
        eyebrow: String(form.get('eyebrow') ?? ''),
        titulo:  String(form.get('titulo') ?? ''),
        paragrafos,
        stats,
      };
      break;
    }

    case 'whatsapp':
      value = {
        numero:           String(form.get('numero') ?? '').replace(/\D/g, ''),
        mensagem_default: String(form.get('mensagem_default') ?? ''),
      };
      break;

    case 'contato_card':
      value = {
        titulo_html: String(form.get('titulo_html') ?? ''),
      };
      break;

    default:
      return backRedirect('/admin/settings?error=key');
  }

  const { error } = await sb.from('site_settings').upsert({ key, value });
  if (error) return backRedirect(`/admin/settings?error=${encodeURIComponent(error.message)}`);

  return backRedirect('/admin/settings?saved=1');
};

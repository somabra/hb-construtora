export const prerender = false;

import type { APIRoute } from 'astro';
import { getSupabaseAdmin } from '../../../lib/supabase-admin';
import { rateLimit, getClientIp } from '../../../lib/rate-limit';

const TIPOS_VALIDOS = new Set(['Casa Residencial', 'Prédio Comercial', 'Galpão Comercial', 'Outro']);
const ETAPAS_VALIDAS = new Set(['Ainda não tenho terreno', 'Tenho terreno, sem projeto', 'Pronto para começar']);

const TURNSTILE_SECRET = import.meta.env.TURNSTILE_SECRET_KEY;

async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  if (!TURNSTILE_SECRET) return true;
  if (!token) return false;
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret: TURNSTILE_SECRET, response: token, remoteip: ip }).toString(),
    });
    const data = await res.json() as { success?: boolean };
    return !!data.success;
  } catch {
    return false;
  }
}

export const POST: APIRoute = async ({ request }) => {
  const ip = getClientIp(request, request.headers);

  const rl = rateLimit(`lead:${ip}`, 5, 60_000);
  if (!rl.allowed) {
    return json({ error: 'Muitas tentativas. Tente novamente em 1 minuto.' }, 429, {
      'Retry-After': String(rl.retryAfter),
    });
  }

  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return json({ error: 'JSON inválido' }, 400);
  }

  if (payload.website) {
    return json({ ok: true }, 200);
  }

  const nome = String(payload.nome ?? '').trim();
  const telefone = String(payload.telefone ?? '').trim();
  const cidade = payload.cidade ? String(payload.cidade).trim() : null;
  const tipo = String(payload.tipo ?? '').trim();
  const etapa = String(payload.etapa ?? '').trim();
  const turnstileToken = payload.turnstileToken ? String(payload.turnstileToken) : '';

  const palavras = nome.split(/\s+/).filter(Boolean);
  if (nome.length < 3 || nome.length > 120 || palavras.length < 2) {
    return json({ error: 'Nome inválido.' }, 400);
  }
  if (!/^[A-Za-zÀ-ÿ' -]+$/.test(nome)) {
    return json({ error: 'Nome contém caracteres inválidos.' }, 400);
  }

  const digits = telefone.replace(/\D/g, '');
  if (digits.length < 10 || digits.length > 11) {
    return json({ error: 'Telefone inválido.' }, 400);
  }

  if (!TIPOS_VALIDOS.has(tipo)) {
    return json({ error: 'Tipo inválido.' }, 400);
  }
  if (!ETAPAS_VALIDAS.has(etapa)) {
    return json({ error: 'Etapa inválida.' }, 400);
  }
  if (cidade && cidade.length > 120) {
    return json({ error: 'Cidade muito longa.' }, 400);
  }

  const turnstileOk = await verifyTurnstile(turnstileToken, ip);
  if (!turnstileOk) {
    return json({ error: 'Verificação anti-bot falhou. Recarregue a página.' }, 400);
  }

  const sb = getSupabaseAdmin();
  if (!sb) {
    console.error('[leads/create] SUPABASE_SERVICE_ROLE_KEY não configurada');
    return json({ error: 'Servidor mal configurado.' }, 500);
  }

  const { error } = await sb.from('leads').insert({
    nome,
    telefone,
    cidade,
    tipo,
    etapa,
  });

  if (error) {
    console.error('[leads/create] insert error:', error);
    return json({ error: 'Não foi possível registrar agora.' }, 500);
  }

  return json({ ok: true }, 201);
};

function json(body: unknown, status = 200, extraHeaders: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
  });
}

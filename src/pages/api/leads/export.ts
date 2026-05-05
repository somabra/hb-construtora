export const prerender = false;

import type { APIRoute } from 'astro';
import { createSupabaseServerClient } from '../../../lib/supabase-server';

function csvEscape(v: unknown): string {
  if (v === null || v === undefined) return '';
  const s = String(v);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export const GET: APIRoute = async ({ cookies, request }) => {
  const supabase = createSupabaseServerClient(cookies, request.headers);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response('Unauthorized', { status: 401 });

  const { data: leads, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return new Response('Erro: ' + error.message, { status: 500 });

  const header = ['data', 'nome', 'telefone', 'cidade', 'tipo', 'etapa'];
  const rows = (leads ?? []).map(l => [
    new Date(l.created_at).toLocaleString('pt-BR'),
    l.nome, l.telefone, l.cidade ?? '', l.tipo ?? '', l.etapa ?? '',
  ].map(csvEscape).join(','));

  const csv = '﻿' + [header.join(','), ...rows].join('\n');
  const stamp = new Date().toISOString().slice(0, 10);

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="leads-hb-${stamp}.csv"`,
    },
  });
};

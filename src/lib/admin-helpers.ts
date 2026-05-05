import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Move um item pra cima ou pra baixo trocando o `position` com o vizinho.
 * Usa a coluna `position` de uma tabela genérica.
 */
export async function reorderRow(
  supabase: SupabaseClient,
  table: string,
  rowId: string,
  direction: 'up' | 'down',
  filter?: { column: string; value: string },
): Promise<{ ok: boolean; error?: string }> {
  let query = supabase.from(table).select('id, position');
  if (filter) query = query.eq(filter.column, filter.value);
  const { data: rows, error } = await query.order('position', { ascending: true });
  if (error) return { ok: false, error: error.message };
  if (!rows) return { ok: false, error: 'sem dados' };

  const idx = rows.findIndex(r => r.id === rowId);
  if (idx === -1) return { ok: false, error: 'não encontrado' };

  const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= rows.length) return { ok: true }; // nada a fazer

  const a = rows[idx];
  const b = rows[swapIdx];

  // Swap positions
  const [r1, r2] = await Promise.all([
    supabase.from(table).update({ position: b.position }).eq('id', a.id),
    supabase.from(table).update({ position: a.position }).eq('id', b.id),
  ]);
  if (r1.error) return { ok: false, error: r1.error.message };
  if (r2.error) return { ok: false, error: r2.error.message };
  return { ok: true };
}

export function backRedirect(path: string) {
  return new Response(null, { status: 303, headers: { Location: path } });
}

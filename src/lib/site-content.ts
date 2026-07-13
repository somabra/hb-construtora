import { supabase } from './supabase';

// CDN Bunny.net na frente do Storage do Supabase (acelera as imagens públicas).
const CDN_URL = 'https://somabrasupabase.b-cdn.net';
const STORAGE_URL = `${CDN_URL}/storage/v1/object/public/site-media/`;
const STORAGE_ORIGIN = `${import.meta.env.PUBLIC_SUPABASE_URL}/storage/v1/object/public`;

/**
 * Resolve um path de imagem pra URL final (sempre via CDN quando for do Storage):
 * - http(s)://... do nosso Storage → reescreve o host pra CDN
 * - http(s)://... externo          → mantém
 * - /caminho/local                 → mantém (arquivo em public/)
 * - resto                          → trata como path no Storage, já via CDN
 */
export function resolveImg(path?: string | null): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path.replace(STORAGE_ORIGIN, `${CDN_URL}/storage/v1/object/public`);
  }
  if (path.startsWith('/')) return path;
  return STORAGE_URL + path;
}

export interface Servico {
  id: string;
  slug: string;
  titulo: string;
  descricao: string;
  longa_descricao: string | null;
  cta_text: string | null;
  form_value: string | null;
  imagem_path: string | null;
  position: number;
  enabled: boolean;
}

export interface Obra {
  id: string;
  titulo: string;
  local: string | null;
  descricao: string | null;
  cover_path: string | null;
  position: number;
  enabled: boolean;
  fotos: ObraFoto[];
}

export interface ObraFoto {
  id: string;
  obra_id: string;
  path: string;
  alt: string | null;
  position: number;
}

export interface FaqItem {
  id: string;
  pergunta: string;
  resposta: string;
  position: number;
  enabled: boolean;
}

export interface SiteSection {
  id: string;
  slug: string;
  title: string;
  position: number;
  enabled: boolean;
}

export async function getServicos(): Promise<Servico[]> {
  const { data, error } = await supabase
    .from('servicos')
    .select('*')
    .eq('enabled', true)
    .order('position', { ascending: true });
  if (error) {
    console.error('getServicos:', error);
    return [];
  }
  return data ?? [];
}

export async function getObras(): Promise<Obra[]> {
  const { data: obras, error } = await supabase
    .from('obras')
    .select('*, fotos:obra_fotos(*)')
    .eq('enabled', true)
    .order('position', { ascending: true });
  if (error) {
    console.error('getObras:', error);
    return [];
  }
  return (obras ?? []).map(o => ({
    ...o,
    fotos: (o.fotos ?? []).sort((a: ObraFoto, b: ObraFoto) => a.position - b.position),
  }));
}

export async function getFAQ(): Promise<FaqItem[]> {
  const { data, error } = await supabase
    .from('faq_items')
    .select('*')
    .eq('enabled', true)
    .order('position', { ascending: true });
  if (error) {
    console.error('getFAQ:', error);
    return [];
  }
  return data ?? [];
}

export async function getSections(): Promise<SiteSection[]> {
  const { data, error } = await supabase
    .from('site_sections')
    .select('*')
    .order('position', { ascending: true });
  if (error) {
    console.error('getSections:', error);
    return [];
  }
  return data ?? [];
}

export async function getSetting<T = unknown>(key: string): Promise<T | null> {
  const { data, error } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', key)
    .maybeSingle();
  if (error) {
    console.error('getSetting', key, error);
    return null;
  }
  return (data?.value as T) ?? null;
}

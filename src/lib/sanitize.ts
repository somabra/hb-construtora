import DOMPurify from 'isomorphic-dompurify';

const RICH_TEXT_CONFIG = {
  ALLOWED_TAGS: ['span', 'br', 'strong', 'em', 'b', 'i', 'sup', 'sub'],
  ALLOWED_ATTR: ['class'],
};

export function sanitizeRichText(html: string | null | undefined): string {
  if (!html) return '';
  return DOMPurify.sanitize(String(html), RICH_TEXT_CONFIG);
}

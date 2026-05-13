export const prerender = false;

import type { APIRoute } from 'astro';

const SITE = 'https://hb-construtora.vercel.app';

export const GET: APIRoute = async () => {
  const urls = [
    { loc: `${SITE}/`, changefreq: 'weekly', priority: '1.0' },
    { loc: `${SITE}/#servicos`, changefreq: 'monthly', priority: '0.8' },
    { loc: `${SITE}/#galeria`, changefreq: 'weekly', priority: '0.8' },
    { loc: `${SITE}/#sobre`, changefreq: 'monthly', priority: '0.6' },
    { loc: `${SITE}/#faq`, changefreq: 'monthly', priority: '0.6' },
    { loc: `${SITE}/#contato`, changefreq: 'yearly', priority: '0.7' },
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};

import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import node from '@astrojs/node';

export default defineConfig({
  site: 'https://hb-construtora.vercel.app',
  output: 'hybrid',
  adapter: node({ mode: 'standalone' }),
  integrations: [tailwind(), react()],
  devToolbar: { enabled: false },
  // Inlina o CSS no HTML em vez de <link> externo — corta o render-blocking
  // dos CSS de componente (ex.: os dois faq.css que atrasavam a primeira pintura).
  build: { inlineStylesheets: 'always' },
});

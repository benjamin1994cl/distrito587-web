// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Fase 1: se publica en https://benjamin1994cl.github.io/distrito587-web
// Fase 3: con el dominio, SITE_URL=https://distrito587.cl y BASE_PATH=/
const site = process.env.SITE_URL || 'https://benjamin1994cl.github.io';
const base = process.env.BASE_PATH || '/distrito587-web';

export default defineConfig({
  site,
  base,
  trailingSlash: 'ignore',
  output: 'static',
  build: { inlineStylesheets: 'always' },
  integrations: [sitemap({ filter: (page) => !page.includes('/404') })],
});

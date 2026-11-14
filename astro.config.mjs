// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Se publica en el dominio propio, en la raíz: https://distrito587.cl
// SITE_URL y BASE_PATH quedan como override opcional (por ejemplo, para probar en un subdirectorio)
const site = process.env.SITE_URL || 'https://distrito587.cl';
const base = process.env.BASE_PATH || '/';

export default defineConfig({
  site,
  base,
  trailingSlash: 'never',
  output: 'static',
  build: { format: 'file', inlineStylesheets: 'always' },
  integrations: [sitemap({ filter: (page) => !page.includes('/404') })],
});

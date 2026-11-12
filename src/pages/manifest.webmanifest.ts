import type { APIRoute } from 'astro';
import { url } from '../lib/formato';

export const GET: APIRoute = () =>
  new Response(
    JSON.stringify(
      {
        name: 'Distrito 587 · Smash & Fries',
        short_name: 'Distrito 587',
        description: 'Smash burgers en Osorno',
        lang: 'es-CL',
        start_url: url(),
        scope: url(),
        display: 'standalone',
        background_color: '#000000',
        theme_color: '#000000',
        icons: [
          { src: url('icon-192.png'), sizes: '192x192', type: 'image/png' },
          { src: url('icon-512.png'), sizes: '512x512', type: 'image/png' },
          { src: url('favicon.svg'), sizes: 'any', type: 'image/svg+xml' },
        ],
      },
      null,
      2,
    ),
    { headers: { 'Content-Type': 'application/manifest+json' } },
  );

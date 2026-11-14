import type { APIRoute } from 'astro';

// Bots de buscadores y asistentes permitidos de forma explícita (entrenamiento, búsqueda y respuestas)
const bots = ['GPTBot', 'OAI-SearchBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended', 'CCBot'];

export const GET: APIRoute = ({ site }) => {
  const sitemap = new URL(`${import.meta.env.BASE_URL.replace(/\/$/, '')}/sitemap-index.xml`, site);
  // Una sola lista de reglas para todos los grupos: una regla nueva en `*` también aplica a cada bot
  const reglas = ['Allow: /'];
  const bloques = ['*', ...bots].map((b) => [`User-agent: ${b}`, ...reglas, ''].join('\n'));
  return new Response(`${bloques.join('\n')}\nSitemap: ${sitemap.href}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};

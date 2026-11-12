/** Formatea un precio entero en CLP: 6990 -> "$6.990". */
export function precio(valor: number): string {
  return '$' + valor.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/** Une la base del sitio con una ruta interna: url('carta') -> "/distrito587-web/carta". */
export function url(ruta = ''): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const limpia = ruta.replace(/^\//, '');
  return limpia ? `${base}/${limpia}` : `${base}/`;
}

/** URL absoluta (para canonical, Open Graph y JSON-LD). */
export function urlAbsoluta(ruta = ''): string {
  return new URL(url(ruta), import.meta.env.SITE).href;
}

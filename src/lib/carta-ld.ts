import carta from '../data/carta.json';
import { urlAbsoluta } from './formato';
import { datos } from './local';

/** Datos estructurados Menu (schema.org) de /carta, generados desde carta.json. */
export function jsonLdMenu() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Menu',
    '@id': urlAbsoluta('carta#menu'),
    name: 'Carta de Distrito 587',
    url: urlAbsoluta('carta'),
    inLanguage: 'es-CL',
    publisher: { '@type': 'Restaurant', '@id': urlAbsoluta('#restaurant'), name: datos.nombre, url: urlAbsoluta() },
    hasMenuSection: carta.categorias.map((c) => ({
      '@type': 'MenuSection',
      name: c.nombre,
      hasMenuItem: c.productos.map((p) => ({
        '@type': 'MenuItem',
        name: p.nombre,
        ...(p.descripcion ? { description: p.descripcion } : {}),
        offers: {
          '@type': 'Offer',
          price: p.precio,
          priceCurrency: 'CLP',
        },
      })),
    })),
  };
}

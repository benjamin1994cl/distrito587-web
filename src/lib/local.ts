import local from '../data/local.json';
import { urlAbsoluta } from './formato';

export interface Horario {
  /** Etiqueta para mostrar, por ejemplo "Martes a jueves". */
  etiqueta: string;
  /** Días en formato schema.org: Monday, Tuesday, ... */
  dias: string[];
  abre: string;
  cierra: string;
}

export const datos = local as typeof local & {
  geo: { lat: number; lng: number } | null;
  horario: Horario[];
  whatsapp: string | null;
  telefono: string | null;
  delivery: { nombre: string; url: string }[];
  pagos: string[];
};

export const direccionCorta = `${datos.direccion.calle}, ${datos.direccion.comuna}`;

export const urlInstagram = `https://www.instagram.com/${datos.instagram}/`;

export const urlComoLlegar =
  'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(datos.mapa.consulta);

export const urlMapaEmbebido =
  'https://www.google.com/maps?output=embed&q=' + encodeURIComponent(datos.mapa.consulta);

export const urlWhatsapp = datos.whatsapp
  ? `https://wa.me/${datos.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent('Hola Distrito 587, quiero hacer un pedido')}`
  : null;

/** Datos estructurados Restaurant (schema.org) para Google. */
export function jsonLdRestaurant() {
  const ld: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    '@id': urlAbsoluta('#restaurant'),
    name: datos.nombre,
    slogan: datos.eslogan,
    description: datos.descripcion,
    url: urlAbsoluta(),
    image: urlAbsoluta('og-distrito587.png'),
    logo: urlAbsoluta('icon-512.png'),
    address: {
      '@type': 'PostalAddress',
      streetAddress: datos.direccion.calle,
      addressLocality: datos.direccion.comuna,
      addressRegion: datos.direccion.region,
      addressCountry: datos.direccion.codigoPais,
    },
    servesCuisine: datos.cocina,
    priceRange: datos.rangoPrecios,
    sameAs: [urlInstagram],
    hasMenu: urlAbsoluta('carta'),
    acceptsReservations: false,
  };
  if (datos.geo) {
    ld.geo = { '@type': 'GeoCoordinates', latitude: datos.geo.lat, longitude: datos.geo.lng };
  }
  if (datos.horario.length) {
    ld.openingHoursSpecification = datos.horario.map((h) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: h.dias,
      opens: h.abre,
      closes: h.cierra,
    }));
  }
  if (datos.telefono) ld.telephone = datos.telefono;
  return ld;
}

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
  /** Días de cierre fijos. Solo se muestran: schema.org omite los días cerrados. */
  cerrado: { etiqueta: string }[];
  whatsapp: string | null;
  telefono: string | null;
  delivery: { id: 'ubereats' | 'pedidosya'; nombre: string; url: string }[];
  pagos: string[];
};

export const direccionCorta = `${datos.direccion.calle}, ${datos.direccion.comuna}`;

/** Dirección oficial de la ficha de Google ("Ramón Freire 587"). Solo para datos estructurados y llms.txt. */
export const direccionOficial = `${datos.direccion.calleOficial}, ${datos.direccion.comuna}`;

export const urlInstagram = `https://www.instagram.com/${datos.instagram}/`;

// Con coordenadas el iframe cae en el punto exacto de la ficha; sin ellas se usa la dirección de texto
const consultaMapa = datos.geo ? `${datos.geo.lat},${datos.geo.lng}` : datos.mapa.consulta;

// Nombre y dirección: Google abre la ficha del local (la misma URL que el enlace de Google en resenas.json)
export const urlComoLlegar =
  'https://www.google.com/maps/search/?api=1&query=' +
  encodeURIComponent(`${datos.nombre.replace(/\s+/g, '')} ${datos.direccion.calleOficial} ${datos.direccion.comuna}`);

export const urlMapaEmbebido =
  'https://www.google.com/maps?output=embed&z=17&q=' + encodeURIComponent(consultaMapa);

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
      streetAddress: datos.direccion.calleOficial,
      postalCode: datos.direccion.codigoPostal,
      addressLocality: datos.direccion.comuna,
      addressRegion: datos.direccion.region,
      addressCountry: datos.direccion.codigoPais,
    },
    servesCuisine: datos.cocina,
    priceRange: datos.rangoPrecios,
    sameAs: [urlInstagram, ...datos.delivery.filter((d) => d.url).map((d) => d.url)],
    hasMenu: { '@type': 'Menu', '@id': urlAbsoluta('carta#menu'), url: urlAbsoluta('carta') },
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
  // Delivery: sin OrderAction a propósito. Google solo lo usa con el programa de pedidos de socios
  // y su validación no se puede comprobar aquí; sameAs ya enlaza los perfiles de las apps
  if (datos.telefono) ld.telephone = datos.telefono;
  return ld;
}

import type { APIRoute } from 'astro';
import carta from '../data/carta.json';
import { precio, urlAbsoluta } from '../lib/formato';
import { datos, direccionCorta, direccionOficial, urlInstagram } from '../lib/local';

// Formato llmstxt.org. Se genera desde local.json y carta.json para que no quede desfasado.
export const GET: APIRoute = () => {
  const horario = [
    ...datos.horario.map((h) => `- ${h.etiqueta}: ${h.abre} a ${h.cierra}`),
    ...datos.cerrado.map((c) => `- ${c.etiqueta}: cerrado`),
  ];
  const delivery = datos.delivery.filter((d) => d.url).map((d) => `- [${d.nombre}](${d.url}): delivery en Osorno`);
  const secciones = carta.categorias.map((c) => {
    const items = c.productos.map((p) => `- ${p.nombre}: ${precio(p.precio)}${p.descripcion ? `. ${p.descripcion}` : ''}`);
    return `### ${c.nombre}\n\n${items.join('\n')}`;
  });
  const texto = `# ${datos.nombre}

> ${datos.descripcion} Local en ${direccionCorta}.

## Ubicación

- Dirección: ${direccionCorta}
- Dirección oficial (ficha de Google): ${direccionOficial}, código postal ${datos.direccion.codigoPostal}, ${datos.direccion.region}, Chile

## Horario

${horario.join('\n')}

## Pedidos y contacto

${delivery.join('\n')}
- [Instagram](${urlInstagram})

## Carta

- [Carta completa](${urlAbsoluta('carta')}): categorías, productos y precios. Precios en pesos chilenos (CLP).

${secciones.join('\n\n')}
`;
  return new Response(texto, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};

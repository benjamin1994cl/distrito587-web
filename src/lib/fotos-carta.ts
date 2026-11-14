// Fotos de la carta: se busca por nombre de archivo (sin extensión) en src/assets/carta.
import type { ImageMetadata } from 'astro';

const archivos = import.meta.glob<{ default: ImageMetadata }>(
  '../assets/carta/*.{avif,webp,jpg,jpeg,png}',
  { eager: true },
);

export function buscarFoto(imagen: string | null): ImageMetadata | undefined {
  if (!imagen) return undefined;
  return Object.entries(archivos).find(
    ([ruta]) => ruta.split('/').pop()!.replace(/\.\w+$/, '') === imagen,
  )?.[1].default;
}

export const tieneFoto = (p: { imagen: string | null }) => buscarFoto(p.imagen) !== undefined;

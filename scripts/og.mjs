// Genera public/og-distrito587.png (1200x630) con el logo oficial, para Open Graph
// (vista previa en WhatsApp). Se corre a mano con `npm run og` y el PNG se commitea.
import sharp from 'sharp';
import { readFileSync } from 'node:fs';

const raiz = new URL('..', import.meta.url);
const logo = readFileSync(new URL('src/assets/marca/distrito587-logo-color.svg', raiz));

const ANCHO = 1200;
const ALTO = 630;
const BANDA = 70;

const logoPng = await sharp(logo, { density: 300 }).resize({ width: 940 }).png().toBuffer();
const { height: altoLogo } = await sharp(logoPng).metadata();

const fondo = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${ANCHO}" height="${ALTO}">
    <rect width="100%" height="100%" fill="#FFF4E6"/>
    <rect y="${ALTO - BANDA}" width="100%" height="${BANDA}" fill="#FFCD27"/>
    <rect y="${ALTO - BANDA - 10}" width="100%" height="10" fill="#F05432"/>
  </svg>`,
);

await sharp(fondo)
  .composite([
    {
      input: logoPng,
      left: Math.round((ANCHO - 940) / 2),
      top: Math.round((ALTO - BANDA - 10 - altoLogo) / 2),
    },
  ])
  .png({ compressionLevel: 9, palette: true })
  .toFile(new URL('public/og-distrito587.png', raiz).pathname);

console.log('public/og-distrito587.png generado');

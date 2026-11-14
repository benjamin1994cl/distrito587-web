# Distrito 587 · sitio web

Sitio estático de Distrito 587, hamburguesería smash en Osorno. Astro con salida 100% estática, publicado en GitHub Pages con GitHub Actions. Todo el contenido se lee con JavaScript desactivado.

## Comandos

```bash
npm install
npm run dev       # genera la carta y levanta http://localhost:4321/
npm run build     # genera la carta y compila a dist/
npm run preview   # sirve dist/
npm test          # tests del generador de la carta
npm run og        # regenera public/og-distrito587.png (1200x630) desde el logo
```

## Datos

| Archivo | Qué es | Quién lo edita |
|---|---|---|
| `data/carta-web.csv` | Carta semilla (Fase 1) | A mano, en el repo |
| `src/data/carta.json` | Carta que usa el sitio | Lo genera `scripts/generar-carta.mjs` en cada build |
| `src/data/local.json` | Dirección, horario, WhatsApp, redes, delivery | A mano, en el repo |
| `src/assets/carta/` | Fotos de productos (opcional) | Archivo con el nombre de la columna `imagen` (`cucumelo-onions.jpg`) |

### Carta

Columnas: `categoria,orden,nombre,descripcion,precio,disponible,imagen`. Categorías válidas: Hamburguesas, Tocomples, Papas caseras, Agregados, Salsas, Bebidas. El precio es un entero en CLP (se acepta `6.990` o `$6.990`). `disponible = NO` oculta el producto.

Si una fila no cuadra, el build falla y lista los errores por fila, con el número de línea del CSV (`fila 7: el precio 'seis mil' no es un número`; 1 es el encabezado). El precio acepta `6990`, `6.990`, `$6.990` o `$ 6.990`; `6.99` o `1.2.3` se rechazan. La web publicada no cambia.

### Fotos de la carta

La columna `imagen` de `data/carta-web.csv` lleva el nombre de la foto, sin extensión (por ejemplo `smash-clasica`). El archivo va en `src/assets/carta/<nombre>.jpg|png|webp|avif`.

- Proporción 4:5 vertical, mínimo 640 x 800 px (ideal 1280 x 1600 px). Si la proporción es otra, el recorte al centro lo hace el sitio (variantes 4:5 con `fit="cover"` y `object-fit` en CSS).
- El build genera AVIF y WebP en varios anchos (`srcset`); sube el original sin comprimir de más.
- Si falta el archivo, el slide muestra una ilustración propia de burger (`src/assets/ilustraciones/burger.svg`), así que se pueden subir las fotos de a una.
- Después de cambiar el CSV, corre `npm run carta` para regenerar `src/data/carta.json`.

### Datos del local

Los campos en `null` o vacíos no se muestran. Formato del horario:

```json
"horario": [
  { "etiqueta": "Martes a jueves", "dias": ["Tuesday", "Wednesday", "Thursday"], "abre": "18:00", "cierra": "23:00" }
],
"geo": { "lat": -40.57, "lng": -73.13 },
"whatsapp": "+56 9 1234 5678"
```

Con `whatsapp` aparece el botón "Pedir por WhatsApp"; con `horario` y `geo` el JSON-LD suma `openingHoursSpecification` y `geo`.

## Despliegue

`.github/workflows/deploy.yml` publica en cada push a `main` (y con el botón manual). El sitio se publica en `https://distrito587.cl` (el dominio va en `public/CNAME` y en Settings > Pages). Variables opcionales del repo, solo como override:

| Variable | Por defecto | Para qué |
|---|---|---|
| `SITE_URL` | `https://distrito587.cl` | Probar con otro dominio |
| `BASE_PATH` | `/` | Probar en un subdirectorio |

En Settings > Pages, la fuente tiene que ser "GitHub Actions".

URLs sin barra final: el build genera `carta.html` (`build.format: 'file'`, `trailingSlash: 'never'`), así que la carta vive en `/carta` (esa es la URL de los QR). La portada es `/`.

`robots.txt` permite todo y apunta a `https://distrito587.cl/sitemap-index.xml`.

## Reglas

- No se usa código, diseño ni imágenes del sitio del proveedor (timbles.cl). Las ilustraciones y fotos son propias o de Maxi.
- Nada de secretos en el repo: es público.

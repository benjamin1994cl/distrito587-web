# Distrito 587 · sitio web

Sitio estático de Distrito 587, hamburguesería smash en Osorno. Astro con salida 100% estática, publicado en GitHub Pages con GitHub Actions. Todo el contenido se lee con JavaScript desactivado.

## Comandos

```bash
npm install
npm run dev       # genera la carta y levanta http://localhost:4321/distrito587-web/
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

Si una fila no cuadra, el build falla y lista los errores por fila (`fila 7: el precio 'seis mil' no es un número`). La web publicada no cambia.

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

`.github/workflows/deploy.yml` publica en cada push a `main` (y con el botón manual). Variables opcionales del repo:

| Variable | Fase 1 (por defecto) | Con dominio propio |
|---|---|---|
| `SITE_URL` | `https://benjamin1994cl.github.io` | `https://distrito587.cl` |
| `BASE_PATH` | `/distrito587-web` | `/` |

En Settings > Pages, la fuente tiene que ser "GitHub Actions".

## Reglas

- No se usa código, diseño ni imágenes del sitio del proveedor (timbles.cl). Las ilustraciones y fotos son propias o de Maxi.
- Nada de secretos en el repo: es público.

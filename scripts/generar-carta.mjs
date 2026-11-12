// Genera src/data/carta.json desde data/carta-web.csv.
// Fase 1: la fuente es el CSV semilla. Fase 2: la pestaña Carta de la planilla
// (scripts/leer-carta.mjs) entregará las mismas filas a validarFilas().
// Falla cerrado: si alguna fila no cuadra, el build se detiene y lista los errores.

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export const CATEGORIAS = [
  'Hamburguesas',
  'Tocomples',
  'Papas caseras',
  'Agregados',
  'Salsas',
  'Bebidas',
];

const COLUMNAS = ['categoria', 'orden', 'nombre', 'descripcion', 'precio', 'disponible', 'imagen'];

/** CSV mínimo con comillas dobles (RFC 4180). */
export function parsearCsv(texto) {
  const filas = [];
  let fila = [];
  let campo = '';
  let entreComillas = false;
  const t = texto.replace(/^﻿/, '');
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (entreComillas) {
      if (c === '"' && t[i + 1] === '"') {
        campo += '"';
        i++;
      } else if (c === '"') {
        entreComillas = false;
      } else {
        campo += c;
      }
    } else if (c === '"') {
      entreComillas = true;
    } else if (c === ',') {
      fila.push(campo);
      campo = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && t[i + 1] === '\n') i++;
      fila.push(campo);
      filas.push(fila);
      fila = [];
      campo = '';
    } else {
      campo += c;
    }
  }
  if (campo !== '' || fila.length) {
    fila.push(campo);
    filas.push(fila);
  }
  return filas.filter((f) => f.some((v) => v.trim() !== ''));
}

/** Acepta 6990, "6.990" o "$6.990". Devuelve un entero o null. */
export function normalizarPrecio(valor) {
  const limpio = String(valor ?? '').replace(/[$\s.]/g, '');
  if (!/^\d+$/.test(limpio)) return null;
  return Number.parseInt(limpio, 10);
}

function slug(texto) {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Valida las filas (sin encabezado) y devuelve { carta, errores }.
 * `numeroInicial` es el número de fila de la primera fila de datos en la fuente.
 */
export function validarFilas(filas, numeroInicial = 2) {
  const errores = [];
  const productos = [];
  filas.forEach((valores, i) => {
    const n = numeroInicial + i;
    const r = Object.fromEntries(COLUMNAS.map((c, j) => [c, (valores[j] ?? '').trim()]));
    if (!CATEGORIAS.includes(r.categoria)) {
      errores.push(`fila ${n}: la categoría '${r.categoria}' no es una de: ${CATEGORIAS.join(', ')}`);
    }
    const orden = Number.parseInt(r.orden, 10);
    if (!/^\d+$/.test(r.orden)) errores.push(`fila ${n}: el orden '${r.orden}' no es un número entero`);
    if (!r.nombre) errores.push(`fila ${n}: el nombre está vacío`);
    const precio = normalizarPrecio(r.precio);
    if (precio === null) errores.push(`fila ${n}: el precio '${r.precio}' no es un número`);
    else if (precio <= 0) errores.push(`fila ${n}: el precio tiene que ser mayor que 0`);
    const disp = r.disponible.toUpperCase();
    if (!['SÍ', 'SI', 'NO'].includes(disp)) {
      errores.push(`fila ${n}: disponible tiene que ser SÍ o NO (dice '${r.disponible}')`);
    }
    if (r.imagen && !/^[a-z0-9-]+$/.test(r.imagen)) {
      errores.push(`fila ${n}: la imagen '${r.imagen}' solo puede tener minúsculas, números y guiones`);
    }
    productos.push({
      categoria: r.categoria,
      orden,
      nombre: r.nombre,
      descripcion: r.descripcion,
      precio,
      disponible: disp !== 'NO',
      imagen: r.imagen || null,
    });
  });

  const carta = CATEGORIAS.map((nombre) => ({
    id: slug(nombre),
    nombre,
    productos: productos
      .filter((p) => p.categoria === nombre && p.disponible)
      .sort((a, b) => a.orden - b.orden)
      .map(({ nombre, descripcion, precio, imagen }) => ({ nombre, descripcion, precio, imagen })),
  })).filter((c) => c.productos.length > 0);

  if (!errores.length && !carta.some((c) => c.id === 'hamburguesas')) {
    errores.push('la carta no tiene ninguna hamburguesa disponible');
  }
  return { carta, errores };
}

function main() {
  const raiz = new URL('..', import.meta.url);
  const csv = readFileSync(new URL('data/carta-web.csv', raiz), 'utf8');
  const [encabezado, ...filas] = parsearCsv(csv);
  const esperado = COLUMNAS.join(',');
  if (encabezado.map((c) => c.trim()).join(',') !== esperado) {
    console.error(`carta-web.csv: el encabezado tiene que ser "${esperado}"`);
    process.exit(1);
  }
  const { carta, errores } = validarFilas(filas);
  if (errores.length) {
    console.error(`carta-web.csv tiene ${errores.length} error(es):`);
    for (const e of errores) console.error(`  - ${e}`);
    process.exit(1);
  }
  const salida = new URL('src/data/carta.json', raiz);
  writeFileSync(salida, JSON.stringify({ categorias: carta }, null, 2) + '\n');
  const total = carta.reduce((s, c) => s + c.productos.length, 0);
  console.log(`carta.json: ${total} productos en ${carta.length} categorías`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { normalizarPrecio, parsearCsv, parsearCsvConLineas, validarFilas } from './generar-carta.mjs';

const SCRIPT = new URL('./generar-carta.mjs', import.meta.url).pathname;
const ENCABEZADO = 'categoria,orden,nombre,descripcion,precio,disponible,imagen';

/** Corre el generador sobre un CSV temporal y devuelve el resultado del proceso. */
function correrConCsv(contenido) {
  const ruta = join(mkdtempSync(join(tmpdir(), 'carta-')), 'carta.csv');
  writeFileSync(ruta, contenido);
  return spawnSync(process.execPath, [SCRIPT, ruta], { encoding: 'utf8' });
}

const fila = (cambios = {}) => {
  const base = {
    categoria: 'Hamburguesas',
    orden: '1',
    nombre: 'Distrito 587',
    descripcion: 'Pan de papa, smash burger',
    precio: '6990',
    disponible: 'SÍ',
    imagen: '',
  };
  return Object.values({ ...base, ...cambios });
};

test('normaliza precios con puntos y signo peso', () => {
  assert.equal(normalizarPrecio('6990'), 6990);
  assert.equal(normalizarPrecio('6.990'), 6990);
  assert.equal(normalizarPrecio('$6.990'), 6990);
  assert.equal(normalizarPrecio('$ 6.990'), 6990);
  assert.equal(normalizarPrecio(' 6.990 '), 6990);
  assert.equal(normalizarPrecio('1.250.000'), 1250000);
  assert.equal(normalizarPrecio(''), null);
});

test('rechaza precios mal formados', () => {
  for (const malo of ['6.99', '1.2.3', 'seis mil', '-100', '6,990', '69.90', '.990', '$']) {
    assert.equal(normalizarPrecio(malo), null, `'${malo}' debería ser inválido`);
  }
});

test('precio 0 se reporta como error (tiene que ser mayor que 0)', () => {
  assert.equal(normalizarPrecio('0'), 0);
  const { errores } = validarFilas([fila({ precio: '0' }), fila({ precio: '-100' })]);
  assert.deepEqual(errores, [
    'fila 2: el precio tiene que ser mayor que 0',
    "fila 3: el precio '-100' no es un número",
  ]);
});

test('el número de fila es la línea real del CSV con líneas en blanco y saltos dentro de comillas', () => {
  const csv = [
    ENCABEZADO, // línea 1
    '', // 2 (en blanco)
    'Hamburguesas,1,A,"desc",6990,SÍ,', // 3
    '"Hamburguesas",2,B,"desc', // 4
    'en dos líneas",seis mil,SÍ,', // 5 (continúa el registro de la línea 4)
    '', // 6
    'Postres,3,C,x,1000,SÍ,', // 7
  ].join('\n');
  const registros = parsearCsvConLineas(csv);
  assert.deepEqual(registros.map((r) => r.linea), [1, 3, 4, 7]);
  const [, ...datos] = registros;
  const { errores } = validarFilas(
    datos.map((d) => d.valores),
    2,
    datos.map((d) => d.linea),
  );
  assert.deepEqual(errores, [
    "fila 4: el precio 'seis mil' no es un número",
    "fila 7: la categoría 'Postres' no es una de: Hamburguesas, Tocomples, Papas caseras, Agregados, Salsas, Bebidas",
  ]);
});

test('cuenta bien las líneas con CRLF', () => {
  const registros = parsearCsvConLineas('a,b\r\n\r\nc,d\r\n');
  assert.deepEqual(registros.map((r) => r.linea), [1, 3]);
});

test('CSV vacío sale con mensaje claro y exit 1', () => {
  for (const contenido of ['', '\n\n']) {
    const r = correrConCsv(contenido);
    assert.equal(r.status, 1);
    assert.match(r.stderr, /está vacío/);
    assert.doesNotMatch(r.stderr, /TypeError/);
  }
});

test('CSV con solo el encabezado sale con mensaje claro y exit 1', () => {
  const r = correrConCsv(ENCABEZADO + '\n');
  assert.equal(r.status, 1);
  assert.match(r.stderr, /solo tiene el encabezado/);
});

test('CSV válido pasa con exit 0', () => {
  const r = correrConCsv(`${ENCABEZADO}\nHamburguesas,1,A,desc,6990,SÍ,\n`);
  assert.equal(r.status, 0, r.stderr);
});

test('parsea comillas, comas internas y comillas escapadas', () => {
  const filas = parsearCsv('a,b\n"x, y","dijo ""hola"""\n');
  assert.deepEqual(filas, [
    ['a', 'b'],
    ['x, y', 'dijo "hola"'],
  ]);
});

test('una fila válida produce la categoría con su producto', () => {
  const { carta, errores } = validarFilas([fila()]);
  assert.deepEqual(errores, []);
  assert.equal(carta[0].id, 'hamburguesas');
  assert.equal(carta[0].productos[0].precio, 6990);
});

test('falla cerrado con mensajes legibles por fila', () => {
  const { errores } = validarFilas([
    fila(),
    fila({ precio: 'seis mil' }),
    fila({ categoria: 'Postres' }),
    fila({ nombre: '' }),
    fila({ disponible: 'tal vez' }),
  ]);
  assert.deepEqual(errores, [
    "fila 3: el precio 'seis mil' no es un número",
    "fila 4: la categoría 'Postres' no es una de: Hamburguesas, Tocomples, Papas caseras, Agregados, Salsas, Bebidas",
    'fila 5: el nombre está vacío',
    "fila 6: disponible tiene que ser SÍ o NO (dice 'tal vez')",
  ]);
});

test('disponible NO oculta el producto y ordena por orden', () => {
  const { carta } = validarFilas([
    fila({ orden: '2', nombre: 'B' }),
    fila({ orden: '1', nombre: 'A' }),
    fila({ orden: '3', nombre: 'C', disponible: 'NO' }),
  ]);
  assert.deepEqual(
    carta[0].productos.map((p) => p.nombre),
    ['A', 'B'],
  );
});

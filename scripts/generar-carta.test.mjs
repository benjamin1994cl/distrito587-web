import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizarPrecio, parsearCsv, validarFilas } from './generar-carta.mjs';

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
  assert.equal(normalizarPrecio('seis mil'), null);
  assert.equal(normalizarPrecio(''), null);
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

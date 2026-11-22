import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { filterBooks, formatCLP } from '../src/utils/bookFilters.js';
import { getJson, BookApiError, resetBookApiCache } from '../src/services/bookApi.js';

const catalog = JSON.parse(readFileSync(new URL('../server/data/catalogo.json', import.meta.url), 'utf8'));

test('Hay categorías y libros con claves de categoría válidas', () => {
  assert.ok(catalog.categorias.length >= 2);
  assert.ok(catalog.libros.length >= catalog.categorias.length);
  const keys = new Set(catalog.categorias.map(c => c.id));
  for (const book of catalog.libros) assert.ok(keys.has(book.categoriaId));
});

test('Filtra categorías sin modificar los datos originales', () => {
  const before = JSON.stringify(catalog.libros);
  const results = filterBooks(catalog.libros, { category: 'ciencia-ficcion' });
  assert.ok(results.length > 0);
  assert.ok(results.every(b => b.categoriaId === 'ciencia-ficcion'));
  assert.equal(JSON.stringify(catalog.libros), before);
});

test('Búsqueda por título o autor y orden de precios', () => {
  const search = filterBooks(catalog.libros, { query: 'react' });
  assert.ok(search.some(b => b.titulo === 'React paso a paso'));
  const asc = filterBooks(catalog.libros, { order: 'precio-asc' });
  assert.ok(asc[0].precio <= asc.at(-1).precio);
  assert.match(formatCLP(13990), /13[.\s]?990/);
});

test('Cliente REST obtiene JSON y reutiliza caché en consultas repetidas', async () => {
  resetBookApiCache();
  let n = 0;
  const fetcher = async () => { n++; return { ok: true, json: async () => ({ data: [1, 2] }) }; };
  assert.deepEqual(await getJson('/test/cache', { fetcher }), [1, 2]);
  assert.deepEqual(await getJson('/test/cache', { fetcher }), [1, 2]);
  assert.equal(n, 1);
  await getJson('/test/cache', { fetcher, force: true });
  assert.equal(n, 2);
});

test('Cliente REST agrupa consultas simultáneas sin repetirlas', async () => {
  resetBookApiCache();
  let n = 0;
  const fetcher = async () => { n++; await new Promise(resolve => setTimeout(resolve, 15)); return { ok: true, json: async () => ({ data: [3] }) }; };
  const [a, b] = await Promise.all([getJson('/test/concurrente', { fetcher }), getJson('/test/concurrente', { fetcher })]);
  assert.deepEqual(a, b);
  assert.equal(n, 1);
});

test('Cliente REST entrega mensajes distintos para HTTP 404 y 500', async () => {
  resetBookApiCache();
  for (const status of [404, 500]) {
    await assert.rejects(
      () => getJson(`/test/http-${status}`, { fetcher: async () => ({ ok: false, status, json: async () => ({ error: `Prueba ${status}` }) }) }),
      error => error instanceof BookApiError && error.status === status && error.message.includes(String(status)),
    );
  }
});

test('Cliente REST detecta datos con formato incorrecto', async () => {
  resetBookApiCache();
  await assert.rejects(
    () => getJson('/test/malformado', { fetcher: async () => ({ ok: true, json: async () => ({ data: 7 }) }) }),
    /formato inesperado/i,
  );
});

test('Archivos publicados en GitHub Pages coinciden con la API local', () => {
  for (const [file, expected] of [['categorias.json', catalog.categorias], ['libros.json', catalog.libros]]) {
    const parsed = JSON.parse(readFileSync(new URL(`../public/mock/${file}`, import.meta.url), 'utf8'));
    assert.deepEqual(parsed.data, expected);
  }
});

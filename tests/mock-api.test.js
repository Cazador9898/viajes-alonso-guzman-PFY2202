import test from 'node:test';
import assert from 'node:assert/strict';
import { createMockApiServer } from '../server/mock-api.mjs';

let server;
let url;
test.before(async () => {
  server = createMockApiServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  url = `http://127.0.0.1:${server.address().port}`;
});
test.after(async () => { if (server) await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve())); });

test('GET /api/categorias retorna 200, JSON y categorías', async () => {
  const response = await fetch(`${url}/api/categorias`);
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /application\/json/);
  const data = await response.json();
  assert.ok(data.total >= 2);
  assert.ok(data.data.some((item) => item.nombre === 'Ciencia ficción'));
});

test('GET /api/libros filtra por categoría y consulta individual', async () => {
  const response = await fetch(`${url}/api/libros?categoria=tecnologia`);
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.ok(result.data.length > 0);
  assert.ok(result.data.every(item => item.categoriaId === 'tecnologia'));
  const book = await (await fetch(`${url}/api/libros/${result.data[0].id}`)).json();
  assert.equal(book.data.id, result.data[0].id);
});

test('API HTTP devuelve 404 para una ruta o un libro inexistentes', async () => {
  for (const path of ['/api/no-existe', '/api/libros/inexistente']) {
    const response = await fetch(url + path);
    assert.equal(response.status, 404);
    assert.ok((await response.json()).error);
  }
});

test('API simula un fallo 500 para probar la interfaz', async () => {
  const response = await fetch(url + '/api/categorias?simularError=500');
  assert.equal(response.status, 500);
  assert.match((await response.json()).error, /Error/);
});

test('API no acepta métodos de modificación', async () => {
  const response = await fetch(url + '/api/categorias', { method: 'POST' });
  assert.equal(response.status, 405);
});

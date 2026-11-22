import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createMockApiServer } from '../server/mock-api.mjs';
import { searchDestinations, availableFlights, availableHotels, calculateQuote, formatTravelPrice } from '../src/utils/travel.js';
import { getTravelDestinations, getDestinationOptions, resetTravelApiCache, OPTIONS_QUERY, TravelApiError } from '../src/services/travelApi.js';

const travel = JSON.parse(readFileSync(new URL('../server/data/viajes.json', import.meta.url), 'utf8'));
let server;
let base;
test.before(async () => {
  server = createMockApiServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});
test.after(async () => { if (server) await new Promise(resolve => server.close(resolve)); });

test('Datos: destinos, vuelos y hoteles están relacionados y son válidos', () => {
  assert.ok(travel.destinos.length >= 5);
  const destinations = new Set(travel.destinos.map(x => x.id));
  assert.equal(destinations.size, travel.destinos.length);
  assert.ok(travel.vuelos.length > travel.destinos.length);
  assert.ok(travel.hoteles.length > travel.destinos.length);
  for (const flight of travel.vuelos) {
    assert.ok(destinations.has(flight.destinoId));
    assert.ok(flight.precioCLP > 0);
    assert.ok(flight.asientosDisponibles >= 0);
  }
  for (const hotel of travel.hoteles) {
    assert.ok(destinations.has(hotel.destinoId));
    assert.ok(hotel.precioNocheCLP > 0);
    assert.ok(hotel.habitacionesDisponibles >= 0);
  }
});

test('Filtros de destino no alteran el arreglo original', () => {
  const original = JSON.stringify(travel.destinos);
  assert.ok(searchDestinations(travel.destinos, { query: 'puerto varas' }).some(x => x.pais === 'Chile'));
  assert.ok(searchDestinations(travel.destinos, { continent: 'Europa' }).every(x => x.continente === 'Europa'));
  assert.ok(searchDestinations(travel.destinos, { query: 'museo' }).length > 0);
  assert.equal(JSON.stringify(travel.destinos), original);
});

test('Disponibilidad, precios y resumen de viaje', () => {
  assert.ok(availableFlights(travel.vuelos).every(x => x.asientosDisponibles > 0));
  assert.ok(availableHotels(travel.hoteles).every(x => x.habitacionesDisponibles > 0));
  assert.equal(calculateQuote({precioCLP: 170000}, {precioNocheCLP: 50000}, 4), 370000);
  assert.match(formatTravelPrice(150000), /150[.\s]?000/);
});

test('REST GET /api/destinos retorna información y filtros', async () => {
  const response = await fetch(base + '/api/destinos');
  assert.equal(response.status, 200);
  assert.equal((await response.json()).data.length, travel.destinos.length);
  const filtered = await (await fetch(base + '/api/destinos?q=madrid')).json();
  assert.equal(filtered.total, 1);
  assert.equal(filtered.data[0].pais, 'España');
  const selected = await (await fetch(base + '/api/destinos/madrid')).json();
  assert.equal(selected.data.ciudad, 'Madrid');
  assert.equal((await fetch(base + '/api/destinos/no-existe')).status, 404);
});

test('Cliente REST conserva caché y no duplica peticiones', async () => {
  resetTravelApiCache();
  let count = 0;
  const fetcher = async () => { count++; return { ok: true, json: async () => ({ data: travel.destinos }), status: 200 }; };
  const [a,b] = await Promise.all([getTravelDestinations({ fetcher }), getTravelDestinations({ fetcher })]);
  assert.equal(count, 1);
  assert.deepEqual(a,b);
  await getTravelDestinations({ fetcher });
  assert.equal(count, 1);
  await getTravelDestinations({ fetcher, force: true });
  assert.equal(count, 2);
});

test('Cliente GraphQL POST manda query y variables con el destino elegido', async () => {
  resetTravelApiCache();
  const destinationId = 'cusco';
  let called = 0;
  const fetcher = async (url, params) => {
    called++;
    assert.equal(url, '/graphql');
    assert.equal(params.method, 'POST');
    const body = JSON.parse(params.body);
    assert.match(body.query, /vuelos\(destinoId:/);
    assert.match(OPTIONS_QUERY, /hoteles\(destinoId:/);
    assert.equal(body.variables.destinoId, destinationId);
    return { ok: true, status: 200, json: async () => ({ data: {
      vuelos: travel.vuelos.filter(x => x.destinoId === destinationId),
      hoteles: travel.hoteles.filter(x => x.destinoId === destinationId),
    } }) };
  };
  const a = await getDestinationOptions(destinationId, { fetcher });
  assert.ok(a.vuelos.length > 0);
  assert.ok(a.hoteles.every(x => x.destinoId === destinationId));
  await getDestinationOptions(destinationId, { fetcher });
  assert.equal(called, 1);
});

test('Cliente GraphQL muestra error de servidor, error GraphQL y respuesta incompleta', async () => {
  resetTravelApiCache();
  await assert.rejects(() => getDestinationOptions('buenos-aires', { fetcher: async () => ({ ok:false, status:500, json:async () => ({error:'Caída simulada'}) }) }),
    error => error instanceof TravelApiError && error.message.includes('500'));
  await assert.rejects(() => getDestinationOptions('buenos-aires', { fetcher: async () => ({ ok:true, status:200, json:async () => ({errors:[{message:'Campo inválido'}]}) }) }), /Campo inválido/);
  await assert.rejects(() => getDestinationOptions('buenos-aires', { fetcher: async () => ({ ok:true, status:200, json:async () => ({data:{hoteles:[]}}) }) }), /incompleta/);
});

test('Los snapshots de GitHub Pages reflejan los mismos datos del servidor', () => {
  const destinations = JSON.parse(readFileSync(new URL('../public/mock/destinos.json', import.meta.url), 'utf8'));
  const choices = JSON.parse(readFileSync(new URL('../public/mock/opciones-viaje.json', import.meta.url), 'utf8'));
  assert.deepEqual(destinations.data, travel.destinos);
  assert.deepEqual(choices.data.vuelos, travel.vuelos);
  assert.deepEqual(choices.data.hoteles, travel.hoteles);
});

const graphqlPresent = await import('graphql').then(() => true).catch(() => false);
test('GraphQL real: ejecuta consulta por destino e informa campos inválidos', {skip: !graphqlPresent && 'graphql no instalado en este entorno; se instala con npm install'}, async () => {
  const response = await fetch(base + '/graphql', {
    method: 'POST', headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ query: OPTIONS_QUERY, variables:{destinoId:'paris'},operationName:'OpcionesDestino' }),
  });
  assert.equal(response.status, 200);
  const output = await response.json();
  assert.equal(output.errors, undefined);
  assert.ok(output.data.vuelos.every(x => x.destinoId === 'paris'));
  assert.ok(output.data.hoteles.every(x => x.destinoId === 'paris'));
  const failed = await fetch(base + '/graphql', {
    method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({query:'{ campoQueNoExiste }'}),
  });
  assert.equal(failed.status, 400);
  assert.ok((await failed.json()).errors.length > 0);
});

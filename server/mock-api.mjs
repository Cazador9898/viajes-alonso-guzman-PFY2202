/**
 * Backend mock académico: REST para libros y destinos, GraphQL para vuelos/hoteles.
 * Ejecutar con npm run dev (frontend + backend) o npm run api (solo backend).
 * Todos los datos son ficticios; no realiza reservas ni pagos.
 */
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const catalog = JSON.parse(readFileSync(new URL('./data/catalogo.json', import.meta.url), 'utf8'));
const travels = JSON.parse(readFileSync(new URL('./data/viajes.json', import.meta.url), 'utf8'));
const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function respond(res, status, payload) {
  res.writeHead(status, { ...cors, 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(payload));
}

async function readJsonBody(req) {
  let body = '';
  for await (const chunk of req) {
    body += chunk.toString();
    if (body.length > 65_536) throw Object.assign(new Error('La petición excede el tamaño permitido.'), { status: 413 });
  }
  try { return JSON.parse(body); }
  catch { throw Object.assign(new Error('El cuerpo de la petición debe ser JSON válido.'), { status: 400 }); }
}

export function createMockApiServer() {
  return createServer(async (req, res) => {
    try {
      if (req.method === 'OPTIONS') {
        res.writeHead(204, cors);
        res.end();
        return;
      }
      const url = new URL(req.url || '/', 'http://localhost');
      const path = decodeURIComponent(url.pathname);
      if (url.searchParams.get('simularError') === '500') {
        respond(res, 500, { error: 'Error de demostración del servidor.' });
        return;
      }

      if (path === '/graphql') {
        if (req.method !== 'POST') {
          respond(res, 405, { errors: [{ message: 'GraphQL requiere POST con query y variables en JSON.' }] });
          return;
        }
        const body = await readJsonBody(req);
        if (!body || typeof body.query !== 'string' || !body.query.trim()) {
          respond(res, 400, { errors: [{ message: 'Incluye una consulta GraphQL en el campo query.' }] });
          return;
        }
        // Import diferido: la API REST sigue disponible sin cargar GraphQL hasta recibir un POST.
        const { executeTravelGraphQL } = await import('./travel-graphql.mjs');
        const result = await executeTravelGraphQL(body);
        // Las respuestas GraphQL siempre tienen la estructura data / errors.
        respond(res, result.errors && !result.data ? 400 : 200, result);
        return;
      }
      if (req.method !== 'GET') {
        respond(res, 405, { error: 'Método no permitido. Los endpoints REST solo aceptan GET.' });
        return;
      }

      if (path === '/api/salud') {
        respond(res, 200, { estado: 'activo', servicio: 'getiomark REST + GraphQL mock' });
        return;
      }
      if (path === '/api/destinos') {
        const search = url.searchParams.get('q')?.trim().toLocaleLowerCase('es') ?? '';
        const items = travels.destinos.filter(d => !search || `${d.ciudad} ${d.pais}`.toLocaleLowerCase('es').includes(search));
        respond(res, 200, { data: items, total: items.length });
        return;
      }
      if (path.startsWith('/api/destinos/')) {
        const id = path.slice('/api/destinos/'.length);
        const dest = travels.destinos.find(item => item.id === id);
        if (!dest) { respond(res, 404, { error: 'El destino solicitado no existe.' }); return; }
        respond(res, 200, { data: dest });
        return;
      }

      // Se conserva el mock REST de libros de Semana 4.
      if (path === '/api/categorias') {
        respond(res, 200, { data: catalog.categorias, total: catalog.categorias.length });
        return;
      }
      if (path === '/api/libros') {
        const cat = url.searchParams.get('categoria');
        const search = url.searchParams.get('q')?.trim().toLocaleLowerCase('es') ?? '';
        const items = catalog.libros.filter((book) => (!cat || book.categoriaId === cat)
          && (!search || `${book.titulo} ${book.autor}`.toLocaleLowerCase('es').includes(search)));
        respond(res, 200, { data: items, total: items.length });
        return;
      }
      if (path.startsWith('/api/libros/')) {
        const id = path.slice('/api/libros/'.length);
        const book = catalog.libros.find((item) => item.id === id);
        if (!book) { respond(res, 404, { error: 'El libro solicitado no existe.' }); return; }
        respond(res, 200, { data: book });
        return;
      }
      respond(res, 404, { error: 'Ruta no encontrada. Prueba /api/destinos, /api/categorias o POST /graphql.' });
    } catch (error) {
      respond(res, error.status || 500, { error: error.status ? error.message : 'Error interno del servidor mock.' });
    }
  });
}

const self = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (self) {
  const port = Number(process.env.MOCK_API_PORT || 3001);
  const server = createMockApiServer();
  server.on('error', (error) => { console.error('No se pudo iniciar la API mock:', error.message); process.exitCode = 1; });
  server.listen(port, '127.0.0.1', () => {
    console.log(`REST: http://localhost:${port}/api/destinos`);
    console.log(`GraphQL: http://localhost:${port}/graphql (POST)`);
    console.log(`Librería anterior: http://localhost:${port}/api/categorias`);
  });
}

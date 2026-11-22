/** Sincroniza JSON estáticos para el alojamiento en GitHub Pages. */
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
const catalog = JSON.parse(readFileSync(new URL('../server/data/catalogo.json', import.meta.url), 'utf8'));
const travelData = JSON.parse(readFileSync(new URL('../server/data/viajes.json', import.meta.url), 'utf8'));
const dir = new URL('../public/mock/', import.meta.url);
mkdirSync(dir, { recursive: true });
const results = [
  ['categorias.json', catalog.categorias],
  ['libros.json', catalog.libros],
  ['destinos.json', travelData.destinos],
];
for (const [file, data] of results) {
  writeFileSync(new URL(file, dir), JSON.stringify({ data, total: data.length }, null, 2) + '\n');
}
// Este JSON es una copia del resultado de consultas GraphQL para el modo Pages.
// GraphQL real solo está disponible al ejecutar Node localmente.
writeFileSync(new URL('opciones-viaje.json', dir), JSON.stringify({
  data: { vuelos: travelData.vuelos, hoteles: travelData.hoteles },
  aviso: 'Vista de demostración estática. El endpoint GraphQL se ejecuta con npm run dev.',
}, null, 2) + '\n');
console.log('Copias JSON REST y GraphQL de demostración sincronizadas para Pages.');

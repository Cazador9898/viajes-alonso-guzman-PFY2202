/**
 * Capa de comunicación con mocks de Semana 5.
 * Local: REST GET /api/destinos y GraphQL POST /graphql (Node, graphql-js).
 * GitHub Pages: snapshots JSON de demostración porque Pages no ejecuta backend.
 */
const environment = import.meta.env ?? {};
export const isTravelStaticPreview = environment.VITE_GITHUB_PAGES === 'true';
const base = environment.BASE_URL || '/';
const destinationsUrl = isTravelStaticPreview ? `${base}mock/destinos.json` : '/api/destinos';
const staticOptionsUrl = `${base}mock/opciones-viaje.json`;

export const OPTIONS_QUERY = `
query OpcionesDestino($destinoId: ID!) {
  vuelos(destinoId: $destinoId) {
    id destinoId aerolinea origen destino fechaSalida fechaRegreso
    precioCLP asientosDisponibles duracion
  }
  hoteles(destinoId: $destinoId) {
    id destinoId nombre ubicacion estrellas precioNocheCLP
    habitacionesDisponibles fechaEntrada fechaSalida servicios
  }
}`;

export class TravelApiError extends Error {
  constructor(message, status = null) {
    super(message);
    this.name = 'TravelApiError';
    this.status = status;
  }
}

const CACHE_MS = 120_000;
const fulfilled = new Map();
const pending = new Map();

function humanError(error) {
  if (error instanceof TravelApiError) return error;
  if (error?.name === 'AbortError') return new TravelApiError('La consulta tardó demasiado. Intenta nuevamente.');
  return new TravelApiError('No fue posible conectar con la API mock. Comprueba que esté activa con npm run dev.');
}

async function fetchJson(url, { method = 'GET', body, fetcher = fetch, timeoutMs = 8000 } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetcher(url, {
      method,
      headers: { Accept: 'application/json', ...(body ? { 'Content-Type': 'application/json' } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {}),
      signal: controller.signal,
    });
    let payload;
    try { payload = await response.json(); }
    catch { throw new TravelApiError('La API no devolvió datos JSON válidos.', response.status); }
    if (!response.ok) {
      const detail = payload?.errors?.[0]?.message || payload?.error;
      throw new TravelApiError(
        `Error HTTP ${response.status}: ${detail || 'No se pudo completar la consulta.'}`,
        response.status,
      );
    }
    return payload;
  } catch (error) {
    throw humanError(error);
  } finally {
    clearTimeout(timer);
  }
}

async function memoize(key, loader, { force = false, now = Date.now } = {}) {
  if (!force && fulfilled.get(key)?.expires > now()) return fulfilled.get(key).value;
  if (pending.has(key)) return pending.get(key);
  const work = (async () => {
    const value = await loader();
    fulfilled.set(key, { value, expires: now() + CACHE_MS });
    return value;
  })();
  pending.set(key, work);
  try { return await work; }
  finally { if (pending.get(key) === work) pending.delete(key); }
}

export function getTravelDestinations({ force = false, fetcher = fetch } = {}) {
  return memoize('destinos', async () => {
    const result = await fetchJson(destinationsUrl, { fetcher });
    if (!Array.isArray(result.data)) throw new TravelApiError('La API REST devolvió una lista de destinos inválida.');
    return result.data;
  }, { force });
}

export function getDestinationOptions(destinationId, { force = false, fetcher = fetch } = {}) {
  if (!destinationId || typeof destinationId !== 'string') {
    return Promise.reject(new TravelApiError('Selecciona un destino válido antes de continuar.'));
  }
  return memoize(`opciones:${destinationId}`, async () => {
    let result;
    if (isTravelStaticPreview) {
      // Copia de una consulta GraphQL de ejemplo, no un servidor GraphQL publicado.
      const snapshot = await fetchJson(staticOptionsUrl, { fetcher });
      result = {
        data: {
          vuelos: snapshot.data?.vuelos?.filter(x => x.destinoId === destinationId),
          hoteles: snapshot.data?.hoteles?.filter(x => x.destinoId === destinationId),
        },
      };
    } else {
      result = await fetchJson('/graphql', {
        method: 'POST',
        body: { query: OPTIONS_QUERY, variables: { destinoId: destinationId }, operationName: 'OpcionesDestino' },
        fetcher,
      });
    }
    if (result.errors?.length) throw new TravelApiError(`GraphQL: ${result.errors[0].message}`);
    if (!Array.isArray(result.data?.vuelos) || !Array.isArray(result.data?.hoteles)) {
      throw new TravelApiError('La consulta GraphQL devolvió información incompleta.');
    }
    return result.data;
  }, { force });
}

export function resetTravelApiCache() {
  fulfilled.clear();
  pending.clear();
}

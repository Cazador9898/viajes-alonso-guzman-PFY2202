/** API HTTP GET y caché temporal compartida para evitar peticiones duplicadas. */
const env = import.meta.env ?? {};
const isPages = env.VITE_GITHUB_PAGES === 'true';
const siteBase = env.BASE_URL || '/';
const URLs = isPages
  ? { categorias: `${siteBase}mock/categorias.json`, libros: `${siteBase}mock/libros.json` }
  : { categorias: '/api/categorias', libros: '/api/libros' };

export class BookApiError extends Error {
  constructor(message, status = null) {
    super(message);
    this.name = 'BookApiError';
    this.status = status;
  }
}

const resolved = new Map();
const pending = new Map();
const CACHE_MS = 120_000;

function explainError(error) {
  if (error instanceof BookApiError) return error;
  if (error?.name === 'AbortError') return new BookApiError('La consulta tardó demasiado. Revisa la conexión y vuelve a intentar.');
  return new BookApiError('No pudimos conectar con el catálogo. Comprueba que la API mock esté activa (npm run dev).');
}

export async function getJson(path, { force = false, fetcher = fetch, timeoutMs = 7000, now = Date.now } = {}) {
  if (!force && resolved.has(path) && resolved.get(path).expires > now()) {
    return resolved.get(path).data;
  }
  if (!force && pending.has(path)) return pending.get(path);

  const request = (async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetcher(path, { signal: controller.signal, headers: { Accept: 'application/json' } });
      if (!res.ok) {
        let detail = '';
        try { detail = (await res.json()).error; } catch { /* Respuesta sin JSON */ }
        if (res.status === 404) throw new BookApiError(detail || 'El recurso solicitado no existe (404).', 404);
        if (res.status >= 500) throw new BookApiError(detail || 'El servidor de prueba tuvo un problema (500).', res.status);
        throw new BookApiError(detail || `La solicitud no pudo completarse (HTTP ${res.status}).`, res.status);
      }
      const payload = await res.json();
      if (!payload || !Array.isArray(payload.data)) throw new BookApiError('La API respondió con un formato inesperado.');
      resolved.set(path, { data: payload.data, expires: now() + CACHE_MS });
      return payload.data;
    } catch (error) {
      throw explainError(error);
    } finally {
      clearTimeout(timeout);
    }
  })();
  pending.set(path, request);
  try { return await request; }
  finally { if (pending.get(path) === request) pending.delete(path); }
}

export const getBookCategories = (options) => getJson(URLs.categorias, options);
export const getBooks = (options) => getJson(URLs.libros, options);
export const isStaticBookCatalog = isPages;
export function resetBookApiCache() { resolved.clear(); pending.clear(); }

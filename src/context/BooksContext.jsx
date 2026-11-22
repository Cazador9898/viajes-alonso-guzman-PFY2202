import { createContext, useCallback, useContext, useRef, useState } from 'react';
import localCatalog from '../../server/data/catalogo.json';
import { getBooks, getBookCategories } from '../services/bookApi.js';

const BooksContext = createContext(null);
const empty = { categories: [], books: [], status: 'idle', error: '', source: '' };

export function BooksProvider({ children }) {
  const [state, setState] = useState(empty);
  const stateRef = useRef(state);
  const inFlight = useRef(null);
  const assign = useCallback((update) => {
    stateRef.current = { ...stateRef.current, ...update };
    setState(stateRef.current);
  }, []);

  const load = useCallback(async (force = false) => {
    if (!force && stateRef.current.status === 'success') return;
    if (inFlight.current) return inFlight.current;
    assign({ status: 'loading', error: '' });
    const request = Promise.all([getBookCategories({ force }), getBooks({ force })]);
    inFlight.current = request;
    try {
      const [categories, books] = await request;
      assign({ categories, books, status: 'success', error: '', source: 'api' });
    } catch (error) {
      // Si existían datos válidos, se conservan hasta que se pueda reintentar.
      assign({ status: 'error', error: error.message || 'No fue posible cargar el catálogo.' });
    } finally {
      inFlight.current = null;
    }
  }, [assign]);

  const useBackup = useCallback(() => {
    assign({ categories: localCatalog.categorias, books: localCatalog.libros,
      status: 'success', source: 'respaldo', error: 'Mostrando copia local. Los datos de la API no están disponibles en este momento.' });
  }, [assign]);

  return <BooksContext.Provider value={{ ...state, load, useBackup }}>{children}</BooksContext.Provider>;
}

export function useBooks() {
  const value = useContext(BooksContext);
  if (!value) throw new Error('useBooks requiere BooksProvider.');
  return value;
}

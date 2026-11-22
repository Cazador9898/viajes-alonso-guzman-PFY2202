import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { getTravelDestinations } from '../services/travelApi.js';

const TravelContext = createContext(null);

export function TravelProvider({ children }) {
  const [state, setState] = useState({ destinations: [], status: 'idle', error: '' });
  const current = useRef(state);
  const inflight = useRef(null);
  const assign = useCallback((change) => {
    current.current = { ...current.current, ...change };
    setState(current.current);
  }, []);

  const loadDestinations = useCallback(async (force = false) => {
    if (!force && current.current.status === 'success') return;
    if (inflight.current) return inflight.current;
    assign({ status: 'loading', error: '' });
    const request = getTravelDestinations({ force });
    inflight.current = request;
    try {
      const destinations = await request;
      assign({ destinations, status: 'success', error: '' });
    } catch (error) {
      assign({ status: 'error', error: error.message || 'No se encontraron destinos.' });
    } finally { inflight.current = null; }
  }, [assign]);

  return (
    <TravelContext.Provider value={{ ...state, loadDestinations }}>
      {children}
    </TravelContext.Provider>
  );
}

export function useTravel() {
  const context = useContext(TravelContext);
  if (!context) throw new Error('useTravel requiere TravelProvider.');
  return context;
}

export const travelCurrency = new Intl.NumberFormat('es-CL', {
  style: 'currency', currency: 'CLP', maximumFractionDigits: 0,
});

export function formatTravelPrice(value) {
  return travelCurrency.format(value);
}

export function searchDestinations(destinations, { query = '', continent = 'Todos' } = {}) {
  const term = query.toLocaleLowerCase('es').trim();
  return destinations.filter(destination =>
    (continent === 'Todos' || destination.continente === continent)
    && (!term || `${destination.ciudad} ${destination.pais} ${destination.actividades.join(' ')}`.toLocaleLowerCase('es').includes(term))
  );
}

export function availableFlights(flights) {
  return flights.filter(flight => flight.asientosDisponibles > 0);
}

export function availableHotels(hotels) {
  return hotels.filter(hotel => hotel.habitacionesDisponibles > 0);
}

/** Cotización informativa, no reserva real. */
export function calculateQuote(flight, hotel, nights) {
  return (flight?.precioCLP || 0) + (hotel?.precioNocheCLP || 0) * Math.max(1, nights);
}

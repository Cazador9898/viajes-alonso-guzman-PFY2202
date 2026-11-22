import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, BedDouble, CalendarDays, CheckCircle2,
  Clock3, MapPin, Plane, RefreshCcw, Server, ShieldCheck, Users,
} from 'lucide-react';
import { useTravel } from '../context/TravelContext.jsx';
import { getDestinationOptions, isTravelStaticPreview } from '../services/travelApi.js';
import { calculateQuote, formatTravelPrice } from '../utils/travel.js';
import { TravelNotice, TravelSectionTitle } from '../components/TravelUi.jsx';

function FlightCard({ flight, selected, onSelect }) {
  const available = flight.asientosDisponibles > 0;
  return <article className={`tv-option ${selected ? 'tv-option-selected' : ''} ${!available ? 'tv-option-unavailable' : ''}`}>
    <div className="tv-option-head"><span className="tv-option-icon"><Plane size={21} /></span><span className={`tv-availability ${available ? 'is-available' : ''}`}>{available ? `${flight.asientosDisponibles} asientos` : 'Agotado'}</span></div>
    <h3>{flight.aerolinea}</h3><p className="tv-option-sub">{flight.origen} → {flight.destino}</p>
    <div className="tv-option-details"><span><CalendarDays size={15} /> Ida: {flight.fechaSalida}</span><span><CalendarDays size={15} /> Regreso: {flight.fechaRegreso}</span><span><Clock3 size={15} /> {flight.duracion}</span></div>
    <div className="tv-option-foot"><div><small>Por persona · ida y vuelta</small><strong>{formatTravelPrice(flight.precioCLP)}</strong></div><button type="button" disabled={!available} aria-pressed={selected} onClick={() => onSelect(selected ? null : flight.id)}>{selected ? 'Seleccionado ✓' : available ? 'Elegir vuelo' : 'No disponible'}</button></div>
  </article>;
}

function HotelCard({ hotel, selected, onSelect }) {
  const available = hotel.habitacionesDisponibles > 0;
  return <article className={`tv-option ${selected ? 'tv-option-selected' : ''} ${!available ? 'tv-option-unavailable' : ''}`}>
    <div className="tv-option-head"><span className="tv-option-icon tv-hotel-icon"><BedDouble size={21} /></span><span className={`tv-availability ${available ? 'is-available' : ''}`}>{available ? `${hotel.habitacionesDisponibles} habitaciones` : 'Agotado'}</span></div>
    <div className="tv-stars" aria-label={`${hotel.estrellas} estrellas`}>{'★'.repeat(hotel.estrellas)}</div>
    <h3>{hotel.nombre}</h3><p className="tv-option-sub"><MapPin size={14} /> {hotel.ubicacion}</p>
    <div className="tv-option-details"><span><CalendarDays size={15} /> Entrada: {hotel.fechaEntrada}</span><span><CalendarDays size={15} /> Salida: {hotel.fechaSalida}</span><span><Users size={15} /> {hotel.servicios.join(' · ')}</span></div>
    <div className="tv-option-foot"><div><small>Por noche · habitación</small><strong>{formatTravelPrice(hotel.precioNocheCLP)}</strong></div><button type="button" disabled={!available} aria-pressed={selected} onClick={() => onSelect(selected ? null : hotel.id)}>{selected ? 'Seleccionado ✓' : available ? 'Elegir hotel' : 'No disponible'}</button></div>
  </article>;
}

export default function TravelDetail() {
  const { id } = useParams();
  const { destinations, status: destinationsStatus, error: destinationsError, loadDestinations } = useTravel();
  const [loadId, setLoadId] = useState(0);
  const [options, setOptions] = useState({ vuelos: [], hoteles: [] });
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [flightId, setFlightId] = useState(null);
  const [hotelId, setHotelId] = useState(null);
  const [confirmation, setConfirmation] = useState(false);

  useEffect(() => { loadDestinations(); }, [loadDestinations]);
  useEffect(() => {
    let active = true;
    setStatus('loading');setError('');setFlightId(null);setHotelId(null);setConfirmation(false);
    getDestinationOptions(id, { force: loadId > 0 })
      .then(data => { if (active) { setOptions(data);setStatus('success'); } })
      .catch(reason => { if (active) { setOptions({ vuelos: [], hoteles: [] });setError(reason.message);setStatus('error'); } });
    return () => { active = false; };
  }, [id, loadId]);

  const destination = destinations.find(entry => entry.id === id);
  const selectedFlight = useMemo(() => options.vuelos.find(flight => flight.id === flightId), [options, flightId]);
  const selectedHotel = useMemo(() => options.hoteles.find(hotel => hotel.id === hotelId), [options, hotelId]);
  const nights = Math.max(1, (destination?.diasSugeridos || 4) - 1);
  const total = calculateQuote(selectedFlight, selectedHotel, nights);

  if (!destination) {
    return <div className="tv-page page-enter"><Link className="tv-back" to="/viajes"><ArrowLeft size={16} /> Volver a destinos</Link>
      <TravelNotice status={destinationsStatus} error={destinationsError} onRetry={() => loadDestinations(true)} />
      {destinationsStatus === 'success' && <div className="tv-empty">No existe el destino solicitado. <Link to="/viajes">Ver todos los destinos</Link></div>}
    </div>;
  }

  return <div className="tv-page page-enter">
    <Link to="/viajes" className="tv-back"><ArrowLeft size={16} /> Todos los destinos</Link>
    <section className="tv-detail-hero" style={{ '--tv-tint': destination.color }}>
      <div><span className="tv-eyebrow">PLANIFICA TU VIAJE</span><h1>{destination.ciudad}<span>, {destination.pais}</span></h1><p>{destination.descripcion}</p>
        <div className="tv-detail-facts"><span><MapPin size={16} /> {destination.continente}</span><span><CalendarDays size={16} /> {destination.diasSugeridos} días sugeridos</span><span><CheckCircle2 size={16} /> {destination.mejorTemporada}</span></div>
      </div><div className="tv-detail-emoji" aria-hidden="true">{destination.emoji}</div>
    </section>
    <div className="tv-activities"><strong>Actividades populares</strong><div>{destination.actividades.map(activity => <span key={activity}>{activity}</span>)}</div></div>
    <div className="tv-detail-source"><Server size={16} /> {isTravelStaticPreview ? 'Datos de GraphQL precargados para GitHub Pages' : 'Consulta real POST /graphql con variable destinoId'}<span>Datos académicos ficticios</span></div>

    {status !== 'success' && <TravelNotice status={status} error={error} onRetry={() => setLoadId(current => current + 1)} />}
    {status === 'success' && <>
      <section className="tv-options-section" aria-labelledby="tv-flights-title"><TravelSectionTitle eyebrow="PASO 1 · TRANSPORTE" title={<span id="tv-flights-title">Vuelos disponibles</span>} description="Consulta GraphQL filtrada para este destino. Selecciona un vuelo con asientos disponibles." />
        {options.vuelos.length === 0 ? <div className="tv-empty">Por ahora no hay vuelos registrados para este destino.</div> : <div className="tv-options-grid">{options.vuelos.map(flight => <FlightCard key={flight.id} flight={flight} selected={flightId === flight.id} onSelect={value => {setFlightId(value);setConfirmation(false);}} />)}</div>}
      </section>
      <section className="tv-options-section" aria-labelledby="tv-hotels-title"><TravelSectionTitle eyebrow="PASO 2 · ALOJAMIENTO" title={<span id="tv-hotels-title">Hoteles disponibles</span>} description="Compara precios por noche, servicios y habitaciones disponibles." />
        {options.hoteles.length === 0 ? <div className="tv-empty">Por ahora no hay hoteles registrados para este destino.</div> : <div className="tv-options-grid">{options.hoteles.map(hotel => <HotelCard key={hotel.id} hotel={hotel} selected={hotelId === hotel.id} onSelect={value => {setHotelId(value);setConfirmation(false);}} />)}</div>}
      </section>

      <section className="tv-summary" aria-label="Resumen del viaje"><div><span className="tv-eyebrow">PASO 3 · RESUMEN</span><h2>Tu viaje a {destination.ciudad}</h2><p>Selecciona vuelo y hotel para obtener una cotización referencial.</p>
        <div className="tv-summary-items"><span><Plane size={16} /> {selectedFlight ? selectedFlight.aerolinea : 'Sin vuelo seleccionado'}</span><span><BedDouble size={16} /> {selectedHotel ? `${selectedHotel.nombre} · ${nights} noches (estimadas)` : 'Sin hotel seleccionado'}</span></div>
        <small>Precios ficticios en CLP. El cálculo usa {nights} noches sugeridas y no comprueba coincidencia de fechas ni impuestos.</small></div>
        <div className="tv-summary-total"><span>Total estimado</span><strong>{formatTravelPrice(total)}</strong><button disabled={!selectedFlight || !selectedHotel} type="button" onClick={() => setConfirmation(true)}>{confirmation ? 'Selección preparada ✓' : 'Preparar itinerario'} <ArrowRight size={16} /></button><small>{confirmation ? 'Plan preparado en esta pantalla. No se realizó ninguna reserva.' : 'Demostración, sin pagos ni reservas'}</small></div>
      </section>
      {confirmation && <div role="status" className="tv-confirmation"><ShieldCheck size={20} /> Selección registrada temporalmente en pantalla. Esta aplicación académica no realiza compras.</div>}
      <button type="button" className="tv-refresh" onClick={() => setLoadId(current => current + 1)}><RefreshCcw size={16} /> Volver a consultar disponibilidad</button>
    </>}
  </div>;
}

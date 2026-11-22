import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Compass, Globe2, MapPin, PlaneTakeoff, Search, Server, ShieldCheck, Sparkles } from 'lucide-react';
import { useTravel } from '../context/TravelContext.jsx';
import { TravelNotice, TravelSectionTitle } from '../components/TravelUi.jsx';
import { searchDestinations } from '../utils/travel.js';
import { isTravelStaticPreview } from '../services/travelApi.js';

function DestinationCard({ destination }) {
  return (
    <Link className="tv-destination" to={`/viajes/destino/${destination.id}`} aria-label={`Explorar ${destination.ciudad}, ${destination.pais}`}>
      <div className="tv-destination-art" style={{ background: destination.color }}>
        <span aria-hidden="true">{destination.emoji}</span>
        <div className="tv-destination-country">{destination.continente}</div>
      </div>
      <div className="tv-destination-copy">
        <span className="tv-subline"><MapPin size={14} /> {destination.pais}</span>
        <h3>{destination.ciudad}</h3>
        <p>{destination.descripcion}</p>
        <div className="tv-tags">{destination.actividades.slice(0, 2).map(activity => <span key={activity}>{activity}</span>)}</div>
        <span className="tv-go">Ver vuelos y hoteles <ArrowRight size={17} /></span>
      </div>
    </Link>
  );
}

export default function TravelCatalog() {
  const { destinations, status, error, loadDestinations } = useTravel();
  const [query, setQuery] = useState('');
  const [continent, setContinent] = useState('Todos');
  useEffect(() => { loadDestinations(); }, [loadDestinations]);
  const continents = useMemo(() => ['Todos', ...new Set(destinations.map(d => d.continente))], [destinations]);
  const filtered = useMemo(() => searchDestinations(destinations, { query, continent }), [destinations, query, continent]);

  return <div className="tv-page page-enter">
    <section className="tv-hero" aria-labelledby="viajes-title">
      <div className="tv-orbit tv-orbit-a" /><div className="tv-orbit tv-orbit-b" />
      <div className="tv-hero-content">
        <span className="tv-hero-label"><Sparkles size={15} /> NUEVO · SEMANA 5 · EXPERIENCIA 2</span>
        <h1 id="viajes-title">Tu próximo destino <em>empieza aquí.</em></h1>
        <p>Descubre ciudades, compara vuelos y revisa hoteles en una sola experiencia de planificación con getiomark Viajes.</p>
        <a href="#explorar" className="tv-hero-action">Explorar destinos <ArrowRight size={17} /></a>
      </div>
      <div className="tv-hero-visual" aria-hidden="true"><div className="tv-floating-ticket"><span>GETIOMARK TRAVEL</span><span>✈</span><strong>SCL <span>→</span> DESTINO</strong><small>Empieza a planear tu aventura</small></div><div className="tv-globe">🌎</div></div>
    </section>

    <div className="tv-tech-strip" aria-label="Tecnologías utilizadas">
      <span><Server size={16} /> {isTravelStaticPreview ? 'Vista estática REST de demostración' : 'Destinos consultados con GET /api/destinos'}</span>
      <span><ShieldCheck size={16} /> {isTravelStaticPreview ? 'Opciones precargadas de GraphQL' : 'Vuelos y hoteles mediante POST /graphql'}</span>
      <span><Globe2 size={16} /> Datos ficticios para evaluación</span>
    </div>

    <section id="explorar" className="tv-catalog" aria-labelledby="destinos-title">
      <TravelSectionTitle eyebrow="EXPLORA EL MUNDO" title="Destinos disponibles" description="Elige una ciudad para conocer sus actividades y consultar vuelos y hoteles de ejemplo." right={`${filtered.length} resultados`} />
      <div className="tv-searchbar">
        <label className="tv-search-input"><Search size={19} aria-hidden="true" /><span className="sr-only">Buscar destino</span>
          <input value={query} type="search" onChange={event => setQuery(event.target.value)} placeholder="Buscar ciudad, país o actividad..." />
        </label>
        <label className="tv-select-wrap"><Compass size={17} aria-hidden="true" /><span className="sr-only">Filtrar continente</span>
          <select value={continent} onChange={event => setContinent(event.target.value)}>
            {continents.map(item => <option value={item} key={item}>{item === 'Todos' ? 'Todos los continentes' : item}</option>)}
          </select>
        </label>
      </div>

      {status === 'error' && destinations.length > 0 && <TravelNotice status="error" error={error} onRetry={() => loadDestinations(true)} />}
      {destinations.length === 0 && <TravelNotice status={status} error={error} onRetry={() => loadDestinations(true)} />}
      {filtered.length > 0 && <div className="tv-grid">{filtered.map(destination => <DestinationCard destination={destination} key={destination.id} />)}</div>}
      {status === 'success' && filtered.length === 0 && <div className="tv-empty">No encontramos destinos con esos filtros. Prueba otra búsqueda.</div>}
    </section>
    <section className="tv-explainer" aria-label="Cómo funciona"><div className="tv-explainer-icon"><PlaneTakeoff size={25} /></div><div>
      <strong>¿Cómo funciona la planificación?</strong><p>Primero consultamos los destinos desde REST. Después, al elegir uno, React envía una consulta GraphQL para obtener solamente sus vuelos y hoteles. Los datos son de demostración y no representan reservas reales.</p>
    </div></section>
  </div>;
}

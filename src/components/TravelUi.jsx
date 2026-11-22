import { AlertTriangle, ChevronRight, LoaderCircle, RefreshCcw } from 'lucide-react';

export function TravelNotice({ status, error, onRetry }) {
  if (status === 'loading' || status === 'idle') {
    return (
      <div className="tv-feedback tv-loading" role="status" aria-live="polite">
        <LoaderCircle size={22} className="tv-spin" aria-hidden="true" /> Consultando información del servidor de prueba...
      </div>
    );
  }
  if (status === 'error') {
    return (
      <div className="tv-feedback tv-error" role="alert">
        <AlertTriangle size={22} aria-hidden="true" />
        <div><strong>No se pudieron cargar los datos.</strong><p>{error}</p>
          <button type="button" onClick={onRetry}><RefreshCcw size={15} /> Reintentar consulta</button></div>
      </div>
    );
  }
  return null;
}

export function TravelSectionTitle({ eyebrow, title, description, right }) {
  return <div className="tv-section-heading"><div>
    <span className="tv-eyebrow">{eyebrow}</span>
    <h2>{title}</h2>
    {description && <p>{description}</p>}
  </div>{right && <div className="tv-heading-right">{right} <ChevronRight size={15} /></div>}</div>;
}

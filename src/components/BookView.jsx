import { BookOpen, ChevronRight, RefreshCcw, WifiOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatCLP } from '../utils/bookFilters.js';

export function CatalogFeedback({ status, error, load, useBackup, hasData }) {
  if (status === 'loading' && hasData) return (
    <div className="bk-refreshing" role="status" aria-live="polite"><span className="bk-spinner" aria-hidden="true" /> Actualizando el catálogo desde la API...</div>
  );
  if (status === 'loading' && !hasData) return (
    <div className="bk-panel bk-loading" role="status" aria-live="polite">
      <span className="bk-spinner" aria-hidden="true" /> Consultando categorías y libros en la API REST...
    </div>
  );
  if (status !== 'error') return null;
  return (
    <div className="bk-panel bk-error" role="alert">
      <WifiOff size={24} />
      <div><strong>No se pudo consultar el catálogo</strong><p>{error}</p>
        <div className="bk-actions">
          <button type="button" className="button button-primary" onClick={() => load(true)}><RefreshCcw size={15} /> Reintentar</button>
          <button type="button" className="button button-outline" onClick={useBackup}>Ver copia sin conexión</button>
        </div>
      </div>
    </div>
  );
}

export function BookCard({ book, category }) {
  return (
    <article className="bk-book">
      <Link to={`/libreria/libro/${encodeURIComponent(book.id)}`} className="bk-book-cover" style={{ background: category?.color ?? '#ebf2eb' }} aria-label={`Ver detalle de ${book.titulo}`}>
        <span aria-hidden="true">{category?.emoji ?? '📖'}</span>
        <span className="bk-cover-label">GETIOMARK · LIBROS</span>
      </Link>
      <div className="bk-book-info">
        <p className="bk-book-category">{category?.nombre ?? 'Libros'}</p>
        <h3><Link to={`/libreria/libro/${encodeURIComponent(book.id)}`}>{book.titulo}</Link></h3>
        <p className="bk-book-author">{book.autor}</p>
        <div className="bk-book-footer"><strong>{formatCLP(book.precio)}</strong>
          <Link aria-label={`Ver ${book.titulo}`} to={`/libreria/libro/${encodeURIComponent(book.id)}`} className="bk-book-arrow"><ChevronRight size={18} /></Link>
        </div>
      </div>
    </article>
  );
}

export function EmptyBooks({ text = 'No encontramos libros con esos filtros.' }) {
  return <div className="bk-empty"><BookOpen size={35} /><p>{text}</p><Link className="button button-outline" to="/libreria">Ver todas las categorías</Link></div>;
}

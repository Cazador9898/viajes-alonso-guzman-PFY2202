import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, CalendarDays, Layers3 } from 'lucide-react';
import { useBooks } from '../context/BooksContext.jsx';
import { formatCLP } from '../utils/bookFilters.js';
import { BookCard, CatalogFeedback } from '../components/BookView.jsx';

export default function BookDetail() {
  const { id } = useParams();
  const { categories, books, status, error, load, useBackup } = useBooks();
  useEffect(() => { load(); }, [load]);
  const book = books.find((item) => item.id === id);
  const category = categories.find((c) => c.id === book?.categoriaId);
  const related = books.filter((item) => item.categoriaId === book?.categoriaId && item.id !== id).slice(0, 3);
  return <div className="bk-page page-enter">
    <div className="bk-breadcrumb"><Link to="/libreria"><ArrowLeft size={17} /> Volver a la librería</Link> {category && <span>/ {category.nombre}</span>}</div>
    <CatalogFeedback status={status} error={error} load={load} useBackup={useBackup} hasData={books.length > 0} />
    {status === 'success' && !book && <div className="bk-panel bk-error"><div><h2>Libro no encontrado</h2><p>El título solicitado no existe en el catálogo.</p><Link className="button button-primary" to="/libreria">Regresar a la librería</Link></div></div>}
    {book && <>
      <article className="bk-detail">
        <div className="bk-detail-cover" style={{ background: category?.color ?? '#eff4ee' }}><span>{category?.emoji ?? '📚'}</span><small>GETIOMARK · EDICIÓN DIGITAL</small></div>
        <div className="bk-detail-copy"><span className="bk-detail-category">{category?.nombre}</span><h1>{book.titulo}</h1>
          <p className="bk-detail-author">Escrito por {book.autor}</p><p className="bk-detail-description">{book.descripcion}</p>
          <div className="bk-detail-metadata"><span><CalendarDays size={17} /> Año {book.anio}</span><span><Layers3 size={17} /> {book.paginas} páginas</span><span><BookOpen size={17} /> {book.disponible ? 'Disponible' : 'No disponible'}</span></div>
          <strong className="bk-detail-price">{formatCLP(book.precio)}</strong><p className="bk-disclaimer">Catálogo académico de ejemplo. No se procesan compras ni pagos reales.</p>
          <Link className="button button-primary" to={`/libreria/categoria/${book.categoriaId}`}>Ver más títulos de {category?.nombre}</Link>
        </div>
      </article>
      <section className="bk-section"><div className="bk-heading"><div><span className="section-kicker">PODRÍAN INTERESARTE</span><h2>Más de {category?.nombre}</h2></div></div>
        <div className="bk-books">{related.map((item) => <BookCard key={item.id} book={item} category={category} />)}</div>
      </section>
    </>}
  </div>;
}

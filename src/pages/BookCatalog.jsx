import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, BookOpen, LibraryBig, RefreshCcw, Search, Server, ShieldCheck } from 'lucide-react';
import { useBooks } from '../context/BooksContext.jsx';
import { filterBooks } from '../utils/bookFilters.js';
import { BookCard, CatalogFeedback, EmptyBooks } from '../components/BookView.jsx';
import { isStaticBookCatalog } from '../services/bookApi.js';

export default function BookCatalog() {
  const { categoria } = useParams();
  const selected = categoria || 'todas';
  const [query, setQuery] = useState('');
  const [order, setOrder] = useState('titulo');
  const { categories, books, status, error, source, load, useBackup } = useBooks();

  useEffect(() => { load(); }, [load]);
  const filtered = useMemo(() => filterBooks(books, { category: selected, query, order }), [books, selected, query, order]);
  const category = categories.find((item) => item.id === selected);
  const invalidCategory = status === 'success' && selected !== 'todas' && !category;
  return (
    <div className="bk-page page-enter">
      <section className="bk-hero">
        <div className="bk-hero-content"><span className="bk-kicker"><LibraryBig size={15} /> NUEVO · SEMANA 4</span>
          <h1>Una biblioteca de <em>nuevas historias.</em></h1>
          <p>Explora libros por categoría, descubre nuevos títulos y aprende cómo React consulta una API REST de prueba.</p>
          <button type="button" className="button button-lime" onClick={() => document.getElementById('categorias')?.scrollIntoView({ behavior: 'smooth' })}><BookOpen size={16} /> Explorar categorías <ArrowRight size={16} /></button>
        </div>
        <div className="bk-hero-emblem" aria-hidden="true"><span>📚</span><small>Historias para todos</small></div>
      </section>

      <div className="bk-source" role="status">
        <span><Server size={16} /> Catálogo de ejemplo · {isStaticBookCatalog ? 'GET JSON publicado en GitHub Pages' : 'Mock REST local GET /api/categorias'}</span>
        <span><ShieldCheck size={16} /> {source === 'respaldo' ? 'Copia de respaldo' : status === 'success' ? 'Datos consultados' : 'Consulta pendiente'}</span>
        {(status === 'success' || status === 'loading' && books.length > 0) && <button type="button" className="bk-refresh-button" disabled={status === 'loading'} onClick={() => load(true)}><RefreshCcw size={14} /> Actualizar datos</button>}
      </div>
      {source === 'respaldo' && <p className="bk-backup" role="status">{error} <button type="button" onClick={() => load(true)}>Reintentar conexión</button></p>}
      <CatalogFeedback status={status} error={error} load={load} useBackup={useBackup} hasData={books.length > 0} />

      {(status === 'success' || books.length > 0) && <>
        <section id="categorias" aria-labelledby="categorias-title" className="bk-section">
          <div className="bk-heading"><div><span className="section-kicker">EXPLORA TU PRÓXIMA LECTURA</span>
            <h2 id="categorias-title">Categorías <span className="bk-counter">{categories.length}</span></h2>
            <p>Selecciona un género para descubrir los libros disponibles.</p></div>
            <span className="bk-small-note">Información obtenida mediante HTTP GET</span>
          </div>
          <div className="bk-categories">
            {categories.map((item) => <Link key={item.id} to={`/libreria/categoria/${item.id}`} aria-current={selected === item.id ? 'page' : undefined} className={`bk-category ${selected === item.id ? 'chosen' : ''}`} style={{ '--bk-card-bg': item.color }}>
              <span className="bk-category-emoji" aria-hidden="true">{item.emoji}</span>
              <strong>{item.nombre}</strong><span>{books.filter((book) => book.categoriaId === item.id).length} libros</span>
              <ArrowRight size={16} aria-hidden="true" className="bk-category-arrow" />
            </Link>)}
          </div>
        </section>

        <section className="bk-section bk-list-section" aria-labelledby="libros-title">
          <div className="bk-heading"><div><span className="section-kicker">CATÁLOGO DE EJEMPLO</span>
            <h2 id="libros-title">{category ? category.nombre : 'Todos los libros'} <span className="bk-counter">{filtered.length}</span></h2>
            <p>{category?.descripcion ?? 'Explora el catálogo y encuentra tu próxima lectura.'}</p></div>
            {selected !== 'todas' && <Link className="button button-outline" to="/libreria">Ver todas las categorías</Link>}
          </div>
          <div className="bk-tools"><label className="bk-search"><Search size={17} /><span className="sr-only">Buscar libros</span>
            <input type="search" placeholder="Buscar por título, autor o descripción..." value={query} onChange={(event) => setQuery(event.target.value)} /></label>
            <label className="bk-sort">Ordenar <select aria-label="Ordenar libros" value={order} onChange={(event) => setOrder(event.target.value)}>
              <option value="titulo">Por título</option><option value="precio-asc">Precio: menor a mayor</option><option value="precio-desc">Precio: mayor a menor</option>
            </select></label>
          </div>
          {invalidCategory ? <EmptyBooks text="La categoría solicitada no existe." />
            : filtered.length === 0 ? <EmptyBooks />
              : <div className="bk-books">{filtered.map((book) => <BookCard key={book.id} book={book} category={categories.find((c) => c.id === book.categoriaId)} />)}</div>}
        </section>
      </>}
    </div>
  );
}

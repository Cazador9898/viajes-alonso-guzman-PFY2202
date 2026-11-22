/** Utilidades puras y comprobables del catálogo de libros. */
export function filterBooks(books, { category = 'todas', query = '', order = 'titulo' } = {}) {
  const term = String(query).trim().toLocaleLowerCase('es');
  const selected = books.filter((b) => (category === 'todas' || b.categoriaId === category)
    && (!term || `${b.titulo} ${b.autor} ${b.descripcion}`.toLocaleLowerCase('es').includes(term)));
  const comparator = order === 'precio-asc' ? (a, b) => a.precio - b.precio
    : order === 'precio-desc' ? (a, b) => b.precio - a.precio
      : (a, b) => a.titulo.localeCompare(b.titulo, 'es');
  return [...selected].sort(comparator); // No modifica el arreglo original.
}
export const formatCLP = (price) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(price);

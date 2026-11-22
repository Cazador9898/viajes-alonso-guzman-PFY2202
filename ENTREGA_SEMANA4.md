# Entrega Semana 4 | getiomark

- Curso: Desarrollo Frontend II (PFY2202)
- Estudiante: Alonso Guzmán
- Experiencia 2, Semana 4, evaluación formativa.

## Objetivo

Integrar React con una API REST de prueba para explorar categorías de libros. El módulo Librería se incorporó al proyecto getiomark sin borrar las pantallas de inventario y carrito de las semanas anteriores.

## Requisitos desarrollados

1. Aplicación de tienda de libros con ocho categorías de ejemplo y fichas de libros.
2. Navegación React Router a listado, categoría y detalle de libro.
3. Endpoint REST mock local `GET /api/categorias` y endpoint `GET /api/libros`.
4. Estados de carga, mensajes de error y opciones de reintentar o ver respaldo local.
5. Consultas eficientes mediante caché y filtro local sin peticiones repetidas.
6. Publicación preparada para GitHub Pages con respuestas JSON GET estáticas.

## Evidencia sugerida para mostrar al docente

- Inicio del módulo «Librería» con sus categorías.
- Filtrado por «Ciencia ficción» y visualización del detalle de un libro.
- Consulta `http://localhost:3001/api/categorias` devolviendo JSON en el navegador.
- Respuesta de error `404` al consultar `http://localhost:3001/api/libros/inexistente`.
- Indicador de carga, botón de reintento y alternativa de respaldo.
- `npm test` y `npm run build` ejecutados correctamente en el computador.
- Repositorio actualizado y página GitHub Pages funcionando.

## Observación

Las instrucciones de la actividad piden una tienda de libros, pero especifican un nombre de repositorio que empieza con `hospital-`. Se ha conservado el repositorio de las semanas anteriores porque este proyecto es su continuación. Confirmar con el docente si corresponde renombrarlo.

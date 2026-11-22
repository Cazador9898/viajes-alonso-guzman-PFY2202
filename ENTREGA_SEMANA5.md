# Entrega de Semana 5 · Evaluación sumativa · PFY2202

Proyecto: getiomark Viajes · Autor: Alonso Guzmán.

## Relación con la pauta

1. Interfaz gráfica y responsiva: `src/pages/TravelCatalog.jsx`, `src/pages/TravelDetail.jsx` y `src/styles/travel.css` con tarjetas y formularios responsive.
2. API REST mock: `GET /api/destinos` y `GET /api/destinos/:id` en `server/mock-api.mjs`, consumidos mediante `src/services/travelApi.js`.
3. API GraphQL mock: `POST /graphql` con esquema y resolvers de `server/travel-graphql.mjs`. El frontend envía `OPTIONS_QUERY` y la variable `destinoId` para consultar vuelos y hoteles por destino.
4. React Router: rutas `/`, `/viajes`, `/viajes/destino/:id` y navegación hacia componentes anteriores.
5. Modularidad: `TravelContext`, servicios REST/GraphQL, componentes de indicadores, páginas y utilidades separados.
6. Estado dinámico: `useState`, `useEffect`, `useMemo`, filtro, opciones seleccionadas, indicador de carga, errores, reintentos.
7. GitHub y GitHub Pages: flujo `.github/workflows/deploy.yml`, `README.md` y modo snapshot estático. La publicación debe realizarse desde la cuenta GitHub del estudiante.
8. Pruebas en navegadores: ejecutar manualmente en Chrome, Edge y Firefox, incluyendo pantalla móvil y captura de evidencia.

## Pruebas recomendadas para demostrar

- Inicio de Viajes: comprobar consulta REST GET en Network y 8 destinos cargados.
- Escribir `madrid` en búsqueda y filtrar por `Europa`, cambiar de filtros y observar resultados correctos.
- Abrir Madrid: comprobar consulta GraphQL POST en Network y la variable `{ "destinoId": "madrid" }`.
- Seleccionar un vuelo disponible y hotel con habitaciones; comprobar el resumen de valores referenciales.
- Intentar seleccionar una alternativa con disponibilidad 0 (debe estar deshabilitada).
- Pulsar "Volver a consultar disponibilidad", comprobar estado de carga y actualización.
- Abrir destino inexistente en local `/viajes/destino/invalido` y comprobar respuesta visual.
- Detener el mock API y recargar: debe aparecer aviso de conexión con botón de reintentar.
- Comprobar que las funciones de inventario, carrito y librería siguen accesibles.
- Ejecutar `npm test` y `npm run build` antes de subir la entrega.

## Diferencia del despliegue web y el backend

En local se ejecutan REST y GraphQL auténticos mediante Node. GitHub Pages no ejecuta servidores: muestra una copia JSON de las respuestas para facilitar la demostración de navegación, sin afirmar que aloje GraphQL.

## Enlace que debes completar cuando publiques

- URL del repositorio GitHub: pegar aquí.
- URL de GitHub Pages: pegar aquí.
- Capturas Chrome: adjuntar.
- Capturas Edge: adjuntar.
- Capturas Firefox: adjuntar.

## Consideración del repositorio

La Semana 5 indica `viajes-nombre-apellido-siglaCurso`. Si el docente exige ese formato literal, se sugiere `viajes-alonso-guzman-PFY2202`; el repositorio previo `DESARROLLO-FRONTEND-II_002A` puede renombrarse sin perder su historial.

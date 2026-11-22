# getiomark | Desarrollo Frontend II (PFY2202) | Semana 5

Autor: Alonso Guzmán. Actividad: Experiencia 2, Semana 5, evaluación sumativa.

## Qué contiene

Actualización del proyecto de las semanas 1 a 4. La pantalla principal es ahora **getiomark Viajes**, una **agencia de viajes de prueba** desarrollada con React, React Router, JavaScript, HTML y CSS (Tailwind CSS + estilos propios). Se conservan el inventario, carrito y librería de las semanas anteriores mediante enlaces del menú superior.

La interfaz permite:

- Consultar 8 destinos turísticos con ciudad, país, continente y actividades populares mediante REST GET.
- Buscar por ciudad/país/actividad y filtrar por continente sin modificar los datos originales.
- Abrir el detalle de un destino con React Router y consultar sus vuelos y hoteles mediante **GraphQL POST** con una variable `destinoId`.
- Revisar precios en pesos chilenos, fechas y disponibilidad simulada.
- Seleccionar vuelo y hotel si existen cupos, y preparar una cotización referencial de ejemplo (no genera reservas reales).
- Visualizar estados de carga, fallos de conexión, datos vacíos, avisos y botón de reintentar.
- Mantener el proyecto anterior (inventario, carrito, librería, acerca de y contacto).

**Aviso:** destinos, vuelos y hoteles son inventados para la actividad académica. Los precios no son ofertas reales y el sistema no permite comprar ni reservar.

## Inicio local (recomendado para evaluar REST + GraphQL reales)

Instala Node.js 22 o compatible con Vite 6, abre esta carpeta en Visual Studio Code y ejecuta:

```bash
npm install
npm run dev
```

Abre **http://localhost:5173/**. `npm run dev` inicia React/Vite y el backend mock juntos. La API se ejecuta en **http://localhost:3001**; Vite redirige `/api` y `/graphql` al servidor Node.

Puedes probar REST en un navegador:

- `http://localhost:3001/api/destinos`
- `http://localhost:3001/api/destinos?q=madrid`
- `http://localhost:3001/api/destinos/paris`
- `http://localhost:3001/api/salud`

Consulta GraphQL de prueba (en PowerShell):

```powershell
$body = @{
  query = 'query OpcionesDestino($destinoId: ID!) { vuelos(destinoId: $destinoId) { id aerolinea precioCLP fechaSalida asientosDisponibles } hoteles(destinoId: $destinoId) { id nombre precioNocheCLP habitacionesDisponibles } }'
  variables = @{ destinoId = 'paris' }
} | ConvertTo-Json -Depth 5
Invoke-RestMethod -Uri 'http://localhost:3001/graphql' -Method Post -ContentType 'application/json' -Body $body
```

Respuesta GraphQL real: `data.vuelos` y `data.hoteles` filtrados por el destino indicado. El servidor utiliza el paquete oficial `graphql` (`buildSchema` y `graphql`) para validar consultas, campos y variables.

### Otros comandos

```bash
npm run api       # ejecutar solo el mock Node
npm run dev:web   # ejecutar solo el frontend
npm test          # pruebas automatizadas
npm run build     # compilar para producción
npm run preview   # revisar build; iniciar npm run api aparte si requiere GraphQL local
```

Si `npm run dev:web` se ejecuta sin la API, la sección Viajes mostrará un aviso de error y la opción de reintentar. Para verificar la integración real debes usar `npm run dev`.

## Rutas de la aplicación

| Página | Ruta |
| --- | --- |
| Agencia de viajes (inicio) | `/` |
| Agencia de viajes (acceso alternativo) | `/viajes` |
| Detalle con vuelos/hoteles | `/viajes/destino/:id` |
| Inventario anterior | `/inventario` |
| Nuevo artículo | `/articulos/nuevo` |
| Lista de artículos | `/articulos/listado` |
| Detalle de artículo | `/articulos/:id` |
| Carrito | `/carrito` |
| Librería de Semana 4 | `/libreria` |
| Libros por categoría | `/libreria/categoria/:categoria` |
| Detalle libro | `/libreria/libro/:id` |
| Quiénes somos | `/quienes-somos` |
| Contacto | `/contacto` |

## Implementación técnica

```text
getiomark/
├─ .github/workflows/deploy.yml   # GitHub Pages automático
├─ public/mock/                   # Copias JSON de prueba para Pages
├─ server/
│  ├─ data/viajes.json            # Destinos, vuelos y hoteles de muestra
│  ├─ data/catalogo.json          # Datos de libros (Semana 4)
│  ├─ mock-api.mjs                # REST GET + endpoint POST /graphql
│  └─ travel-graphql.mjs          # Esquema y resolvers de GraphQL
├─ src/
│  ├─ context/TravelContext.jsx   # Estado global, control de carga REST
│  ├─ services/travelApi.js       # fetch REST/GraphQL, caché y errores
│  ├─ components/TravelUi.jsx     # Indicadores y componentes compartidos
│  ├─ pages/TravelCatalog.jsx     # Búsqueda, filtro y tarjetas
│  ├─ pages/TravelDetail.jsx      # Vuelos, hoteles y resumen
│  ├─ utils/travel.js             # Filtros, disponibilidad, cotización
│  ├─ styles/travel.css           # CSS responsive
│  └─ App.jsx                     # Rutas y navegación actualizadas
├─ scripts/sync-mock.mjs          # Copias JSON estáticas para Pages
└─ tests/travel.test.js           # Pruebas de REST, GraphQL y filtros
```

REST y GraphQL se implementan como **endpoints independientes**. REST devuelve los destinos (`GET /api/destinos`). GraphQL recupera vuelos y hoteles del destino seleccionado (`POST /graphql`). `travelApi.js` usa caché temporal de 2 minutos para no duplicar solicitudes iguales. Los componentes utilizan `useState` y `useEffect` para manejar carga, errores, selección y actualización.

### GitHub Pages: diferencia importante

GitHub Pages **solo aloja archivos estáticos**. Para poder mostrar la interfaz publicada, el flujo de build copia los registros del backend a `public/mock/destinos.json` y `public/mock/opciones-viaje.json`. En esa vista web se usa `fetch` sobre JSON estático y se filtra la **copia** del resultado de GraphQL. Esto **no es** un endpoint GraphQL ejecutándose en Pages.

Para demostrar los puntos REST y GraphQL de la pauta al docente, ejecuta el proyecto localmente con `npm run dev` y muestra la pestaña **Network/Red** del navegador:

- GET `/api/destinos` al cargar el catálogo.
- POST `/graphql` al abrir un destino, con `query` y `variables.destinoId`.

Si necesitas que GraphQL ejecute consultas en una web pública, deberás hospedar el backend Node en otro servicio que ejecute procesos, o usar la demostración local para la entrega.

## Publicación en GitHub

El repositorio utilizado antes era `Cazador9898/DESARROLLO-FRONTEND-II_002A`. La consigna de la Semana 5 pide específicamente el formato **`viajes-nombre-apellido-siglaCurso`**, por ejemplo `viajes-alonso-guzman-PFY2202`.

1. Guarda una copia de la versión anterior, descarga el proyecto y copia el **contenido** de esta carpeta sobre tu clon local del repositorio anterior, conservando `.git`.
2. Ejecuta `npm install`, `npm test` y `npm run build` para verificar.
3. Sube los cambios: `git add -A`, `git commit -m "Semana 5 - Viajes REST y GraphQL"`, `git push origin main`.
4. En GitHub revisa `Settings > Pages > Source: GitHub Actions`.
5. Comprueba que el workflow `Publicar getiomark en GitHub Pages` termine en verde y abre la URL pública.
6. Para ajustar el nombre del repositorio a la consigna, renómbralo desde GitHub > Settings > General > Repository name. Si lo renombras, actualiza la URL remota local con `git remote set-url origin https://github.com/Cazador9898/viajes-alonso-guzman-PFY2202.git`.

La base de rutas de Vite en Pages se configura automáticamente a partir del nombre actual del repositorio (`GITHUB_REPOSITORY`).

## Pruebas de navegador requeridas por la pauta

Después de compilar, revisa Chrome, Firefox y Edge: carga del inicio, navegación al detalle, selección de vuelo y hotel, validación de agotados, respuesta al filtro y presentación en pantalla móvil. La automatización por sí sola no prueba visualmente los distintos navegadores; anota resultados y captura evidencias cuando corresponda.

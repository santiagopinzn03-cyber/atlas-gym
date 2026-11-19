# Atlas

PWA de entrenamiento con React, Vite, Tailwind CSS y Supabase. La aplicación no incluye modo demo: todos los datos proceden de la sesión autenticada con Google.

## Puesta en marcha

1. Copia `.env.example` a `.env` y completa `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY` (o `VITE_SUPABASE_ANON_KEY`).
2. Ejecuta `supabase/schema.sql` en el editor SQL de tu proyecto Supabase.
3. Activa el proveedor Google en Authentication → Providers y registra la URL de la app como URL de redirección permitida.
4. Instala dependencias con `npm install`.
5. Desarrollo: `npm run dev`. Producción: `npm run build` y sirve `dist/` por HTTPS.

## Verificación

- `npm run lint` — análisis estático.
- `npm run build` — compilación de producción.

## Datos y seguridad

- Las tablas `workout_sets` y `workout_notes` usan Row Level Security por `auth.uid()`.
- No se almacenan nombres de usuario: el saludo es genérico y la interfaz no consume metadata personal.
- No existe caché local de registros; al cerrar sesión se limpia cualquier dato en memoria.
- El service worker solo cachea la estructura de la app, nunca datos de entrenamiento.

## Estructura

- `src/App.jsx` — validación de sesión, navegación y estados de carga/error.
- `src/components/` — login, panel, entrenamiento, progreso y resumen.
- `src/lib/atlasData.js` — catálogo de ejercicios y cálculos de racha, tonelaje y fuerza.
- `src/lib/historyStore.js` — acceso a Supabase.
- `supabase/schema.sql` — esquema, restricciones y políticas RLS.

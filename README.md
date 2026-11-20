# Atlas

PWA de entrenamiento con React, Vite, Tailwind CSS y Supabase. Acceso con Google o con correo y contraseña. No incluye modo demo: todos los datos proceden de la sesión autenticada.

## Puesta en marcha

1. Copia `.env.example` a `.env` y completa `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY` (o `VITE_SUPABASE_ANON_KEY`).
2. Ejecuta (o vuelve a ejecutar) `supabase/schema.sql` en el editor SQL de tu proyecto Supabase; añade las columnas en español a `series_registro`, crea `ejercicios_personalizados` y recrea `notas_entrenamiento` con una nota por ejercicio.
3. Activa Google y Email en Authentication → Providers y registra la URL de la app como URL de redirección permitida.
4. Instala dependencias con `npm install`.
5. Desarrollo: `npm run dev`. Producción: `npm run build` y sirve `dist/` por HTTPS.

## Verificación

- `npm run lint` — análisis estático.
- `npm run build` — compilación de producción.

## Datos y seguridad

- Las tablas `series_registro`, `notas_entrenamiento` y `ejercicios_personalizados` usan Row Level Security por `auth.uid()`.
- Cada nota vive en `notas_entrenamiento` con `user_id`, `ejercicio_id`, `nombre_ejercicio`, `content` y `creado_en`; ya no existe una nota general del día.
- El nombre y el avatar se leen de la metadata de Supabase; el nombre se puede editar desde el panel.
- No existe caché local de registros; al cerrar sesión se limpia cualquier dato en memoria.
- El service worker solo cachea la estructura de la app, nunca datos de entrenamiento.

## Estructura

- `src/App.jsx` — validación de sesión, navegación y estados de carga/error.
- `src/components/` — login, panel, entrenamiento, progreso y resumen.
- `src/lib/atlasData.js` — catálogo de ejercicios y cálculos de racha, tonelaje y fuerza.
- `src/lib/historyStore.js` — acceso a Supabase.
- `supabase/schema.sql` — esquema, restricciones y políticas RLS.

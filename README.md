# Soundlike

Base de minijuegos musicales (Vite + TypeScript + Tone.js) con los juegos
"Arregla el beat" y "Explora el sinte". Toda la interfaz en español.

```bash
docker compose up --build
```

La app queda en http://localhost:8080 (puerto configurable con `PORT` en `.env`;
ver `.env.example`).

## Desarrollo

```bash
npm install
npm run dev      # servidor de desarrollo
npm test         # pruebas unitarias (npx vitest run)
npm run build    # typecheck + build de producción
```

## Capturas de pantalla (Playwright)

```bash
npx playwright install chromium   # una sola vez
npm run dev &                     # app levantada
BASE_URL=http://localhost:5173 CAPTURAS=capturas npm run capturas
```

## Estructura

La fuente de verdad es [ARCHITECTURE.md](ARCHITECTURE.md). Resumen:

- `src/core/` — teoría, secuenciador, puntaje (puros), batería y reproductor (Tone.js).
- `src/ui/` — tema (`theme.css`), estilos (`app.css`), enrutador hash, cuadrícula y tutorial reutilizables.
- `src/screens/` — menú principal, Tutoriales y Acerca de.
- `src/games/explora-el-sinte/` — lecciones, reto "Imita el sonido", progreso, tutorial y pantalla del pad XY.
- `src/games/arregla-el-beat/` — banco de beats, romper, feedback, lógica de rondas, tutorial y pantalla.

Rutas: `#/` (menú), `#/arregla-el-beat`, `#/explora-el-sinte`, `#/tutoriales`, `#/acerca-de`.

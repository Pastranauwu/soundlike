# Soundlike

Base de minijuegos musicales (Vite + TypeScript + Tone.js) con el juego
"Arregla el beat". Toda la interfaz en español.

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
- `src/ui/` — tema (`theme.css`), estilos (`app.css`), enrutador hash y cuadrícula reutilizable.
- `src/screens/` — menú principal.
- `src/games/arregla-el-beat/` — banco de beats, romper, feedback, lógica de rondas y pantalla.

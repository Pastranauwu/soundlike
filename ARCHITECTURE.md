# Arquitectura de Soundlike

Base de minijuegos musicales (Vite + TypeScript + Tone.js + Vitest) con el primer
juego: **Arregla el beat**. Estilo: **en capas con puertos** — un núcleo puro y
reutilizable (`src/core`), componentes de interfaz compartidos (`src/ui`,
`src/screens`) y un módulo por juego (`src/games/<juego>/`). TypeScript sin
framework: el DOM se crea con funciones `crear*` que devuelven elementos.

## Módulos y responsabilidades

| Módulo | Archivo | Responsabilidad |
|---|---|---|
| Tipos núcleo | `src/core/types.ts` | Constantes (16 pasos, tempo 60-180, nivel máx. 3), `Cuadricula`, `Celda`, `Puntaje`, `PISTAS_BATERIA` y los puertos `Bateria` / `Reproductor`. Solo declaraciones. |
| Teoría | `src/core/theory.ts` | `noteToFreq` (A4=440), escalas mayor y menor natural, acordes mayor y menor. **Puro.** |
| Secuenciador | `src/core/sequencer.ts` | Crear/alternar/comparar cuadrículas de N pistas x 16 pasos, `validarTempo`. **Puro, inmutable.** |
| Puntaje | `src/core/scoring.ts` | Puntos por acierto (100 x nivel), racha, subida de nivel cada 3 aciertos (techo 3). **Puro, inmutable.** |
| Batería | `src/core/drums.ts` | Implementa el puerto `Bateria`: kick, clap, closed-hat y open-hat **sintetizados con Tone.js** (sin samples). |
| Reproductor | `src/core/player.ts` | Implementa el puerto `Reproductor`: loop de 16 pasos sobre Tone.Transport, play/pausa, tempo validado, callback de paso. Recibe `Bateria` por parámetro. |
| Enrutador | `src/ui/router.ts` | Rutas hash: `#/`, `#/arregla-el-beat`; hash desconocido o vacío -> menú y `location.hash = "#/"`. No conoce vistas concretas. |
| Cuadrícula UI | `src/ui/grid.ts` | Componente reutilizable: nombre de pista a la izquierda, 16 botones por pista, clic alterna, columna del paso actual resaltada, números 1-16 al pie. |
| Menú | `src/screens/menu.ts` | Tarjetas por juego: "Arregla el beat" activa; 3 más como "Próximamente". |
| Banco | `src/games/arregla-el-beat/bank.ts` | 10 beats (hip-hop, boom bap, reggaetón, house, rock), cada uno nombre + género + tempo 60-180 + 4 pistas x 16. `elegirBeat(semilla)` determinista. Datos puros. |
| Romper | `src/games/arregla-el-beat/breakBeat.ts` | `breakBeat(beat, nErrores, semilla)`: exactamente nErrores celdas invertidas, determinista por semilla. **Puro.** |
| Feedback | `src/games/arregla-el-beat/feedback.ts` | Frase en español que explica el error: "El clap va en los pasos 5 y 13 (tiempos 2 y 4)." **Puro.** |
| Juego | `src/games/arregla-el-beat/juego.ts` | Estado de rondas: erroresPorNivel (nivel N = N errores), iniciarRonda, comprobar, ayudaDisponible (tras 3 fallos), celdasErroneas. **Puro.** |
| Pantalla juego | `src/games/arregla-el-beat/screen.ts` | Orquesta: reproductor + cuadrícula + juego + banco. Controles arriba, cuadrícula al centro, marcador arriba a la derecha. |
| Entrada | `src/main.ts` | Importa CSS, registra rutas y arranca. Solo cableado. |

## Dependencias permitidas

- `core/*` solo depende de `core/types` (+ Tone.js en drums/player). **El core no conoce juegos.**
- `theory`, `sequencer`, `scoring`, `breakBeat`, `feedback`, `juego` y `bank` son
  **puros**: prohibido importar Tone.js o tocar el DOM en ellos.
- `ui/*` y `screens/*` dependen del core (tipos y funciones), nunca de un juego.
- `games/<juego>/*` puede depender de `core/*` y `ui/*`. Los juegos no se importan entre sí.
- Las dependencias con audio/DOM entran **por parámetro** (puertos `Bateria`,
  `Reproductor`; opciones de `crearPantallaJuego`) para probar con fakes.

## Flujo del caso principal (Arregla el beat)

1. `main.ts` registra rutas; el enrutador monta `crearPantallaJuego()` en `#/arregla-el-beat`.
2. La pantalla elige un beat (`bank.elegirBeat(semilla)`), lo rompe con
   `juego.iniciarRonda` (erroresPorNivel + `breakBeat`) y pinta el beat **roto**
   en la cuadrícula (`grid.ponerCuadricula`).
3. Primer clic en "Escuchar" -> `reproductor.iniciar()` (regla de autoplay: el
   audio nace de un gesto). `reproductor.alPaso` resalta la columna actual.
4. El jugador edita celdas (`grid.alAlternar` -> estado + `reproductor.cargar`).
5. "Comprobar" -> `juego.comprobar`: si iguala el original, `scoring.registrarAcierto`
   (puntos, racha, nivel) y `feedback.explicarError` como mensaje; si no,
   `registrarFallo` y, tras 3 fallos, aparece "Escuchar el correcto"
   (`reproductor.cargar(original)` + `grid.marcarErrores(celdasErroneas)`).
6. Acierto -> nueva ronda con el siguiente beat y semilla nueva.

## UI: sistema de diseño y plantilla

- **Tema en un solo lugar**: tokens en `src/ui/theme.css` (`:root`, ver contrato
  en el propio archivo). Tema oscuro: fondo gris muy oscuro, celdas gris medio,
  celdas activas amarillo, texto blanco, sans-serif grande (>= 18px).
- **Estilos globales y de componentes**: `src/ui/app.css` (importa nada; lo
  importa `main.ts` junto a theme.css). No hay más hojas de estilo.
- **Contratos de DOM fijos** (los respetan componentes y CSS): ver comentarios de
  `src/ui/grid.ts`, `src/screens/menu.ts` y `src/games/arregla-el-beat/screen.ts`.
  Clases BEM: `.cuadricula__celda--activa/--actual/--error`, `.tarjeta--proximamente`, `.juego__*`.
- **Plantilla de página**: sin framework; cada vista es una función `crear*` que
  devuelve un `HTMLElement` y el enrutador reemplaza el contenido de `#app`.
  Estados: el juego muestra mensajes en `.juego__mensaje` (`aria-live="polite"`);
  no hay estados de carga (todo es local).
- **Responsivo**: celular = cuadrícula a todo el ancho, celdas >= 32px de alto;
  escritorio (>= 768px) = centrada con max-width 900px; tarjetas del menú en
  columna en celular, en fila/grid en escritorio.

## Cómo se prueba cada módulo

Las pruebas viven en `tests/` con la misma ruta del archivo que prueban
(p. ej. `src/core/theory.ts` -> `tests/core/theory.test.ts`). Vitest corre con
entorno `jsdom` y `globals: true` (vite.config.ts).

- Puros (theory, sequencer, scoring, bank, breakBeat, feedback, juego): Vitest
  directo sobre entradas/salidas, sin mocks.
- drums y player: Vitest con `vi.mock("tone")` y batería fake; nunca audio real.
- router, grid, menu, screen, main: Vitest + jsdom, verificando lo que el
  usuario ve y hace (textos, roles, estados, navegación), no clases CSS.
  La pantalla se prueba con `OpcionesPantallaJuego` (reproductor y beats fake).
  main e integración mockean `"tone"` porque la pantalla crea audio real por
  defecto al montarse.
- Diseño: `tests/ui/diseno.test.ts` importa los CSS con `?inline` y verifica
  tokens y reglas clave (32px, 900px, media query 768px); el aspecto final se
  juzga con capturas (`npm run capturas`, Playwright).
- Integración punta a punta: `tests/integracion.test.ts` (aceptación global).
- Comandos: `npx vitest run` (todo), `npm run build` (typecheck + build).

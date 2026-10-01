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
| Enrutador | `src/ui/router.ts` | Rutas hash: `#/`, `#/arregla-el-beat`, `#/tutoriales`, `#/acerca-de`; hash desconocido o vacío -> menú y `location.hash = "#/"`. Pone `document.title` y, al navegar, enfoca el `h1` de la vista nueva. No conoce vistas concretas. |
| Cuadrícula UI | `src/ui/grid.ts` | Componente reutilizable: nombre de pista a la izquierda, 16 botones por pista, clic alterna, columna del paso actual resaltada, números 1-16 al pie. Accesible: roving tabindex + flechas/Home/End, `aria-pressed`, celdas equivocadas anunciadas en su `aria-label`. |
| Tipos UI | `src/ui/types.ts` | `Tutorial`, `PasoTutorial`, `MotivoCierreTutorial` y el puerto `RegistroTutoriales`. Solo declaraciones. |
| Tutorial UI | `src/ui/tutorial.ts` | Diálogo modal reutilizable de 1-2 pantallas: Anterior/Siguiente/"¡A jugar!", "Saltar tutorial" y Escape, foco atrapado y devuelto al cerrar. Recibe el `Tutorial` por parámetro. |
| Registro tutoriales | `src/ui/registroTutoriales.ts` | Implementa `RegistroTutoriales` sobre localStorage (con respaldo en memoria): el tutorial del juego se abre solo la primera vez. |
| Menú | `src/screens/menu.ts` | Botones "Tutoriales" y "Acerca de"; tarjetas por juego: "Arregla el beat" activa con "Cómo se gana" y "Aprendes"; 3 más como "Próximamente". |
| Tutoriales | `src/screens/tutoriales.ts` | Pantalla `#/tutoriales`: lista de tutoriales (objetivo, qué se aprende, "Ver tutorial", "Jugar"). Recibe los `Tutorial` por parámetro. |
| Acerca de | `src/screens/acerca.ts` | Pantalla `#/acerca-de`: texto estático (qué es, cómo suena, accesibilidad, versión). |
| Banco | `src/games/arregla-el-beat/bank.ts` | 10 beats (hip-hop, boom bap, reggaetón, house, rock), cada uno nombre + género + tempo 60-180 + 4 pistas x 16. `elegirBeat(semilla)` determinista. Datos puros. |
| Romper | `src/games/arregla-el-beat/breakBeat.ts` | `breakBeat(beat, nErrores, semilla)`: exactamente nErrores celdas invertidas, determinista por semilla. **Puro.** |
| Feedback | `src/games/arregla-el-beat/feedback.ts` | Frase en español que explica el error: "El clap va en los pasos 5 y 13 (tiempos 2 y 4)." **Puro.** |
| Juego | `src/games/arregla-el-beat/juego.ts` | Estado de rondas: erroresPorNivel (nivel N = N errores), iniciarRonda, comprobar, ayudaDisponible (tras 3 fallos), celdasErroneas. **Puro.** |
| Tutorial del juego | `src/games/arregla-el-beat/tutorial.ts` | `obtenerTutorial()`: contenido (2 pantallas, objetivo, qué se aprende). **Datos puros.** |
| Pantalla juego | `src/games/arregla-el-beat/screen.ts` | Orquesta: reproductor + cuadrícula + juego + banco + tutorial. Título, objetivo y marcador arriba (marcador a la derecha), controles (Escuchar, Tempo, Comprobar, Reiniciar, Escuchar el correcto), cuadrícula al centro. Abre el tutorial la primera vez. |
| Entrada | `src/main.ts` | Importa CSS, registra las 4 rutas y arranca. Solo cableado. |

## Dependencias permitidas

- `core/*` solo depende de `core/types` (+ Tone.js en drums/player). **El core no conoce juegos.**
- `theory`, `sequencer`, `scoring`, `breakBeat`, `feedback`, `juego` y `bank` son
  **puros**: prohibido importar Tone.js o tocar el DOM en ellos.
- `ui/*` y `screens/*` dependen del core (tipos y funciones) y de `ui/*`, nunca de
  un juego. Lo que es de un juego (p. ej. su `Tutorial`) les llega por parámetro
  desde `main.ts`.
- `games/<juego>/*` puede depender de `core/*` y `ui/*`. Los juegos no se importan entre sí.
- Las dependencias con audio/DOM entran **por parámetro** (puertos `Bateria`,
  `Reproductor`, `RegistroTutoriales`; opciones de `crearPantallaJuego`) para
  probar con fakes.

## Flujo del caso principal (Arregla el beat)

1. `main.ts` registra rutas; el enrutador monta `crearPantallaJuego()` en `#/arregla-el-beat`.
   Si `registroTutoriales.visto("arregla-el-beat")` es false se abre el tutorial
   (`ui/tutorial.ts`); al saltarlo o terminarlo se marca visto y el foco va a "Escuchar".
   El objetivo queda visible arriba; "¿Cómo se juega?" reabre el tutorial.
2. La pantalla elige un beat (`bank.elegirBeat(semilla)`), lo rompe con
   `juego.iniciarRonda` (erroresPorNivel + `breakBeat`) y pinta el beat **roto**
   en la cuadrícula (`grid.ponerCuadricula`).
3. Primer clic en "Escuchar" -> `reproductor.iniciar()` (regla de autoplay: el
   audio nace de un gesto). `reproductor.alPaso` resalta la columna actual.
4. El jugador edita celdas (`grid.alAlternar` -> estado + `reproductor.cargar`).
5. "Comprobar" -> `juego.comprobar`: si iguala el original, `scoring.registrarAcierto`
   (puntos, racha, nivel) y `feedback.explicarError` como mensaje; si no,
   `registrarFallo` y, tras 3 fallos, se habilita "Escuchar el correcto" (siempre
   visible, deshabilitado con contador "(F/3)" hasta entonces):
   `reproductor.cargar(original)` + `grid.marcarErrores(celdasErroneas)`.
6. "Reiniciar" -> la cuadrícula vuelve al beat roto de la ronda (sin tocar puntaje
   ni intentos).
7. Acierto -> nueva ronda con el siguiente beat y semilla nueva.

Otras rutas: `#/tutoriales` (`crearPantallaTutoriales([obtenerTutorial()])`) y
`#/acerca-de` (`crearPantallaAcerca()`), a las que se llega con los botones del menú.

## UI: sistema de diseño y plantilla

- **Tema en un solo lugar**: tokens en `src/ui/theme.css` (`:root`, ver contrato
  en el propio archivo). Tema oscuro: fondo gris muy oscuro, celdas gris medio,
  celdas activas amarillo, texto blanco, sans-serif grande (>= 18px).
- **Estilos globales y de componentes**: `src/ui/app.css` (importa nada; lo
  importa `main.ts` junto a theme.css). No hay más hojas de estilo.
- **Contratos de DOM fijos** (los respetan componentes y CSS): ver comentarios de
  `src/ui/grid.ts`, `src/screens/menu.ts` y `src/games/arregla-el-beat/screen.ts`.
  y de `src/ui/tutorial.ts`, `src/screens/tutoriales.ts`, `src/screens/acerca.ts`.
  Clases BEM: `.cuadricula__celda--activa/--actual/--error`, `.tarjeta--proximamente`,
  `.tarjeta__objetivo/__aprendes`, `.menu__acciones`, `.juego__*`, `.tutorial__*`,
  `.tutoriales__*`, `.acerca__*`.
- **Plantilla de página**: sin framework; cada vista es una función `crear*` que
  devuelve un `HTMLElement` y el enrutador reemplaza el contenido de `#app`.
  Estados: el juego muestra mensajes en `.juego__mensaje` (`aria-live="polite"`);
  no hay estados de carga (todo es local).
- **Plantilla de pantalla secundaria** (Tutoriales, Acerca de): `<main>` con `h1`,
  contenido en tarjetas de superficie y enlace "← Volver al menú" al pie; mismo
  ancho y márgenes que el menú.
- **Diálogo** (tutorial): capa a pantalla completa con fondo semitransparente y
  un panel de superficie centrado (max-width 560px; en celular, casi todo el
  ancho, anclado abajo); botón principal amarillo a la derecha.
- **Botones**: primario = fondo `--color-activa` y texto oscuro (Comprobar,
  "¡A jugar!"); secundario = superficie con borde (Escuchar, Reiniciar,
  Tutoriales, Acerca de); deshabilitado = atenuado con su pista de texto al lado.
  Todos >= 44px de alto. **Foco visible** en todo control (anillo amarillo de 3px
  con separación, también en celdas activas, donde se usa anillo blanco).
- **Responsivo**: celular (< 768px) = cada pista ocupa todo el ancho con su
  nombre arriba y sus 16 celdas en 2 filas de 8 (pasos 1-8 y 9-16), celdas
  >= 40px; encabezado apilado (título y marcador en una fila, controles debajo
  ocupando el ancho), sin desbordamiento horizontal a 390px. Escritorio (>= 768px)
  = nombre a la izquierda, 16 columnas con un hueco entre los pasos 8 y 9,
  centrado con max-width 900px; tarjetas del menú en grid de 2 columnas.

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
- tutorial, tutoriales, acerca, registroTutoriales: Vitest + jsdom con un
  `Tutorial` fake y un `RegistroTutoriales` en memoria (o un `Storage` fake).
- Accesibilidad: pruebas de teclado (keydown de flechas, Escape, Tab), foco
  (`document.activeElement`, montando en `document.body`), roles y `aria-*`.
- Diseño: `tests/ui/diseno.test.ts` lee los CSS como texto y verifica solo
  tokens y reglas que el usuario nota (foco visible, tamaños táctiles, 900px,
  punto de corte 768px); el aspecto final se juzga con capturas
  (`npm run capturas`, Playwright).
- Integración punta a punta: `tests/integracion.test.ts` (aceptación global del
  primer cambio) y `tests/integracion-tutoriales.test.ts` (aceptación global +
  menú con Tutoriales/Acerca de, tutorial saltable, Reiniciar y teclado).
- Comandos: `npx vitest run` (todo), `npm run build` (typecheck + build).

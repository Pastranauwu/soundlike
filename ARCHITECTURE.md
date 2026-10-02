# Arquitectura de Soundlike

Base de minijuegos musicales (Vite + TypeScript + Tone.js + Vitest) con dos
juegos: **Arregla el beat** y **Explora el sinte**. Estilo: **en capas con puertos** — un núcleo puro y
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
| Tutorial del juego | `src/games/arregla-el-beat/tutorial.ts` | `obtenerTutorial()`: contenido (2 pantallas, objetivo, qué se aprende) sobre la cuadrícula y los controles. **Datos puros.** |
| Tutorial de teoría del beat | `src/games/arregla-el-beat/tutorialTeoria.ts` | `obtenerTutorialTeoriaBeat()`: tutorial didáctico de 2 pantallas (pulso, compás, pasos; papel de cada instrumento y de cada género). **Datos puros.** |
| Escucha | `src/games/arregla-el-beat/escucha.ts` | Qué beat suena (`"ninguna" \| "roto" \| "correcto"`), etiquetas de los dos botones de escucha y si la cuadrícula se ve. **Puro.** |
| Resultado | `src/games/arregla-el-beat/resultado.ts` | `evaluarJugada(original, roto, actual, intentosFallidos)`: resultado de la jugada y por qué falló (instrumento, sobra/falta, y con más intentos dónde). **Puro.** |
| Contenido de teoría | `src/content/escalasYAcordes.ts` | `obtenerTutorialEscalasAcordes()`: tutorial didáctico general (escalas y acordes); los ejemplos salen de `core/theory`. **Datos puros**, sin juego (`ruta: ""`). |
| Indicador de pasos | `src/ui/indicadorPasos.ts` | Fila de 16 casillas numeradas que solo ilumina el paso que suena; no muestra ningún patrón. Reutilizable. |
| Pantalla juego | `src/games/arregla-el-beat/screen.ts` | Orquesta: reproductor + cuadrícula + indicador de pasos + juego + escucha + resultado + banco + tutoriales. Título, objetivo, "Aprendes" y marcador arriba (marcador a la derecha); panel de escucha (Escuchar el beat roto, Escuchar el correcto, Tempo, indicador de pasos); controles (Comprobar, Reiniciar); resultado de la jugada; cuadrícula al centro (oculta mientras suena algo). Abre el tutorial la primera vez; "Teoría del beat" abre el didáctico. |
| Tipos del sinte | `src/core/synthTypes.ts` | `FormaOnda`, `IdParametro`, `DefinicionParametro`, `PosicionPad`, `AjustesSinte` y el puerto `Sinte` (ajustar, iniciarNota, soltarNota, destruir). Solo declaraciones. |
| Parámetros del sinte | `src/core/synthParams.ts` | Tabla `PARAMETROS` (nombre, unidad, escala, rango) y conversión posición 0..1 <-> valor: tono C2-C6 y corte 80-8000 Hz exponenciales, volumen/resonancia/profundidad lineales, ataque, relajación y velocidad del LFO exponenciales, forma de onda en 4 zonas. Textos ("Corte: 1.2 kHz", "Tono: A3"). **Puro.** |
| Sinte | `src/core/synth.ts` | Implementa el puerto `Sinte` con Tone.js: oscilador -> pasa-bajos -> envolvente -> ganancia -> limitador (tope de salida) -> destino, y LFO sobre el corte. Sin archivos de audio. |
| Pad UI | `src/ui/pad.ts` | Componente reutilizable: recuadro cuadrado con un punto arrastrable (puntero y teclado), nombres de eje en los bordes, lectura de valores `aria-live` y marca de objetivo. No conoce el sinte: avisa con `alPresionar` / `alMover` / `alSoltar`. |
| Tipos del sinte (juego) | `src/games/explora-el-sinte/types.ts` | `Leccion`, `EjesLeccion`, `EstadoReto`, `ResultadoReto` y el puerto `ProgresoLecciones`. Solo declaraciones. |
| Lecciones | `src/games/explora-el-sinte/lecciones.ts` | `obtenerLecciones()`: las 6 lecciones (título, 2-3 frases, ejes, ajustes de partida, explicación al acertar). **Datos puros.** |
| Reto | `src/games/explora-el-sinte/reto.ts` | "Imita el sonido": objetivo determinista por semilla, tolerancia 12 % por eje, pistas con el nombre del parámetro y la dirección, objetivo visible tras 3 fallos. **Puro.** |
| Progreso | `src/games/explora-el-sinte/progreso.ts` | Implementa `ProgresoLecciones` sobre localStorage (respaldo en memoria): lecciones con reto resuelto. |
| Tutorial del sinte | `src/games/explora-el-sinte/tutorial.ts` | `obtenerTutorialSinte()`: 2 pantallas (el pad; lecciones y reto). **Datos puros.** |
| Pantalla del sinte | `src/games/explora-el-sinte/screen.ts` | Orquesta pad + sinte + lecciones + reto + puntaje + progreso + tutorial. Índice y "Lección N de 6", texto de la lección, aviso de audio, pad, reto, resultado, Anterior/Siguiente. Crea el sinte en el primer gesto. |
| Entrada | `src/main.ts` | Importa CSS, registra las 5 rutas y arranca. Solo cableado. |

## Dependencias permitidas

- `core/*` solo depende de `core/types` (+ Tone.js en drums/player). **El core no conoce juegos.**
- `content/*` (tutoriales de teoría sin juego) solo depende de `core/theory` y de
  los tipos de `ui/types`; no conoce juegos ni DOM. Llega a las pantallas por `main.ts`.
- `synthParams`, y de Explora el sinte `lecciones`, `reto` y `tutorial`, también son
  **puros** (mismas prohibiciones). `core/synth` es el único archivo nuevo que importa Tone.js.
- `ui/pad` solo usa el tipo `PosicionPad` del core; la pantalla del juego le pasa
  nombre y texto de cada eje (`EjePad`) y conecta sus callbacks con el puerto `Sinte`.
- `theory`, `sequencer`, `scoring`, `breakBeat`, `feedback`, `juego`, `bank`,
  `escucha`, `resultado`, `tutorialTeoria` y `content/*` (lista completa de puros) son
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
   en la cuadrícula (`grid.ponerCuadricula`), que es lo que el jugador edita.
3. **Escucha a ciegas** (`escucha.ts` decide, `screen.ts` ejecuta). Dos botones:
   - "Escuchar el beat roto" (`.juego__play`): `reproductor.cargar(cuadriculaActual)`
     (el beat roto con las correcciones del jugador) + `reproductor.iniciar()`.
   - "Escuchar el correcto" (`.juego__ayuda`, **siempre habilitado**):
     `reproductor.cargar(original)` + `iniciar()`.
   El primer clic en cualquiera es el gesto que arranca el audio (regla de
   autoplay). Mientras suena algo: la cuadrícula lleva `hidden`, se ve el aviso
   `.juego__oculta` y `reproductor.alPaso` ilumina solo el **indicador de pasos**
   (`ui/indicadorPasos`); la cuadrícula nunca resalta columna. El botón de lo que
   suena dice "Pausar"; pulsarlo pausa, apaga el indicador y devuelve la
   cuadrícula. Se puede pasar de roto a correcto sin pausar.
4. En pausa el jugador edita celdas (`grid.alAlternar` -> `alternarPaso`).
5. "Comprobar" -> `juego.comprobar` y `resultado.evaluarJugada(original, roto,
   actual, intentosFallidos)`; el panel `.juego__resultado` muestra título,
   resumen, **por qué falló** (una línea por instrumento: sobra/falta; desde el 2.º
   fallo en qué mitad; desde el 3.º en qué pasos) y el puntaje. Acierto:
   `scoring.registrarAcierto` (puntos, racha, nivel) y la frase de
   `feedback.explicarError` como resumen. Tras 3 fallos (`juego.ayudaDisponible`)
   las celdas equivocadas se marcan en rojo (`grid.marcarErrores(celdasErroneas)`)
   y se vuelven a calcular en cada edición.
6. "Reiniciar" -> la cuadrícula vuelve al beat roto de la ronda (sin tocar puntaje
   ni intentos).
7. Acierto -> pausa la escucha y nueva ronda con el siguiente beat y semilla nueva;
   el resultado del acierto sigue visible hasta el próximo "Comprobar".
8. "Teoría del beat" (`.juego__teoria`) abre el tutorial didáctico con
   `ui/tutorial.ts`; no se abre solo ni se registra como visto. La línea
   "Aprendes:" del encabezado muestra su `aprendes`.

## Flujo de Explora el sinte

1. `main.ts` monta `crearPantallaSinte().elemento` en `#/explora-el-sinte`. Nada
   de audio se crea al montar: la pantalla recibe una **fábrica** `crearSinte` y la
   llama en el primer gesto que suena (presionar el pad o "Escuchar el objetivo").
   Hasta entonces se ve el aviso `.sinte__aviso`. El tutorial se abre solo la
   primera vez (`registroTutoriales`), "¿Cómo se juega?" lo reabre.
2. Cada lección (`lecciones.obtenerLecciones()`) fija dos parámetros, uno por eje.
   El pad (`ui/pad`) avisa `alPresionar` -> `sinte.ajustar` + `iniciarNota`;
   `alMover` -> `sinte.ajustar(cambioDesdePosicion(...))`; `alSoltar` ->
   `soltarNota` (se apaga con su relajación; el punto se queda). La lectura
   "Horizontal · Corte: 1.2 kHz" sale de `synthParams.etiquetaPosicion`.
3. "Anterior", "Siguiente" o el índice cambian de lección: se suelta la nota, el
   punto vuelve al centro y cambian ejes y textos. En el patio libre (lección 6)
   dos listas eligen el parámetro de cada eje y no hay reto.
4. Reto (lecciones 1-5): "Escuchar el objetivo" toca 1.5 s el sonido de
   `reto.generarObjetivo(ejes, semilla)`. "Comprobar" -> `reto.comprobarReto`:
   acierto (12 % o menos en cada eje) -> `scoring.registrarAcierto`,
   `progreso.marcarResuelta`, frase de la lección y objetivo nuevo (semilla + 1);
   fallo -> `scoring.registrarFallo` y una pista por eje ("Te falta abrir el
   filtro: mueve el punto a la derecha"); al 3.er fallo el objetivo se dibuja en el pad.
5. `hashchange` -> la pantalla se destruye (suelta la nota y libera el sinte).
6. Tope de volumen: `core/synth` multiplica el volumen por `GANANCIA_MAX` y
   termina en un `Tone.Limiter(TOPE_DB)`.

Otras rutas: `#/tutoriales` (`crearPantallaTutoriales([obtenerTutorial(),
obtenerTutorialTeoriaBeat(), obtenerTutorialEscalasAcordes(), obtenerTutorialSinte()])`; un tutorial con
`ruta: ""` no muestra el enlace "Jugar") y
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
  `.tutoriales__*`, `.acerca__*`, `.pad__*`, `.sinte__*` (la pantalla del sinte
  reutiliza `.juego__*`).
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
- **Panel de escucha** (`.juego__escucha`): superficie con los dos botones de
  escucha del mismo tamaño (el que suena se pinta como primario amarillo y dice
  "Pausar"), el tempo, y debajo el indicador `.pasos`: 16 casillas pequeñas
  (gris medio, número dentro; los tiempos 1, 5, 9 y 13 con número en negrita; la
  casilla actual en amarillo con texto oscuro), con el mismo hueco entre 8 y 9
  que la cuadrícula; en celular 2 filas de 8. Donde iba la cuadrícula, mientras
  suena, queda el aviso `.juego__oculta` en una caja punteada de la misma altura
  mínima (sin saltos de layout bruscos).
- **Resultado de la jugada** (`.juego__resultado`): tarjeta de superficie con borde
  izquierdo de 4px: verde (`--color-acierto`) si `data-estado="acierto"`, rojo
  (`--color-error`) si `"fallo"`; título h2, resumen, lista de motivos y línea de
  puntaje atenuada. Va entre los controles y la cuadrícula.
- **Pad** (`.pad`): recuadro cuadrado (`aspect-ratio: 1`) de fondo `--color-fondo`
  y borde claro de 2px (`--color-texto-suave`), con una retícula tenue en los
  cuartos; ancho 100 % en celular y máximo 480px centrado en escritorio;
  `touch-action: none` para que arrastrar no desplace la página. Punto amarillo
  (`--color-activa`) de 24px que crece a 40px con halo mientras
  `data-sonando="true"`; objetivo = anillo punteado `--color-acierto`. Nombres de
  eje en los bordes (abajo el horizontal, a la izquierda y girado el vertical) en
  texto suave; debajo la lectura `.pad__lectura` en dos líneas con el valor en negrita.
- **Pantalla Explora el sinte** (`.juego.sinte`): mismo encabezado que Arregla el
  beat (título, marcador arriba a la derecha, objetivo, "¿Cómo se juega?"); índice
  `.sinte__indice` como fila de 6 botones redondos numerados (actual en amarillo,
  resuelto con ✓ y borde verde); tarjeta de superficie con "Lección N de 6",
  título y frases; aviso de audio en caja punteada; pad al centro; reto debajo
  (Escuchar el objetivo secundario, Comprobar primario); resultado con la misma
  tarjeta `.juego__resultado`; Anterior/Siguiente al pie, a cada extremo.
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

- Puros (theory, sequencer, scoring, bank, breakBeat, feedback, juego, escucha,
  resultado, tutorialTeoria, content/escalasYAcordes): Vitest
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
- synthParams, lecciones, reto, tutorial del sinte: Vitest directo, sin mocks.
- synth: Vitest con `vi.mock("tone")` (nodos fake que anotan llamadas).
- pad: Vitest + jsdom montado en `document.body`, con `getBoundingClientRect`
  simulado; eventos `pointerdown/move/up` y `keydown`.
- progreso: `Storage` fake. Pantalla del sinte: `OpcionesPantallaSinte` con sinte
  fake (fábrica espía), progreso y registro en memoria y timers falsos.
- Integración de Explora el sinte: `tests/integracion-sinte.test.ts`.
- indicadorPasos: Vitest + jsdom (casillas, `aria-current`, `aria-label`).
- Integración punta a punta vigente: `tests/integracion-escucha.test.ts`
  (aceptación global + escucha a ciegas + resultado de la jugada + tutoriales
  didácticos). Las anteriores siguen como regresión: `tests/integracion.test.ts` (aceptación global del
  primer cambio) y `tests/integracion-tutoriales.test.ts` (aceptación global +
  menú con Tutoriales/Acerca de, tutorial saltable, Reiniciar y teclado).
- Comandos: `npx vitest run` (todo), `npm run build` (typecheck + build).

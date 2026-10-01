/**
 * Pantalla del juego "Arregla el beat". Es la ÚNICA pieza que orquesta todo:
 * reproductor (puerto), cuadrícula UI, lógica pura de juego (juego.ts) y banco.
 * Pertenece a la tarea de diseño: el DOM y las clases de este contrato se
 * estilan en src/ui/app.css. Toda la interfaz en español.
 *
 * CONTRATO DE DOM:
 * <section class="juego" aria-labelledby="juego-titulo">
 *   <header class="juego__superior">
 *     <h1 class="juego__titulo" id="juego-titulo">Arregla el beat</h1>
 *     <div class="juego__marcador" aria-live="polite">Nivel 1 · Puntos 0 · Racha 0</div>
 *     <p class="juego__objetivo"><strong>Objetivo:</strong> {tutorial.objetivo}</p>
 *     <button type="button" class="juego__como">¿Cómo se juega?</button>
 *   </header>
 *   <div class="juego__controles" role="group" aria-label="Controles">
 *     <button type="button" class="juego__play">Escuchar</button>
 *     <label class="juego__tempo">Tempo
 *       <input type="range" class="juego__tempo-slider" min="60" max="180"
 *              aria-valuetext="120 bpm">
 *       <output class="juego__tempo-valor">120 bpm</output>
 *     </label>
 *     <button type="button" class="juego__comprobar">Comprobar</button>
 *     <button type="button" class="juego__reiniciar">Reiniciar</button>
 *     <button type="button" class="juego__ayuda" disabled
 *             aria-describedby="juego-ayuda-pista">Escuchar el correcto</button>
 *     <span class="juego__ayuda-pista" id="juego-ayuda-pista">Se desbloquea tras 3 intentos fallidos (0/3)</span>
 *   </div>
 *   <p class="juego__mensaje" aria-live="polite"></p>
 *   <!-- aquí se monta la cuadrícula de src/ui/grid.ts (4 pistas x 16) -->
 *   <a class="juego__volver" href="#/">← Volver al menú</a>
 *   <!-- aquí se agrega el .tutorial (src/ui/tutorial.ts) mientras está abierto -->
 * </section>
 * Nota: "Escuchar el correcto" SIEMPRE está visible (ya no usa hidden); queda
 * disabled hasta que ayudaDisponible(estado) es true (tras 3 intentos fallidos).
 */
import { crearBateria } from "../../core/drums";
import { crearReproductor } from "../../core/player";
import { alternarPaso } from "../../core/sequencer";
import type { Cuadricula, Puntaje, Reproductor } from "../../core/types";
import { PISTAS_BATERIA, TEMPO_MAX, TEMPO_MIN } from "../../core/types";
import { crearCuadriculaUI } from "../../ui/grid";
import { crearRegistroTutoriales } from "../../ui/registroTutoriales";
import { crearTutorialUI } from "../../ui/tutorial";
import type { TutorialUI } from "../../ui/tutorial";
import type { RegistroTutoriales, Tutorial } from "../../ui/types";
import { obtenerBanco } from "./bank";
import { ayudaDisponible, celdasErroneas, comprobar, crearJuego, iniciarRonda } from "./juego";
import { obtenerTutorial } from "./tutorial";
import type { Beat, EstadoJuego } from "./types";

/** Tope del contador que muestra la pista de la ayuda (la regla vive en ayudaDisponible). */
const FALLOS_EN_PISTA = 3;
const PISTA_AYUDA_DISPONIBLE =
  "Disponible: suena el beat original y las celdas equivocadas se marcan en rojo.";
const MENSAJE_REINICIO = "Cuadrícula reiniciada: está igual que al empezar la ronda.";

/** Dependencias opcionales para pruebas: en producción se usan las reales. */
export interface OpcionesPantallaJuego {
  /** Reproductor inyectado (fake en pruebas). Por defecto crearReproductor(crearBateria()). */
  reproductor?: Reproductor;
  /** Beats disponibles. Por defecto obtenerBanco(). */
  beats?: Beat[];
  /** Semilla de la primera ronda (determinista en pruebas). Por defecto 1. */
  semillaInicial?: number;
  /** Tutorial del juego. Por defecto obtenerTutorial() de ./tutorial. */
  tutorial?: Tutorial;
  /** Registro de tutoriales vistos. Por defecto crearRegistroTutoriales() (localStorage). */
  registroTutoriales?: RegistroTutoriales;
}

/** Manejador de la pantalla montada. */
export interface PantallaJuego {
  elemento: HTMLElement;
  /** Pausa el audio, desuscribe alPaso y destruye lo creado. */
  destruir(): void;
}

/**
 * Crea la pantalla completa del juego.
 * Flujo (orquesta, no decide reglas: esas viven en juego.ts):
 * - Al montar: crearJuego() + iniciarRonda con beats[ronda % beats.length] y
 *   semilla = semillaInicial + ronda; la cuadrícula muestra el beat ROTO;
 *   el slider toma el tempo del beat y reproductor.cargar(beatRoto.cuadricula).
 * - Botón Escuchar/Pausa: primer clic llama reproductor.iniciar() (gesto del
 *   usuario: solo así arranca el audio) y alterna el texto; alPaso actualiza
 *   la columna resaltada; al pausar se quita el resaltado.
 * - Slider de tempo: reproductor.setTempo(valor) y "<valor> bpm" en el output.
 * - Editar la cuadrícula actualiza el estado interno y reproductor.cargar.
 * - Comprobar: llama comprobar(estado, cuadriculaActual). Acierto: muestra
 *   ultimo.mensaje (la frase de feedback), actualiza el marcador y arranca la
 *   ronda siguiente (nuevo beat, nueva semilla). Fallo: muestra MENSAJE_FALLO;
 *   si ayudaDisponible(estado) quita el hidden del botón "Escuchar el correcto".
 * - "Escuchar el correcto": reproductor.cargar(beatOriginal.cuadricula) y
 *   marcarErrores(celdasErroneas(estado, cuadriculaActual)) en la cuadrícula.
 * - Marcador: "Nivel N · Puntos P · Racha R".
 * NUEVO (tutoriales, accesibilidad, mejorar interfaz):
 * - Encabezado con h1 "Arregla el beat", el marcador y la línea de objetivo
 *   ("Objetivo: " + tutorial.objetivo), siempre visibles.
 * - Tutorial: al montar, si !registroTutoriales.visto(tutorial.id), crearTutorialUI
 *   (src/ui/tutorial.ts), se agrega al final de la sección y se llama abrir(). Al
 *   cerrarse (saltar o terminar) -> registroTutoriales.marcarVisto(tutorial.id) y
 *   el foco va a .juego__play. El botón "¿Cómo se juega?" lo vuelve a abrir
 *   siempre (si ya hay uno abierto no abre otro). destruir() también destruye
 *   el tutorial abierto. El tutorial NO pausa ni arranca el audio.
 * - Reiniciar: la cuadrícula vuelve al beat roto con el que empezó la ronda
 *   (estado.beatRoto.cuadricula), reproductor.cargar(esa cuadrícula),
 *   limpiarErrores(), mensaje "Cuadrícula reiniciada: está igual que al empezar la ronda."
 *   No cambia puntaje, ronda ni intentos fallidos (la ayuda desbloqueada sigue igual).
 * - Escuchar el correcto: siempre visible, disabled = !ayudaDisponible(estado).
 *   .juego__ayuda-pista dice "Se desbloquea tras 3 intentos fallidos (F/3)" con
 *   F = min(estado.intentosFallidos, 3); cuando se habilita dice "Disponible: suena
 *   el beat original y las celdas equivocadas se marcan en rojo." Al empezar una
 *   ronda nueva vuelve a disabled y "(0/3)".
 * - Accesibilidad: el slider actualiza aria-valuetext "<valor> bpm"; el botón
 *   play cambia aria-label junto con su texto ("Escuchar"/"Pausar"); al pulsar
 *   "Escuchar el correcto" el mensaje dice "Suena el beat correcto. Las celdas
 *   equivocadas están marcadas: N." (N = cantidad de celdas marcadas).
 * Casos:
 * - en jsdom, con reproductor fake y banco de 1 solo beat: renderiza 4 filas x
 *   16 celdas, los controles y el marcador "Nivel 1 · Puntos 0 · Racha 0"
 * - clic en .juego__play -> fake.iniciar() llamado y texto pasa a "Pausar"
 * - corregir la cuadrícula y pulsar Comprobar -> mensaje de acierto visible y nueva ronda
 * - 3 fallos seguidos -> el botón .juego__ayuda deja de estar disabled
 * - clic en .juego__ayuda -> fake.cargar() recibe la cuadrícula original y hay celdas --error
 * Casos nuevos (prueba nueva tests/games/arregla-el-beat/screen-mejoras.test.ts,
 * con reproductor fake, tutorial fake de 2 pasos y registro fake en memoria):
 * - registro vacío -> al montar hay [role="dialog"]; clic "Saltar tutorial" ->
 *   desaparece, registro.visto(id) true y document.activeElement es .juego__play
 *   (montar la sección en document.body para probar el foco)
 * - registro con el id ya visto -> no hay diálogo; clic "¿Cómo se juega?" -> aparece
 * - h1 "Arregla el beat" y .juego__objetivo contiene tutorial.objetivo
 * - editar 2 celdas y clic "Reiniciar" -> las celdas vuelven a como empezó la ronda,
 *   fake.cargar recibió la cuadrícula rota y el marcador no cambió
 * - al montar .juego__ayuda está visible (sin hidden) y disabled con "(0/3)";
 *   tras 1 fallo "(1/3)"; tras 3 fallos enabled y "Disponible: ..."
 * - mover el slider a 140 -> aria-valuetext "140 bpm"
 */
export function crearPantallaJuego(opciones: OpcionesPantallaJuego = {}): PantallaJuego {
  const reproductorPropio = opciones.reproductor === undefined;
  const reproductor = opciones.reproductor ?? crearReproductor(crearBateria());
  const beats = opciones.beats ?? obtenerBanco();
  const semillaInicial = opciones.semillaInicial ?? 1;
  const tutorial = opciones.tutorial ?? obtenerTutorial();
  const registroTutoriales = opciones.registroTutoriales ?? crearRegistroTutoriales();

  const dom = crearDom(tutorial.objetivo);
  const cuadriculaUI = crearCuadriculaUI(PISTAS_BATERIA, alternarCelda);
  dom.seccion.insertBefore(cuadriculaUI.elemento, dom.volver);

  let estado: EstadoJuego = crearJuego();
  let cuadriculaActual: Cuadricula = {};
  let ronda = 0;
  let tutorialAbierto: TutorialUI | null = null;

  function empezarRonda(): void {
    const beat = beats[ronda % beats.length];
    estado = iniciarRonda(estado, beat, semillaInicial + ronda);
    const beatRoto = estado.beatRoto!;
    mostrarCuadricula(beatRoto.cuadricula);
    actualizarAyuda();
    ponerTempo(beatRoto.tempo);
  }

  function mostrarCuadricula(cuadricula: Cuadricula): void {
    cuadriculaActual = cuadricula;
    cuadriculaUI.limpiarErrores();
    cuadriculaUI.ponerCuadricula(cuadriculaActual);
    reproductor.cargar(cuadriculaActual);
  }

  function reiniciarCuadricula(): void {
    mostrarCuadricula(estado.beatRoto!.cuadricula);
    dom.mensaje.textContent = MENSAJE_REINICIO;
  }

  function actualizarAyuda(): void {
    const disponible = ayudaDisponible(estado);
    dom.ayuda.disabled = !disponible;
    dom.ayudaPista.textContent = disponible
      ? PISTA_AYUDA_DISPONIBLE
      : textoPistaBloqueada(estado.intentosFallidos);
  }

  function ponerEtiquetaPlay(texto: string): void {
    dom.play.textContent = texto;
    dom.play.setAttribute("aria-label", texto);
  }

  function abrirTutorial(): void {
    if (tutorialAbierto !== null) return;
    tutorialAbierto = crearTutorialUI(tutorial, { alCerrar: alCerrarTutorial });
    dom.seccion.append(tutorialAbierto.elemento);
    tutorialAbierto.abrir();
  }

  function alCerrarTutorial(): void {
    tutorialAbierto = null;
    registroTutoriales.marcarVisto(tutorial.id);
    dom.play.focus();
  }

  function alternarCelda(pistaId: string, paso: number): void {
    cuadriculaActual = alternarPaso(cuadriculaActual, pistaId, paso);
    reproductor.cargar(cuadriculaActual);
  }

  function ponerTempo(bpm: number): void {
    reproductor.setTempo(bpm);
    dom.tempoSlider.value = String(bpm);
    dom.tempoSlider.setAttribute("aria-valuetext", `${bpm} bpm`);
    dom.tempoValor.textContent = `${bpm} bpm`;
  }

  async function alternarReproduccion(): Promise<void> {
    if (reproductor.sonando) {
      reproductor.pausar();
      cuadriculaUI.ponerPasoActual(null);
      ponerEtiquetaPlay("Escuchar");
      return;
    }
    await reproductor.iniciar();
    ponerEtiquetaPlay("Pausar");
  }

  function comprobarCuadricula(): void {
    estado = comprobar(estado, cuadriculaActual);
    dom.mensaje.textContent = estado.ultimo!.mensaje;
    dom.marcador.textContent = textoMarcador(estado.puntaje);
    if (estado.rondaResuelta) {
      ronda += 1;
      empezarRonda();
      return;
    }
    actualizarAyuda();
  }

  function escucharCorrecto(): void {
    reproductor.cargar(estado.beatOriginal!.cuadricula);
    const erroneas = celdasErroneas(estado, cuadriculaActual);
    cuadriculaUI.marcarErrores(erroneas);
    dom.mensaje.textContent = `Suena el beat correcto. Las celdas equivocadas están marcadas: ${erroneas.length}.`;
  }

  dom.play.addEventListener("click", () => void alternarReproduccion());
  dom.tempoSlider.addEventListener("input", () => ponerTempo(Number(dom.tempoSlider.value)));
  dom.comprobar.addEventListener("click", comprobarCuadricula);
  dom.reiniciar.addEventListener("click", reiniciarCuadricula);
  dom.ayuda.addEventListener("click", escucharCorrecto);
  dom.como.addEventListener("click", abrirTutorial);
  const desuscribirPaso = reproductor.alPaso((paso) => cuadriculaUI.ponerPasoActual(paso));

  empezarRonda();
  if (!registroTutoriales.visto(tutorial.id)) abrirTutorial();

  function destruir(): void {
    tutorialAbierto?.destruir();
    tutorialAbierto = null;
    reproductor.pausar();
    desuscribirPaso();
    cuadriculaUI.ponerPasoActual(null);
    if (reproductorPropio) reproductor.destruir();
    dom.seccion.remove();
  }

  return { elemento: dom.seccion, destruir };
}

function textoMarcador({ nivel, puntos, racha }: Puntaje): string {
  return `Nivel ${nivel} · Puntos ${puntos} · Racha ${racha}`;
}

function textoPistaBloqueada(intentosFallidos: number): string {
  const fallos = Math.min(intentosFallidos, FALLOS_EN_PISTA);
  return `Se desbloquea tras ${FALLOS_EN_PISTA} intentos fallidos (${fallos}/${FALLOS_EN_PISTA})`;
}

function crearElemento<K extends keyof HTMLElementTagNameMap>(
  etiqueta: K,
  clase: string,
  texto = "",
): HTMLElementTagNameMap[K] {
  const elemento = document.createElement(etiqueta);
  elemento.className = clase;
  elemento.textContent = texto;
  return elemento;
}

function crearBoton(clase: string, texto: string): HTMLButtonElement {
  const boton = crearElemento("button", clase, texto);
  boton.type = "button";
  return boton;
}

function crearSuperior(objetivoTutorial: string) {
  const superior = crearElemento("header", "juego__superior");
  const titulo = crearElemento("h1", "juego__titulo", "Arregla el beat");
  titulo.id = "juego-titulo";

  const marcador = crearElemento("div", "juego__marcador", textoMarcador(crearJuego().puntaje));
  marcador.setAttribute("aria-live", "polite");

  const objetivo = crearElemento("p", "juego__objetivo");
  const etiquetaObjetivo = document.createElement("strong");
  etiquetaObjetivo.textContent = "Objetivo:";
  objetivo.append(etiquetaObjetivo, ` ${objetivoTutorial}`);

  const como = crearBoton("juego__como", "¿Cómo se juega?");
  superior.append(titulo, marcador, objetivo, como);
  return { superior, marcador, como };
}

function crearTempo() {
  const tempo = crearElemento("label", "juego__tempo", "Tempo");
  const tempoSlider = crearElemento("input", "juego__tempo-slider");
  tempoSlider.type = "range";
  tempoSlider.min = String(TEMPO_MIN);
  tempoSlider.max = String(TEMPO_MAX);
  tempoSlider.setAttribute("aria-valuetext", "120 bpm");
  const tempoValor = crearElemento("output", "juego__tempo-valor", "120 bpm");
  tempo.append(tempoSlider, tempoValor);
  return { tempo, tempoSlider, tempoValor };
}

function crearControles() {
  const controles = crearElemento("div", "juego__controles");
  controles.setAttribute("role", "group");
  controles.setAttribute("aria-label", "Controles");

  const play = crearBoton("juego__play", "Escuchar");
  play.setAttribute("aria-label", "Escuchar");
  const { tempo, tempoSlider, tempoValor } = crearTempo();
  const comprobar = crearBoton("juego__comprobar", "Comprobar");
  const reiniciar = crearBoton("juego__reiniciar", "Reiniciar");

  const ayudaPista = crearElemento("span", "juego__ayuda-pista", textoPistaBloqueada(0));
  ayudaPista.id = "juego-ayuda-pista";
  const ayuda = crearBoton("juego__ayuda", "Escuchar el correcto");
  ayuda.disabled = true;
  ayuda.setAttribute("aria-describedby", ayudaPista.id);

  controles.append(play, tempo, comprobar, reiniciar, ayuda, ayudaPista);
  return { controles, play, tempoSlider, tempoValor, comprobar, reiniciar, ayuda, ayudaPista };
}

function crearDom(objetivoTutorial: string) {
  const seccion = crearElemento("section", "juego");
  seccion.setAttribute("aria-labelledby", "juego-titulo");
  const { superior, ...encabezado } = crearSuperior(objetivoTutorial);
  const { controles, ...botones } = crearControles();

  const mensaje = crearElemento("p", "juego__mensaje");
  mensaje.setAttribute("aria-live", "polite");

  const volver = crearElemento("a", "juego__volver", "← Volver al menú");
  volver.href = "#/";

  seccion.append(superior, controles, mensaje, volver);
  return { seccion, mensaje, volver, ...encabezado, ...botones };
}

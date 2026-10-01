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
 *     <p class="juego__aprendes"><strong>Aprendes:</strong> {tutorialTeoria.aprendes}</p>
 *     <div class="juego__ayudas">
 *       <button type="button" class="juego__como">¿Cómo se juega?</button>
 *       <button type="button" class="juego__teoria">Teoría del beat</button>
 *     </div>
 *   </header>
 *   <div class="juego__escucha" role="group" aria-label="Escucha">
 *     <button type="button" class="juego__play" aria-pressed="false">Escuchar el beat roto</button>
 *     <button type="button" class="juego__ayuda" aria-pressed="false">Escuchar el correcto</button>
 *     <label class="juego__tempo">Tempo <input class="juego__tempo-slider" ...>
 *       <output class="juego__tempo-valor">120 bpm</output></label>
 *     <!-- indicador de src/ui/indicadorPasos.ts (.pasos, 16 casillas) -->
 *     <p class="juego__escucha-estado" aria-live="polite">{vistaEscucha(fuente).estado}</p>
 *   </div>
 *   <div class="juego__controles" role="group" aria-label="Controles">
 *     <button type="button" class="juego__comprobar">Comprobar</button>
 *     <button type="button" class="juego__reiniciar">Reiniciar</button>
 *     <span class="juego__ayuda-pista">Tras 3 intentos fallidos se marcan en rojo las celdas equivocadas (0/3)</span>
 *   </div>
 *   <p class="juego__mensaje" aria-live="polite"></p>
 *   <section class="juego__resultado" aria-live="polite" hidden>
 *     <h2 class="juego__resultado-titulo">{resultado.titulo}</h2>
 *     <p class="juego__resultado-resumen">{resultado.resumen}</p>
 *     <ul class="juego__resultado-motivos"><li>{motivo}</li>...</ul>   (sin <ul> si no hay motivos)
 *     <p class="juego__resultado-puntaje">Nivel N · Puntos P · Racha R · Intentos fallidos F</p>
 *   </section>
 *   <p class="juego__oculta" hidden>La cuadrícula está oculta mientras escuchas. Pulsa Pausar para editarla.</p>
 *   <!-- cuadrícula de src/ui/grid.ts; lleva hidden mientras suena algo -->
 *   <a class="juego__volver" href="#/">← Volver al menú</a>
 * </section>
 * .juego__resultado lleva además data-estado="acierto" | "fallo".
 */
import { crearBateria } from "../../core/drums";
import { crearReproductor } from "../../core/player";
import { alternarPaso } from "../../core/sequencer";
import type { Cuadricula, Puntaje, Reproductor } from "../../core/types";
import { PISTAS_BATERIA, TEMPO_MAX, TEMPO_MIN } from "../../core/types";
import { crearCuadriculaUI } from "../../ui/grid";
import { crearIndicadorPasos } from "../../ui/indicadorPasos";
import { crearRegistroTutoriales } from "../../ui/registroTutoriales";
import { crearTutorialUI } from "../../ui/tutorial";
import type { TutorialUI } from "../../ui/tutorial";
import type { RegistroTutoriales, Tutorial } from "../../ui/types";
import { obtenerBanco } from "./bank";
import { alternarEscucha, vistaEscucha } from "./escucha";
import type { FuenteEscucha } from "./escucha";
import { ayudaDisponible, celdasErroneas, comprobar, crearJuego, iniciarRonda } from "./juego";
import { evaluarJugada } from "./resultado";
import type { ResultadoJugada } from "./resultado";
import { obtenerTutorial } from "./tutorial";
import { obtenerTutorialTeoriaBeat } from "./tutorialTeoria";
import type { Beat, EstadoJuego } from "./types";

/** Tope del contador que muestra la pista (la regla vive en ayudaDisponible). */
const FALLOS_EN_PISTA = 3;
const PISTA_CELDAS_MARCADAS = "Las celdas equivocadas están marcadas en rojo.";
const MENSAJE_REINICIO = "Cuadrícula reiniciada: está igual que al empezar la ronda.";
const MENSAJE_AUDIO_FALLIDO = "No se pudo iniciar el audio. Vuelve a intentarlo.";
const AVISO_CUADRICULA_OCULTA =
  "La cuadrícula está oculta mientras escuchas. Pulsa Pausar para editarla.";

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
  /**
   * Tutorial didáctico (teoría) del juego. Por defecto obtenerTutorialTeoriaBeat()
   * de ./tutorialTeoria.
   */
  tutorialTeoria?: Tutorial;
}

/** Manejador de la pantalla montada. */
export interface PantallaJuego {
  elemento: HTMLElement;
  /** Pausa el audio, desuscribe alPaso y destruye lo creado. */
  destruir(): void;
}

/**
 * Crea la pantalla completa del juego.
 * Flujo (orquesta, no decide reglas: esas viven en juego.ts, escucha.ts y resultado.ts):
 * - Al montar: crearJuego() + iniciarRonda con beats[ronda % beats.length] y
 *   semilla = semillaInicial + ronda; la cuadrícula muestra el beat ROTO y el
 *   slider toma el tempo del beat. El audio NO arranca al montar.
 * - Escucha a ciegas: "Escuchar el beat roto" carga la cuadrícula del jugador y
 *   "Escuchar el correcto" (siempre habilitado) la original; ambos llaman
 *   reproductor.iniciar() (gesto del usuario: solo así arranca el audio). Mientras
 *   suena algo la cuadrícula lleva hidden, se ve .juego__oculta y alPaso ilumina
 *   solo el indicador de pasos. El botón de lo que suena dice "Pausar". Se pasa
 *   de un beat al otro sin pausar en medio.
 * - Slider de tempo: reproductor.setTempo(valor), "<valor> bpm" en el output y
 *   en aria-valuetext.
 * - Editar la cuadrícula (solo en pausa) actualiza el estado interno; el
 *   reproductor la recibe en la próxima escucha.
 * - Comprobar: pausa la escucha, comprobar(estado, cuadriculaActual) y pinta en
 *   .juego__resultado lo que devuelve evaluarJugada con los beats de esa ronda.
 *   Acierto: ronda siguiente (nuevo beat, nueva semilla) y el panel sigue visible.
 *   Desde el tercer fallo (ayudaDisponible) las celdas equivocadas se marcan y
 *   se recalculan en cada edición; .juego__ayuda-pista cuenta los fallos "(F/3)".
 * - Reiniciar: la cuadrícula vuelve al beat roto de la ronda; no cambia puntaje,
 *   intentos fallidos ni el panel de resultado.
 * - Tutoriales (un solo diálogo a la vez; abrir uno pausa la escucha): el de
 *   controles se abre solo si !registroTutoriales.visto(tutorial.id) y con
 *   "¿Cómo se juega?"; al cerrarse se marca visto y el foco va a .juego__play.
 *   "Teoría del beat" abre tutorialTeoria sin registrarlo; al cerrarse el foco
 *   vuelve a .juego__teoria.
 * Errores: si reproductor.iniciar() falla, la pantalla vuelve a pausa y lo
 * avisa en .juego__escucha-estado.
 */
export function crearPantallaJuego(opciones: OpcionesPantallaJuego = {}): PantallaJuego {
  const reproductorPropio = opciones.reproductor === undefined;
  const reproductor = opciones.reproductor ?? crearReproductor(crearBateria());
  const beats = opciones.beats ?? obtenerBanco();
  const semillaInicial = opciones.semillaInicial ?? 1;
  const tutorial = opciones.tutorial ?? obtenerTutorial();
  const tutorialTeoria = opciones.tutorialTeoria ?? obtenerTutorialTeoriaBeat();
  const registroTutoriales = opciones.registroTutoriales ?? crearRegistroTutoriales();

  const dom = crearDom(tutorial.objetivo, tutorialTeoria.aprendes);
  const cuadriculaUI = crearCuadriculaUI(PISTAS_BATERIA, alternarCelda);
  dom.seccion.insertBefore(cuadriculaUI.elemento, dom.volver);
  const indicador = crearIndicadorPasos();
  dom.escucha.insertBefore(indicador.elemento, dom.escuchaEstado);

  let estado: EstadoJuego = crearJuego();
  let cuadriculaActual: Cuadricula = {};
  let ronda = 0;
  let fuente: FuenteEscucha = "ninguna";
  let tutorialAbierto: TutorialUI | null = null;

  function beatsDeLaRonda(): { original: Beat; roto: Beat } {
    if (estado.beatOriginal === null || estado.beatRoto === null) {
      throw new Error("No hay ronda iniciada");
    }
    return { original: estado.beatOriginal, roto: estado.beatRoto };
  }

  function empezarRonda(): void {
    const beat = beats[ronda % beats.length];
    estado = iniciarRonda(estado, beat, semillaInicial + ronda);
    const { roto } = beatsDeLaRonda();
    mostrarCuadricula(roto.cuadricula);
    actualizarPista();
    ponerTempo(roto.tempo);
  }

  function mostrarCuadricula(cuadricula: Cuadricula): void {
    cuadriculaActual = cuadricula;
    cuadriculaUI.ponerCuadricula(cuadriculaActual);
    actualizarErrores();
  }

  function reiniciarCuadricula(): void {
    mostrarCuadricula(beatsDeLaRonda().roto.cuadricula);
    dom.mensaje.textContent = MENSAJE_REINICIO;
  }

  function actualizarErrores(): void {
    cuadriculaUI.limpiarErrores();
    if (ayudaDisponible(estado)) {
      cuadriculaUI.marcarErrores(celdasErroneas(estado, cuadriculaActual));
    }
  }

  function actualizarPista(): void {
    dom.ayudaPista.textContent = ayudaDisponible(estado)
      ? PISTA_CELDAS_MARCADAS
      : textoPistaFallos(estado.intentosFallidos);
  }

  function alternarCelda(pistaId: string, paso: number): void {
    cuadriculaActual = alternarPaso(cuadriculaActual, pistaId, paso);
    actualizarErrores();
  }

  function ponerTempo(bpm: number): void {
    reproductor.setTempo(bpm);
    dom.tempoSlider.value = String(bpm);
    dom.tempoSlider.setAttribute("aria-valuetext", `${bpm} bpm`);
    dom.tempoValor.textContent = `${bpm} bpm`;
  }

  function aplicarFuente(nueva: FuenteEscucha): void {
    fuente = nueva;
    if (nueva === "ninguna") {
      reproductor.pausar();
      indicador.ponerPasoActual(null);
    } else {
      reproductor.cargar(nueva === "roto" ? cuadriculaActual : beatsDeLaRonda().original.cuadricula);
      reproductor.iniciar().catch(avisarAudioFallido);
    }
    pintarEscucha();
  }

  function pintarEscucha(): void {
    const vista = vistaEscucha(fuente);
    ponerBotonEscucha(dom.play, vista.etiquetaRoto, fuente === "roto");
    ponerBotonEscucha(dom.ayuda, vista.etiquetaCorrecto, fuente === "correcto");
    cuadriculaUI.elemento.hidden = !vista.cuadriculaVisible;
    dom.oculta.hidden = vista.cuadriculaVisible;
    dom.escuchaEstado.textContent = vista.estado;
  }

  function avisarAudioFallido(): void {
    aplicarFuente("ninguna");
    dom.escuchaEstado.textContent = MENSAJE_AUDIO_FALLIDO;
  }

  function pausarEscucha(): void {
    if (fuente !== "ninguna") aplicarFuente("ninguna");
  }

  function comprobarCuadricula(): void {
    pausarEscucha();
    const { original, roto } = beatsDeLaRonda();
    estado = comprobar(estado, cuadriculaActual);
    const resultado = evaluarJugada(original, roto, cuadriculaActual, estado.intentosFallidos);
    pintarResultado(dom.resultado, resultado, textoPuntaje(estado));
    dom.mensaje.textContent = "";
    dom.marcador.textContent = textoMarcador(estado.puntaje);
    if (estado.rondaResuelta) {
      ronda += 1;
      empezarRonda();
      return;
    }
    actualizarErrores();
    actualizarPista();
  }

  function abrirTutorial(contenido: Tutorial, alCerrar: () => void): void {
    if (tutorialAbierto !== null) return;
    pausarEscucha();
    tutorialAbierto = crearTutorialUI(contenido, {
      alCerrar: () => {
        tutorialAbierto = null;
        alCerrar();
      },
    });
    dom.seccion.append(tutorialAbierto.elemento);
    tutorialAbierto.abrir();
  }

  function abrirTutorialControles(): void {
    abrirTutorial(tutorial, () => {
      registroTutoriales.marcarVisto(tutorial.id);
      dom.play.focus();
    });
  }

  function abrirTutorialTeoria(): void {
    abrirTutorial(tutorialTeoria, () => dom.teoria.focus());
  }

  dom.play.addEventListener("click", () => aplicarFuente(alternarEscucha(fuente, "roto")));
  dom.ayuda.addEventListener("click", () => aplicarFuente(alternarEscucha(fuente, "correcto")));
  dom.tempoSlider.addEventListener("input", () => ponerTempo(Number(dom.tempoSlider.value)));
  dom.comprobar.addEventListener("click", comprobarCuadricula);
  dom.reiniciar.addEventListener("click", reiniciarCuadricula);
  dom.como.addEventListener("click", abrirTutorialControles);
  dom.teoria.addEventListener("click", abrirTutorialTeoria);
  const desuscribirPaso = reproductor.alPaso((paso) => indicador.ponerPasoActual(paso));

  empezarRonda();
  pintarEscucha();
  if (!registroTutoriales.visto(tutorial.id)) abrirTutorialControles();

  function destruir(): void {
    tutorialAbierto?.destruir();
    tutorialAbierto = null;
    reproductor.pausar();
    desuscribirPaso();
    indicador.ponerPasoActual(null);
    if (reproductorPropio) reproductor.destruir();
    dom.seccion.remove();
  }

  return { elemento: dom.seccion, destruir };
}

function textoMarcador({ nivel, puntos, racha }: Puntaje): string {
  return `Nivel ${nivel} · Puntos ${puntos} · Racha ${racha}`;
}

function textoPuntaje(estado: EstadoJuego): string {
  return `${textoMarcador(estado.puntaje)} · Intentos fallidos ${estado.intentosFallidos}`;
}

function textoPistaFallos(intentosFallidos: number): string {
  const fallos = Math.min(intentosFallidos, FALLOS_EN_PISTA);
  return `Tras ${FALLOS_EN_PISTA} intentos fallidos se marcan en rojo las celdas equivocadas (${fallos}/${FALLOS_EN_PISTA})`;
}

function ponerBotonEscucha(boton: HTMLButtonElement, etiqueta: string, suena: boolean): void {
  boton.textContent = etiqueta;
  boton.setAttribute("aria-label", etiqueta);
  boton.setAttribute("aria-pressed", String(suena));
}

function pintarResultado(panel: HTMLElement, resultado: ResultadoJugada, puntaje: string): void {
  const piezas: HTMLElement[] = [
    crearElemento("h2", "juego__resultado-titulo", resultado.titulo),
    crearElemento("p", "juego__resultado-resumen", resultado.resumen),
  ];
  if (resultado.motivos.length > 0) {
    const motivos = crearElemento("ul", "juego__resultado-motivos");
    motivos.append(...resultado.motivos.map((motivo) => crearElemento("li", "", motivo)));
    piezas.push(motivos);
  }
  piezas.push(crearElemento("p", "juego__resultado-puntaje", puntaje));
  panel.replaceChildren(...piezas);
  panel.dataset.estado = resultado.acierto ? "acierto" : "fallo";
  panel.hidden = false;
}

function crearElemento<K extends keyof HTMLElementTagNameMap>(
  etiqueta: K,
  clase: string,
  texto = "",
): HTMLElementTagNameMap[K] {
  const elemento = document.createElement(etiqueta);
  if (clase !== "") elemento.className = clase;
  elemento.textContent = texto;
  return elemento;
}

function crearBoton(clase: string, texto: string): HTMLButtonElement {
  const boton = crearElemento("button", clase, texto);
  boton.type = "button";
  return boton;
}

function crearGrupo(clase: string, nombre: string): HTMLDivElement {
  const grupo = crearElemento("div", clase);
  grupo.setAttribute("role", "group");
  grupo.setAttribute("aria-label", nombre);
  return grupo;
}

function crearLineaEtiquetada(clase: string, etiqueta: string, texto: string): HTMLParagraphElement {
  const linea = crearElemento("p", clase);
  linea.append(crearElemento("strong", "", etiqueta), ` ${texto}`);
  return linea;
}

function crearSuperior(objetivoTutorial: string, aprendesTeoria: string) {
  const superior = crearElemento("header", "juego__superior");
  const titulo = crearElemento("h1", "juego__titulo", "Arregla el beat");
  titulo.id = "juego-titulo";

  const marcador = crearElemento("div", "juego__marcador", textoMarcador(crearJuego().puntaje));
  marcador.setAttribute("aria-live", "polite");

  const objetivo = crearLineaEtiquetada("juego__objetivo", "Objetivo:", objetivoTutorial);
  const aprendes = crearLineaEtiquetada("juego__aprendes", "Aprendes:", aprendesTeoria);

  const ayudas = crearElemento("div", "juego__ayudas");
  const como = crearBoton("juego__como", "¿Cómo se juega?");
  const teoria = crearBoton("juego__teoria", "Teoría del beat");
  ayudas.append(como, teoria);

  superior.append(titulo, marcador, objetivo, aprendes, ayudas);
  return { superior, marcador, como, teoria };
}

function crearTempo() {
  const tempo = crearElemento("label", "juego__tempo", "Tempo");
  const tempoSlider = crearElemento("input", "juego__tempo-slider");
  tempoSlider.type = "range";
  tempoSlider.min = String(TEMPO_MIN);
  tempoSlider.max = String(TEMPO_MAX);
  const tempoValor = crearElemento("output", "juego__tempo-valor");
  tempo.append(tempoSlider, tempoValor);
  return { tempo, tempoSlider, tempoValor };
}

function crearEscucha() {
  const escucha = crearGrupo("juego__escucha", "Escucha");
  const play = crearBoton("juego__play", "");
  const ayuda = crearBoton("juego__ayuda", "");
  const { tempo, tempoSlider, tempoValor } = crearTempo();
  const escuchaEstado = crearElemento("p", "juego__escucha-estado");
  escuchaEstado.setAttribute("aria-live", "polite");

  escucha.append(play, ayuda, tempo, escuchaEstado);
  return { escucha, play, ayuda, tempoSlider, tempoValor, escuchaEstado };
}

function crearControles() {
  const controles = crearGrupo("juego__controles", "Controles");
  const comprobar = crearBoton("juego__comprobar", "Comprobar");
  const reiniciar = crearBoton("juego__reiniciar", "Reiniciar");
  const ayudaPista = crearElemento("span", "juego__ayuda-pista");

  controles.append(comprobar, reiniciar, ayudaPista);
  return { controles, comprobar, reiniciar, ayudaPista };
}

function crearAvisos() {
  const mensaje = crearElemento("p", "juego__mensaje");
  mensaje.setAttribute("aria-live", "polite");

  const resultado = crearElemento("section", "juego__resultado");
  resultado.setAttribute("aria-live", "polite");
  resultado.hidden = true;

  const oculta = crearElemento("p", "juego__oculta", AVISO_CUADRICULA_OCULTA);
  oculta.hidden = true;
  return { mensaje, resultado, oculta };
}

function crearDom(objetivoTutorial: string, aprendesTeoria: string) {
  const seccion = crearElemento("section", "juego");
  seccion.setAttribute("aria-labelledby", "juego-titulo");
  const { superior, ...encabezado } = crearSuperior(objetivoTutorial, aprendesTeoria);
  const { escucha, ...piezasEscucha } = crearEscucha();
  const { controles, ...botones } = crearControles();
  const avisos = crearAvisos();

  const volver = crearElemento("a", "juego__volver", "← Volver al menú");
  volver.href = "#/";

  seccion.append(
    superior,
    escucha,
    controles,
    avisos.mensaje,
    avisos.resultado,
    avisos.oculta,
    volver,
  );
  return { seccion, escucha, volver, ...encabezado, ...piezasEscucha, ...botones, ...avisos };
}

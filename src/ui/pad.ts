/**
 * Pad XY reutilizable: un recuadro cuadrado con un punto que se arrastra con
 * mouse, dedo o teclado. No conoce el sinte ni los juegos: avisa por callbacks
 * (presionar, mover, soltar) y pinta el texto de cada eje con la función que le dan.
 * Los estilos viven en src/ui/app.css (.pad*); aquí solo el DOM del contrato.
 *
 * CONTRATO DE DOM:
 * <div class="pad">
 *   <div class="pad__marco">
 *     <span class="pad__eje pad__eje--y" aria-hidden="true">Resonancia ↑</span>
 *     <div class="pad__area" tabindex="0" role="application"
 *          aria-label="Pad. Horizontal: Corte. Vertical: Resonancia. Flechas mueven el punto, Shift mueve más, Espacio mantiene o suelta la nota."
 *          data-sonando="false">
 *       <span class="pad__objetivo" hidden aria-hidden="true"></span>
 *       <span class="pad__punto" aria-hidden="true"></span>
 *     </div>
 *     <span class="pad__eje pad__eje--x" aria-hidden="true">Corte →</span>
 *   </div>
 *   <div class="pad__lectura" aria-live="polite">
 *     <p class="pad__valor pad__valor--x">Horizontal · Corte: 1.2 kHz</p>
 *     <p class="pad__valor pad__valor--y">Vertical · Resonancia: 40 %</p>
 *   </div>
 * </div>
 * El punto y el objetivo se colocan con style.left = x*100 % y style.bottom = y*100 %
 * (origen abajo a la izquierda). data-sonando="true" mientras la nota está mantenida.
 */
import type { PosicionPad } from "../core/synthTypes";

/** Paso de las flechas y paso con Shift (fracción del eje). */
export const PASO_PAD = 0.02;
export const PASO_PAD_SHIFT = 0.1;

/** Qué controla un eje y cómo se lee su valor. */
export interface EjePad {
  /** Nombre del parámetro, p. ej. "Corte". Va en el borde del recuadro y en el aria-label. */
  nombre: string;
  /** Texto completo del valor para una posición 0..1, p. ej. (0.5) -> "Corte: 800 Hz". */
  etiqueta(posicion: number): string;
}

export interface OpcionesPad {
  ejeX: EjePad;
  ejeY: EjePad;
  /** Posición inicial. Por defecto { x: 0.5, y: 0.5 }. */
  posicion?: PosicionPad;
  /** Empieza a mantenerse la nota (pointerdown o Espacio). Recibe la posición ya actualizada. */
  alPresionar(posicion: PosicionPad): void;
  /** El punto cambió de lugar (arrastre o flechas), suene o no. */
  alMover(posicion: PosicionPad): void;
  /** Se soltó la nota (pointerup/cancel, Espacio otra vez, perder el foco o soltar()). */
  alSoltar(): void;
}

export interface PadUI {
  elemento: HTMLElement;
  /** Copia de la posición actual. */
  posicion(): PosicionPad;
  /** Mueve el punto sin llamar a alMover; recorta a 0..1 y actualiza la lectura. */
  ponerPosicion(posicion: PosicionPad): void;
  /** Cambia qué controla cada eje: bordes, aria-label y lectura. No mueve el punto. */
  ponerEjes(ejeX: EjePad, ejeY: EjePad): void;
  /** Dibuja el objetivo en esa posición, o lo oculta con null. */
  mostrarObjetivo(posicion: PosicionPad | null): void;
  /** true mientras la nota está mantenida. */
  sonando(): boolean;
  /** Si la nota está mantenida la suelta (llama a alSoltar una vez). El punto se queda donde está. */
  soltar(): void;
}

/**
 * Crea el pad.
 * Usa: nada del core salvo el tipo PosicionPad. Lo usa la pantalla de Explora el sinte.
 * Idea:
 * - estado: posicion, mantenida (boolean), punteroActivo (pointerId | null).
 * - puntero sobre .pad__area: pointerdown -> preventDefault, area.setPointerCapture?.(id) (en jsdom no existe: llamada opcional
 *   dentro de try), calcula posición, alMover si cambió y alPresionar; pointermove solo si es el puntero activo -> alMover;
 *   pointerup / pointercancel del puntero activo -> alSoltar. El punto NO vuelve al centro.
 * - posición desde el evento: r = area.getBoundingClientRect(); x = (clientX - r.left)/r.width; y = 1 - (clientY - r.top)/r.height;
 *   recortar a 0..1. Trampa: si r.width o r.height es 0 se conserva la posición anterior (no NaN).
 * - teclado sobre .pad__area (keydown): flechas ±PASO_PAD, con shiftKey ±PASO_PAD_SHIFT; Arriba y Derecha suman.
 *   Redondear a 4 decimales tras sumar (0.5 + 0.02*3 no debe dar 0.5600000001) y recortar a 0..1. preventDefault en flechas y Espacio
 *   (la página no se desplaza). Espacio (" " o code "Space", ignorando event.repeat): alterna mantener/soltar.
 * - blur del área con la nota mantenida por teclado -> soltar.
 * - cada cambio de posición o de ejes reescribe los dos <p> de la lectura: "Horizontal · " + ejeX.etiqueta(x) y "Vertical · " + ejeY.etiqueta(y)
 *   (aria-live los anuncia). Bordes: "<nombre> →" y "<nombre> ↑".
 * - alMover no se llama si la posición no cambió (flecha contra el borde).
 * Casos: (montado en document.body, con area.getBoundingClientRect simulado a left 0, top 0, 200x200)
 * - recién creado con ejes Corte/Resonancia: lectura "Horizontal · Corte: …" y "Vertical · Resonancia: …"; posicion() -> { x: 0.5, y: 0.5 };
 *   data-sonando "false"; ningún callback llamado
 * - pointerdown en clientX 50, clientY 50 -> alPresionar({ x: 0.25, y: 0.75 }), data-sonando "true", punto con left "25%" y bottom "75%"
 * - pointermove a (200, 200) -> alMover({ x: 1, y: 0 }); pointerup -> alSoltar 1 vez, data-sonando "false", posicion() sigue { x: 1, y: 0 }
 * - foco en el área + ArrowRight -> x 0.52; Shift+ArrowUp -> y 0.6; ArrowLeft en x 0 -> sigue 0 y alMover no se llama
 * - Espacio -> alPresionar y data-sonando "true"; Espacio otra vez -> alSoltar; el evento queda con defaultPrevented
 * - ponerEjes({ nombre: "Tono", … }, …) -> el borde dice "Tono →" y la lectura cambia de nombre
 * - mostrarObjetivo({ x: 0.2, y: 0.8 }) -> .pad__objetivo visible con left "20%" y bottom "80%"; mostrarObjetivo(null) -> hidden
 * - soltar() con la nota mantenida -> alSoltar 1 vez; soltar() sin nota -> 0 veces
 */
export function crearPad(opciones: OpcionesPad): PadUI {
  throw new Error("devclean: sin implementar");
}

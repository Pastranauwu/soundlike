/**
 * Estado de la ESCUCHA de "Arregla el beat" (puro: sin DOM ni Tone.js).
 * Decide qué beat suena (el roto o el correcto), qué dice cada botón y si la
 * cuadrícula se ve. Lo usa solo screen.ts, que es quien toca el reproductor.
 * Regla del juego: mientras suena cualquier beat la cuadrícula está OCULTA y
 * solo se ve el indicador del paso actual (src/ui/indicadorPasos.ts).
 */

/** Qué está sonando. "roto" = la cuadrícula del jugador (beat roto + sus correcciones). */
export type FuenteEscucha = "ninguna" | "roto" | "correcto";

/** Lo que la pantalla pinta para una fuente dada. Todo en español. */
export interface VistaEscucha {
  /** Texto y aria-label del botón .juego__play. */
  etiquetaRoto: string;
  /** Texto y aria-label del botón .juego__ayuda. */
  etiquetaCorrecto: string;
  /** false mientras suena algo: la pantalla oculta la cuadrícula. */
  cuadriculaVisible: boolean;
  /** Frase para .juego__escucha-estado (aria-live). */
  estado: string;
}

/**
 * Fuente que queda tras pulsar un botón de escucha.
 * Si actual === pulsada, pausa (devuelve "ninguna"); si no, cambia a pulsada.
 */
export function alternarEscucha(
  actual: FuenteEscucha,
  pulsada: Exclude<FuenteEscucha, "ninguna">,
): FuenteEscucha {
  return actual === pulsada ? "ninguna" : pulsada;
}

/**
 * Textos y visibilidad para una fuente.
 * Tabla fija de 3 casos: mientras suena algo, la cuadrícula se oculta
 * y los botones muestran cuál suena (diciendo "Pausar") y el que no.
 */
export function vistaEscucha(fuente: FuenteEscucha): VistaEscucha {
  const vistas: Record<FuenteEscucha, VistaEscucha> = {
    ninguna: {
      etiquetaRoto: "Escuchar el beat roto",
      etiquetaCorrecto: "Escuchar el correcto",
      cuadriculaVisible: true,
      estado: "En pausa. Elige qué beat escuchar: el paso que suena se ilumina aquí.",
    },
    roto: {
      etiquetaRoto: "Pausar",
      etiquetaCorrecto: "Escuchar el correcto",
      cuadriculaVisible: false,
      estado: "Suena el beat roto. La cuadrícula se oculta mientras escuchas: sigue el paso iluminado.",
    },
    correcto: {
      etiquetaRoto: "Escuchar el beat roto",
      etiquetaCorrecto: "Pausar",
      cuadriculaVisible: false,
      estado: "Suena el beat correcto. La cuadrícula se oculta mientras escuchas: sigue el paso iluminado.",
    },
  };
  return { ...vistas[fuente] };
}

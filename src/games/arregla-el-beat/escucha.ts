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
 * Entradas: actual = lo que suena ahora; pulsada = botón pulsado.
 * Quién lo usa: screen.ts en el clic de .juego__play ("roto") y .juego__ayuda ("correcto").
 * Idea: pulsar el botón de lo que ya suena = pausar ("ninguna"); cualquier otro
 * caso = pasa a sonar la pulsada (cambio directo roto<->correcto sin pausa).
 * Casos:
 * - ("ninguna", "roto") -> "roto"
 * - ("roto", "roto") -> "ninguna"
 * - ("roto", "correcto") -> "correcto"
 * - ("correcto", "correcto") -> "ninguna"
 */
export function alternarEscucha(
  actual: FuenteEscucha,
  pulsada: Exclude<FuenteEscucha, "ninguna">,
): FuenteEscucha {
  void actual;
  void pulsada;
  throw new Error("devclean: sin implementar");
}

/**
 * Textos y visibilidad para una fuente.
 * Quién lo usa: screen.ts cada vez que cambia la fuente (y al montar con "ninguna").
 * Idea: tabla fija de 3 entradas, textos EXACTOS:
 * - "ninguna": etiquetaRoto "Escuchar el beat roto", etiquetaCorrecto "Escuchar el correcto",
 *   cuadriculaVisible true,
 *   estado "En pausa. Elige qué beat escuchar: el paso que suena se ilumina aquí."
 * - "roto": etiquetaRoto "Pausar", etiquetaCorrecto "Escuchar el correcto", cuadriculaVisible false,
 *   estado "Suena el beat roto. La cuadrícula se oculta mientras escuchas: sigue el paso iluminado."
 * - "correcto": etiquetaRoto "Escuchar el beat roto", etiquetaCorrecto "Pausar", cuadriculaVisible false,
 *   estado "Suena el beat correcto. La cuadrícula se oculta mientras escuchas: sigue el paso iluminado."
 * Devuelve objeto nuevo en cada llamada.
 * Casos:
 * - vistaEscucha("ninguna").cuadriculaVisible -> true; .etiquetaRoto -> "Escuchar el beat roto"
 * - vistaEscucha("roto").etiquetaRoto -> "Pausar"; .cuadriculaVisible -> false
 * - vistaEscucha("correcto").etiquetaCorrecto -> "Pausar"; .estado empieza con "Suena el beat correcto."
 */
export function vistaEscucha(fuente: FuenteEscucha): VistaEscucha {
  void fuente;
  throw new Error("devclean: sin implementar");
}

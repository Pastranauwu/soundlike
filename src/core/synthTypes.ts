/**
 * Tipos del sintetizador de una voz y de sus parámetros. Solo DECLARACIONES.
 * Los usan src/core/synthParams.ts (puro), src/core/synth.ts (Tone.js),
 * src/ui/pad.ts (solo PosicionPad) y los juegos. El core no conoce juegos.
 */

/** Forma de onda del oscilador (ids en español; synth.ts los traduce a Tone.js). */
export type FormaOnda = "seno" | "triangulo" | "sierra" | "cuadrada";

/** Parámetros del sinte que se pueden poner en un eje del pad. */
export type IdParametro =
  | "tono"
  | "volumen"
  | "forma"
  | "corte"
  | "resonancia"
  | "ataque"
  | "relajacion"
  | "lfoVelocidad"
  | "lfoProfundidad";

/** Cómo se reparte el eje 0..1: lineal, exponencial (min * (max/min)^p) o 4 zonas iguales. */
export type EscalaParametro = "lineal" | "exponencial" | "zonas";

/** Ficha de un parámetro: nombre visible en español, unidad y rango de su valor. */
export interface DefinicionParametro {
  id: IdParametro;
  /** Nombre visible, p. ej. "Corte". */
  nombre: string;
  /** Unidad del valor crudo: "Hz", "s", "%", "nota" o "" (forma de onda). */
  unidad: string;
  escala: EscalaParametro;
  /** Valor en posición 0. */
  min: number;
  /** Valor en posición 1. */
  max: number;
}

/** Posición del punto en el pad. Origen abajo a la izquierda; x e y entre 0 y 1. */
export interface PosicionPad {
  x: number;
  y: number;
}

/**
 * Estado completo del sinte, en unidades de usuario.
 * volumen, resonancia y lfoProfundidad van de 0 a 1 (se muestran como %).
 */
export interface AjustesSinte {
  /** Hz del oscilador (C2 = 65.41 … C6 = 1046.50). */
  frecuencia: number;
  /** 0..1. El sinte lo convierte en ganancia con tope (ver synth.ts). */
  volumen: number;
  forma: FormaOnda;
  /** Hz de corte del pasa-bajos, 80..8000. */
  corte: number;
  /** 0..1 (synth.ts lo convierte a Q). */
  resonancia: number;
  /** Segundos, 0.005..2. */
  ataque: number;
  /** Segundos, 0.05..3. */
  relajacion: number;
  /** Hz del LFO, 0.1..20. */
  lfoVelocidad: number;
  /** 0..1: cuánto mueve el LFO el corte del filtro. 0 = quieto. */
  lfoProfundidad: number;
}

/**
 * Puerto del sintetizador de una voz. Implementación real: crearSinte() de
 * src/core/synth.ts (Tone.js). En pruebas se sustituye por un fake que anota llamadas.
 * Los juegos lo reciben por parámetro (como fábrica: se crea en el primer gesto).
 */
export interface Sinte {
  /** Aplica solo los campos presentes; suene o no la nota. No lanza con valores fuera de rango: los recorta. */
  ajustar(cambios: Partial<AjustesSinte>): void;
  /** Empieza la nota (ataque). Llamarla dos veces seguidas no apila notas. */
  iniciarNota(): void;
  /** Suelta la nota: se apaga con su relajación. Sin nota sonando no hace nada. */
  soltarNota(): void;
  /** Corta el sonido y libera los nodos de audio. Después de esto no se usa más. */
  destruir(): void;
}

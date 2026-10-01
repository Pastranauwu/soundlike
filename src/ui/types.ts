/**
 * Tipos compartidos de la interfaz (tutoriales). Solo DECLARACIONES, sin lógica.
 * Los usan src/ui/tutorial.ts, src/ui/registroTutoriales.ts, src/screens/tutoriales.ts
 * y cada juego, que publica su propio Tutorial (p. ej. src/games/arregla-el-beat/tutorial.ts).
 * src/ui no conoce juegos: recibe los Tutorial por parámetro.
 */

/** Una pantalla del tutorial. */
export interface PasoTutorial {
  /** Título corto de la pantalla, p. ej. "La cuadrícula". */
  titulo: string;
  /** Párrafo principal en español. */
  texto: string;
  /** Viñetas de apoyo (0 a 5), en español. */
  puntos: string[];
}

/**
 * Tutorial de un juego o de teoría (didáctico): 1 o 2 pantallas, más lo que se
 * gana y lo que se aprende.
 */
export interface Tutorial {
  /** Id del juego; es también la clave en RegistroTutoriales. P. ej. "arregla-el-beat". */
  id: string;
  /** Nombre visible del juego, p. ej. "Arregla el beat". */
  juego: string;
  /**
   * Hash de la ruta del juego, p. ej. "#/arregla-el-beat". "" = tutorial de
   * teoría sin juego propio: la pantalla Tutoriales no muestra el enlace "Jugar".
   */
  ruta: string;
  /** Cómo se gana, una frase. Se ve en el tutorial, en la pantalla de juego y en Tutoriales. */
  objetivo: string;
  /** Qué se aprende jugando, una frase. */
  aprendes: string;
  /** 1 o 2 pantallas. */
  pasos: PasoTutorial[];
}

/** Por qué se cerró un tutorial. */
export type MotivoCierreTutorial = "saltar" | "terminar";

/**
 * Puerto: recuerda qué tutoriales ya vio el jugador.
 * Implementación real: src/ui/registroTutoriales.ts (localStorage).
 * En pruebas se sustituye por un fake en memoria.
 */
export interface RegistroTutoriales {
  visto(id: string): boolean;
  marcarVisto(id: string): void;
}

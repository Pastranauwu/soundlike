/**
 * Tipos del juego "Arregla el beat". Solo DECLARACIONES, sin lógica.
 * Estos tipos son del juego: src/core no los conoce.
 */
import type { Cuadricula, Puntaje } from "../../core/types";

/** Un beat del banco: 4 pistas de batería x 16 pasos, con nombre, género y tempo. */
export interface Beat {
  id: string;
  nombre: string;
  genero: string;
  tempo: number;
  cuadricula: Cuadricula;
}

/** Resultado de pulsar "Comprobar" en una ronda. */
export interface ResultadoComprobacion {
  acierto: boolean;
  /** Frase en español que se muestra al jugador. */
  mensaje: string;
}

/** Estado completo del juego (inmutable: cada función devuelve uno nuevo). */
export interface EstadoJuego {
  /** Beat correcto de la ronda actual; null antes de la primera ronda. */
  beatOriginal: Beat | null;
  /** Versión rota que escucha y edita el jugador; null antes de la primera ronda. */
  beatRoto: Beat | null;
  puntaje: Puntaje;
  /** Fallos seguidos en la ronda actual. */
  intentosFallidos: number;
  /** true cuando el jugador ya igualó el beat original. */
  rondaResuelta: boolean;
  ultimo: ResultadoComprobacion | null;
}

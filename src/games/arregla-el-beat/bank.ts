/**
 * Banco de beats del juego. DATOS puros: no importa Tone.js ni el DOM.
 * Cada beat tiene exactamente las 4 pistas de PISTAS_BATERIA x 16 pasos.
 * Lo usan la pantalla del juego y la lógica de rondas (juego.ts).
 * Las 4 pistas y su orden las define PISTAS_BATERIA de src/core/types.
 */
import type { Beat } from "./types";

/**
 * Devuelve el banco de 10 beats.
 * Salida: array de 10 Beat distintos, cada uno con id único, nombre y género en
 * español, tempo dentro de 60-180 bpm y cuadrícula con exactamente las claves de
 * PISTAS_BATERIA (4 filas de 16 booleanos, con al menos un golpe por pista).
 * Géneros: al menos un beat de cada uno: "hip-hop", "boom bap", "reggaetón",
 * "house" y "rock".
 * Casos:
 * - obtenerBanco().length === 10
 * - todos los tempos entre 60 y 180; todas las cuadrículas 4 pistas x 16 pasos
 * - los géneros incluyen "hip-hop", "boom bap", "reggaetón", "house" y "rock"
 */
export function obtenerBanco(): Beat[] {
  throw new Error("devclean: sin implementar");
}

/**
 * Elige un beat del banco de forma determinista a partir de una semilla.
 * Entrada: número entero de semilla (cualquier entero, incluidos negativos).
 * Salida: siempre el mismo Beat para la misma semilla.
 * Casos:
 * - elegirBeat(7) devuelve siempre el mismo beat
 * - elegirBeat(semilla) es siempre un elemento de obtenerBanco()
 * - semillas 0..9 reparten entre varios beats distintos
 */
export function elegirBeat(semilla: number): Beat {
  throw new Error("devclean: sin implementar");
}

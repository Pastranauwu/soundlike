/**
 * Frases de feedback en español que explican el error al acertar.
 * FUNCIONES PURAS: no importa Tone.js ni el DOM.
 * Depende de celdasDistintas de src/core/sequencer. Lo usa juego.ts (comprobar).
 */
import type { Beat } from "./types";

/**
 * Explica en español las diferencias entre el beat original y el roto.
 * Entrada: beat original (correcto) y beat roto que escuchó el jugador.
 * Salida: una frase por pista afectada, unidas con espacio. Formato:
 * - Golpe quitado (estaba en el original y no en el roto):
 *   "El <pista> va en el paso <n> (tiempo <t>)." o, con varios:
 *   "El <pista> va en los pasos <n1> y <n2> (tiempos <t1> y <t2>)."
 * - Golpe agregado (no estaba en el original):
 *   "El <pista> no va en el paso <n>." / "El <pista> no va en los pasos <n1> y <n2>."
 * Donde <pista> es el nombre en español (Bombo, Clap, Hi-hat cerrado, Hi-hat
 * abierto), <n> es el paso 1-indexed y <t> el tiempo del compás: ceil(n/4)
 * (pasos 1-4 -> tiempo 1, 5-8 -> 2, 9-12 -> 3, 13-16 -> 4).
 * Listas de 3+ elementos con comas y "y" antes del último. Orden: el de
 * PISTAS_BATERIA y pasos ascendentes.
 * Sin diferencias -> "" (cadena vacía).
 * Casos:
 * - clap quitado en pasos 4 y 12 (0-indexed) ->
 *   "El clap va en los pasos 5 y 13 (tiempos 2 y 4)."
 * - golpe agregado en kick paso 2 -> "El bombo no va en el paso 3."
 * - sin diferencias -> ""
 */
export function explicarError(original: Beat, roto: Beat): string {
  throw new Error("devclean: sin implementar");
}

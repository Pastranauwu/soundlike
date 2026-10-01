/**
 * Resultado de una jugada de "Arregla el beat" (puro: sin DOM ni Tone.js).
 * Convierte la comparación entre la cuadrícula del jugador y el beat original
 * en un resultado claro: si acertó, y si falló POR QUÉ (qué instrumento, si
 * sobra o falta un golpe y, con más intentos, dónde). Lo pinta screen.ts en
 * .juego__resultado después de cada "Comprobar".
 */
import type { Cuadricula } from "../../core/types";
import type { Beat } from "./types";

/** Lo que ve el jugador tras pulsar "Comprobar". Todo en español. */
export interface ResultadoJugada {
  acierto: boolean;
  /** "¡Correcto!" o "Todavía no suena igual". */
  titulo: string;
  /** Una frase: en acierto la explicación del error; en fallo cuántas celdas difieren. */
  resumen: string;
  /** Por qué falló: una línea por instrumento con problemas (+ avisos). Vacío en acierto. */
  motivos: string[];
}

/**
 * Evalúa la jugada.
 * Entradas: original y roto = beats de la ronda (estado.beatOriginal / estado.beatRoto);
 *   actual = cuadrícula del jugador; intentosFallidos = fallos de la ronda CONTANDO
 *   este (1 en el primer fallo); se ignora si acierta.
 * Llama a: celdasDistintas (src/core/sequencer.ts), explicarError (./feedback.ts),
 *   PISTAS_BATERIA (src/core/types.ts) para nombres y orden. No lanza.
 * Quién lo usa: screen.ts en "Comprobar" (después de juego.comprobar).
 * Idea:
 * - dif = celdasDistintas(original.cuadricula, actual). Vacío -> acierto:
 *   titulo "¡Correcto!", resumen = explicarError(original, roto), motivos [].
 * - Fallo: titulo "Todavía no suena igual"; resumen "Hay 1 celda distinta al beat correcto."
 *   / "Hay N celdas distintas al beat correcto." (N = dif.length).
 * - Por pista, en orden de PISTAS_BATERIA, solo las que tienen diferencias:
 *   sobra = actual true y original false; falta = lo contrario. Línea:
 *   "<Nombre>: <partes unidas con ' y '>." con partes en orden sobra, falta:
 *   "sobra 1 golpe"/"sobran 2 golpes", "falta 1 golpe"/"faltan 2 golpes".
 * - Detalle de lugar pegado a cada parte según intentosFallidos (pasos visibles = índice+1):
 *   1 -> nada. 2 -> " en la primera mitad (pasos 1-8)" | " en la segunda mitad (pasos 9-16)"
 *   | " en las dos mitades". >=3 -> " en el paso 7" | " en los pasos 3 y 7" | " en los pasos 3, 7 y 11".
 * - Avisos al final de motivos, en este orden:
 *   si actual es igual a roto.cuadricula: "No cambiaste nada: la cuadrícula sigue igual que el beat roto."
 *   si hay K>0 celdas de dif que en roto estaban bien (roto == original en esa celda):
 *   "Cambiaste 1 celda que ya estaba bien: Reiniciar vuelve al beat roto." (plural:
 *   "Cambiaste K celdas que ya estaban bien: Reiniciar vuelve al beat roto.")
 * - Trampa: pista ausente en actual = fila toda en false.
 * Casos:
 * (en todos: original con clap en pasos 5 y 13; roto = original + clap extra en paso 7)
 * - actual = original -> { acierto: true, titulo: "¡Correcto!", motivos: [] } y resumen = explicarError(original, roto)
 * - actual = roto, intentos 1 -> resumen "Hay 1 celda distinta al beat correcto.";
 *   motivos ["Clap: sobra 1 golpe.", "No cambiaste nada: la cuadrícula sigue igual que el beat roto."]
 * - actual = roto, intentos 2 -> motivos[0] "Clap: sobra 1 golpe en la primera mitad (pasos 1-8)."
 * - actual = roto, intentos 3 -> motivos[0] "Clap: sobra 1 golpe en el paso 7."
 * - actual = roto sin el bombo del paso 1 (que estaba bien), intentos 1 -> resumen "Hay 2 celdas distintas al beat correcto.";
 *   motivos ["Bombo: falta 1 golpe.", "Clap: sobra 1 golpe.", "Cambiaste 1 celda que ya estaba bien: Reiniciar vuelve al beat roto."]
 */
export function evaluarJugada(
  original: Beat,
  roto: Beat,
  actual: Cuadricula,
  intentosFallidos: number,
): ResultadoJugada {
  void original;
  void roto;
  void actual;
  void intentosFallidos;
  throw new Error("devclean: sin implementar");
}

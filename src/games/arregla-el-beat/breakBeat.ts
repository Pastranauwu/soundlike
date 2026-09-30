/**
 * Rompe un beat: genera una versión con golpes agregados o quitados.
 * FUNCIÓN PURA y determinista: no importa Tone.js ni el DOM, no muta el beat.
 * Solo depende de los tipos. Lo usa juego.ts al iniciar cada ronda.
 */
import type { Beat } from "./types";

/**
 * Genera una versión rota del beat con exactamente nErrores celdas alteradas.
 * Entrada:
 * - beat: beat original (no se muta).
 * - nErrores: cuántas celdas cambiar respecto al original (1..64).
 * - semilla: número entero; la misma semilla produce siempre el mismo resultado.
 * Salida: nuevo Beat con la misma metadata (nombre, género, tempo) y una
 * cuadrícula donde exactamente nErrores celdas se invirtieron (true->false o
 * false->true), elegidas con un generador pseudoaleatorio sembrado.
 * Errores: lanza Error si nErrores < 1 o nErrores > 64.
 * La prueba verifica las diferencias con celdasDistintas de src/core/sequencer.
 * Casos:
 * - breakBeat(b, 2, 42) llamado dos veces -> resultados idénticos
 * - celdasDistintas(original.cuadricula, roto.cuadricula).length === nErrores
 * - el beat original queda intacto tras la llamada
 * - breakBeat(b, 0, 1) -> lanza Error
 * - semillas distintas -> versiones rotas distintas (en general)
 */
export function breakBeat(beat: Beat, nErrores: number, semilla: number): Beat {
  throw new Error("devclean: sin implementar");
}

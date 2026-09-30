/**
 * Modelo puro de la cuadrícula de secuenciación (N pistas x 16 pasos).
 * FUNCIONES PURAS: no importa Tone.js ni toca el DOM. No muta sus entradas.
 * Solo depende de ./types. Lo usan los juegos, la cuadrícula UI y el reproductor.
 */
import type { Celda, Cuadricula, PistaDef } from "./types";

/**
 * Crea una cuadrícula vacía (todos los pasos en false) para las pistas dadas.
 * Entrada: definiciones de pista (id + nombre), p. ej. PISTAS_BATERIA.
 * Salida: Cuadricula con una clave por pista y filas de exactamente 16 booleanos.
 * Errores: lanza Error si dos pistas repiten id.
 * Casos:
 * - crearCuadricula(PISTAS_BATERIA) -> 4 claves, cada fila de 16 false
 * - crearCuadricula([]) -> {}
 * - crearCuadricula([{id:"a",nombre:"A"},{id:"a",nombre:"B"}]) -> lanza Error
 */
export function crearCuadricula(pistas: readonly PistaDef[]): Cuadricula {
  throw new Error("devclean: sin implementar");
}

/**
 * Devuelve una NUEVA cuadrícula con un paso alternado (true->false, false->true).
 * No muta la cuadrícula original.
 * Entrada: cuadrícula, id de pista y paso 0-indexed (0..15).
 * Errores: lanza Error si la pista no existe o el paso está fuera de 0..15.
 * Casos:
 * - alternarPaso(c, "kick", 0) -> c.kick[0] pasa de false a true; la original no cambia
 * - alternarPaso(c2, "kick", 0) sobre la anterior -> vuelve a false
 * - alternarPaso(c, "kick", 16) -> lanza Error
 * - alternarPaso(c, "tom", 0) -> lanza Error
 */
export function alternarPaso(
  cuadricula: Cuadricula,
  pistaId: string,
  paso: number,
): Cuadricula {
  throw new Error("devclean: sin implementar");
}

/**
 * Lista las celdas distintas entre dos cuadrículas, en orden estable:
 * primero por pista (orden de aparición en `a`), luego por paso ascendente.
 * Solo compara las pistas presentes en `a`.
 * Entrada: dos cuadrículas con filas de 16.
 * Salida: array de Celda con paso 0-indexed.
 * Casos:
 * - celdasDistintas(c, c) -> []
 * - a.kick[3] distinto -> [{ pista: "kick", paso: 3 }]
 * - diferencias en clap pasos 4 y 12 -> [{pista:"clap",paso:4},{pista:"clap",paso:12}]
 */
export function celdasDistintas(a: Cuadricula, b: Cuadricula): Celda[] {
  throw new Error("devclean: sin implementar");
}

/**
 * true si dos cuadrículas tienen exactamente las mismas celdas activas
 * (mismas pistas y mismos valores). Equivale a celdasDistintas en ambos sentidos vacías.
 * Casos:
 * - cuadriculasIguales(c, c) -> true
 * - tras alternar un paso en una copia -> false
 */
export function cuadriculasIguales(a: Cuadricula, b: Cuadricula): boolean {
  throw new Error("devclean: sin implementar");
}

/**
 * Valida un tempo en bpm y lo devuelve.
 * Entrada: número de bpm.
 * Salida: el mismo número si está en rango.
 * Errores: lanza Error si no es finito o queda fuera de TEMPO_MIN..TEMPO_MAX (60-180).
 * Lo usan: el reproductor, la pantalla del juego y el banco de beats.
 * Casos:
 * - validarTempo(120) -> 120
 * - validarTempo(60) y validarTempo(180) -> válidos (bordes incluidos)
 * - validarTempo(59) -> lanza Error
 * - validarTempo(181) -> lanza Error
 * - validarTempo(NaN) -> lanza Error
 */
export function validarTempo(bpm: number): number {
  throw new Error("devclean: sin implementar");
}

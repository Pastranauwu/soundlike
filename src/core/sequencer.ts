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
  const ids = new Set<string>();
  const cuadricula: Cuadricula = {};
  for (const pista of pistas) {
    if (ids.has(pista.id)) {
      throw new Error(`Pista duplicada: ${pista.id}`);
    }
    ids.add(pista.id);
    cuadricula[pista.id] = new Array(16).fill(false);
  }
  return cuadricula;
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
  if (!(pistaId in cuadricula)) {
    throw new Error(`Pista no existe: ${pistaId}`);
  }
  if (paso < 0 || paso >= 16) {
    throw new Error(`Paso fuera de rango: ${paso}`);
  }
  const nueva: Cuadricula = {};
  for (const id in cuadricula) {
    if (id === pistaId) {
      nueva[id] = [...cuadricula[id]];
      nueva[id][paso] = !nueva[id][paso];
    } else {
      nueva[id] = [...cuadricula[id]];
    }
  }
  return nueva;
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
  const diferentes: Celda[] = [];
  for (const pistaId in a) {
    const filaA = a[pistaId];
    const filaB = b[pistaId] || [];
    for (let paso = 0; paso < filaA.length; paso++) {
      if (filaA[paso] !== filaB[paso]) {
        diferentes.push({ pista: pistaId, paso });
      }
    }
  }
  return diferentes;
}

/**
 * true si dos cuadrículas tienen exactamente las mismas celdas activas
 * (mismas pistas y mismos valores). Equivale a celdasDistintas en ambos sentidos vacías.
 * Casos:
 * - cuadriculasIguales(c, c) -> true
 * - tras alternar un paso en una copia -> false
 */
export function cuadriculasIguales(a: Cuadricula, b: Cuadricula): boolean {
  return celdasDistintas(a, b).length === 0 && celdasDistintas(b, a).length === 0;
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
  if (!Number.isFinite(bpm) || bpm < 60 || bpm > 180) {
    throw new Error(`Tempo fuera de rango o no finito: ${bpm}`);
  }
  return bpm;
}

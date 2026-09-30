/**
 * Rompe un beat: genera una versión con golpes agregados o quitados.
 * FUNCIÓN PURA y determinista: no importa Tone.js ni el DOM, no muta el beat.
 * Solo depende de los tipos. Lo usa juego.ts al iniciar cada ronda.
 */
import type { Beat } from "./types";
import type { Cuadricula } from "../../core/types";

function mulberry32(a: number): () => number {
  return () => {
    const t = (a += 0x6d2b79f5);
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x = x + Math.imul(x ^ (x >>> 7), 61 | x) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function copiarCuadricula(c: Cuadricula): Cuadricula {
  const copia: Cuadricula = {};
  for (const pista in c) {
    copia[pista] = [...c[pista]];
  }
  return copia;
}

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
  if (nErrores < 1 || nErrores > 64) {
    throw new Error(`nErrores debe estar entre 1 y 64, recibido: ${nErrores}`);
  }

  const rng = mulberry32(semilla);
  const nuevaCuadricula = copiarCuadricula(beat.cuadricula);

  const pistas = Object.keys(nuevaCuadricula);
  const celdasTotales = pistas.length * 16;
  const indicesDisponibles = Array.from({ length: celdasTotales }, (_, i) => i);

  // Fisher-Yates shuffle para seleccionar nErrores índices distintos
  for (let i = 0; i < nErrores; i++) {
    const randomIndex = Math.floor(rng() * (indicesDisponibles.length - i)) + i;
    [indicesDisponibles[i], indicesDisponibles[randomIndex]] = [indicesDisponibles[randomIndex], indicesDisponibles[i]];
  }

  // Invertir las celdas seleccionadas
  for (let i = 0; i < nErrores; i++) {
    const indiceGlobal = indicesDisponibles[i];
    const pistaIndex = Math.floor(indiceGlobal / 16);
    const pasoIndex = indiceGlobal % 16;
    const pistaNombre = pistas[pistaIndex];

    nuevaCuadricula[pistaNombre][pasoIndex] = !nuevaCuadricula[pistaNombre][pasoIndex];
  }

  return {
    id: beat.id,
    nombre: beat.nombre,
    genero: beat.genero,
    tempo: beat.tempo,
    cuadricula: nuevaCuadricula,
  };
}

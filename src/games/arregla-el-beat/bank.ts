/**
 * Banco de beats del juego. DATOS puros: no importa Tone.js ni el DOM.
 * Cada beat tiene exactamente las 4 pistas de PISTAS_BATERIA x 16 pasos.
 * Lo usan la pantalla del juego y la lógica de rondas (juego.ts).
 * Las 4 pistas y su orden las define PISTAS_BATERIA de src/core/types.
 */
import { PISTAS_BATERIA } from "../../core/types";
import type { Beat } from "./types";

/** Construye una fila de 16 pasos con golpe en los índices dados (0-indexed). */
function fila(indices: number[]): boolean[] {
  const pasos = new Array(16).fill(false);
  for (const indice of indices) {
    pasos[indice] = true;
  }
  return pasos;
}

/** Construye una Cuadricula de las 4 pistas de PISTAS_BATERIA a partir de sus índices de golpe. */
function cuadricula(golpes: {
  kick: number[];
  clap: number[];
  "closed-hat": number[];
  "open-hat": number[];
}): Beat["cuadricula"] {
  const resultado: Beat["cuadricula"] = {};
  for (const pista of PISTAS_BATERIA) {
    resultado[pista.id] = fila(golpes[pista.id as keyof typeof golpes]);
  }
  return resultado;
}

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
  return [
    {
      id: "hip-hop-boom-bap-clasico",
      nombre: "Boom Bap Clásico",
      genero: "hip-hop",
      tempo: 90,
      cuadricula: cuadricula({
        kick: [0, 6, 10],
        clap: [4, 12],
        "closed-hat": [0, 2, 4, 6, 8, 10, 12, 14],
        "open-hat": [14],
      }),
    },
    {
      id: "hip-hop-golpe-de-calle",
      nombre: "Golpe de Calle",
      genero: "hip-hop",
      tempo: 95,
      cuadricula: cuadricula({
        kick: [0, 3, 8, 11],
        clap: [4, 12],
        "closed-hat": [0, 2, 4, 6, 8, 10, 12, 14],
        "open-hat": [6],
      }),
    },
    {
      id: "boom-bap-jazzy",
      nombre: "Boom Bap Jazzy",
      genero: "boom bap",
      tempo: 88,
      cuadricula: cuadricula({
        kick: [0, 7, 10],
        clap: [4, 12],
        "closed-hat": [0, 2, 4, 6, 8, 10, 12, 14],
        "open-hat": [15],
      }),
    },
    {
      id: "boom-bap-sample-viejo",
      nombre: "Sample Viejo",
      genero: "boom bap",
      tempo: 92,
      cuadricula: cuadricula({
        kick: [0, 5, 8, 13],
        clap: [4, 12],
        "closed-hat": [0, 2, 4, 6, 8, 10, 12, 14],
        "open-hat": [10],
      }),
    },
    {
      id: "reggaeton-dembow-clasico",
      nombre: "Dembow Clásico",
      genero: "reggaetón",
      tempo: 95,
      cuadricula: cuadricula({
        kick: [0, 4, 8, 12],
        clap: [3, 6, 11, 14],
        "closed-hat": [0, 2, 4, 6, 8, 10, 12, 14],
        "open-hat": [7, 15],
      }),
    },
    {
      id: "reggaeton-perreo-intenso",
      nombre: "Perreo Intenso",
      genero: "reggaetón",
      tempo: 98,
      cuadricula: cuadricula({
        kick: [0, 4, 8, 12],
        clap: [3, 6, 11, 14],
        "closed-hat": [0, 1, 2, 4, 6, 8, 9, 10, 12, 14],
        "open-hat": [3, 11],
      }),
    },
    {
      id: "house-four-on-the-floor",
      nombre: "Four on the Floor",
      genero: "house",
      tempo: 124,
      cuadricula: cuadricula({
        kick: [0, 4, 8, 12],
        clap: [4, 12],
        "closed-hat": [0, 2, 4, 6, 8, 10, 12, 14],
        "open-hat": [2, 6, 10, 14],
      }),
    },
    {
      id: "house-deep-nocturno",
      nombre: "Deep House Nocturno",
      genero: "house",
      tempo: 120,
      cuadricula: cuadricula({
        kick: [0, 4, 8, 12],
        clap: [4, 12],
        "closed-hat": [2, 6, 10, 14],
        "open-hat": [2, 6, 10, 14],
      }),
    },
    {
      id: "rock-clasico",
      nombre: "Rock Clásico",
      genero: "rock",
      tempo: 120,
      cuadricula: cuadricula({
        kick: [0, 8, 10],
        clap: [4, 12],
        "closed-hat": [0, 2, 4, 6, 8, 10, 12, 14],
        "open-hat": [15],
      }),
    },
    {
      id: "rock-rapido",
      nombre: "Rock Rápido",
      genero: "rock",
      tempo: 150,
      cuadricula: cuadricula({
        kick: [0, 6, 8, 14],
        clap: [4, 12],
        "closed-hat": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
        "open-hat": [7],
      }),
    },
  ];
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
  const banco = obtenerBanco();
  const indice = ((semilla % banco.length) + banco.length) % banco.length;
  return banco[indice];
}

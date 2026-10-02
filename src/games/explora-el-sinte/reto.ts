/**
 * Lógica del reto "Imita el sonido". PURO e inmutable: no importa Tone.js ni el DOM.
 * Depende solo de tipos (core/synthTypes y ./types). Lo usa screen.ts.
 */
import type { IdParametro, PosicionPad } from "../../core/synthTypes";
import type { Eje, EjesLeccion, EstadoReto, ResultadoReto } from "./types";

/** Distancia máxima por eje para acertar (12 % del pad). */
export const TOLERANCIA = 0.12;
/** Fallos a partir de los cuales el objetivo se dibuja en el pad. */
export const FALLOS_PARA_VER_OBJETIVO = 3;
/** El objetivo cae siempre dentro de este tramo de cada eje (lejos de los bordes y audible). */
export const OBJETIVO_MIN = 0.15;
export const OBJETIVO_MAX = 0.85;

/**
 * Objetivo oculto del reto, determinista por semilla.
 * Entrada: ejes de la lección y semilla entera.
 * Idea:
 * - PRNG mulberry32 sembrado con (semilla >>> 0); primer número -> x, segundo -> y.
 * - cada coordenada = OBJETIVO_MIN + r*(OBJETIVO_MAX - OBJETIVO_MIN), redondeada a 2 decimales.
 * - si el eje es "forma": ajustar al centro de su zona (floor(p*4) + 0.5)/4, así ±12 % nunca cambia de forma de onda.
 * - no usar Math.random ni la fecha.
 * Casos:
 * - generarObjetivo(ejes, 7) dos veces -> el mismo { x, y }
 * - semillas 1..20 -> x e y siempre entre 0.15 y 0.85, y al menos 2 objetivos distintos
 * - ejes { x: "forma", y: "tono" } -> x es uno de 0.125, 0.375, 0.625, 0.875
 * - generarObjetivo(ejes, 1) distinto de generarObjetivo(ejes, 2)
 */
export function generarObjetivo(ejes: EjesLeccion, semilla: number): PosicionPad {
  throw new Error("devclean: sin implementar");
}

/**
 * Empieza un reto: objetivo de la semilla y 0 fallos.
 * Usa: generarObjetivo.
 * Casos:
 * - crearReto(ejes, 3) -> { ejes, semilla: 3, objetivo: generarObjetivo(ejes, 3), fallos: 0 }
 */
export function crearReto(ejes: EjesLeccion, semilla: number): EstadoReto {
  throw new Error("devclean: sin implementar");
}

/**
 * Pista de un eje fallido, con el nombre del parámetro y hacia dónde mover el punto.
 * Entrada: parámetro del eje, eje, y si hay que subir el valor (objetivo mayor que el punto).
 * Salida: "<frase>: mueve el punto <dirección>".
 * Idea:
 * - dirección: x subir "a la derecha", x bajar "a la izquierda", y subir "hacia arriba", y bajar "hacia abajo".
 * - frase (subir / bajar):
 *   tono: "Te falta subir el tono" / "Te falta bajar el tono"
 *   volumen: "Te falta subir el volumen" / "Te falta bajar el volumen"
 *   forma: "Te falta cambiar la forma de onda" (las dos)
 *   corte: "Te falta abrir el filtro" / "Te falta cerrar el filtro"
 *   resonancia: "Te falta subir la resonancia" / "Te falta bajar la resonancia"
 *   ataque: "Te falta alargar el ataque" / "Te falta acortar el ataque"
 *   relajacion: "Te falta alargar la relajación" / "Te falta acortar la relajación"
 *   lfoVelocidad: "Te falta acelerar el LFO" / "Te falta frenar el LFO"
 *   lfoProfundidad: "Te falta subir la profundidad del LFO" / "Te falta bajar la profundidad del LFO"
 * Casos:
 * - pistaEje("corte", "x", true) -> "Te falta abrir el filtro: mueve el punto a la derecha"
 * - pistaEje("resonancia", "y", false) -> "Te falta bajar la resonancia: mueve el punto hacia abajo"
 * - pistaEje("forma", "x", false) -> "Te falta cambiar la forma de onda: mueve el punto a la izquierda"
 * - pistaEje("relajacion", "y", true) -> "Te falta alargar la relajación: mueve el punto hacia arriba"
 */
export function pistaEje(parametro: IdParametro, eje: Eje, subir: boolean): string {
  throw new Error("devclean: sin implementar");
}

/**
 * Comprueba el punto del jugador contra el objetivo.
 * Salida: el resultado y el estado NUEVO (no muta el recibido).
 * Usa: pistaEje, crearReto.
 * Idea:
 * - un eje falla si |punto - objetivo| > TOLERANCIA + 1e-9 (el épsilon evita que 0.62 - 0.5 falle por coma flotante).
 * - acierto (ningún eje falla): estado = crearReto(ejes, semilla + 1) (objetivo nuevo, fallos 0); mostrarObjetivo false; pistas [].
 * - fallo: estado igual con fallos + 1; pistas en orden x, y solo de los ejes que fallan, subir = objetivo > punto;
 *   mostrarObjetivo = fallos nuevos >= FALLOS_PARA_VER_OBJETIVO.
 * Casos: (objetivo { x: 0.5, y: 0.5 }, ejes corte/resonancia, fallos 0)
 * - punto { x: 0.62, y: 0.38 } -> acierto true, pistas [], estado.semilla + 1 y fallos 0
 * - punto { x: 0.63, y: 0.5 } -> acierto false, ejesFallidos ["x"], pistas ["Te falta cerrar el filtro: mueve el punto a la izquierda"], estado.fallos 1
 * - punto { x: 0.1, y: 0.9 } -> ejesFallidos ["x", "y"], 2 pistas (la de y dice "hacia abajo")
 * - con fallos 2 y un punto que falla -> estado.fallos 3 y mostrarObjetivo true; con fallos 0 -> mostrarObjetivo false
 * - el estado de entrada no cambia
 */
export function comprobarReto(estado: EstadoReto, punto: PosicionPad): { estado: EstadoReto; resultado: ResultadoReto } {
  throw new Error("devclean: sin implementar");
}

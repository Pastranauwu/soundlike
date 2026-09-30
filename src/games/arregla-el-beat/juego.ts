/**
 * Lógica de rondas de "Arregla el beat". FUNCIONES PURAS e inmutables:
 * no importa Tone.js ni el DOM. La pantalla (screen.ts) solo lo orquesta.
 * Depende de: src/core/sequencer (comparar cuadrículas), src/core/scoring
 * (puntaje/racha/nivel), ./breakBeat (romper) y ./feedback (frase de acierto).
 */
import type { Celda, Cuadricula } from "../../core/types";
import { celdasDistintas, cuadriculasIguales } from "../../core/sequencer";
import { crearPuntaje, registrarAcierto, registrarFallo } from "../../core/scoring";
import { breakBeat } from "./breakBeat";
import { explicarError } from "./feedback";
import type { Beat, EstadoJuego } from "./types";

/** Mensaje fijo tras un intento fallido. */
export const MENSAJE_FALLO = "Todavía no suena igual. Sigue probando.";

/**
 * Errores que tendrá el beat roto según el nivel: nivel 1 = 1 error,
 * nivel 2 = 2 errores, nivel 3 = 3 errores.
 * Errores: lanza Error si el nivel está fuera de 1..3.
 * Casos:
 * - erroresPorNivel(1) -> 1; erroresPorNivel(2) -> 2; erroresPorNivel(3) -> 3
 * - erroresPorNivel(0) y erroresPorNivel(4) -> lanzan Error
 */
export function erroresPorNivel(nivel: number): number {
  if (nivel < 1 || nivel > 3) {
    throw new Error(`Nivel fuera de rango: ${nivel}`);
  }
  return nivel;
}

/**
 * Estado inicial del juego: sin ronda, puntaje de crearPuntaje(), 0 fallos.
 * Casos:
 * - crearJuego() -> { beatOriginal: null, beatRoto: null, intentosFallidos: 0,
 *   rondaResuelta: false, ultimo: null, puntaje: {puntos:0,racha:0,nivel:1} }
 */
export function crearJuego(): EstadoJuego {
  return {
    beatOriginal: null,
    beatRoto: null,
    intentosFallidos: 0,
    rondaResuelta: false,
    ultimo: null,
    puntaje: crearPuntaje(),
  };
}

/**
 * Inicia una ronda nueva: rompe el beat con breakBeat usando
 * erroresPorNivel(estado.puntaje.nivel) y la semilla dada.
 * Reinicia intentosFallidos, rondaResuelta y ultimo; conserva el puntaje.
 * Casos:
 * - con nivel 1 y semilla 5 -> beatRoto difiere del original en 1 celda exacta
 * - con nivel 2 -> 2 celdas distintas; mismas entradas -> mismo beatRoto
 */
export function iniciarRonda(estado: EstadoJuego, beat: Beat, semilla: number): EstadoJuego {
  const nErrores = erroresPorNivel(estado.puntaje.nivel);
  return {
    ...estado,
    beatOriginal: beat,
    beatRoto: breakBeat(beat, nErrores, semilla),
    intentosFallidos: 0,
    rondaResuelta: false,
    ultimo: null,
  };
}

/**
 * Comprueba la cuadrícula editada contra el beat original de la ronda.
 * - Acierto (cuadrículas iguales): puntaje = registrarAcierto (suma puntos,
 *   racha y sube de nivel cada 3 seguidos), rondaResuelta = true y
 *   ultimo.mensaje = explicarError(original, roto).
 * - Fallo: puntaje = registrarFallo (racha a 0), intentosFallidos + 1 y
 *   ultimo = { acierto: false, mensaje: MENSAJE_FALLO }.
 * Errores: lanza Error si no hay ronda iniciada o si ya estaba resuelta.
 * Casos:
 * - comprobar con la cuadrícula original -> acierto: puntos +100, racha 1, resuelta
 * - comprobar con la cuadrícula rota (nivel 1) -> fallo: intentosFallidos 1, racha 0
 * - 3 aciertos seguidos en nivel 1 -> nivel pasa a 2
 */
export function comprobar(estado: EstadoJuego, actual: Cuadricula): EstadoJuego {
  if (estado.beatOriginal === null || estado.beatRoto === null) {
    throw new Error("No hay ronda iniciada");
  }
  if (estado.rondaResuelta) {
    throw new Error("La ronda ya estaba resuelta");
  }

  if (cuadriculasIguales(estado.beatOriginal.cuadricula, actual)) {
    return {
      ...estado,
      puntaje: registrarAcierto(estado.puntaje),
      rondaResuelta: true,
      ultimo: { acierto: true, mensaje: explicarError(estado.beatOriginal, estado.beatRoto) },
    };
  }

  return {
    ...estado,
    puntaje: registrarFallo(estado.puntaje),
    intentosFallidos: estado.intentosFallidos + 1,
    ultimo: { acierto: false, mensaje: MENSAJE_FALLO },
  };
}

/**
 * true si el jugador puede pedir la ayuda: 3 o más fallos en la ronda y sin resolver.
 * Casos:
 * - con intentosFallidos 2 -> false; con 3 -> true; ronda resuelta -> false
 */
export function ayudaDisponible(estado: EstadoJuego): boolean {
  return !estado.rondaResuelta && estado.intentosFallidos >= 3;
}

/**
 * Celdas que hay que marcar como equivocadas: diferencias entre el beat
 * original y la cuadrícula actual del jugador (celdasDistintas del core).
 * Errores: lanza Error si no hay ronda iniciada.
 * Casos:
 * - actual igual al original -> []
 * - falta el clap del paso 4 -> [{ pista: "clap", paso: 4 }]
 */
export function celdasErroneas(estado: EstadoJuego, actual: Cuadricula): Celda[] {
  if (estado.beatOriginal === null) {
    throw new Error("No hay ronda iniciada");
  }
  return celdasDistintas(estado.beatOriginal.cuadricula, actual);
}

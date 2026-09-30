/**
 * Lógica de rondas de "Arregla el beat". FUNCIONES PURAS e inmutables:
 * no importa Tone.js ni el DOM. La pantalla (screen.ts) solo lo orquesta.
 * Depende de: src/core/sequencer (comparar cuadrículas), src/core/scoring
 * (puntaje/racha/nivel), ./breakBeat (romper) y ./feedback (frase de acierto).
 */
import type { Celda, Cuadricula } from "../../core/types";
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
  throw new Error("devclean: sin implementar");
}

/**
 * Estado inicial del juego: sin ronda, puntaje de crearPuntaje(), 0 fallos.
 * Casos:
 * - crearJuego() -> { beatOriginal: null, beatRoto: null, intentosFallidos: 0,
 *   rondaResuelta: false, ultimo: null, puntaje: {puntos:0,racha:0,nivel:1} }
 */
export function crearJuego(): EstadoJuego {
  throw new Error("devclean: sin implementar");
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
  throw new Error("devclean: sin implementar");
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
  throw new Error("devclean: sin implementar");
}

/**
 * true si el jugador puede pedir la ayuda: 3 o más fallos en la ronda y sin resolver.
 * Casos:
 * - con intentosFallidos 2 -> false; con 3 -> true; ronda resuelta -> false
 */
export function ayudaDisponible(estado: EstadoJuego): boolean {
  throw new Error("devclean: sin implementar");
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
  throw new Error("devclean: sin implementar");
}

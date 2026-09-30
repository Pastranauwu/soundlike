/**
 * Puntaje del jugador. FUNCIONES PURAS e inmutables: no importa Tone.js ni el DOM.
 * Solo depende de ./types. Lo usan los juegos (p. ej. Arregla el beat).
 */
import { NIVEL_MAX, type Puntaje } from "./types";

/** Puntos base por acierto; se multiplican por el nivel actual. */
export const PUNTOS_POR_ACIERTO = 100;

/**
 * Puntaje inicial: 0 puntos, racha 0, nivel 1.
 * Casos:
 * - crearPuntaje() -> { puntos: 0, racha: 0, nivel: 1 }
 */
export function crearPuntaje(): Puntaje {
  return { puntos: 0, racha: 0, nivel: 1 };
}

/**
 * Registra un acierto y devuelve un NUEVO puntaje (no muta).
 * Reglas:
 * - puntos += PUNTOS_POR_ACIERTO * nivel actual.
 * - racha += 1.
 * - cada 3 aciertos seguidos (racha múltiplo de 3) sube 1 nivel, sin pasar de nivelMax.
 * Entrada: puntaje actual y nivel máximo permitido (por defecto NIVEL_MAX = 3).
 * Casos:
 * - registrarAcierto({puntos:0,racha:0,nivel:1}) -> {puntos:100,racha:1,nivel:1}
 * - registrarAcierto({puntos:200,racha:2,nivel:1}) -> {puntos:300,racha:3,nivel:2}
 * - registrarAcierto({puntos:0,racha:2,nivel:3}) -> {puntos:300,racha:3,nivel:3} (techo)
 * - registrarAcierto({puntos:0,racha:1,nivel:2}) -> {puntos:200,racha:2,nivel:2}
 */
export function registrarAcierto(puntaje: Puntaje, nivelMax: number = NIVEL_MAX): Puntaje {
  const nuevosPuntos = puntaje.puntos + PUNTOS_POR_ACIERTO * puntaje.nivel;
  const nuevaRacha = puntaje.racha + 1;
  const nuevoNivel =
    nuevaRacha % 3 === 0 && puntaje.nivel < nivelMax
      ? puntaje.nivel + 1
      : puntaje.nivel;

  return {
    puntos: nuevosPuntos,
    racha: nuevaRacha,
    nivel: nuevoNivel,
  };
}

/**
 * Registra un fallo y devuelve un NUEVO puntaje: la racha vuelve a 0.
 * No quita puntos ni baja de nivel.
 * Casos:
 * - registrarFallo({puntos:300,racha:2,nivel:2}) -> {puntos:300,racha:0,nivel:2}
 */
export function registrarFallo(puntaje: Puntaje): Puntaje {
  return {
    puntos: puntaje.puntos,
    racha: 0,
    nivel: puntaje.nivel,
  };
}

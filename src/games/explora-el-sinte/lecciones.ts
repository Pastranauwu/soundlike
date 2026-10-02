/**
 * Contenido de las 6 lecciones de "Explora el sinte". DATOS PUROS: no importa
 * Tone.js ni el DOM. Depende de core/synthTypes y core/synthParams (AJUSTES_BASE).
 * Lo usa screen.ts.
 */
import type { Leccion } from "./types";

/**
 * Devuelve las 6 lecciones en orden (objetos nuevos en cada llamada).
 * Idea: contenido fijo, sin algoritmo; función que arma y devuelve literales nuevos (id · titulo · eje x / eje y · ajustes = AJUSTES_BASE con estos cambios):
 * 1. "tono-volumen" · "Tono y volumen" · tono / volumen · forma "triangulo", corte 8000
 * 2. "forma-tono" · "Forma de onda y tono" · forma / tono · corte 8000, resonancia 0
 * 3. "filtro" · "Filtro: corte y resonancia" · corte / resonancia · frecuencia 110, forma "sierra"
 * 4. "envolvente" · "Envolvente: ataque y relajación" · ataque / relajacion · corte 3000
 * 5. "lfo" · "LFO: velocidad y profundidad" · lfoVelocidad / lfoProfundidad · frecuencia 110, corte 800, resonancia 0.5
 * 6. "patio-libre" · "Patio libre" · corte / resonancia · sin cambios; libre true, conReto false, explicacionAcierto ""
 * - 1 a 5: libre false, conReto true. Cada una con 2 o 3 frases cortas, en español, para alguien que nunca vio un sinte
 *   (sin jerga sin explicar; decir qué se oye al mover cada eje). La 5 debe decir que el LFO mueve el filtro solo.
 *   La 6 debe decir que se eligen los dos parámetros con las listas.
 * - explicacionAcierto (1 frase, nombra los dos parámetros con su nombre visible): p. ej. lección 3:
 *   "El corte decide cuánto brillo pasa y la resonancia resalta justo ese punto."
 * - no compartir el mismo objeto ajustes entre lecciones (copiar).
 * Casos:
 * - obtenerLecciones().length -> 6; los títulos, en orden, son los 6 de arriba
 * - [2].ejes -> { x: "corte", y: "resonancia" }; [1].ejes -> { x: "forma", y: "tono" }; [4].ejes -> { x: "lfoVelocidad", y: "lfoProfundidad" }
 * - cada lección tiene 2 o 3 frases no vacías; las 5 primeras conReto true y explicacionAcierto no vacía
 * - [5].libre -> true y [5].conReto -> false; ids únicos
 * - mutar obtenerLecciones()[0].ajustes no cambia la siguiente llamada
 */
export function obtenerLecciones(): Leccion[] {
  throw new Error("devclean: sin implementar");
}

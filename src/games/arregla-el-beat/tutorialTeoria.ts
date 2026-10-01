/**
 * Tutorial DIDÁCTICO de "Arregla el beat": la teoría musical detrás de los beats
 * (datos puros, sin DOM ni Tone.js). No explica botones: eso es ./tutorial.ts.
 * Lo usan screen.ts (botón "Teoría del beat" y línea "Aprendes:") y main.ts
 * (pantalla Tutoriales).
 */
import type { Tutorial } from "../../ui/types";

/**
 * Devuelve el tutorial de teoría del beat (objeto nuevo en cada llamada).
 * Contenido fijo (= texto exacto; el resto redáctalo en español claro, frases cortas,
 * para alguien que nunca estudió música):
 * - id = "teoria-beat", juego = "Teoría del beat", ruta = "#/arregla-el-beat"
 * - objetivo = "Reconoce de oído el pulso y el backbeat: así encuentras más rápido el golpe que sobra o falta."
 * - aprendes = "Pulso, compás de 4 tiempos, semicorcheas y el papel del bombo, el clap y los hi-hats."
 * - pasos (exactamente 2):
 *   1. titulo = "Pulso, compás y pasos". texto: el pulso es el latido regular de la
 *      música; un compás de 4/4 tiene 4 tiempos y cada tiempo se divide en 4
 *      semicorcheas: 4 x 4 = 16 pasos. puntos (4): tiempos 1, 2, 3 y 4 = pasos 1, 5, 9 y 13;
 *      los pasos 3, 7, 11 y 15 son los "y" (contratiempos); el tempo (bpm) es cuántos
 *      tiempos caben en un minuto: 90 bpm relajado, 125 bpm para bailar; cuenta en voz
 *      alta "1 e y a, 2 e y a..." para ubicar cada paso.
 *   2. titulo = "Quién toca qué". texto: cada instrumento tiene un papel y cada
 *      género lo reparte distinto. puntos (5): el bombo marca el peso (tiempo 1 y
 *      casi siempre el 3); el clap hace el backbeat: tiempos 2 y 4 = pasos 5 y 13;
 *      el hi-hat cerrado lleva la subdivisión (cada 2 pasos = corcheas) y el abierto
 *      da aire en un contratiempo; house = bombo en los 4 tiempos ("four on the floor");
 *      reggaetón = dembow, con golpes en los pasos 4 y 7 (y 12 y 15) contra el bombo.
 * Idea: un literal Tutorial devuelto dentro de la función (no constante de módulo
 * compartida: cada llamada crea objeto y arrays nuevos, así quien lo mute no afecta a otros).
 * Sin imports de valor (solo el tipo). 1 punto = 1 frase terminada en punto, sin HTML
 * ni markdown (se pinta con textContent). Escribir literal "backbeat", "4 tiempos" y
 * "pasos 5 y 13" (la prueba los busca tal cual). Trampa: los pasos se nombran 1-16
 * (como los ve el jugador), nunca 0-15; no pasar de 5 puntos por paso.
 * Casos:
 * - obtenerTutorialTeoriaBeat().id -> "teoria-beat"; .ruta -> "#/arregla-el-beat"
 * - .pasos.length -> 2; pasos[0].titulo -> "Pulso, compás y pasos"; pasos[1].titulo -> "Quién toca qué"
 * - el texto de todos los pasos junto contiene "backbeat", "4 tiempos" y "pasos 5 y 13"
 * - ningún texto vacío; ningún paso con más de 5 puntos
 * - dos llamadas devuelven objetos distintos (!==) con el mismo contenido (toEqual)
 */
export function obtenerTutorialTeoriaBeat(): Tutorial {
  throw new Error("devclean: sin implementar");
}

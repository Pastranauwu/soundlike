/**
 * Contenido del tutorial de "Explora el sinte" (datos puros, sin DOM ni Tone.js).
 * Lo usan screen.ts (diálogo y línea de objetivo) y main.ts (pantalla Tutoriales).
 */
import type { Tutorial } from "../../ui/types";

/**
 * Devuelve el tutorial del juego (objeto nuevo en cada llamada).
 * Idea: contenido fijo, sin algoritmo; función que arma y devuelve literales nuevos (texto exacto donde hay =):
 * - id = "explora-el-sinte", juego = "Explora el sinte", ruta = "#/explora-el-sinte"
 * - objetivo = "Mueve el punto del pad para oír qué hace cada control del sintetizador y, en el reto, imita el sonido objetivo."
 * - aprendes = "Osciladores y formas de onda, filtro, envolvente y LFO: las piezas con las que se arma cualquier sonido de sintetizador."
 * - pasos (exactamente 2):
 *   1. titulo = "El pad". texto: mantén presionado el recuadro para que suene; cada eje cambia un parámetro.
 *      puntos (4): horizontal = un parámetro y vertical = otro, arriba y a la derecha es más; al soltar la nota se apaga
 *      y el punto se queda; con teclado: Tab para entrar, flechas para mover (Shift mueve más) y Espacio para mantener o soltar la nota;
 *      debajo del pad se lee siempre el valor de cada eje.
 *   2. titulo = "Lecciones y reto". texto: son 6 lecciones cortas; avanza con "Siguiente" o salta desde el índice.
 *      puntos (4): tono y volumen, forma de onda, filtro, envolvente, LFO y un patio libre; "Escuchar el objetivo" toca
 *      un sonido escondido y "Comprobar" dice qué eje te falta y hacia dónde; tras 3 fallos el objetivo se dibuja en el pad;
 *      si no oyes nada sube el volumen, y con audífonos se aprecia mejor.
 * Casos:
 * - obtenerTutorialSinte().id -> "explora-el-sinte"; .ruta -> "#/explora-el-sinte"; .juego -> "Explora el sinte"
 * - .pasos.length -> 2; pasos[0].titulo -> "El pad"; pasos[1].titulo -> "Lecciones y reto"
 * - .aprendes contiene "filtro", "envolvente" y "LFO"; cada paso tiene de 1 a 5 puntos
 * - dos llamadas devuelven objetos distintos con el mismo contenido
 */
export function obtenerTutorialSinte(): Tutorial {
  throw new Error("devclean: sin implementar");
}

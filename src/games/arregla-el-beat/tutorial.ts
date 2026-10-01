/**
 * Contenido del tutorial de "Arregla el beat" (datos puros, sin DOM ni Tone.js).
 * Lo usan screen.ts (diálogo y línea de objetivo) y main.ts (pantalla Tutoriales).
 */
import type { Tutorial } from "../../ui/types";

/**
 * Devuelve el tutorial del juego. Siempre el mismo contenido (objeto nuevo en cada llamada).
 * Contenido fijo (texto exacto en los campos marcados con =):
 * - id = "arregla-el-beat", juego = "Arregla el beat", ruta = "#/arregla-el-beat"
 * - objetivo = "Encuentra los golpes equivocados y corrige la cuadrícula hasta que suene igual que el original. En el nivel N hay N errores; 3 aciertos seguidos suben de nivel."
 * - aprendes = "Dónde va cada instrumento de la batería en el hip-hop, el boom bap, el reggaetón, el house y el rock."
 * - pasos (exactamente 2):
 *   1. titulo = "La cuadrícula". texto: cada fila es un instrumento (Bombo, Clap,
 *      Hi-hat cerrado, Hi-hat abierto) y cada una de las 16 columnas es un paso
 *      del compás; amarillo = suena. puntos (3): los números en negrita 1, 5, 9 y 13
 *      son los tiempos 1, 2, 3 y 4; la columna iluminada es el paso que suena;
 *      toca una celda (o usa Enter/Espacio) para encenderla o apagarla.
 *   2. titulo = "Controles y objetivo". texto: escucha el beat roto y arréglalo.
 *      puntos (5): "Escuchar" / "Pausar" arranca o detiene el sonido; el slider
 *      cambia el tempo; "Comprobar" revisa tu cuadrícula; "Reiniciar" la devuelve
 *      a como empezó la ronda; tras 3 intentos fallidos "Escuchar el correcto"
 *      toca el original y marca en rojo las celdas equivocadas. Con teclado: Tab
 *      para moverte entre controles y flechas dentro de la cuadrícula.
 * Casos:
 * - obtenerTutorial().id -> "arregla-el-beat"; .ruta -> "#/arregla-el-beat"
 * - obtenerTutorial().pasos.length -> 2; pasos[0].titulo -> "La cuadrícula"
 * - obtenerTutorial().objetivo contiene "3 aciertos seguidos"
 * - todos los textos no vacíos; ningún paso con más de 5 puntos
 */
export function obtenerTutorial(): Tutorial {
  throw new Error("devclean: sin implementar");
}

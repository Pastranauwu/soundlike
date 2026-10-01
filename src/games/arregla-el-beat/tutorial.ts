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
 *      son los tiempos 1, 2, 3 y 4; solo puedes editarla en pausa: mientras suena
 *      un beat la cuadrícula se oculta; toca una celda (o usa Enter/Espacio) para
 *      encenderla o apagarla.
 *   2. titulo = "Controles y objetivo". texto = "Escucha el beat roto, compáralo con el correcto y arregla la cuadrícula."
 *      puntos (exactamente 5): "Escuchar el beat roto" toca tu versión: la cuadrícula
 *      se oculta y solo ves iluminado el paso que suena; "Escuchar el correcto" toca
 *      el beat original cuando quieras, también a ciegas; "Pausar" detiene el sonido
 *      y devuelve la cuadrícula para editarla; el slider cambia el tempo; "Comprobar"
 *      revisa tu cuadrícula y te dice qué instrumento falla y si sobra o falta un golpe;
 *      "Reiniciar" la devuelve al beat roto; tras 3 intentos fallidos las celdas
 *      equivocadas se marcan en rojo.
 * Casos:
 * - obtenerTutorial().id -> "arregla-el-beat"; .ruta -> "#/arregla-el-beat"
 * - obtenerTutorial().pasos.length -> 2; pasos[0].titulo -> "La cuadrícula"
 * - obtenerTutorial().objetivo contiene "3 aciertos seguidos"
 * - pasos[1].puntos.length -> 5
 * - todos los textos no vacíos; ningún paso con más de 5 puntos
 */
export function obtenerTutorial(): Tutorial {
  return {
    id: "arregla-el-beat",
    juego: "Arregla el beat",
    ruta: "#/arregla-el-beat",
    objetivo:
      "Encuentra los golpes equivocados y corrige la cuadrícula hasta que suene igual que el original. En el nivel N hay N errores; 3 aciertos seguidos suben de nivel.",
    aprendes:
      "Dónde va cada instrumento de la batería en el hip-hop, el boom bap, el reggaetón, el house y el rock.",
    pasos: [
      {
        titulo: "La cuadrícula",
        texto: "Cada fila es un instrumento (Bombo, Clap, Hi-hat cerrado, Hi-hat abierto) y cada una de las 16 columnas es un paso del compás; amarillo = suena.",
        puntos: [
          "Los números en negrita 1, 5, 9 y 13 son los tiempos 1, 2, 3 y 4.",
          "Solo puedes editarla en pausa: mientras suena un beat la cuadrícula se oculta.",
          "Toca una celda (o usa Enter/Espacio) para encenderla o apagarla.",
        ],
      },
      {
        titulo: "Controles y objetivo",
        texto: "Escucha el beat roto, compáralo con el correcto y arregla la cuadrícula.",
        puntos: [
          '"Escuchar el beat roto" toca tu versión: la cuadrícula se oculta y solo ves iluminado el paso que suena.',
          '"Escuchar el correcto" toca el beat original cuando quieras, también a ciegas.',
          '"Pausar" detiene el sonido y devuelve la cuadrícula para editarla; el slider cambia el tempo.',
          '"Comprobar" revisa tu cuadrícula y te dice qué instrumento falla y si sobra o falta un golpe.',
          '"Reiniciar" la devuelve al beat roto; tras 3 intentos fallidos las celdas equivocadas se marcan en rojo.',
        ],
      },
    ],
  };
}

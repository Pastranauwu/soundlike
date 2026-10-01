/**
 * Tutorial DIDÁCTICO de "Arregla el beat": la teoría musical detrás de los beats
 * (datos puros, sin DOM ni Tone.js). No explica botones: eso es ./tutorial.ts.
 * Lo usan screen.ts (botón "Teoría del beat" y línea "Aprendes:") y main.ts
 * (pantalla Tutoriales).
 */
import type { Tutorial } from "../../ui/types";

/**
 * Devuelve el tutorial de teoría del beat.
 * Crea un objeto nuevo en cada llamada: quien lo mute no afecta a otros.
 * Contenido en español claro para principiantes, sin HTML ni markdown.
 */
export function obtenerTutorialTeoriaBeat(): Tutorial {
  return {
    id: "teoria-beat",
    juego: "Teoría del beat",
    ruta: "#/arregla-el-beat",
    objetivo:
      "Reconoce de oído el pulso y el backbeat: así encuentras más rápido el golpe que sobra o falta.",
    aprendes:
      "Pulso, compás de 4 tiempos, semicorcheas y el papel del bombo, el clap y los hi-hats.",
    pasos: [
      {
        titulo: "Pulso, compás y pasos",
        texto: "El pulso es el latido regular de la música. Un compás de 4/4 tiene 4 tiempos y cada tiempo se divide en 4 semicorcheas: 4 × 4 = 16 pasos. El tempo (bpm) es cuántos tiempos caben en un minuto: 90 bpm relajado, 125 bpm para bailar.",
        puntos: [
          "Tiempos 1, 2, 3 y 4 coinciden con pasos 1, 5, 9 y 13.",
          "Los pasos 3, 7, 11 y 15 son los \"y\" (contratiempos).",
          "Cuenta en voz alta '1 e y a, 2 e y a...' para ubicar cada paso.",
          "Escucha cómo los instrumentos siguen estos pulsos ocultos.",
        ],
      },
      {
        titulo: "Quién toca qué",
        texto: "Cada instrumento tiene un papel y cada género lo reparte distinto. El bombo marca el peso; el clap hace el backbeat en los tiempos 2 y 4; el hi-hat lleva la subdivisión. Géneros como house y reggaetón adaptan estos roles.",
        puntos: [
          "El bombo marca el tiempo 1 y casi siempre el 3.",
          "El clap hace el backbeat: tiempos 2 y 4, que son pasos 5 y 13.",
          "El hi-hat cerrado lleva la subdivisión (cada 2 pasos).",
          "El hi-hat abierto da aire en un contratiempo.",
          "House: bombo en los 4 tiempos. Reggaetón: dembow con golpes en pasos 4 y 7.",
        ],
      },
    ],
  };
}

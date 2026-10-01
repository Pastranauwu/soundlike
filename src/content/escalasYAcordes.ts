/**
 * Tutorial DIDÁCTICO general "Escalas y acordes" (datos puros, sin DOM ni Tone.js).
 * No pertenece a ningún juego: vive en src/content y solo depende de
 * src/core/theory.ts, de donde salen los ejemplos (así el texto nunca
 * contradice a la teoría del núcleo). Lo usa main.ts (pantalla Tutoriales).
 */
import type { Tutorial } from "../ui/types";
import {
  escalaMayor,
  escalaMenorNatural,
  acordeMayor,
  acordeMenor,
  noteToFreq,
} from "../core/theory";

/**
 * Devuelve el tutorial de escalas y acordes (objeto nuevo en cada llamada).
 * Calcula los ejemplos usando theory.ts: escalaMayor("C"), escalaMenorNatural("A"),
 * acordeMayor("C"), acordeMenor("A") y noteToFreq("A4"), noteToFreq("C4").
 */
export function obtenerTutorialEscalasAcordes(): Tutorial {
  return {
    id: "escalas-y-acordes",
    juego: "Escalas y acordes",
    ruta: "",
    objetivo:
      "Entiende de dónde salen las notas que suenan bien juntas: una escala es el menú y un acorde es el plato.",
    aprendes:
      "Escala mayor y menor natural, acordes mayor y menor, y por qué A4 vibra a 440 Hz.",
    pasos: [
      {
        titulo: "Escalas",
        texto: "Una escala es una selección de 7 notas ordenadas por altura; se construye con saltos de tono (T) y semitono (S).",
        puntos: [
          `Escala mayor: T T S T T T S. Do mayor = ${escalaMayor("C").join(" ")}.`,
          `Escala menor natural: T S T T S T T. La menor = ${escalaMenorNatural("A").join(" ")}.`,
          "Mayor suena alegre/brillante, menor suena triste/oscura.",
          `A4 = ${Math.round(noteToFreq("A4"))} Hz y C4 = ${noteToFreq("C4").toFixed(2)} Hz.`,
        ],
      },
      {
        titulo: "Acordes",
        texto: "Un acorde son 3 notas de la escala que suenan a la vez: la 1.ª, la 3.ª y la 5.ª.",
        puntos: [
          `Do mayor = ${acordeMayor("C").join(" ")}.`,
          `La menor = ${acordeMenor("A").join(" ")}.`,
          "La diferencia está en la tercera: mayor = 4 semitonos, menor = 3.",
          "Relación con los beats: el ritmo dice CUÁNDO suena algo, la escala y el acorde dicen QUÉ notas.",
        ],
      },
    ],
  };
}

/**
 * Tutorial DIDÁCTICO general "Escalas y acordes" (datos puros, sin DOM ni Tone.js).
 * No pertenece a ningún juego: vive en src/content y solo depende de
 * src/core/theory.ts, de donde salen los ejemplos (así el texto nunca
 * contradice a la teoría del núcleo). Lo usa main.ts (pantalla Tutoriales).
 */
import type { Tutorial } from "../ui/types";

/**
 * Devuelve el tutorial de escalas y acordes (objeto nuevo en cada llamada).
 * Llama a: escalaMayor, escalaMenorNatural, acordeMayor, acordeMenor, noteToFreq
 *   (src/core/theory.ts). Las notas de los ejemplos se arman con .join(" "), no a mano.
 * Contenido fijo (= texto exacto; el resto en español claro para principiantes):
 * - id = "escalas-y-acordes", juego = "Escalas y acordes", ruta = "" (sin juego todavía:
 *   la pantalla Tutoriales no muestra el enlace "Jugar")
 * - objetivo = "Entiende de dónde salen las notas que suenan bien juntas: una escala es el menú y un acorde es el plato."
 * - aprendes = "Escala mayor y menor natural, acordes mayor y menor, y por qué A4 vibra a 440 Hz."
 * - pasos (exactamente 2):
 *   1. titulo = "Escalas". texto: una escala es una selección de 7 notas ordenadas
 *      por altura; se construye con saltos de tono (T) y semitono (S). puntos (4):
 *      "Escala mayor: T T S T T T S. Do mayor = " + escalaMayor("C") -> "C D E F G A B.";
 *      "Escala menor natural: T S T T S T T. La menor = " + escalaMenorNatural("A") -> "A B C D E F G.";
 *      mayor suena alegre/brillante, menor suena triste/oscura;
 *      cada nota es una frecuencia: "A4 = 440 Hz" y "C4 = 261.63 Hz" (noteToFreq, 2 decimales en C4).
 *   2. titulo = "Acordes". texto: un acorde son 3 notas de la escala que suenan a la
 *      vez: la 1.ª, la 3.ª y la 5.ª. puntos (4):
 *      "Do mayor = " + acordeMayor("C") -> "C E G.";
 *      "La menor = " + acordeMenor("A") -> "A C E.";
 *      la diferencia está en la tercera: mayor = 4 semitonos, menor = 3;
 *      relación con los beats: el ritmo dice CUÁNDO suena algo, la escala y el acorde dicen QUÉ notas.
 * Idea: literal Tutorial armado dentro de la función (objeto y arrays nuevos por llamada).
 * Los ejemplos se calculan al llamar: escalaMayor("C").join(" ") etc. y se interpolan
 * en el punto; frecuencia con noteToFreq("A4") -> "440" (sin decimales) y
 * noteToFreq("C4").toFixed(2) -> "261.63". Trampas: no escribir las notas a mano;
 * punto decimal (no coma: nada de toLocaleString); texto plano sin HTML ni markdown
 * (se pinta con textContent); ruta "" exacta, no "#/".
 * Casos:
 * - obtenerTutorialEscalasAcordes().id -> "escalas-y-acordes"; .ruta -> ""
 * - .pasos.length -> 2; pasos[0].titulo -> "Escalas"; pasos[1].titulo -> "Acordes"
 * - pasos[0].puntos junto contiene "C D E F G A B", "A B C D E F G", "440" y "261.63"
 * - pasos[1].puntos junto contiene "C E G" y "A C E"
 * - ningún texto vacío; ningún paso con más de 5 puntos
 * - dos llamadas devuelven objetos distintos (!==) con el mismo contenido (toEqual)
 */
export function obtenerTutorialEscalasAcordes(): Tutorial {
  throw new Error("devclean: sin implementar");
}

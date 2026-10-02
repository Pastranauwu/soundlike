/**
 * Contenido del tutorial de "Explora el sinte" (datos puros, sin DOM ni Tone.js).
 * Lo usan screen.ts (diálogo y línea de objetivo) y main.ts (pantalla Tutoriales).
 */
import type { Tutorial } from "../../ui/types";

/** Devuelve el tutorial del juego (objeto nuevo en cada llamada). */
export function obtenerTutorialSinte(): Tutorial {
  return {
    id: "explora-el-sinte",
    juego: "Explora el sinte",
    ruta: "#/explora-el-sinte",
    objetivo:
      "Mueve el punto del pad para oír qué hace cada control del sintetizador y, en el reto, imita el sonido objetivo.",
    aprendes:
      "Osciladores y formas de onda, filtro, envolvente y LFO: las piezas con las que se arma cualquier sonido de sintetizador.",
    pasos: [
      {
        titulo: "El pad",
        texto: "Mantén presionado el recuadro para que suene; cada eje cambia un parámetro.",
        puntos: [
          "Horizontal = un parámetro y vertical = otro; arriba y a la derecha es más.",
          "Al soltar la nota se apaga y el punto se queda.",
          "Con teclado: Tab para entrar, flechas para mover (Shift mueve más) y Espacio para mantener o soltar la nota.",
          "Debajo del pad se lee siempre el valor de cada eje.",
        ],
      },
      {
        titulo: "Lecciones y reto",
        texto: "Son 6 lecciones cortas; avanza con «Siguiente» o salta desde el índice.",
        puntos: [
          "Tono y volumen, forma de onda, filtro, envolvente, LFO y un patio libre.",
          "«Escuchar el objetivo» toca un sonido escondido y «Comprobar» dice qué eje te falta y hacia dónde.",
          "Tras 3 fallos el objetivo se dibuja en el pad.",
          "Si no oyes nada sube el volumen, y con audífonos se aprecia mejor.",
        ],
      },
    ],
  };
}

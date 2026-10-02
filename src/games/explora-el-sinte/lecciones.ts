/**
 * Contenido de las 6 lecciones de "Explora el sinte". DATOS PUROS: no importa
 * Tone.js ni el DOM. Depende de core/synthTypes y core/synthParams (AJUSTES_BASE).
 * Lo usa screen.ts.
 */
import { AJUSTES_BASE } from "../../core/synthParams";
import type { Leccion } from "./types";

/**
 * Devuelve las 6 lecciones en orden (objetos nuevos en cada llamada).
 * Cada lección es independiente; los ajustes se copian desde AJUSTES_BASE con
 * cambios específicos. Función pura: llamadas sucesivas devuelven objetos nuevos.
 */
export function obtenerLecciones(): Leccion[] {
  return [
    {
      id: "tono-volumen",
      titulo: "Tono y volumen",
      frases: [
        "Al mover izquierda y derecha el sonido sube y baja de altura.",
        "Al mover arriba y abajo el sonido se hace más o menos fuerte.",
      ],
      ejes: { x: "tono", y: "volumen" },
      libre: false,
      conReto: true,
      ajustes: {
        ...AJUSTES_BASE,
        forma: "triangulo",
        corte: 8000,
      },
      explicacionAcierto:
        "El tono controla la altura del sonido y el volumen controla qué tan fuerte se escucha.",
    },
    {
      id: "forma-tono",
      titulo: "Forma de onda y tono",
      frases: [
        "Al mover izquierda y derecha cambia cómo suena: desde suave hasta más áspero.",
        "Al mover arriba y abajo la altura del sonido sube o baja.",
      ],
      ejes: { x: "forma", y: "tono" },
      libre: false,
      conReto: true,
      ajustes: {
        ...AJUSTES_BASE,
        corte: 8000,
        resonancia: 0,
      },
      explicacionAcierto:
        "La forma de onda cambia el carácter del sonido y el tono cambia su altura.",
    },
    {
      id: "filtro",
      titulo: "Filtro: corte y resonancia",
      frases: [
        "Al mover izquierda y derecha quita o pasa más brillo del sonido.",
        "Al mover arriba y abajo resalta más el punto que elegiste con el otro eje.",
      ],
      ejes: { x: "corte", y: "resonancia" },
      libre: false,
      conReto: true,
      ajustes: {
        ...AJUSTES_BASE,
        frecuencia: 110,
        forma: "sierra",
      },
      explicacionAcierto:
        "El corte decide cuánto brillo pasa y la resonancia resalta justo ese punto.",
    },
    {
      id: "envolvente",
      titulo: "Envolvente: ataque y relajación",
      frases: [
        "Al mover izquierda y derecha el sonido aparece más rápido o más lentamente.",
        "Al mover arriba y abajo el sonido se apaga más lentamente o más rápido.",
      ],
      ejes: { x: "ataque", y: "relajacion" },
      libre: false,
      conReto: true,
      ajustes: {
        ...AJUSTES_BASE,
        corte: 3000,
      },
      explicacionAcierto:
        "El ataque controla cuán rápido empieza el sonido y la relajación cuán rápido termina.",
    },
    {
      id: "lfo",
      titulo: "LFO: velocidad y profundidad",
      frases: [
        "El LFO mueve el filtro solo, sin que hagas nada. Al mover izquierda y derecha cambia qué tan rápido se mueve.",
        "Al mover arriba y abajo se mueve más o menos.",
      ],
      ejes: { x: "lfoVelocidad", y: "lfoProfundidad" },
      libre: false,
      conReto: true,
      ajustes: {
        ...AJUSTES_BASE,
        frecuencia: 110,
        corte: 800,
        resonancia: 0.5,
      },
      explicacionAcierto:
        "La velocidad del LFO controla qué tan rápido se mueve el filtro y la profundidad cuánto se mueve.",
    },
    {
      id: "patio-libre",
      titulo: "Patio libre",
      frases: [
        "Aquí controlas dos parámetros: usa las listas para elegir cuáles quieres cambiar.",
        "Sin necesidad de acertar un objetivo.",
      ],
      ejes: { x: "corte", y: "resonancia" },
      libre: true,
      conReto: false,
      ajustes: { ...AJUSTES_BASE },
      explicacionAcierto: "",
    },
  ];
}

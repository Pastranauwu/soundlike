/**
 * Conversión posición del pad (0..1) <-> valor de un parámetro del sinte, y su
 * texto en español. FUNCIONES PURAS: no importa Tone.js ni toca el DOM.
 * Solo depende de ./synthTypes. Lo usan los juegos (p. ej. Explora el sinte).
 */
import type { AjustesSinte, DefinicionParametro, FormaOnda, IdParametro } from "./synthTypes";

/** C2 y C6 en Hz (temperamento igual, A4 = 440): MIDI 36 y 84. */
export const TONO_MIN_HZ = 440 * 2 ** (-33 / 12);
export const TONO_MAX_HZ = 440 * 2 ** (15 / 12);

/** Las 4 formas de onda en el orden de sus zonas (cuartos del eje, de 0 a 1). */
export const FORMAS_ONDA: readonly FormaOnda[] = ["seno", "triangulo", "sierra", "cuadrada"];

/** Nombre visible de cada forma de onda. */
export const NOMBRES_FORMA: Readonly<Record<FormaOnda, string>> = {
  seno: "Seno",
  triangulo: "Triángulo",
  sierra: "Sierra",
  cuadrada: "Cuadrada",
};

/**
 * Los 9 parámetros, en el orden en que se listan en la interfaz.
 * El valor de "forma" es el índice de FORMAS_ONDA (0..3).
 */
export const PARAMETROS: readonly DefinicionParametro[] = [
  { id: "tono", nombre: "Tono", unidad: "nota", escala: "exponencial", min: TONO_MIN_HZ, max: TONO_MAX_HZ },
  { id: "volumen", nombre: "Volumen", unidad: "%", escala: "lineal", min: 0, max: 1 },
  { id: "forma", nombre: "Forma de onda", unidad: "", escala: "zonas", min: 0, max: 3 },
  { id: "corte", nombre: "Corte", unidad: "Hz", escala: "exponencial", min: 80, max: 8000 },
  { id: "resonancia", nombre: "Resonancia", unidad: "%", escala: "lineal", min: 0, max: 1 },
  { id: "ataque", nombre: "Ataque", unidad: "s", escala: "exponencial", min: 0.005, max: 2 },
  { id: "relajacion", nombre: "Relajación", unidad: "s", escala: "exponencial", min: 0.05, max: 3 },
  { id: "lfoVelocidad", nombre: "Velocidad del LFO", unidad: "Hz", escala: "exponencial", min: 0.1, max: 20 },
  { id: "lfoProfundidad", nombre: "Profundidad del LFO", unidad: "%", escala: "lineal", min: 0, max: 1 },
];

/** Sonido de partida: A3 en sierra, filtro medio abierto, sin LFO. */
export const AJUSTES_BASE: AjustesSinte = {
  frecuencia: 220,
  volumen: 0.7,
  forma: "sierra",
  corte: 2000,
  resonancia: 0.2,
  ataque: 0.01,
  relajacion: 0.3,
  lfoVelocidad: 2,
  lfoProfundidad: 0,
};

/** Recorta una posición a 0..1 (NaN se trata como 0). */
function recortarPosicion(posicion: number): number {
  if (Number.isNaN(posicion)) return 0;
  return Math.min(1, Math.max(0, posicion));
}

/** Ficha del parámetro (busca en PARAMETROS). */
export function definicionParametro(id: IdParametro): DefinicionParametro {
  const definicion = PARAMETROS.find((parametro) => parametro.id === id);
  if (!definicion) {
    throw new Error(`Parámetro desconocido: ${id}`);
  }
  return definicion;
}

/**
 * Posición del eje (0..1) -> valor del parámetro.
 * Entrada: posicion; fuera de 0..1 se recorta (NaN -> 0).
 * Salida: Hz, segundos, 0..1 o, para "forma", el índice 0..3 de FORMAS_ONDA.
 * Usa: definicionParametro. Lo usan aplicarParametro, etiquetaPosicion y los juegos.
 */
export function valorDesdePosicion(id: IdParametro, posicion: number): number {
  const definicion = definicionParametro(id);
  const p = recortarPosicion(posicion);
  switch (definicion.escala) {
    case "lineal":
      return definicion.min + p * (definicion.max - definicion.min);
    case "exponencial":
      return definicion.min * (definicion.max / definicion.min) ** p;
    case "zonas":
      return Math.min(3, Math.floor(p * 4));
  }
}

/**
 * Valor del parámetro -> posición del eje (0..1). Inversa de valorDesdePosicion.
 * Entrada: valor en la unidad del parámetro; fuera de rango se recorta a min..max.
 * Para "forma" la ida y vuelta solo es exacta en los centros 0.125, 0.375, 0.625, 0.875:
 * usa el centro de la zona del índice redondeado y recortado a 0..3.
 */
export function posicionDesdeValor(id: IdParametro, valor: number): number {
  const definicion = definicionParametro(id);
  const v = Math.min(definicion.max, Math.max(definicion.min, valor));
  switch (definicion.escala) {
    case "lineal":
      return (v - definicion.min) / (definicion.max - definicion.min);
    case "exponencial":
      return Math.log(v / definicion.min) / Math.log(definicion.max / definicion.min);
    case "zonas": {
      const indice = Math.min(3, Math.max(0, Math.round(v)));
      return (indice + 0.5) / 4;
    }
  }
}

/** Forma de onda de una posición: el eje se parte en 4 zonas iguales. */
export function formaDesdePosicion(posicion: number): FormaOnda {
  return FORMAS_ONDA[valorDesdePosicion("forma", posicion)];
}

/** Nombres de las notas en orden cromático desde C, para textoValor("tono", ...). */
const NOMBRES_NOTA = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

/** Nota más cercana con octava, p. ej. "A3", a partir de su frecuencia en Hz. */
function notaDesdeFrecuencia(hz: number): string {
  const midi = Math.round(69 + 12 * Math.log2(hz / 440));
  const octava = Math.floor(midi / 12) - 1;
  const nombre = NOMBRES_NOTA[((midi % 12) + 12) % 12];
  return `${nombre}${octava}`;
}

/** Texto corto del valor, sin el nombre del parámetro (punto decimal, nunca coma). */
export function textoValor(id: IdParametro, valor: number): string {
  switch (id) {
    case "tono":
      return notaDesdeFrecuencia(valor);
    case "corte":
      return valor < 1000 ? `${Math.round(valor)} Hz` : `${(valor / 1000).toFixed(1)} kHz`;
    case "volumen":
    case "resonancia":
    case "lfoProfundidad":
      return `${Math.round(valor * 100)} %`;
    case "ataque":
    case "relajacion":
      return valor < 1 ? `${Math.round(valor * 1000)} ms` : `${valor.toFixed(1)} s`;
    case "lfoVelocidad":
      return `${valor.toFixed(1)} Hz`;
    case "forma": {
      const indice = Math.min(3, Math.max(0, Math.round(valor)));
      return NOMBRES_FORMA[FORMAS_ONDA[indice]];
    }
  }
}

/**
 * Etiqueta completa "<Nombre>: <texto del valor>" para la posición de un eje.
 * La usa la pantalla del juego para la lectura del pad.
 */
export function etiquetaPosicion(id: IdParametro, posicion: number): string {
  const definicion = definicionParametro(id);
  const valor = valorDesdePosicion(id, posicion);
  return `${definicion.nombre}: ${textoValor(id, valor)}`;
}

/**
 * Devuelve el cambio de AjustesSinte que corresponde a poner un parámetro en una
 * posición del eje (para pasarlo a Sinte.ajustar o mezclarlo con {...ajustes}).
 */
export function cambioDesdePosicion(id: IdParametro, posicion: number): Partial<AjustesSinte> {
  if (id === "tono") {
    return { frecuencia: valorDesdePosicion(id, posicion) };
  }
  if (id === "forma") {
    return { forma: formaDesdePosicion(posicion) };
  }
  return { [id]: valorDesdePosicion(id, posicion) };
}

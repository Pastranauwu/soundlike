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

/**
 * Ficha del parámetro (busca en PARAMETROS).
 * Errores: lanza Error("Parámetro desconocido: <id>") si no existe.
 * Casos:
 * - definicionParametro("corte") -> { nombre: "Corte", unidad: "Hz", min: 80, max: 8000, ... }
 * - definicionParametro("relajacion").nombre -> "Relajación"
 * - definicionParametro("x" as IdParametro) -> lanza Error
 */
export function definicionParametro(id: IdParametro): DefinicionParametro {
  throw new Error("devclean: sin implementar");
}

/**
 * Posición del eje (0..1) -> valor del parámetro.
 * Entrada: posicion; fuera de 0..1 se recorta (NaN -> 0).
 * Salida: Hz, segundos, 0..1 o, para "forma", el índice 0..3 de FORMAS_ONDA.
 * Usa: definicionParametro. Lo usan aplicarParametro, etiquetaPosicion y los juegos.
 * Idea:
 * - lineal: min + p*(max-min). exponencial: min * (max/min)^p.
 * - zonas: floor(p*4), y p = 1 cae en 3 (no en 4).
 * - sin redondear: el tono es continuo (no se cuantiza a semitonos) para que ida y vuelta sea exacta.
 * Casos:
 * - valorDesdePosicion("tono", 0) -> 65.406 (C2, ±0.01); ("tono", 1) -> 1046.502 (C6, ±0.01)
 * - valorDesdePosicion("corte", 0.5) -> 800 (±1)
 * - valorDesdePosicion("volumen", 0.4) -> 0.4; ("ataque", 0) -> 0.005; ("relajacion", 1) -> 3
 * - valorDesdePosicion("lfoVelocidad", 0) -> 0.1; ("lfoVelocidad", 1) -> 20
 * - valorDesdePosicion("forma", 0.1) -> 0; (0.3) -> 1; (0.6) -> 2; (0.9) -> 3; (1) -> 3
 * - valorDesdePosicion("corte", 1.7) -> 8000; ("corte", -1) -> 80
 */
export function valorDesdePosicion(id: IdParametro, posicion: number): number {
  throw new Error("devclean: sin implementar");
}

/**
 * Valor del parámetro -> posición del eje (0..1). Inversa de valorDesdePosicion.
 * Entrada: valor en la unidad del parámetro; fuera de rango se recorta a min..max.
 * Idea:
 * - lineal: (v-min)/(max-min). exponencial: ln(v/min)/ln(max/min).
 * - zonas: centro de la zona = (indice + 0.5)/4 con indice redondeado y recortado a 0..3.
 *   Trampa: para "forma" la ida y vuelta solo es exacta en los centros 0.125, 0.375, 0.625, 0.875.
 * Casos:
 * - posicionDesdeValor("corte", 800) -> 0.5 (±0.001)
 * - posicionDesdeValor("tono", 65.406) -> 0 (±0.001); ("tono", 1046.502) -> 1 (±0.001)
 * - para cada parámetro que no es "forma" y p en {0, 0.13, 0.5, 0.87, 1}:
 *   posicionDesdeValor(id, valorDesdePosicion(id, p)) -> p (±0.001)
 * - posicionDesdeValor("forma", 2) -> 0.625; posicionDesdeValor("forma", valorDesdePosicion("forma", 0.375)) -> 0.375
 * - posicionDesdeValor("corte", 99999) -> 1
 */
export function posicionDesdeValor(id: IdParametro, valor: number): number {
  throw new Error("devclean: sin implementar");
}

/**
 * Forma de onda de una posición: el eje se parte en 4 zonas iguales.
 * Usa: valorDesdePosicion("forma", p) como índice de FORMAS_ONDA.
 * Casos:
 * - formaDesdePosicion(0) -> "seno"; (0.24) -> "seno"; (0.25) -> "triangulo"
 * - formaDesdePosicion(0.6) -> "sierra"; (0.8) -> "cuadrada"; (1) -> "cuadrada"
 */
export function formaDesdePosicion(posicion: number): FormaOnda {
  throw new Error("devclean: sin implementar");
}

/**
 * Texto corto del valor, sin el nombre del parámetro.
 * Idea: (formato por parámetro; punto decimal, nunca coma)
 * - tono: nota más cercana con octava. midi = round(69 + 12*log2(hz/440));
 *   nombres ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"]; octava = floor(midi/12) - 1.
 * - corte: < 1000 -> "<entero> Hz"; >= 1000 -> "<1 decimal> kHz".
 * - volumen, resonancia, lfoProfundidad: round(v*100) + " %".
 * - ataque, relajacion: < 1 s -> "<entero> ms"; >= 1 -> "<1 decimal> s".
 * - lfoVelocidad: "<1 decimal> Hz".
 * - forma: NOMBRES_FORMA de FORMAS_ONDA[indice redondeado y recortado].
 * Casos:
 * - textoValor("corte", 1200) -> "1.2 kHz"; ("corte", 800) -> "800 Hz"
 * - textoValor("tono", 220) -> "A3"; ("tono", 65.41) -> "C2"; ("tono", 1046.5) -> "C6"
 * - textoValor("resonancia", 0.4) -> "40 %"
 * - textoValor("ataque", 0.005) -> "5 ms"; ("relajacion", 1.25) -> "1.3 s" o "1.2 s" (toFixed(1)); ("relajacion", 3) -> "3.0 s"
 * - textoValor("lfoVelocidad", 2) -> "2.0 Hz"; textoValor("forma", 2) -> "Sierra"
 */
export function textoValor(id: IdParametro, valor: number): string {
  throw new Error("devclean: sin implementar");
}

/**
 * Etiqueta completa "<Nombre>: <texto del valor>" para la posición de un eje.
 * Usa: definicionParametro, valorDesdePosicion, textoValor. La usa la pantalla
 * del juego para la lectura del pad.
 * Casos:
 * - etiquetaPosicion("corte", 0.5) -> "Corte: 800 Hz"
 * - etiquetaPosicion("resonancia", 0.4) -> "Resonancia: 40 %"
 * - etiquetaPosicion("tono", 0) -> "Tono: C2"
 * - etiquetaPosicion("forma", 0.9) -> "Forma de onda: Cuadrada"
 */
export function etiquetaPosicion(id: IdParametro, posicion: number): string {
  throw new Error("devclean: sin implementar");
}

/**
 * Devuelve el cambio de AjustesSinte que corresponde a poner un parámetro en una
 * posición del eje (para pasarlo a Sinte.ajustar o mezclarlo con {...ajustes}).
 * Idea: campo según id — tono -> frecuencia; forma -> forma (FormaOnda, no índice);
 * el resto lleva el mismo nombre que su id. Un solo campo en el objeto devuelto.
 * Casos:
 * - cambioDesdePosicion("corte", 0.5) -> { corte: 800 } (±1)
 * - cambioDesdePosicion("tono", 0) -> { frecuencia: 65.406 } (±0.01)
 * - cambioDesdePosicion("forma", 0.3) -> { forma: "triangulo" }
 * - cambioDesdePosicion("lfoProfundidad", 0.25) -> { lfoProfundidad: 0.25 }
 */
export function cambioDesdePosicion(id: IdParametro, posicion: number): Partial<AjustesSinte> {
  throw new Error("devclean: sin implementar");
}

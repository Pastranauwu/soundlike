/**
 * Lógica del reto "Imita el sonido". PURO e inmutable: no importa Tone.js ni el DOM.
 * Depende solo de tipos (core/synthTypes y ./types). Lo usa screen.ts.
 */
import type { IdParametro, PosicionPad } from "../../core/synthTypes";
import type { Eje, EjesLeccion, EstadoReto, ResultadoReto } from "./types";

/**
 * Ejes de entrada: igual de forma que EjesLeccion, pero sin forzar los literales de
 * IdParametro. Así se acepta cualquier valor construido en tiempo de ejecución
 * (por ejemplo, objetos armados en pruebas) sin perder la forma del contrato.
 */
type EjesComoTexto = Record<Eje, string>;

/** Igual que EstadoReto, pero con EjesComoTexto en vez de EjesLeccion. */
interface EstadoRetoComoTexto {
  ejes: EjesComoTexto;
  semilla: number;
  objetivo: PosicionPad;
  fallos: number;
}

/** Distancia máxima por eje para acertar (12 % del pad). */
export const TOLERANCIA = 0.12;
/** Fallos a partir de los cuales el objetivo se dibuja en el pad. */
export const FALLOS_PARA_VER_OBJETIVO = 3;
/** El objetivo cae siempre dentro de este tramo de cada eje (lejos de los bordes y audible). */
export const OBJETIVO_MIN = 0.15;
export const OBJETIVO_MAX = 0.85;

/** PRNG mulberry32: determinista, sin Math.random ni la fecha. */
function mulberry32(semilla: number): () => number {
  let estado = semilla >>> 0;
  return () => {
    estado = (estado + 0x6d2b79f5) | 0;
    let t = Math.imul(estado ^ (estado >>> 15), 1 | estado);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Coordenada de un eje a partir de un número 0..1 del PRNG. */
function coordenadaDesde(r: number, parametro: IdParametro): number {
  const valor = OBJETIVO_MIN + r * (OBJETIVO_MAX - OBJETIVO_MIN);
  if (parametro === "forma") {
    return (Math.floor(valor * 4) + 0.5) / 4;
  }
  return Math.round(valor * 100) / 100;
}

/**
 * Objetivo oculto del reto, determinista por semilla.
 * Entrada: ejes de la lección y semilla entera.
 */
export function generarObjetivo(ejes: EjesComoTexto, semilla: number): PosicionPad {
  const siguiente = mulberry32(semilla);
  const x = coordenadaDesde(siguiente(), ejes.x as IdParametro);
  const y = coordenadaDesde(siguiente(), ejes.y as IdParametro);
  return { x, y };
}

/** Empieza un reto: objetivo de la semilla y 0 fallos. */
export function crearReto(ejes: EjesComoTexto, semilla: number): EstadoReto {
  return { ejes: ejes as EjesLeccion, semilla, objetivo: generarObjetivo(ejes, semilla), fallos: 0 };
}

/** Frases "sube" / "baja" por parámetro. "forma" usa la misma frase en los dos sentidos. */
const FRASES_PISTA: Record<IdParametro, [string, string]> = {
  tono: ["Te falta subir el tono", "Te falta bajar el tono"],
  volumen: ["Te falta subir el volumen", "Te falta bajar el volumen"],
  forma: ["Te falta cambiar la forma de onda", "Te falta cambiar la forma de onda"],
  corte: ["Te falta abrir el filtro", "Te falta cerrar el filtro"],
  resonancia: ["Te falta subir la resonancia", "Te falta bajar la resonancia"],
  ataque: ["Te falta alargar el ataque", "Te falta acortar el ataque"],
  relajacion: ["Te falta alargar la relajación", "Te falta acortar la relajación"],
  lfoVelocidad: ["Te falta acelerar el LFO", "Te falta frenar el LFO"],
  lfoProfundidad: ["Te falta subir la profundidad del LFO", "Te falta bajar la profundidad del LFO"],
};

/** Dirección en la que hay que mover el punto del pad. */
function direccion(eje: Eje, subir: boolean): string {
  if (eje === "x") return subir ? "a la derecha" : "a la izquierda";
  return subir ? "hacia arriba" : "hacia abajo";
}

/**
 * Pista de un eje fallido, con el nombre del parámetro y hacia dónde mover el punto.
 * Entrada: parámetro del eje, eje, y si hay que subir el valor (objetivo mayor que el punto).
 * Salida: "<frase>: mueve el punto <dirección>".
 */
export function pistaEje(parametro: IdParametro, eje: Eje, subir: boolean): string {
  const [frasesubir, fraseBajar] = FRASES_PISTA[parametro];
  const frase = subir ? frasesubir : fraseBajar;
  return `${frase}: mueve el punto ${direccion(eje, subir)}`;
}

/** true si el punto queda fuera de tolerancia en ese eje (con épsilon contra errores de coma flotante). */
function fallaEje(valorPunto: number, valorObjetivo: number): boolean {
  return Math.abs(valorPunto - valorObjetivo) > TOLERANCIA + 1e-9;
}

/**
 * Comprueba el punto del jugador contra el objetivo.
 * Salida: el resultado y el estado NUEVO (no muta el recibido).
 */
export function comprobarReto(
  estado: EstadoRetoComoTexto,
  punto: PosicionPad,
): ResultadoReto & { estado: EstadoReto } {
  const { ejes, objetivo } = estado;
  const ejesFallidos: Eje[] = [];
  if (fallaEje(punto.x, objetivo.x)) ejesFallidos.push("x");
  if (fallaEje(punto.y, objetivo.y)) ejesFallidos.push("y");

  if (ejesFallidos.length === 0) {
    return {
      estado: crearReto(ejes, estado.semilla + 1),
      acierto: true,
      ejesFallidos: [],
      pistas: [],
      mostrarObjetivo: false,
    };
  }

  const fallos = estado.fallos + 1;
  const pistas = ejesFallidos.map((eje) => {
    const subir = objetivo[eje] > punto[eje];
    return pistaEje(ejes[eje] as IdParametro, eje, subir);
  });
  return {
    estado: { ejes: ejes as EjesLeccion, semilla: estado.semilla, objetivo, fallos },
    acierto: false,
    ejesFallidos,
    pistas,
    mostrarObjetivo: fallos >= FALLOS_PARA_VER_OBJETIVO,
  };
}

/**
 * Estilos musicales del sintetizador: combinaciones de parámetros con nombre y
 * color en español. DATOS PUROS: no importa Tone.js ni toca el DOM.
 * Solo depende de ./synthTypes y ./synthParams. Lo usa
 * src/games/explora-el-sinte (patio libre).
 */

import { AJUSTES_BASE } from "./synthParams";
import type { AjustesSinte } from "./synthTypes";

/** Ids de los 6 estilos musicales. */
export type IdEstilo = "noventero" | "rave" | "acid" | "ambiente" | "chip" | "bajo";

/**
 * Un estilo musical: nombre visible, color CSS de su pad/lectura y el sonido
 * completo de partida (los ejes del pad se escriben encima).
 */
export interface EstiloMusical {
  id: IdEstilo;
  /** Nombre visible en español, p. ej. "Sinte noventero". */
  nombre: string;
  /** Color CSS (hex) del pad y de la lectura; distinto en cada estilo. */
  color: string;
  /** Sonido de partida del estilo. */
  ajustes: AjustesSinte;
}

/**
 * Los 6 estilos, en el orden en que se listan.
 * `obtenerEstilos` devuelve copias nuevas (con `ajustes` copiados) para que
 * mutarlas no contamine las llamadas siguientes.
 */
const ORDEN_ESTILOS: readonly EstiloMusical[] = [
  {
    id: "noventero",
    nombre: "Sinte noventero",
    color: "#8b5cf6",
    ajustes: { ...AJUSTES_BASE, forma: "sierra", corte: 2500 },
  },
  {
    id: "rave",
    nombre: "Sinte de rave electrónico",
    color: "#22d3ee",
    ajustes: { ...AJUSTES_BASE, forma: "cuadrada", corte: 6000, resonancia: 0.4 },
  },
  {
    id: "acid",
    nombre: "Sinte ácido",
    color: "#84cc16",
    ajustes: { ...AJUSTES_BASE, forma: "sierra", corte: 1200, resonancia: 0.8 },
  },
  {
    id: "ambiente",
    nombre: "Sinte ambiental",
    color: "#38bdf8",
    ajustes: { ...AJUSTES_BASE, forma: "seno", corte: 900, ataque: 1.2, relajacion: 2.5 },
  },
  {
    id: "chip",
    nombre: "Sinte de chip",
    color: "#f472b6",
    ajustes: { ...AJUSTES_BASE, forma: "cuadrada", corte: 4000, ataque: 0.005, relajacion: 0.08 },
  },
  {
    id: "bajo",
    nombre: "Sinte de bajos",
    color: "#fb923c",
    ajustes: { ...AJUSTES_BASE, forma: "triangulo", frecuencia: 65.41, corte: 400 },
  },
];

/** Copia de una ficha: quien la reciba puede mutarla sin tocar el catálogo. */
function copiarEstilo(estilo: EstiloMusical): EstiloMusical {
  return { ...estilo, ajustes: { ...estilo.ajustes } };
}

/** Los 6 estilos musicales del sinte, cada llamada con fichas nuevas. */
export function obtenerEstilos(): EstiloMusical[] {
  return ORDEN_ESTILOS.map(copiarEstilo);
}

/** Ficha del estilo por su id. Lanza Error(`Estilo desconocido: ${id}`) si no existe. */
export function estiloPorId(id: IdEstilo): EstiloMusical {
  const estilo = ORDEN_ESTILOS.find((candidato) => candidato.id === id);
  if (!estilo) {
    throw new Error(`Estilo desconocido: ${id}`);
  }
  return copiarEstilo(estilo);
}

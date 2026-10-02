/**
 * Estilos musicales del sintetizador: combinaciones de parámetros con nombre y
 * color en español. DATOS PUROS: no importa Tone.js ni toca el DOM.
 * Solo depende de ./synthTypes. Lo usa src/games/explora-el-sinte (patio libre).
 */

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
 *
 * Idea: constante privada ORDEN_ESTILOS con 6 fichas literales; cada `ajustes`
 * arranca de { ...AJUSTES_BASE } (de core/synthParams) y sobreescribe solo los
 * campos que definen su carácter (forma, corte, resonancia, ataque/relajación,
 * y en las que usen LFO velocidad/profundidad). Nombres y colores fijos:
 * noventero "Sinte noventero" #8b5cf6 (sierra, corte 2500);
 * rave "Sinte de rave electrónico" #22d3ee (cuadrada, corte 6000, resonancia 0.4);
 * acid "Sinte ácido" #84cc16 (sierra, corte 1200, resonancia 0.8);
 * ambiente "Sinte ambiental" #38bdf8 (seno, corte 900, ataque 1.2, relajación 2.5);
 * chip "Sinte de chip" #f472b6 (cuadrada, corte 4000, ataque 0.005, relajación 0.08);
 * bajo "Sinte de bajos" #fb923c (triangulo, frecuencia 65.41, corte 400).
 * `obtenerEstilos` = ORDEN_ESTILOS.map(e => ({ ...e, ajustes: { ...e.ajustes } }))
 * (nada de devolver la constante tal cual: el que la reciba podría mutarla).
 * `estiloPorId` reutiliza la búsqueda y devuelve también copia.
 *
 * Casos:
 * - obtenerEstilos() -> 6 fichas; ids en orden ["noventero","rave","acid","ambiente","chip","bajo"].
 * - los 6 colores son distintos y cada `ajustes` trae los 9 campos de AjustesSinte.
 * - mutar obtenerEstilos()[0].ajustes.corte y volver a llamar mantiene el valor original.
 * - estiloPorId("rave").nombre -> "Sinte de rave electrónico".
 * - estiloPorId("nope" as IdEstilo) -> Error("Estilo desconocido: nope").
 */
export function obtenerEstilos(): EstiloMusical[] {
  throw new Error("devclean: sin implementar");
}

/** Ficha del estilo por su id. Lanza Error(`Estilo desconocido: ${id}`) si no existe. */
export function estiloPorId(id: IdEstilo): EstiloMusical {
  throw new Error("devclean: sin implementar");
}

/**
 * Frases de feedback en español que explican el error al acertar.
 * FUNCIONES PURAS: no importa Tone.js ni el DOM.
 * Depende de celdasDistintas de src/core/sequencer. Lo usa juego.ts (comprobar).
 */
import type { Celda } from "../../core/types";
import { PISTAS_BATERIA } from "../../core/types";
import type { Beat } from "./types";

/**
 * Explica en español las diferencias entre el beat original y el roto.
 * Entrada: beat original (correcto) y beat roto que escuchó el jugador.
 * Salida: una frase por pista afectada, unidas con espacio. Formato:
 * - Golpe quitado (estaba en el original y no en el roto):
 *   "El <pista> va en el paso <n> (tiempo <t>)." o, con varios:
 *   "El <pista> va en los pasos <n1> y <n2> (tiempos <t1> y <t2>)."
 * - Golpe agregado (no estaba en el original):
 *   "El <pista> no va en el paso <n>." / "El <pista> no va en los pasos <n1> y <n2>."
 * Donde <pista> es el nombre en español (Bombo, Clap, Hi-hat cerrado, Hi-hat
 * abierto), <n> es el paso 1-indexed y <t> el tiempo del compás: ceil(n/4)
 * (pasos 1-4 -> tiempo 1, 5-8 -> 2, 9-12 -> 3, 13-16 -> 4).
 * Listas de 3+ elementos con comas y "y" antes del último. Orden: el de
 * PISTAS_BATERIA y pasos ascendentes.
 * Sin diferencias -> "" (cadena vacía).
 * Casos:
 * - clap quitado en pasos 4 y 12 (0-indexed) ->
 *   "El clap va en los pasos 5 y 13 (tiempos 2 y 4)."
 * - golpe agregado en kick paso 2 -> "El bombo no va en el paso 3."
 * - sin diferencias -> ""
 */
export function explicarError(original: Beat, roto: Beat): string {
  const quitados: Celda[] = [];
  const agregados: Celda[] = [];

  for (const pista of PISTAS_BATERIA) {
    const pistaId = pista.id;
    const originalFila = original.cuadricula[pistaId] || [];
    const rotoFila = roto.cuadricula[pistaId] || [];

    for (let paso = 0; paso < 16; paso++) {
      if (originalFila[paso] && !rotoFila[paso]) {
        quitados.push({ pista: pistaId, paso });
      } else if (!originalFila[paso] && rotoFila[paso]) {
        agregados.push({ pista: pistaId, paso });
      }
    }
  }

  const mapaNombres = new Map(PISTAS_BATERIA.map((p) => [p.id, p.nombre]));
  const frases: string[] = [];

  for (const pista of PISTAS_BATERIA) {
    const quitadosEnPista = quitados
      .filter((c) => c.pista === pista.id)
      .map((c) => c.paso);
    const agregadosEnPista = agregados
      .filter((c) => c.pista === pista.id)
      .map((c) => c.paso);

    if (quitadosEnPista.length > 0) {
      const pasos1Indexed = quitadosEnPista.map((p) => p + 1);
      const tiempos = pasos1Indexed.map((p) => Math.ceil(p / 4));
      frases.push(
        formatarFrase("va", pista.nombre.toLowerCase(), pasos1Indexed, tiempos)
      );
    }

    if (agregadosEnPista.length > 0) {
      const pasos1Indexed = agregadosEnPista.map((p) => p + 1);
      frases.push(
        formatarFrase("no va", pista.nombre.toLowerCase(), pasos1Indexed)
      );
    }
  }

  return frases.join(" ");
}

function formatarFrase(
  tipo: "va" | "no va",
  pista: string,
  pasos: number[],
  tiempos?: number[]
): string {
  const formarLista = (items: number[]): string => {
    if (items.length === 1) {
      return items[0].toString();
    }
    if (items.length === 2) {
      return `${items[0]} y ${items[1]}`;
    }
    return (
      items.slice(0, -1).join(", ") + ` y ${items[items.length - 1]}`
    );
  };

  const pasosStr = formarLista(pasos);
  const palabra = pasos.length === 1 ? "paso" : "pasos";
  const articulo = pasos.length === 1 ? "el" : "los";

  if (tipo === "va") {
    const tiemposStr = formarLista(tiempos!);
    const palabraTiempo = tiempos!.length === 1 ? "tiempo" : "tiempos";
    return `El ${pista} va en ${articulo} ${palabra} ${pasosStr} (${palabraTiempo} ${tiemposStr}).`;
  } else {
    return `El ${pista} no va en ${articulo} ${palabra} ${pasosStr}.`;
  }
}

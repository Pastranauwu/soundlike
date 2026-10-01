/**
 * Resultado de una jugada de "Arregla el beat" (puro: sin DOM ni Tone.js).
 * Convierte la comparación entre la cuadrícula del jugador y el beat original
 * en un resultado claro: si acertó, y si falló POR QUÉ (qué instrumento, si
 * sobra o falta un golpe y, con más intentos, dónde). Lo pinta screen.ts en
 * .juego__resultado después de cada "Comprobar".
 */
import type { Cuadricula } from "../../core/types";
import { PISTAS_BATERIA } from "../../core/types";
import { celdasDistintas } from "../../core/sequencer";
import { explicarError } from "./feedback";
import type { Beat } from "./types";

/** Lo que ve el jugador tras pulsar "Comprobar". Todo en español. */
export interface ResultadoJugada {
  acierto: boolean;
  /** "¡Correcto!" o "Todavía no suena igual". */
  titulo: string;
  /** Una frase: en acierto la explicación del error; en fallo cuántas celdas difieren. */
  resumen: string;
  /** Por qué falló: una línea por instrumento con problemas (+ avisos). Vacío en acierto. */
  motivos: string[];
}

/**
 * Evalúa la jugada: compara la cuadrícula del jugador (`actual`) contra el
 * beat original de la ronda y explica por qué falló, si falló.
 *
 * `intentosFallidos` cuenta los fallos de la ronda incluyendo este (1 en el
 * primer fallo) y controla cuánto detalle de ubicación se da por pista: nada
 * en el primer fallo, la mitad del compás en el segundo, los pasos exactos
 * a partir del tercero. Una pista ausente en `actual` se trata como fila en
 * false (el jugador borró todos sus golpes).
 */
export function evaluarJugada(
  original: Beat,
  roto: Beat,
  actual: Cuadricula,
  intentosFallidos: number,
): ResultadoJugada {
  const dif = celdasDistintas(original.cuadricula, actual);

  if (dif.length === 0) {
    return {
      acierto: true,
      titulo: "¡Correcto!",
      resumen: explicarError(original, roto),
      motivos: [],
    };
  }

  const resumen = `Hay ${dif.length} celda${dif.length === 1 ? "" : "s"} distinta${
    dif.length === 1 ? "" : "s"
  } al beat correcto.`;

  const motivos = construirMotivosPorPista(original, actual, dif, intentosFallidos);

  if (celdasDistintas(roto.cuadricula, actual).length === 0) {
    motivos.push("No cambiaste nada: la cuadrícula sigue igual que el beat roto.");
  }

  const celdasYaBien = dif.filter((celda) => {
    const enRoto = roto.cuadricula[celda.pista]?.[celda.paso] ?? false;
    const enOriginal = original.cuadricula[celda.pista]?.[celda.paso] ?? false;
    return enRoto === enOriginal;
  }).length;

  if (celdasYaBien > 0) {
    const palabra = celdasYaBien === 1 ? "celda" : "celdas";
    const verbo = celdasYaBien === 1 ? "estaba" : "estaban";
    motivos.push(
      `Cambiaste ${celdasYaBien} ${palabra} que ya ${verbo} bien: Reiniciar vuelve al beat roto.`,
    );
  }

  return {
    acierto: false,
    titulo: "Todavía no suena igual",
    resumen,
    motivos,
  };
}

function construirMotivosPorPista(
  original: Beat,
  actual: Cuadricula,
  dif: { pista: string; paso: number }[],
  intentosFallidos: number,
): string[] {
  const motivos: string[] = [];

  for (const pista of PISTAS_BATERIA) {
    const sobraPasos: number[] = [];
    const faltaPasos: number[] = [];

    for (const celda of dif) {
      if (celda.pista !== pista.id) continue;
      const enActual = actual[pista.id]?.[celda.paso] ?? false;
      const enOriginal = original.cuadricula[pista.id]?.[celda.paso] ?? false;
      if (enActual && !enOriginal) {
        sobraPasos.push(celda.paso + 1);
      } else if (!enActual && enOriginal) {
        faltaPasos.push(celda.paso + 1);
      }
    }

    if (sobraPasos.length === 0 && faltaPasos.length === 0) continue;

    const partes: string[] = [];
    if (sobraPasos.length > 0) {
      partes.push(describirGolpes("sobra", "sobran", sobraPasos, intentosFallidos));
    }
    if (faltaPasos.length > 0) {
      partes.push(describirGolpes("falta", "faltan", faltaPasos, intentosFallidos));
    }
    motivos.push(`${pista.nombre}: ${partes.join(" y ")}.`);
  }

  return motivos;
}

function describirGolpes(
  verboSingular: string,
  verboPlural: string,
  pasos: number[],
  intentosFallidos: number,
): string {
  const verbo = pasos.length === 1 ? verboSingular : verboPlural;
  const palabra = pasos.length === 1 ? "golpe" : "golpes";
  return `${verbo} ${pasos.length} ${palabra}${describirUbicacion(pasos, intentosFallidos)}`;
}

function describirUbicacion(pasos: number[], intentosFallidos: number): string {
  if (intentosFallidos <= 1) return "";

  if (intentosFallidos === 2) {
    const primeraMitad = pasos.some((paso) => paso <= 8);
    const segundaMitad = pasos.some((paso) => paso > 8);
    if (primeraMitad && segundaMitad) return " en las dos mitades";
    return primeraMitad
      ? " en la primera mitad (pasos 1-8)"
      : " en la segunda mitad (pasos 9-16)";
  }

  const ordenados = [...pasos].sort((a, b) => a - b);
  if (ordenados.length === 1) return ` en el paso ${ordenados[0]}`;
  if (ordenados.length === 2) return ` en los pasos ${ordenados[0]} y ${ordenados[1]}`;
  return ` en los pasos ${ordenados.slice(0, -1).join(", ")} y ${ordenados[ordenados.length - 1]}`;
}

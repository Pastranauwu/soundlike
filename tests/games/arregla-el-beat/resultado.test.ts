import { describe, expect, it } from "vitest";
import { crearCuadricula, alternarPaso } from "../../../src/core/sequencer";
import { PISTAS_BATERIA } from "../../../src/core/types";
import { explicarError } from "../../../src/games/arregla-el-beat/feedback";
import { evaluarJugada } from "../../../src/games/arregla-el-beat/resultado";
import type { Beat } from "../../../src/games/arregla-el-beat/types";

function crearBeat(): Beat {
  let cuadricula = crearCuadricula(PISTAS_BATERIA);
  cuadricula = alternarPaso(cuadricula, "kick", 0);
  cuadricula = alternarPaso(cuadricula, "clap", 4);
  cuadricula = alternarPaso(cuadricula, "clap", 12);
  return { id: "x", nombre: "X", genero: "test", tempo: 120, cuadricula };
}

const original = crearBeat();
const roto: Beat = {
  ...original,
  cuadricula: alternarPaso(original.cuadricula, "clap", 6),
};

describe("evaluarJugada", () => {
  it("acierto: actual igual al original", () => {
    const resultado = evaluarJugada(original, roto, original.cuadricula, 1);
    expect(resultado.acierto).toBe(true);
    expect(resultado.titulo).toBe("¡Correcto!");
    expect(resultado.resumen).toBe(explicarError(original, roto));
    expect(resultado.motivos).toEqual([]);
  });

  it("fallo con actual = roto, intentos 1: resumen y motivos sin detalle de ubicación", () => {
    const resultado = evaluarJugada(original, roto, roto.cuadricula, 1);
    expect(resultado.acierto).toBe(false);
    expect(resultado.titulo).toBe("Todavía no suena igual");
    expect(resultado.resumen).toBe("Hay 1 celda distinta al beat correcto.");
    expect(resultado.motivos).toEqual([
      "Clap: sobra 1 golpe.",
      "No cambiaste nada: la cuadrícula sigue igual que el beat roto.",
    ]);
  });

  it("fallo con actual = roto, intentos 2: detalle de mitad del compás", () => {
    const resultado = evaluarJugada(original, roto, roto.cuadricula, 2);
    expect(resultado.motivos[0]).toBe(
      "Clap: sobra 1 golpe en la primera mitad (pasos 1-8).",
    );
  });

  it("fallo con actual = roto, intentos 3: detalle de paso exacto", () => {
    const resultado = evaluarJugada(original, roto, roto.cuadricula, 3);
    expect(resultado.motivos[0]).toBe("Clap: sobra 1 golpe en el paso 7.");
  });

  it("fallo con bombo borrado (celda que ya estaba bien): aviso de reinicio", () => {
    const actual = alternarPaso(roto.cuadricula, "kick", 0);
    const resultado = evaluarJugada(original, roto, actual, 1);
    expect(resultado.resumen).toBe("Hay 2 celdas distintas al beat correcto.");
    expect(resultado.motivos).toEqual([
      "Bombo: falta 1 golpe.",
      "Clap: sobra 1 golpe.",
      "Cambiaste 1 celda que ya estaba bien: Reiniciar vuelve al beat roto.",
    ]);
  });
});

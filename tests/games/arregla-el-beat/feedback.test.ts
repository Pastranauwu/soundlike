import { describe, it, expect } from "vitest";
import { explicarError } from "../../../src/games/arregla-el-beat/feedback";
import { crearCuadricula, alternarPaso } from "../../../src/core/sequencer";
import { PISTAS_BATERIA, type Cuadricula } from "../../../src/core/types";
import type { Beat } from "../../../src/games/arregla-el-beat/types";

const crearBeat = (cuadricula: Cuadricula): Beat => ({
  id: "test",
  nombre: "Test",
  genero: "Test",
  tempo: 120,
  cuadricula,
});

describe("feedback.explicarError", () => {
  it("devuelve cadena vacía cuando no hay diferencias", () => {
    const c = crearCuadricula(PISTAS_BATERIA);
    const original = crearBeat(c);
    const roto = crearBeat(c);

    const resultado = explicarError(original, roto);
    expect(resultado).toBe("");
  });

  it("explica golpe quitado en clap pasos 4 y 12 (0-indexed)", () => {
    const original = crearBeat(
      alternarPaso(
        alternarPaso(crearCuadricula(PISTAS_BATERIA), "clap", 4),
        "clap",
        12
      )
    );
    const roto = crearBeat(crearCuadricula(PISTAS_BATERIA));

    const resultado = explicarError(original, roto);
    expect(resultado).toBe(
      "El clap va en los pasos 5 y 13 (tiempos 2 y 4)."
    );
  });

  it("explica golpe agregado en kick paso 2 (0-indexed)", () => {
    const original = crearBeat(crearCuadricula(PISTAS_BATERIA));
    const roto = crearBeat(
      alternarPaso(crearCuadricula(PISTAS_BATERIA), "kick", 2)
    );

    const resultado = explicarError(original, roto);
    expect(resultado).toBe("El bombo no va en el paso 3.");
  });

  it("explica múltiples golpes agregados en una pista", () => {
    const original = crearBeat(crearCuadricula(PISTAS_BATERIA));
    const roto = crearBeat(
      alternarPaso(
        alternarPaso(crearCuadricula(PISTAS_BATERIA), "kick", 1),
        "kick",
        5
      )
    );

    const resultado = explicarError(original, roto);
    expect(resultado).toBe("El bombo no va en los pasos 2 y 6.");
  });

  it("explica golpe quitado en una sola pista", () => {
    const original = crearBeat(
      alternarPaso(crearCuadricula(PISTAS_BATERIA), "clap", 8)
    );
    const roto = crearBeat(crearCuadricula(PISTAS_BATERIA));

    const resultado = explicarError(original, roto);
    expect(resultado).toBe("El clap va en el paso 9 (tiempo 3).");
  });

  it("ordena por pista (orden PISTAS_BATERIA) luego por paso ascendente", () => {
    let c = crearCuadricula(PISTAS_BATERIA);
    c = alternarPaso(c, "open-hat", 0);
    c = alternarPaso(c, "clap", 1);
    c = alternarPaso(c, "kick", 2);

    const original = crearBeat(c);
    const roto = crearBeat(crearCuadricula(PISTAS_BATERIA));

    const resultado = explicarError(original, roto);
    expect(resultado).toBe(
      "El bombo va en el paso 3 (tiempo 1). El clap va en el paso 2 (tiempo 1). El hi-hat abierto va en el paso 1 (tiempo 1)."
    );
  });

  it("usa listas con comas y 'y' para 3+ elementos", () => {
    let c = crearCuadricula(PISTAS_BATERIA);
    c = alternarPaso(c, "kick", 0);
    c = alternarPaso(c, "kick", 1);
    c = alternarPaso(c, "kick", 2);

    const original = crearBeat(c);
    const roto = crearBeat(crearCuadricula(PISTAS_BATERIA));

    const resultado = explicarError(original, roto);
    expect(resultado).toBe(
      "El bombo va en los pasos 1, 2 y 3 (tiempos 1, 1 y 1)."
    );
  });

  it("mezcla golpes quitados y agregados de varias pistas", () => {
    let original = crearCuadricula(PISTAS_BATERIA);
    original = alternarPaso(original, "kick", 3); // quitado

    let roto = crearCuadricula(PISTAS_BATERIA);
    roto = alternarPaso(roto, "clap", 7); // agregado

    const resultado = explicarError(
      crearBeat(original),
      crearBeat(roto)
    );
    expect(resultado).toBe(
      "El bombo va en el paso 4 (tiempo 1). El clap no va en el paso 8."
    );
  });
});

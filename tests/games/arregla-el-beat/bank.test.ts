import { describe, expect, it } from "vitest";
import { PASOS, PISTAS_BATERIA, TEMPO_MAX, TEMPO_MIN } from "../../../src/core/types";
import { elegirBeat, obtenerBanco } from "../../../src/games/arregla-el-beat/bank";

const GENEROS_ESPERADOS = ["hip-hop", "boom bap", "reggaetón", "house", "rock"];

describe("obtenerBanco", () => {
  it("devuelve 10 beats", () => {
    expect(obtenerBanco().length).toBe(10);
  });

  it("tiene tempos dentro de 60-180 y cuadrículas de 4 pistas x 16 pasos con al menos un golpe por pista", () => {
    for (const beat of obtenerBanco()) {
      expect(beat.tempo).toBeGreaterThanOrEqual(TEMPO_MIN);
      expect(beat.tempo).toBeLessThanOrEqual(TEMPO_MAX);

      const pistas = Object.keys(beat.cuadricula);
      expect(pistas.sort()).toEqual(PISTAS_BATERIA.map((p) => p.id).sort());

      for (const pista of PISTAS_BATERIA) {
        const fila = beat.cuadricula[pista.id];
        expect(fila).toHaveLength(PASOS);
        expect(fila.some((golpe) => golpe)).toBe(true);
      }
    }
  });

  it("incluye los 5 géneros: hip-hop, boom bap, reggaetón, house y rock", () => {
    const generos = obtenerBanco().map((beat) => beat.genero);
    for (const genero of GENEROS_ESPERADOS) {
      expect(generos).toContain(genero);
    }
  });

  it("no tiene beats con id repetido", () => {
    const ids = obtenerBanco().map((beat) => beat.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("elegirBeat", () => {
  it("devuelve siempre el mismo beat para la misma semilla", () => {
    expect(elegirBeat(7)).toEqual(elegirBeat(7));
  });

  it("devuelve siempre un elemento de obtenerBanco()", () => {
    const banco = obtenerBanco();
    for (const semilla of [-20, -1, 0, 1, 3, 10, 99]) {
      expect(banco).toContainEqual(elegirBeat(semilla));
    }
  });

  it("reparte las semillas 0..9 entre varios beats distintos", () => {
    const elegidos = new Set(
      Array.from({ length: 10 }, (_, semilla) => elegirBeat(semilla).id),
    );
    expect(elegidos.size).toBeGreaterThan(1);
  });
});

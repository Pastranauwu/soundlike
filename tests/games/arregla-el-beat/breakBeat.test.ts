import { describe, it, expect } from "vitest";
import { breakBeat } from "../../../src/games/arregla-el-beat/breakBeat";
import type { Beat } from "../../../src/games/arregla-el-beat/types";
import type { Cuadricula } from "../../../src/core/types";

function crearBeatPrueba(): Beat {
  const cuadricula: Cuadricula = {
    kick: [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false],
    clap: [false, true, false, true, false, true, false, true, false, true, false, true, false, true, false, true],
    "closed-hat": [true, true, false, false, true, true, false, false, true, true, false, false, true, true, false, false],
    "open-hat": [false, false, true, true, false, false, true, true, false, false, true, true, false, false, true, true],
  };

  return {
    id: "test-beat",
    nombre: "Beat de Prueba",
    genero: "Test",
    tempo: 120,
    cuadricula,
  };
}

function contarDiferencias(a: Cuadricula, b: Cuadricula): number {
  let diferencias = 0;
  for (const pista in a) {
    if (pista in b) {
      for (let i = 0; i < 16; i++) {
        if (a[pista][i] !== b[pista][i]) {
          diferencias++;
        }
      }
    }
  }
  return diferencias;
}

function copiarCuadricula(c: Cuadricula): Cuadricula {
  const copia: Cuadricula = {};
  for (const pista in c) {
    copia[pista] = [...c[pista]];
  }
  return copia;
}

describe("breakBeat", () => {
  it("debería ser determinista: misma semilla produce el mismo resultado", () => {
    const beat = crearBeatPrueba();
    const resultado1 = breakBeat(beat, 2, 42);
    const resultado2 = breakBeat(beat, 2, 42);

    expect(resultado1.cuadricula).toEqual(resultado2.cuadricula);
  });

  it("debería invertir exactamente nErrores celdas distintas", () => {
    const beat = crearBeatPrueba();
    const nErrores = 5;
    const resultado = breakBeat(beat, nErrores, 42);

    const diferencias = contarDiferencias(beat.cuadricula, resultado.cuadricula);
    expect(diferencias).toBe(nErrores);
  });

  it("no debería mutar el beat original", () => {
    const beat = crearBeatPrueba();
    const original = copiarCuadricula(beat.cuadricula);

    breakBeat(beat, 3, 42);

    expect(beat.cuadricula).toEqual(original);
  });

  it("debería conservar metadata del beat original", () => {
    const beat = crearBeatPrueba();
    const resultado = breakBeat(beat, 2, 42);

    expect(resultado.nombre).toBe(beat.nombre);
    expect(resultado.genero).toBe(beat.genero);
    expect(resultado.tempo).toBe(beat.tempo);
    expect(resultado.id).toBe(beat.id);
  });

  it("debería lanzar Error si nErrores < 1", () => {
    const beat = crearBeatPrueba();
    expect(() => breakBeat(beat, 0, 1)).toThrow(Error);
    expect(() => breakBeat(beat, -1, 1)).toThrow(Error);
  });

  it("debería lanzar Error si nErrores > 64", () => {
    const beat = crearBeatPrueba();
    expect(() => breakBeat(beat, 65, 1)).toThrow(Error);
    expect(() => breakBeat(beat, 100, 1)).toThrow(Error);
  });

  it("semillas distintas deberían producir resultados distintos (con alta probabilidad)", () => {
    const beat = crearBeatPrueba();
    const resultado1 = breakBeat(beat, 8, 42);
    const resultado2 = breakBeat(beat, 8, 43);

    // Verificamos que son distintos (con semillas diferentes)
    const sonIguales = JSON.stringify(resultado1.cuadricula) === JSON.stringify(resultado2.cuadricula);
    expect(sonIguales).toBe(false);
  });

  it("debería invertir exactamente 1 celda cuando nErrores=1", () => {
    const beat = crearBeatPrueba();
    const resultado = breakBeat(beat, 1, 42);

    const diferencias = contarDiferencias(beat.cuadricula, resultado.cuadricula);
    expect(diferencias).toBe(1);
  });

  it("debería invertir exactamente 64 celdas cuando nErrores=64", () => {
    const beat = crearBeatPrueba();
    const resultado = breakBeat(beat, 64, 42);

    const diferencias = contarDiferencias(beat.cuadricula, resultado.cuadricula);
    expect(diferencias).toBe(64);
  });

  it("debería crear un beat con estructura completa", () => {
    const beat = crearBeatPrueba();
    const resultado = breakBeat(beat, 3, 42);

    expect(resultado).toHaveProperty("id");
    expect(resultado).toHaveProperty("nombre");
    expect(resultado).toHaveProperty("genero");
    expect(resultado).toHaveProperty("tempo");
    expect(resultado).toHaveProperty("cuadricula");
  });

  it("debería invertir valores booleanos correctamente", () => {
    const beat = crearBeatPrueba();
    const resultado = breakBeat(beat, 1, 42);

    // Verificar que exactamente una celda cambió
    for (const pista in beat.cuadricula) {
      for (let i = 0; i < 16; i++) {
        if (beat.cuadricula[pista][i] !== resultado.cuadricula[pista][i]) {
          // Debe ser la inversión
          expect(resultado.cuadricula[pista][i]).toBe(!beat.cuadricula[pista][i]);
        }
      }
    }
  });
});

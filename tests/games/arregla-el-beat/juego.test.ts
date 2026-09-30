import { describe, it, expect } from "vitest";
import {
  erroresPorNivel,
  crearJuego,
  iniciarRonda,
  comprobar,
  ayudaDisponible,
  celdasErroneas,
  MENSAJE_FALLO,
} from "../../../src/games/arregla-el-beat/juego";
import { celdasDistintas, crearCuadricula } from "../../../src/core/sequencer";
import { alternarPaso } from "../../../src/core/sequencer";
import { PISTAS_BATERIA, type Cuadricula } from "../../../src/core/types";
import type { Beat, EstadoJuego } from "../../../src/games/arregla-el-beat/types";

function crearBeatPrueba(): Beat {
  let cuadricula = crearCuadricula(PISTAS_BATERIA);
  cuadricula = alternarPaso(cuadricula, "kick", 0);
  cuadricula = alternarPaso(cuadricula, "clap", 4);
  return {
    id: "beat-prueba",
    nombre: "Beat de Prueba",
    genero: "hip-hop",
    tempo: 120,
    cuadricula,
  };
}

function estadoEnNivel(nivel: number): EstadoJuego {
  const estado = crearJuego();
  return { ...estado, puntaje: { ...estado.puntaje, nivel } };
}

describe("erroresPorNivel", () => {
  it("nivel 1 -> 1, nivel 2 -> 2, nivel 3 -> 3", () => {
    expect(erroresPorNivel(1)).toBe(1);
    expect(erroresPorNivel(2)).toBe(2);
    expect(erroresPorNivel(3)).toBe(3);
  });

  it("lanza Error fuera de 1..3", () => {
    expect(() => erroresPorNivel(0)).toThrowError();
    expect(() => erroresPorNivel(4)).toThrowError();
  });
});

describe("crearJuego", () => {
  it("crea el estado inicial", () => {
    expect(crearJuego()).toEqual({
      beatOriginal: null,
      beatRoto: null,
      intentosFallidos: 0,
      rondaResuelta: false,
      ultimo: null,
      puntaje: { puntos: 0, racha: 0, nivel: 1 },
    });
  });
});

describe("iniciarRonda", () => {
  it("nivel 1 y semilla 5 -> beatRoto difiere en exactamente 1 celda", () => {
    const beat = crearBeatPrueba();
    const estado = iniciarRonda(crearJuego(), beat, 5);
    expect(estado.beatOriginal).toEqual(beat);
    expect(celdasDistintas(beat.cuadricula, estado.beatRoto!.cuadricula)).toHaveLength(1);
    expect(estado.intentosFallidos).toBe(0);
    expect(estado.rondaResuelta).toBe(false);
    expect(estado.ultimo).toBeNull();
  });

  it("nivel 2 -> 2 celdas distintas; mismas entradas -> mismo beatRoto", () => {
    const beat = crearBeatPrueba();
    const estado = estadoEnNivel(2);
    const rondaA = iniciarRonda(estado, beat, 7);
    const rondaB = iniciarRonda(estado, beat, 7);
    expect(celdasDistintas(beat.cuadricula, rondaA.beatRoto!.cuadricula)).toHaveLength(2);
    expect(rondaA.beatRoto).toEqual(rondaB.beatRoto);
  });
});

describe("comprobar", () => {
  it("acierta con la cuadrícula original: suma puntos, racha 1 y resuelve", () => {
    const beat = crearBeatPrueba();
    const ronda = iniciarRonda(crearJuego(), beat, 1);
    const resultado = comprobar(ronda, beat.cuadricula);
    expect(resultado.puntaje.puntos).toBe(100);
    expect(resultado.puntaje.racha).toBe(1);
    expect(resultado.rondaResuelta).toBe(true);
    expect(resultado.ultimo?.acierto).toBe(true);
  });

  it("falla con la cuadrícula rota (nivel 1): intentosFallidos 1, racha 0", () => {
    const beat = crearBeatPrueba();
    const ronda = iniciarRonda(crearJuego(), beat, 1);
    const resultado = comprobar(ronda, ronda.beatRoto!.cuadricula);
    expect(resultado.intentosFallidos).toBe(1);
    expect(resultado.puntaje.racha).toBe(0);
    expect(resultado.rondaResuelta).toBe(false);
    expect(resultado.ultimo).toEqual({ acierto: false, mensaje: MENSAJE_FALLO });
  });

  it("3 aciertos seguidos en nivel 1 hacen subir a nivel 2", () => {
    const beat = crearBeatPrueba();
    let estado = crearJuego();
    for (let i = 0; i < 3; i++) {
      estado = iniciarRonda(estado, beat, i);
      estado = comprobar(estado, beat.cuadricula);
    }
    expect(estado.puntaje.nivel).toBe(2);
  });

  it("lanza Error si no hay ronda iniciada", () => {
    expect(() => comprobar(crearJuego(), crearBeatPrueba().cuadricula)).toThrowError();
  });

  it("lanza Error si la ronda ya estaba resuelta", () => {
    const beat = crearBeatPrueba();
    let estado = iniciarRonda(crearJuego(), beat, 1);
    estado = comprobar(estado, beat.cuadricula);
    expect(() => comprobar(estado, beat.cuadricula)).toThrowError();
  });
});

describe("ayudaDisponible", () => {
  it("false con 2 fallos, true con 3, false si la ronda está resuelta", () => {
    const conDosFallos: EstadoJuego = { ...crearJuego(), intentosFallidos: 2 };
    const conTresFallos: EstadoJuego = { ...crearJuego(), intentosFallidos: 3 };
    const resuelta: EstadoJuego = { ...crearJuego(), intentosFallidos: 3, rondaResuelta: true };

    expect(ayudaDisponible(conDosFallos)).toBe(false);
    expect(ayudaDisponible(conTresFallos)).toBe(true);
    expect(ayudaDisponible(resuelta)).toBe(false);
  });
});

describe("celdasErroneas", () => {
  it("actual igual al original -> []", () => {
    const beat = crearBeatPrueba();
    const ronda = iniciarRonda(crearJuego(), beat, 1);
    expect(celdasErroneas(ronda, beat.cuadricula)).toEqual([]);
  });

  it("falta el clap del paso 4 -> [{ pista: 'clap', paso: 4 }]", () => {
    const beat = crearBeatPrueba();
    const ronda = iniciarRonda(crearJuego(), beat, 1);
    const actual: Cuadricula = alternarPaso(beat.cuadricula, "clap", 4);
    expect(celdasErroneas(ronda, actual)).toEqual([{ pista: "clap", paso: 4 }]);
  });

  it("lanza Error si no hay ronda iniciada", () => {
    expect(() => celdasErroneas(crearJuego(), crearBeatPrueba().cuadricula)).toThrowError();
  });
});

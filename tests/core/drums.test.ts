import { beforeEach, describe, expect, it, vi } from "vitest";
import { crearBateria } from "../../src/core/drums";
import * as Tone from "tone";

const instancias: Record<string, unknown[]> = {
  MembraneSynth: [],
  NoiseSynth: [],
  MetalSynth: [],
};

function crearSinteFalso(nombre: string) {
  const sinte = {
    connect: vi.fn().mockReturnThis(),
    triggerAttackRelease: vi.fn().mockReturnThis(),
    dispose: vi.fn(),
  };
  instancias[nombre].push(sinte);
  return sinte;
}

vi.mock("tone", () => ({
  getDestination: vi.fn(() => "destino-maestro"),
  MembraneSynth: vi.fn(function MembraneSynth() {
    return crearSinteFalso("MembraneSynth");
  }),
  NoiseSynth: vi.fn(function NoiseSynth() {
    return crearSinteFalso("NoiseSynth");
  }),
  MetalSynth: vi.fn(function MetalSynth() {
    return crearSinteFalso("MetalSynth");
  }),
}));

beforeEach(() => {
  instancias.MembraneSynth = [];
  instancias.NoiseSynth = [];
  instancias.MetalSynth = [];
});

describe("crearBateria", () => {
  it("crea un sinte por sonido: bombo, clap y dos metálicos (hi-hats)", () => {
    crearBateria();

    expect(instancias.MembraneSynth).toHaveLength(1);
    expect(instancias.NoiseSynth).toHaveLength(1);
    expect(instancias.MetalSynth).toHaveLength(2);
  });

  it('disparar("kick") dispara el sinte de bombo con una nota grave', () => {
    crearBateria().disparar("kick");

    const kick = instancias.MembraneSynth[0] as {
      triggerAttackRelease: ReturnType<typeof vi.fn>;
    };
    expect(kick.triggerAttackRelease).toHaveBeenCalledWith("C1", "8n", undefined);
  });

  it('disparar("clap") dispara el sinte de ruido', () => {
    crearBateria().disparar("clap");

    const clap = instancias.NoiseSynth[0] as {
      triggerAttackRelease: ReturnType<typeof vi.fn>;
    };
    expect(clap.triggerAttackRelease).toHaveBeenCalledWith("16n", undefined);
  });

  it('closed-hat y open-hat se crean con decays de envelope distintos', () => {
    crearBateria();

    const metalSynthMock = Tone.MetalSynth as unknown as ReturnType<typeof vi.fn>;
    const [opcionesCerrado] = metalSynthMock.mock.calls[0];
    const [opcionesAbierto] = metalSynthMock.mock.calls[1];
    expect(opcionesCerrado.envelope.decay).not.toBe(opcionesAbierto.envelope.decay);
  });

  it("pasa el tiempo `cuando` al sinte correspondiente", () => {
    const bateria = crearBateria();
    bateria.disparar("kick", 1.5);

    const kick = instancias.MembraneSynth[0] as {
      triggerAttackRelease: ReturnType<typeof vi.fn>;
    };
    expect(kick.triggerAttackRelease).toHaveBeenCalledWith("C1", "8n", 1.5);
  });

  it("disparar con un sonido desconocido no rompe la batería (lanza Error controlado)", () => {
    const bateria = crearBateria();

    expect(() =>
      bateria.disparar("desconocido" as unknown as Parameters<typeof bateria.disparar>[0])
    ).toThrow();
  });

  it("destruir() llama dispose() en todos los sintetizadores creados", () => {
    const bateria = crearBateria();
    bateria.destruir();

    const todos = [
      ...instancias.MembraneSynth,
      ...instancias.NoiseSynth,
      ...instancias.MetalSynth,
    ] as Array<{ dispose: ReturnType<typeof vi.fn> }>;

    expect(todos).toHaveLength(4);
    for (const sinte of todos) {
      expect(sinte.dispose).toHaveBeenCalledTimes(1);
    }
  });
});

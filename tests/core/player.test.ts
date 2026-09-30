import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Bateria } from "../../src/core/types";

type CallbackSecuencia = (tiempo: number, paso: number) => void;

class SecuenciaFalsa {
  static ultima: SecuenciaFalsa | undefined;
  callback: CallbackSecuencia;
  eventos: number[];
  subdivision: string;
  start = vi.fn().mockReturnThis();
  stop = vi.fn().mockReturnThis();
  dispose = vi.fn();

  constructor(callback: CallbackSecuencia, eventos: number[], subdivision: string) {
    this.callback = callback;
    this.eventos = eventos;
    this.subdivision = subdivision;
    SecuenciaFalsa.ultima = this;
  }
}

const transportFalso = {
  bpm: { value: 120 },
  start: vi.fn(),
  stop: vi.fn(),
};

const toneStart = vi.fn(() => Promise.resolve());

vi.mock("tone", () => ({
  getTransport: () => transportFalso,
  start: () => toneStart(),
  Sequence: SecuenciaFalsa,
}));

function crearBateriaFalsa(): Bateria {
  return {
    disparar: vi.fn(),
    destruir: vi.fn(),
  };
}

describe("crearReproductor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    SecuenciaFalsa.ultima = undefined;
  });

  it("lanza Error si el tempo inicial está fuera de rango", async () => {
    const { crearReproductor } = await import("../../src/core/player");
    expect(() => crearReproductor(crearBateriaFalsa(), 59)).toThrow(Error);
  });

  it("usa 120 como tempo por defecto", async () => {
    const { crearReproductor } = await import("../../src/core/player");
    const reproductor = crearReproductor(crearBateriaFalsa(), 120);
    expect(reproductor.getTempo()).toBe(120);
  });

  it("setTempo valida el rango y actualiza getTempo", async () => {
    const { crearReproductor } = await import("../../src/core/player");
    const reproductor = crearReproductor(crearBateriaFalsa(), 120);

    expect(() => reproductor.setTempo(181)).toThrow(Error);

    reproductor.setTempo(90);
    expect(reproductor.getTempo()).toBe(90);
  });

  it("pausar deja sonando en false y pasoActual en -1", async () => {
    const { crearReproductor } = await import("../../src/core/player");
    const reproductor = crearReproductor(crearBateriaFalsa(), 120);

    await reproductor.iniciar();
    reproductor.pausar();

    expect(reproductor.sonando).toBe(false);
    expect(reproductor.pasoActual).toBe(-1);
  });

  it("al avanzar al paso 0 con un kick activo dispara el sonido correspondiente", async () => {
    const { crearReproductor } = await import("../../src/core/player");
    const bateria = crearBateriaFalsa();
    const reproductor = crearReproductor(bateria, 120);

    const cuadricula = { kick: [true, ...Array(15).fill(false)] };
    reproductor.cargar(cuadricula);

    const secuencia = SecuenciaFalsa.ultima;
    expect(secuencia).toBeDefined();
    secuencia!.callback(1.5, 0);

    expect(bateria.disparar).toHaveBeenCalledWith("kick", 1.5);
    expect(reproductor.pasoActual).toBe(0);
  });

  it("notifica a los suscritos de alPaso en cada avance", async () => {
    const { crearReproductor } = await import("../../src/core/player");
    const reproductor = crearReproductor(crearBateriaFalsa(), 120);
    reproductor.cargar({ kick: Array(16).fill(false) });

    const recibidos: number[] = [];
    const desuscribir = reproductor.alPaso((paso) => recibidos.push(paso));

    const secuencia = SecuenciaFalsa.ultima!;
    secuencia.callback(0, 3);
    desuscribir();
    secuencia.callback(0.5, 4);

    expect(recibidos).toEqual([3]);
  });
});

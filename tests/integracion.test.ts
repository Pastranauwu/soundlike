/**
 * Prueba de integración punta a punta: aceptación global del pedido.
 * Cubre teoría, secuenciador, reproductor, romper beats, el flujo de una
 * ronda del juego y el montaje de la app completa (menú y pantalla de juego).
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

vi.mock("tone", () => {
  class SinteFalso {
    connect = vi.fn().mockReturnThis();
    triggerAttackRelease = vi.fn();
    dispose = vi.fn();
  }

  class SecuenciaFalsa {
    callback: any;
    eventos: number[];
    subdivision: string;
    start = vi.fn().mockReturnThis();
    stop = vi.fn().mockReturnThis();
    dispose = vi.fn();

    constructor(callback: any, eventos: number[], subdivision: string) {
      this.callback = callback;
      this.eventos = eventos;
      this.subdivision = subdivision;
    }
  }

  const transportFalso = {
    bpm: { value: 120 },
    start: vi.fn(),
    stop: vi.fn(),
  };

  const destinoFalso = {};

  return {
    getTransport: () => transportFalso,
    getDestination: () => destinoFalso,
    start: vi.fn(() => Promise.resolve()),
    MembraneSynth: class extends SinteFalso {},
    NoiseSynth: class extends SinteFalso {},
    MetalSynth: class extends SinteFalso {},
    Sequence: SecuenciaFalsa,
  };
});

import { noteToFreq, escalaMayor, acordeMenor } from "../src/core/theory";
import { celdasDistintas, validarTempo } from "../src/core/sequencer";
import { crearReproductor } from "../src/core/player";
import type { Bateria, Cuadricula, Reproductor } from "../src/core/types";
import { breakBeat } from "../src/games/arregla-el-beat/breakBeat";
import { comprobar, crearJuego, iniciarRonda } from "../src/games/arregla-el-beat/juego";
import type { Beat } from "../src/games/arregla-el-beat/types";
import { iniciarApp } from "../src/main";
import { crearPantallaJuego } from "../src/games/arregla-el-beat/screen";

function filaCon(pasos: number[]): boolean[] {
  return Array.from({ length: 16 }, (_, paso) => pasos.includes(paso));
}

const BEAT: Beat = {
  id: "prueba",
  nombre: "Beat de prueba",
  genero: "hip-hop",
  tempo: 100,
  cuadricula: {
    kick: filaCon([0, 8]),
    clap: filaCon([4, 12]),
    "closed-hat": filaCon([0, 2, 4, 6, 8, 10, 12, 14]),
    "open-hat": filaCon([14]),
  },
};

function crearBateriaFalsa(): Bateria {
  return { disparar: vi.fn(), destruir: vi.fn() };
}

function crearReproductorFake() {
  const suscriptores: Array<(paso: number) => void> = [];
  const fake = {
    sonando: false,
    pasoActual: -1,
    iniciar: vi.fn(async () => {
      fake.sonando = true;
    }),
    pausar: vi.fn(() => {
      fake.sonando = false;
    }),
    setTempo: vi.fn(),
    getTempo: vi.fn(() => 120),
    cargar: vi.fn<(cuadricula: Cuadricula) => void>(),
    alPaso: vi.fn((callback: (paso: number) => void) => {
      suscriptores.push(callback);
      return () => suscriptores.splice(suscriptores.indexOf(callback), 1);
    }),
    destruir: vi.fn(),
    emitirPaso(paso: number) {
      suscriptores.forEach((callback) => callback(paso));
    },
  };
  return fake satisfies Reproductor;
}

describe("teoría musical", () => {
  it("noteToFreq convierte notas a Hz con A4 = 440", () => {
    expect(noteToFreq("A4")).toBe(440);
    expect(noteToFreq("C4")).toBeCloseTo(261.63, 2);
  });

  it("escalaMayor de C y acordeMenor de A", () => {
    expect(escalaMayor("C")).toEqual(["C", "D", "E", "F", "G", "A", "B"]);
    expect(acordeMenor("A")).toEqual(["A", "C", "E"]);
  });
});

describe("tempo", () => {
  it("validarTempo rechaza bpm fuera de rango", () => {
    expect(() => validarTempo(59)).toThrow();
  });

  it("el reproductor rechaza setTempo fuera de rango", () => {
    const reproductor = crearReproductor(crearBateriaFalsa());
    expect(() => reproductor.setTempo(200)).toThrow();
  });
});

describe("breakBeat", () => {
  it("es determinista por semilla y produce exactamente nErrores celdas distintas", () => {
    const rotoA = breakBeat(BEAT, 3, 42);
    const rotoB = breakBeat(BEAT, 3, 42);
    expect(rotoB).toEqual(rotoA);
    expect(celdasDistintas(BEAT.cuadricula, rotoA.cuadricula)).toHaveLength(3);
  });
});

describe("juego - flujo de una ronda", () => {
  it("corregir la cuadrícula hasta igualar el original cuenta como acierto y la racha pasa a 1", () => {
    let estado = crearJuego();
    estado = iniciarRonda(estado, BEAT, 1);

    estado = comprobar(estado, estado.beatRoto!.cuadricula);
    expect(estado.rondaResuelta).toBe(false);
    expect(estado.puntaje.racha).toBe(0);

    estado = comprobar(estado, BEAT.cuadricula);

    expect(estado.rondaResuelta).toBe(true);
    expect(estado.puntaje.racha).toBe(1);
  });
});

describe("iniciarApp", () => {
  let root: HTMLElement;
  let currentHash = "";
  let destroyRouter: (() => void) | null = null;

  beforeEach(() => {
    currentHash = "";
    root = document.createElement("div");
    root.id = "app";

    const originalLocation = window.location;
    const locationProxy = new Proxy(originalLocation, {
      get(target, prop) {
        if (prop === "hash") return currentHash;
        return (target as any)[prop];
      },
      set(target, prop, value) {
        if (prop === "hash") {
          currentHash = value;
          return true;
        }
        return Reflect.set(target, prop, value);
      },
    });

    Object.defineProperty(window, "location", {
      configurable: true,
      value: locationProxy,
    });
  });

  afterEach(() => {
    currentHash = "";
    if (destroyRouter) {
      destroyRouter();
      destroyRouter = null;
    }
  });

  it("'#/' muestra el menú con 'Arregla el beat' y 3 'Próximamente'", () => {
    currentHash = "#/";
    destroyRouter = (iniciarApp as any)(root) || (() => {});

    const activa = root.querySelector('a[href="#/arregla-el-beat"]');
    expect(activa?.textContent).toContain("Arregla el beat");

    const proximas = root.querySelectorAll(".tarjeta--proximamente");
    expect(proximas).toHaveLength(3);
    proximas.forEach((tarjeta) => expect(tarjeta.textContent).toContain("Próximamente"));
  });

  it("'#/arregla-el-beat' muestra 4 filas x 16 celdas", () => {
    currentHash = "#/arregla-el-beat";
    destroyRouter = (iniciarApp as any)(root) || (() => {});

    const filas = root.querySelectorAll(".cuadricula__fila");
    expect(filas).toHaveLength(4);
    filas.forEach((fila) => {
      expect(fila.querySelectorAll(".cuadricula__celda")).toHaveLength(16);
    });
  });
});

describe("pantalla del juego - corregir y comprobar", () => {
  it("alternar las celdas distintas y comprobar muestra feedback y 'Racha 1'", () => {
    const reproductor = crearReproductorFake();
    const pantalla = crearPantallaJuego({ reproductor, beats: [BEAT], semillaInicial: 1 });
    const elemento = pantalla.elemento;
    const buscar = <T extends HTMLElement>(selector: string) => elemento.querySelector<T>(selector)!;

    const beatRoto = breakBeat(BEAT, 1, 1).cuadricula;
    const diferencias = celdasDistintas(BEAT.cuadricula, beatRoto);

    for (const { pista, paso } of diferencias) {
      elemento
        .querySelector<HTMLButtonElement>(
          `.cuadricula__fila[data-pista="${pista}"] .cuadricula__celda[data-paso="${paso}"]`,
        )!
        .click();
    }

    buscar(".juego__comprobar").click();

    expect(buscar(".juego__resultado-titulo").textContent).toBe("¡Correcto!");
    expect(buscar(".juego__resultado-resumen").textContent).not.toBe("");
    expect(buscar(".juego__marcador").textContent).toContain("Racha 1");
  });
});

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
    MetalSynth: class extends SinteFalso {
      constructor() {
        super();
      }
    },
    Sequence: SecuenciaFalsa,
  };
});

import { iniciarApp } from "../src/main";

describe("iniciarApp", () => {
  let root: HTMLElement;
  let currentHash = "";
  let destroyRouter: (() => void) | null = null;

  beforeEach(() => {
    currentHash = "";
    root = document.createElement("div");
    root.id = "app";

    // Proxy para interceptar window.location.hash
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

  it("muestra el menú en la ruta #/", () => {
    currentHash = "#/";
    destroyRouter = (iniciarApp as any)(root) || (() => {});

    const h1 = root.querySelector("h1");
    expect(h1).not.toBeNull();
    expect(h1?.textContent).toBe("Soundlike");
  });

  it("muestra el juego con 4 pistas x 16 celdas en #/arregla-el-beat", () => {
    currentHash = "#/arregla-el-beat";
    destroyRouter = (iniciarApp as any)(root) || (() => {});

    const juego = root.querySelector(".juego");
    expect(juego).not.toBeNull();

    // Verificar que hay 4 filas (pistas)
    const filas = root.querySelectorAll(".cuadricula__fila");
    expect(filas.length).toBe(4);

    // Verificar que cada fila tiene 16 celdas
    filas.forEach((fila) => {
      const celdas = fila.querySelectorAll(".cuadricula__celda");
      expect(celdas.length).toBe(16);
    });
  });

  it("redirige a #/ cuando el hash es desconocido", () => {
    currentHash = "#/cualquier-cosa";
    destroyRouter = (iniciarApp as any)(root) || (() => {});

    // Debe mostrar el menú
    const h1 = root.querySelector("h1");
    expect(h1?.textContent).toBe("Soundlike");

    // El hash debe haber sido corregido a "#/"
    expect(window.location.hash).toBe("#/");
  });
});

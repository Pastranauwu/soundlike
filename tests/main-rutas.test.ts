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

describe("iniciarApp rutas nuevas", () => {
  let root: HTMLElement;
  let currentHash = "";
  let destroyRouter: (() => void) | null = null;

  beforeEach(() => {
    currentHash = "";
    root = document.createElement("div");
    root.id = "app";
    localStorage.clear();

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
    localStorage.clear();
    if (destroyRouter) {
      destroyRouter();
      destroyRouter = null;
    }
  });

  it("muestra h1 'Tutoriales' y un botón 'Ver tutorial' en #/tutoriales", () => {
    currentHash = "#/tutoriales";
    destroyRouter = (iniciarApp as any)(root) || (() => {});

    const h1 = root.querySelector("h1");
    expect(h1).not.toBeNull();
    expect(h1?.textContent).toBe("Tutoriales");

    const botonVer = root.querySelector(".tutoriales__ver");
    expect(botonVer).not.toBeNull();
    expect(botonVer?.textContent).toContain("Ver tutorial");
  });

  it("muestra h1 'Acerca de Soundlike' en #/acerca-de", () => {
    currentHash = "#/acerca-de";
    destroyRouter = (iniciarApp as any)(root) || (() => {});

    const h1 = root.querySelector("h1");
    expect(h1).not.toBeNull();
    expect(h1?.textContent).toBe("Acerca de Soundlike");
  });

  it("muestra el diálogo del tutorial en #/arregla-el-beat con localStorage vacío", () => {
    currentHash = "#/arregla-el-beat";
    localStorage.clear();
    destroyRouter = (iniciarApp as any)(root) || (() => {});

    const dialogo = root.querySelector('[role="dialog"]');
    expect(dialogo).not.toBeNull();
  });

  it("navega a #/tutoriales al hacer clic en 'Tutoriales' del menú", async () => {
    currentHash = "#/";
    destroyRouter = (iniciarApp as any)(root) || (() => {});

    const botonTutoriales = Array.from(root.querySelectorAll("button")).find(
      (btn) => btn.textContent === "Tutoriales"
    );
    expect(botonTutoriales).not.toBeNull();

    botonTutoriales?.click();

    // Simular hashchange
    currentHash = "#/tutoriales";
    const event = new HashChangeEvent("hashchange", {
      oldURL: "http://localhost/#/",
      newURL: "http://localhost/#/tutoriales",
    });
    window.dispatchEvent(event);

    // Pequeña espera para que el router procese
    await new Promise((resolve) => setTimeout(resolve, 50));

    const h1 = root.querySelector("h1");
    expect(h1?.textContent).toBe("Tutoriales");
  });

  it("redirige a #/ cuando el hash es desconocido", () => {
    currentHash = "#/no-existe";
    destroyRouter = (iniciarApp as any)(root) || (() => {});

    // Debe mostrar el menú
    const h1 = root.querySelector("h1");
    expect(h1?.textContent).toBe("Soundlike");

    // El hash debe haber sido corregido a "#/"
    expect(window.location.hash).toBe("#/");
  });
});

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

describe("iniciarApp con tutoriales didácticos", () => {
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

  it("hash '#/tutoriales': 3 títulos h2 en orden 'Arregla el beat', 'Teoría del beat', 'Escalas y acordes'", () => {
    currentHash = "#/tutoriales";
    destroyRouter = (iniciarApp as any)(root) || (() => {});

    const h2s = Array.from(root.querySelectorAll("h2")).map((el) => el.textContent);
    expect(h2s).toEqual(["Arregla el beat", "Teoría del beat", "Escalas y acordes"]);
  });

  it("hash '#/tutoriales': hay 3 botones 'Ver tutorial'", () => {
    currentHash = "#/tutoriales";
    destroyRouter = (iniciarApp as any)(root) || (() => {});

    const botonesVer = Array.from(root.querySelectorAll(".tutoriales__ver"));
    expect(botonesVer.length).toBe(3);
  });

  it("hash '#/tutoriales': exactamente 2 enlaces 'Jugar' (ambos a '#/arregla-el-beat')", () => {
    currentHash = "#/tutoriales";
    destroyRouter = (iniciarApp as any)(root) || (() => {});

    const enlacesJugar = Array.from(root.querySelectorAll(".tutoriales__jugar"));
    expect(enlacesJugar.length).toBe(2);

    const todosVanAlBeat = enlacesJugar.every(
      (el) => (el as HTMLAnchorElement).href.endsWith("#/arregla-el-beat")
    );
    expect(todosVanAlBeat).toBe(true);
  });

  it("clic en 'Ver tutorial' de 'Escalas y acordes': [role='dialog'] contiene 'C D E F G A B'", () => {
    currentHash = "#/tutoriales";
    destroyRouter = (iniciarApp as any)(root) || (() => {});

    const items = Array.from(root.querySelectorAll(".tutoriales__item"));
    const itemEscalas = items.find((item) => {
      const h2 = item.querySelector("h2");
      return h2?.textContent === "Escalas y acordes";
    });

    const botonVerEscalas = itemEscalas?.querySelector<HTMLButtonElement>(
      ".tutoriales__ver"
    );
    expect(botonVerEscalas).toBeTruthy();

    botonVerEscalas?.click();

    const dialogo = root.querySelector('[role="dialog"]');
    expect(dialogo).toBeTruthy();
    expect(dialogo?.textContent).toContain("C D E F G A B");
  });

  it("clic en 'Ver tutorial' de 'Teoría del beat': [role='dialog'] contiene 'Pulso, compás y pasos'", () => {
    currentHash = "#/tutoriales";
    destroyRouter = (iniciarApp as any)(root) || (() => {});

    const items = Array.from(root.querySelectorAll(".tutoriales__item"));
    const itemTeoria = items.find((item) => {
      const h2 = item.querySelector("h2");
      return h2?.textContent === "Teoría del beat";
    });

    const botonVerTeoria = itemTeoria?.querySelector<HTMLButtonElement>(
      ".tutoriales__ver"
    );
    expect(botonVerTeoria).toBeTruthy();

    botonVerTeoria?.click();

    const dialogo = root.querySelector('[role="dialog"]');
    expect(dialogo).toBeTruthy();
    expect(dialogo?.textContent).toContain("Pulso, compás y pasos");
  });

  it("hash '#/': menú con h1 'Soundlike'", () => {
    currentHash = "#/";
    destroyRouter = (iniciarApp as any)(root) || (() => {});

    const h1 = root.querySelector("h1");
    expect(h1?.textContent).toBe("Soundlike");
  });
});

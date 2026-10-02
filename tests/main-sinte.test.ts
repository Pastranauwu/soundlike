/**
 * Pruebas del cableado de main.ts para "Explora el sinte": la ruta
 * "#/explora-el-sinte" monta la pantalla sin crear ni hacer sonar el sinte al
 * montar, el tutorial del sinte aparece el último en "#/tutoriales" y el resto
 * de rutas (el juego del beat, el menú ante un hash desconocido) no cambian.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

const { osciladorTone, startTone } = vi.hoisted(() => ({
  osciladorTone: vi.fn(),
  startTone: vi.fn(() => Promise.resolve()),
}));

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

  const transportFalso = { bpm: { value: 120 }, start: vi.fn(), stop: vi.fn() };
  const destinoFalso = {};

  return {
    getTransport: () => transportFalso,
    getDestination: () => destinoFalso,
    start: startTone,
    Oscillator: osciladorTone,
    MembraneSynth: class extends SinteFalso {},
    NoiseSynth: class extends SinteFalso {},
    MetalSynth: class extends SinteFalso {},
    Sequence: SecuenciaFalsa,
  };
});

import { iniciarApp } from "../src/main";

describe("iniciarApp con la ruta del sinte", () => {
  let root: HTMLElement;
  let currentHash = "";

  function montarApp(hash: string): void {
    currentHash = hash;
    iniciarApp(root);
  }

  function itemTutorial(nombre: string): Element {
    const item = Array.from(root.querySelectorAll(".tutoriales__item")).find(
      (candidato) => candidato.querySelector("h2")?.textContent === nombre,
    );
    if (!item) throw new Error(`No está el tutorial "${nombre}"`);
    return item;
  }

  beforeEach(() => {
    currentHash = "";
    root = document.createElement("div");
    root.id = "app";
    localStorage.clear();
    document.body.replaceChildren(root);

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
    document.body.replaceChildren();
  });

  it("'#/explora-el-sinte' monta la lección 1 sin crear ni arrancar el sinte", () => {
    montarApp("#/explora-el-sinte");

    expect(root.querySelector("h1")?.textContent).toBe("Explora el sinte");
    expect(root.textContent).toContain("Lección 1 de 6");
    expect(startTone).not.toHaveBeenCalled();
    expect(osciladorTone).not.toHaveBeenCalled();
    expect(globalThis.oscMock).toBeUndefined();
  });

  it("'#/tutoriales' lista los 4 tutoriales y el del sinte enlaza a '#/explora-el-sinte'", () => {
    montarApp("#/tutoriales");

    const titulos = Array.from(root.querySelectorAll("h2")).map((el) => el.textContent);
    expect(titulos).toEqual([
      "Arregla el beat",
      "Teoría del beat",
      "Escalas y acordes",
      "Explora el sinte",
    ]);

    const jugar = itemTutorial("Explora el sinte").querySelector<HTMLAnchorElement>(
      ".tutoriales__jugar",
    );
    expect(jugar?.textContent).toBe("Jugar");
    expect(jugar?.getAttribute("href")).toBe("#/explora-el-sinte");
  });

  it("'Ver tutorial' de 'Explora el sinte' abre un diálogo con 'El pad'", () => {
    montarApp("#/tutoriales");

    const boton = itemTutorial("Explora el sinte").querySelector<HTMLButtonElement>(
      ".tutoriales__ver",
    );
    expect(boton).toBeTruthy();
    boton?.click();

    const dialogo = root.querySelector('[role="dialog"]');
    expect(dialogo).toBeTruthy();
    expect(dialogo?.textContent).toContain("El pad");
  });

  it("'#/arregla-el-beat' sigue mostrando 4 pistas x 16 celdas", () => {
    montarApp("#/arregla-el-beat");

    expect(root.querySelector(".juego")).not.toBeNull();
    const filas = root.querySelectorAll(".cuadricula__fila");
    expect(filas).toHaveLength(4);
    filas.forEach((fila) => expect(fila.querySelectorAll(".cuadricula__celda")).toHaveLength(16));
  });

  it("'#/no-existe' muestra el menú y deja el hash en '#/'", () => {
    montarApp("#/no-existe");

    expect(root.querySelector("h1")?.textContent).toBe("Soundlike");
    expect(window.location.hash).toBe("#/");
  });
});

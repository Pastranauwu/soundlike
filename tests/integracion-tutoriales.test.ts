/**
 * Prueba de integración punta a punta de la aceptación global: teoría,
 * secuenciador, romper beats, una ronda del juego y el flujo completo de la
 * app (tutoriales, accesibilidad y los botones nuevos del menú y del juego).
 * No reemplaza tests/integracion.test.ts, que sigue como regresión.
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
import { breakBeat } from "../src/games/arregla-el-beat/breakBeat";
import { comprobar, crearJuego, iniciarRonda } from "../src/games/arregla-el-beat/juego";
import type { Beat } from "../src/games/arregla-el-beat/types";
import { iniciarApp } from "../src/main";

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
    expect(() => validarTempo(181)).toThrow();
  });
});

describe("breakBeat", () => {
  it("es determinista por semilla", () => {
    const rotoA = breakBeat(BEAT, 3, 42);
    const rotoB = breakBeat(BEAT, 3, 42);
    expect(rotoB).toEqual(rotoA);
  });

  it.each([1, 2, 3])("produce exactamente %i celda(s) distinta(s)", (nErrores) => {
    const roto = breakBeat(BEAT, nErrores, 42);
    expect(celdasDistintas(BEAT.cuadricula, roto.cuadricula)).toHaveLength(nErrores);
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

describe("flujo de la app", () => {
  let root: HTMLElement;
  let currentHash = "";
  let destroyRouter: (() => void) | null = null;

  beforeEach(() => {
    currentHash = "";
    localStorage.clear();
    document.body.innerHTML = "";
    root = document.createElement("div");
    root.id = "app";
    document.body.appendChild(root);

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
    document.body.innerHTML = "";
    if (destroyRouter) {
      destroyRouter();
      destroyRouter = null;
    }
  });

  function irA(hash: string): void {
    currentHash = hash;
    window.dispatchEvent(
      new HashChangeEvent("hashchange", {
        oldURL: "http://localhost/",
        newURL: `http://localhost/${hash}`,
      }),
    );
  }

  function montarApp(hash: string): void {
    currentHash = hash;
    destroyRouter = (iniciarApp as any)(root) || (() => {});
  }

  function botonConTexto(contenedor: ParentNode, texto: string): HTMLButtonElement {
    const boton = Array.from(contenedor.querySelectorAll("button")).find(
      (candidato) => candidato.textContent === texto,
    );
    if (boton === undefined) throw new Error(`No hay botón "${texto}"`);
    return boton;
  }

  it("'#/' muestra el menú con Tutoriales, Acerca de y la tarjeta con 'Cómo se gana:'", () => {
    montarApp("#/");

    const h1 = root.querySelector("h1");
    expect(h1?.textContent).toBe("Soundlike");
    expect(botonConTexto(root, "Tutoriales")).not.toBeUndefined();
    expect(botonConTexto(root, "Acerca de")).not.toBeUndefined();

    const tarjetaActiva = root.querySelector('a[href="#/arregla-el-beat"]');
    expect(tarjetaActiva?.textContent).toContain("Cómo se gana:");
  });

  it("clic en 'Tutoriales' navega y 'Ver tutorial' abre el diálogo; Escape lo cierra", () => {
    montarApp("#/");

    botonConTexto(root, "Tutoriales").click();
    irA("#/tutoriales");

    expect(root.querySelector("h1")?.textContent).toBe("Tutoriales");

    botonConTexto(root, "Ver tutorial").click();
    const dialogo = root.querySelector('[role="dialog"]');
    expect(dialogo).not.toBeNull();

    dialogo!.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(root.querySelector('[role="dialog"]')).toBeNull();
  });

  it("'#/acerca-de' muestra el h1 'Acerca de Soundlike'", () => {
    montarApp("#/acerca-de");
    expect(root.querySelector("h1")?.textContent).toBe("Acerca de Soundlike");
  });

  it("'#/arregla-el-beat' con localStorage vacío abre el tutorial, saltarlo enfoca Escuchar y no vuelve a abrirse", () => {
    montarApp("#/arregla-el-beat");

    const dialogo = root.querySelector('[role="dialog"]');
    expect(dialogo).not.toBeNull();
    expect(dialogo!.querySelector(".tutorial__progreso")?.textContent).toBe("Pantalla 1 de 2");

    botonConTexto(dialogo!, "Saltar tutorial").click();
    expect(root.querySelector('[role="dialog"]')).toBeNull();
    expect(document.activeElement).toBe(root.querySelector(".juego__play"));

    irA("#/");
    irA("#/arregla-el-beat");
    expect(root.querySelector('[role="dialog"]')).toBeNull();
  });

  describe("cuadrícula del juego", () => {
    beforeEach(() => {
      montarApp("#/arregla-el-beat");
      botonConTexto(root, "Saltar tutorial").click();
    });

    function celda(pista: string, paso: number): HTMLButtonElement {
      return root.querySelector<HTMLButtonElement>(
        `.cuadricula__fila[data-pista="${pista}"] .cuadricula__celda[data-paso="${paso}"]`,
      )!;
    }

    it("muestra 4 pistas x 16 celdas y el objetivo", () => {
      const filas = root.querySelectorAll(".cuadricula__fila");
      expect(filas).toHaveLength(4);
      filas.forEach((fila) => expect(fila.querySelectorAll(".cuadricula__celda")).toHaveLength(16));
      expect(root.querySelector(".juego__objetivo")?.textContent).toContain("Objetivo:");
    });

    it("ArrowRight mueve el foco a la celda siguiente y un clic cambia aria-pressed", () => {
      const primera = celda("kick", 0);
      const segunda = celda("kick", 1);
      primera.focus();
      primera.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
      expect(document.activeElement).toBe(segunda);

      const estabaPulsada = segunda.getAttribute("aria-pressed");
      segunda.click();
      expect(segunda.getAttribute("aria-pressed")).not.toBe(estabaPulsada);
    });

    it("editar y 'Reiniciar' devuelve la cuadrícula al estado inicial de la ronda", () => {
      const estadoInicial = Array.from(root.querySelectorAll(".cuadricula__celda")).map((c) =>
        c.getAttribute("aria-pressed"),
      );

      celda("kick", 3).click();
      celda("clap", 7).click();
      expect(
        Array.from(root.querySelectorAll(".cuadricula__celda")).map((c) => c.getAttribute("aria-pressed")),
      ).not.toEqual(estadoInicial);

      botonConTexto(root, "Reiniciar").click();

      expect(
        Array.from(root.querySelectorAll(".cuadricula__celda")).map((c) => c.getAttribute("aria-pressed")),
      ).toEqual(estadoInicial);
    });

    it("'Escuchar el correcto' está visible y disabled al inicio, y se habilita tras 3 fallos", () => {
      const ayuda = root.querySelector<HTMLButtonElement>(".juego__ayuda")!;
      expect(ayuda.hidden).toBe(false);
      expect(ayuda.disabled).toBe(true);

      for (let intento = 0; intento < 3; intento++) {
        botonConTexto(root, "Comprobar").click();
      }

      expect(ayuda.disabled).toBe(false);
    });

    it("corregir todas las celdas y 'Comprobar' muestra 'Racha 1' en el marcador", () => {
      // Falla 3 veces para desbloquear la ayuda y así ver qué celdas corregir.
      for (let intento = 0; intento < 3; intento++) {
        botonConTexto(root, "Comprobar").click();
      }
      botonConTexto(root, "Escuchar el correcto").click();

      const celdasAMarcar = Array.from(
        root.querySelectorAll<HTMLButtonElement>(".cuadricula__celda--error"),
      );
      for (const boton of celdasAMarcar) {
        boton.click();
      }

      botonConTexto(root, "Comprobar").click();

      expect(root.querySelector(".juego__marcador")?.textContent).toContain("Racha 1");
    });
  });
});

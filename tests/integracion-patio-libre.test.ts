/**
 * Prueba de integración punta a punta del patio libre de "Explora el sinte":
 * estilos musicales con color por estilo, presets que sobreviven a una recarga
 * (localStorage real de jsdom) y la regresión de "Arregla el beat". Recorre la
 * app con el router (iniciarApp) y también la pantalla aislada con fábrica de
 * sinte espía, registro de tutoriales y progreso en memoria. No reemplaza las
 * pruebas unitarias de tests/games/explora-el-sinte, tests/core/synthStyles ni
 * tests/ui/pad-estilo, que siguen como regresión.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import type { Mock } from "vitest";

const { startTone, envTone } = vi.hoisted(() => ({
  startTone: vi.fn(() => Promise.resolve()),
  envTone: vi.fn(),
}));

vi.mock("tone", () => {
  class SinteFalso {
    connect = vi.fn().mockReturnThis();
    triggerAttackRelease = vi.fn();
    dispose = vi.fn();
    triggerAttack = envTone;
    triggerRelease = vi.fn();
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
    start: startTone,
    MembraneSynth: class extends SinteFalso {},
    NoiseSynth: class extends SinteFalso {},
    MetalSynth: class extends SinteFalso {},
    Sequence: SecuenciaFalsa,
  };
});

import type { Sinte } from "../src/core/synthTypes";
import { obtenerEstilos } from "../src/core/synthStyles";
import type { EstiloMusical } from "../src/core/synthStyles";
import { AVISO_AUDIO, crearPantallaSinte } from "../src/games/explora-el-sinte/screen";
import type { PantallaSinte } from "../src/games/explora-el-sinte/screen";
import { obtenerLecciones } from "../src/games/explora-el-sinte/lecciones";
import {
  CLAVE_PRESETS_PATIO,
  crearPresets,
} from "../src/games/explora-el-sinte/presets";
import type {
  PresetPatio,
  PresetsPatio,
  ProgresoLecciones,
} from "../src/games/explora-el-sinte/types";
import type { RegistroTutoriales } from "../src/ui/types";
import { iniciarApp } from "../src/main";

interface SinteEspia extends Sinte {
  ajustar: Mock<() => void>;
  iniciarNota: Mock<() => void>;
  soltarNota: Mock<() => void>;
  destruir: Mock<() => void>;
}

function estiloBuscado(id: string): EstiloMusical {
  const encontrado = obtenerEstilos().find((estilo) => estilo.id === id);
  if (encontrado === undefined) throw new Error(`No existe el estilo ${id}`);
  return encontrado;
}

function crearRegistroVisto(): RegistroTutoriales {
  const vistos = new Set(["explora-el-sinte"]);
  return {
    visto: (id) => vistos.has(id),
    marcarVisto: (id) => void vistos.add(id),
  };
}

function crearProgresoEnMemoria(): ProgresoLecciones {
  const resueltas = new Set<string>();
  return {
    resueltas: () => [...resueltas],
    marcarResuelta: (id) => void resueltas.add(id),
  };
}

function copiarPreset(preset: PresetPatio): PresetPatio {
  return { ...preset, ejes: { ...preset.ejes }, posicion: { ...preset.posicion } };
}

function crearPresetsEnMemoria(): PresetsPatio {
  const lista = new Map<string, PresetPatio>();
  return {
    listar: () => [...lista.values()].map(copiarPreset),
    guardar: (preset) => {
      const copia = copiarPreset(preset);
      lista.delete(copia.nombre);
      lista.set(copia.nombre, copia);
    },
    borrar: (nombre) => void lista.delete(nombre),
  };
}

let pantallas: PantallaSinte[] = [];

interface PantallaEspia {
  sinte: SinteEspia;
  crearSinte: Mock<() => Sinte>;
  elemento: HTMLElement;
  buscar<T extends HTMLElement>(selector: string): T;
}

/** Pantalla aislada (sin router) con fábrica de sinte espía. */
function montarPantallaSinte(presetsReales: boolean): PantallaEspia {
  const sinte: SinteEspia = {
    ajustar: vi.fn(),
    iniciarNota: vi.fn(),
    soltarNota: vi.fn(),
    destruir: vi.fn(),
  };
  const crearSinte = vi.fn((): Sinte => sinte);
  const pantalla = crearPantallaSinte({
    crearSinte,
    registroTutoriales: crearRegistroVisto(),
    progreso: crearProgresoEnMemoria(),
    presets: presetsReales ? crearPresets(localStorage) : crearPresetsEnMemoria(),
  });
  document.body.appendChild(pantalla.elemento);
  pantallas.push(pantalla);
  const elemento = pantalla.elemento;
  return {
    sinte,
    crearSinte,
    elemento,
    buscar: <T extends HTMLElement>(selector: string) => elemento.querySelector<T>(selector)!,
  };
}

function avanzarAPatioLibre(elemento: HTMLElement): void {
  const siguiente = elemento.querySelector<HTMLButtonElement>(".sinte__siguiente")!;
  for (let i = 0; i < 5; i++) siguiente.click();
}

function prepararArea(elemento: HTMLElement): HTMLElement {
  const area = elemento.querySelector<HTMLElement>(".pad__area")!;
  Object.defineProperty(area, "getBoundingClientRect", {
    configurable: true,
    value: () => ({
      left: 0,
      top: 0,
      width: 200,
      height: 200,
      right: 200,
      bottom: 200,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    }),
  });
  area.focus();
  return area;
}

/** Teclas del pad: cada una mueve el punto 0.05 en su dirección. */
function moverPuntoConTeclado(area: HTMLElement, teclas: string[]): void {
  for (const tecla of teclas) {
    area.dispatchEvent(
      new KeyboardEvent("keydown", { key: tecla, bubbles: true, cancelable: true }),
    );
  }
}

function veces(tecla: string, n: number): string[] {
  return Array.from({ length: n }, () => tecla);
}

function enviarGuardar(elemento: HTMLElement): void {
  elemento
    .querySelector<HTMLFormElement>(".sinte__presets")!
    .dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
}

describe("integración puntual: patio libre con estilos y presets", () => {
  let root: HTMLElement;
  let currentHash = "";
  let destruirRouter: (() => void) | null = null;

  beforeEach(() => {
    currentHash = "";
    localStorage.clear();
    pantallas = [];
    document.body.replaceChildren();
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
    pantallas.forEach((pantalla) => pantalla.destruir());
    pantallas = [];
    if (destruirRouter) {
      destruirRouter();
      destruirRouter = null;
    }
    localStorage.clear();
    document.body.replaceChildren();
  });

  function montarApp(hash: string): void {
    currentHash = hash;
    destruirRouter = (iniciarApp as any)(root) || (() => {});
  }

  function navegarA(hash: string): void {
    currentHash = hash;
    window.dispatchEvent(new Event("hashchange"));
  }

  it("del menú hasta '#/explora-el-sinte': se ve el aviso de audio y al montar no suena nada", () => {
    montarApp("#/");

    const tarjeta = root.querySelector<HTMLAnchorElement>('a[href="#/explora-el-sinte"]');
    expect(tarjeta?.textContent).toContain("Explora el sinte");
    tarjeta!.click();
    navegarA("#/explora-el-sinte");

    expect(root.querySelector("h1")?.textContent).toBe("Explora el sinte");
    const aviso = root.querySelector<HTMLElement>(".sinte__aviso")!;
    expect(aviso.textContent).toBe(AVISO_AUDIO);
    expect(aviso.hidden).toBe(false);
    const dobles = globalThis as unknown as { envMock?: unknown };
    expect(dobles.envMock).toBeUndefined();
    expect(startTone).not.toHaveBeenCalled();
    expect(envTone).not.toHaveBeenCalled();
    expect(root.textContent).toContain("Lección 1 de 6");
  });

  it("las 6 lecciones se recorren de principio a fin con 'Siguiente' y de vuelta con 'Anterior'", () => {
    const { elemento, buscar } = montarPantallaSinte(false);
    const titulos = obtenerLecciones().map((leccion) => leccion.titulo);

    for (let i = 0; i < titulos.length; i++) {
      expect(buscar(".sinte__paso").textContent).toBe(`Lección ${i + 1} de 6`);
      expect(buscar(".sinte__titulo").textContent).toBe(titulos[i]);
      if (i < titulos.length - 1) {
        elemento.querySelector<HTMLButtonElement>(".sinte__siguiente")!.click();
      }
    }
    for (let i = titulos.length - 1; i >= 0; i--) {
      expect(buscar(".sinte__paso").textContent).toBe(`Lección ${i + 1} de 6`);
      if (i > 0) {
        elemento.querySelector<HTMLButtonElement>(".sinte__anterior")!.click();
      }
    }
  });

  it("al llegar al patio libre hay 6 botones de estilo con el primero activo y el pad pintado con su color", () => {
    const { elemento, buscar, crearSinte } = montarPantallaSinte(false);
    avanzarAPatioLibre(elemento);
    const noventero = estiloBuscado("noventero");

    expect(buscar(".sinte__libre").hidden).toBe(false);
    const botones = elemento.querySelectorAll<HTMLButtonElement>(".sinte__estilo");
    expect(botones).toHaveLength(6);
    expect(botones[0]!.getAttribute("aria-pressed")).toBe("true");
    botones.forEach((boton, i) => {
      expect(boton.style.getPropertyValue("--estilo-color")).toBe(obtenerEstilos()[i]!.color);
    });
    const pad = elemento.querySelector<HTMLElement>(".pad")!;
    expect(pad.dataset.estilo).toBe(noventero.id);
    expect(pad.style.getPropertyValue("--pad-color")).toBe(noventero.color);
    expect(buscar(".pad__estilo").hidden).toBe(false);
    expect(buscar(".pad__estilo").textContent).toBe(noventero.nombre);
    expect(crearSinte).not.toHaveBeenCalled();
  });

  it("elegir 'rave' lo activa, tiñe el pad con su color y no crea el sinte", () => {
    const { elemento, crearSinte } = montarPantallaSinte(false);
    avanzarAPatioLibre(elemento);
    const rave = elemento.querySelector<HTMLButtonElement>(
      ".sinte__estilo[data-estilo='rave']",
    )!;

    rave.click();

    const botones = [...elemento.querySelectorAll<HTMLButtonElement>(".sinte__estilo")];
    expect(botones.filter((boton) => boton.getAttribute("aria-pressed") === "true")).toEqual([rave]);
    const pad = elemento.querySelector<HTMLElement>(".pad")!;
    expect(pad.dataset.estilo).toBe("rave");
    expect(pad.style.getPropertyValue("--pad-color")).toBe(estiloBuscado("rave").color);
    expect(elemento.querySelector(".pad__estilo")?.textContent).toBe(estiloBuscado("rave").nombre);
    expect(crearSinte).not.toHaveBeenCalled();
  });

  it("al salir del patio libre el pad pierde data-estilo y --pad-color, y vuelve al tema", () => {
    const { elemento, buscar } = montarPantallaSinte(false);
    avanzarAPatioLibre(elemento);
    elemento.querySelector<HTMLButtonElement>(".sinte__estilo[data-estilo='rave']")!.click();
    expect(elemento.querySelector<HTMLElement>(".pad")!.dataset.estilo).toBe("rave");

    elemento.querySelector<HTMLButtonElement>(".sinte__anterior")!.click();

    expect(buscar(".sinte__libre").hidden).toBe(true);
    const pad = elemento.querySelector<HTMLElement>(".pad")!;
    expect(pad.hasAttribute("data-estilo")).toBe(false);
    expect(pad.style.getPropertyValue("--pad-color")).toBe("");
    expect(buscar(".pad__estilo").hidden).toBe(true);
  });

  it("elegir ejes y mover el punto, guardar preset lo escribe en localStorage con la clave del patio y una pantalla nueva con el mismo Storage lo lista", () => {
    const pantalla1 = montarPantallaSinte(true);
    avanzarAPatioLibre(pantalla1.elemento);
    const selectX = pantalla1.buscar<HTMLSelectElement>(".sinte__eje-x");
    selectX.value = "tono";
    selectX.dispatchEvent(new Event("change"));
    const selectY = pantalla1.buscar<HTMLSelectElement>(".sinte__eje-y");
    selectY.value = "ataque";
    selectY.dispatchEvent(new Event("change"));
    const area = prepararArea(pantalla1.elemento);
    moverPuntoConTeclado(area, [...veces("ArrowLeft", 5), ...veces("ArrowUp", 5)]);

    pantalla1.elemento
      .querySelector<HTMLButtonElement>(".sinte__estilo[data-estilo='rave']")!
      .click();
    pantalla1.buscar<HTMLInputElement>(".sinte__preset-nombre").value = "Mi rave";
    enviarGuardar(pantalla1.elemento);

    expect(JSON.parse(localStorage.getItem(CLAVE_PRESETS_PATIO) ?? "null")).toEqual([
      {
        nombre: "Mi rave",
        idEstilo: "rave",
        ejes: { x: "tono", y: "ataque" },
        posicion: { x: 0.25, y: 0.75 },
      },
    ]);
    expect(pantalla1.sinte.iniciarNota).not.toHaveBeenCalled();

    const pantalla2 = montarPantallaSinte(true);
    expect(pantalla2.elemento.querySelectorAll(".sinte__preset")).toHaveLength(1);
    expect(pantalla2.elemento.querySelector(".sinte__preset-titulo")?.textContent).toBe("Mi rave");
    expect(pantalla2.crearSinte).not.toHaveBeenCalled();
  });

  it("'Cargar' restaura estilo, ejes y posición del preset guardado sin crear el sinte", () => {
    const preset: PresetPatio = {
      nombre: "Mi rave",
      idEstilo: "rave",
      ejes: { x: "tono", y: "ataque" },
      posicion: { x: 0.25, y: 0.75 },
    };
    crearPresets(localStorage).guardar(preset);

    const pantalla = montarPantallaSinte(true);
    avanzarAPatioLibre(pantalla.elemento);
    expect(pantalla.buscar<HTMLSelectElement>(".sinte__eje-x").value).toBe("corte");
    expect(pantalla.elemento.querySelector<HTMLElement>(".pad")!.dataset.estilo).toBe("noventero");

    pantalla.elemento.querySelector<HTMLButtonElement>(".sinte__preset-cargar")!.click();

    const rave = estiloBuscado("rave");
    expect(
      pantalla.buscar<HTMLButtonElement>(".sinte__estilo[data-estilo='rave']").getAttribute(
        "aria-pressed",
      ),
    ).toBe("true");
    const pad = pantalla.elemento.querySelector<HTMLElement>(".pad")!;
    expect(pad.dataset.estilo).toBe("rave");
    expect(pad.style.getPropertyValue("--pad-color")).toBe(rave.color);
    expect(pantalla.buscar<HTMLSelectElement>(".sinte__eje-x").value).toBe("tono");
    expect(pantalla.buscar<HTMLSelectElement>(".sinte__eje-y").value).toBe("ataque");
    const punto = pantalla.elemento.querySelector<HTMLElement>(".pad__punto")!;
    expect(punto.style.left).toBe("25%");
    expect(punto.style.bottom).toBe("75%");
    expect(pantalla.buscar(".pad__valor--x").textContent).toContain("Tono:");
    expect(pantalla.buscar(".pad__valor--y").textContent).toContain("Ataque:");
    expect(pantalla.crearSinte).not.toHaveBeenCalled();
  });

  it("'Borrar' elimina el preset de la lista y de localStorage", () => {
    const preset: PresetPatio = {
      nombre: "Mi rave",
      idEstilo: "rave",
      ejes: { x: "tono", y: "ataque" },
      posicion: { x: 0.25, y: 0.75 },
    };
    crearPresets(localStorage).guardar(preset);

    const pantalla = montarPantallaSinte(true);
    avanzarAPatioLibre(pantalla.elemento);
    expect(pantalla.elemento.querySelectorAll(".sinte__preset")).toHaveLength(1);

    pantalla.elemento.querySelector<HTMLButtonElement>(".sinte__preset-borrar")!.click();

    expect(pantalla.elemento.querySelectorAll(".sinte__preset")).toHaveLength(0);
    expect(crearPresets(localStorage).listar()).toHaveLength(0);
    expect(JSON.parse(localStorage.getItem(CLAVE_PRESETS_PATIO) ?? "null")).toEqual([]);
  });

  it("regresión: '#/arregla-el-beat' sigue con 4 pistas x 16 celdas", () => {
    montarApp("#/arregla-el-beat");

    const filas = root.querySelectorAll(".cuadricula__fila");
    expect(filas).toHaveLength(4);
    filas.forEach((fila) => expect(fila.querySelectorAll(".cuadricula__celda")).toHaveLength(16));
  });
});

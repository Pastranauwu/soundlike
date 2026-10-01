/**
 * Prueba de integración punta a punta: escucha a ciegas, resultado de la
 * jugada y tutoriales didácticos. Cubre la aceptación global del flujo nuevo
 * (teoría, tempo, breakBeat/celdasDistintas, menú, tutoriales y la pantalla
 * del juego con escucha a ciegas). No reemplaza las pruebas de integración
 * anteriores (tests/integracion.test.ts, tests/integracion-tutoriales.test.ts),
 * que siguen como regresión.
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
import { obtenerBanco } from "../src/games/arregla-el-beat/bank";
import { erroresPorNivel } from "../src/games/arregla-el-beat/juego";
import { crearPantallaJuego } from "../src/games/arregla-el-beat/screen";
import { obtenerTutorial } from "../src/games/arregla-el-beat/tutorial";
import type { RegistroTutoriales } from "../src/ui/types";
import { iniciarApp } from "../src/main";

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

function crearRegistroEnMemoria(vistosIniciales: string[] = []): RegistroTutoriales {
  const vistos = new Set(vistosIniciales);
  return {
    visto: (id) => vistos.has(id),
    marcarVisto: (id) => void vistos.add(id),
  };
}

describe("aceptación pura", () => {
  it("noteToFreq convierte notas a Hz con A4 = 440 y C4 ≈ 261.63", () => {
    expect(noteToFreq("A4")).toBe(440);
    expect(noteToFreq("C4")).toBeCloseTo(261.63, 2);
  });

  it("escalaMayor de C y acordeMenor de A", () => {
    expect(escalaMayor("C")).toEqual(["C", "D", "E", "F", "G", "A", "B"]);
    expect(acordeMenor("A")).toEqual(["A", "C", "E"]);
  });

  it("validarTempo y reproductor.setTempo rechazan bpm fuera de 60-180", () => {
    expect(() => validarTempo(59)).toThrow();
    expect(() => validarTempo(181)).toThrow();

    const reproductor = crearReproductor(crearBateriaFalsa());
    expect(() => reproductor.setTempo(59)).toThrow();
    expect(() => reproductor.setTempo(181)).toThrow();
  });

  describe("breakBeat y celdasDistintas", () => {
    const beat = obtenerBanco()[0];

    it("breakBeat(beat, 2, 7) es determinista por semilla", () => {
      const rotoA = breakBeat(beat, 2, 7);
      const rotoB = breakBeat(beat, 2, 7);
      expect(rotoB).toEqual(rotoA);
    });

    it.each([1, 2, 3])("produce exactamente %i celda(s) distinta(s) del original", (nErrores) => {
      const roto = breakBeat(beat, nErrores, 7);
      expect(celdasDistintas(beat.cuadricula, roto.cuadricula)).toHaveLength(nErrores);
    });
  });
});

describe("interfaz", () => {
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

  describe("menú y tutoriales", () => {
    it("'#/' muestra el h1 'Soundlike', la tarjeta 'Arregla el beat' con 'backbeat' y el enlace de teoría a '#/tutoriales'", () => {
      montarApp("#/");

      expect(root.querySelector("h1")?.textContent).toBe("Soundlike");

      const tarjetaActiva = root.querySelector('a[href="#/arregla-el-beat"]');
      expect(tarjetaActiva?.textContent).toContain("backbeat");

      const enlaceTeoria = root.querySelector<HTMLAnchorElement>('.menu__teoria a[href="#/tutoriales"]');
      expect(enlaceTeoria).not.toBeNull();
    });

    it("'#/tutoriales' lista 3 tutoriales y 'Escalas y acordes' abre un diálogo saltable con 'A C E'", () => {
      montarApp("#/tutoriales");

      const items = root.querySelectorAll(".tutoriales__item");
      expect(items).toHaveLength(3);

      const itemEscalas = Array.from(items).find((item) => item.querySelector("h2")?.textContent === "Escalas y acordes")!;
      expect(itemEscalas).not.toBeUndefined();

      botonConTexto(itemEscalas, "Ver tutorial").click();
      const dialogo = root.querySelector('[role="dialog"]');
      expect(dialogo).not.toBeNull();

      botonConTexto(dialogo!, "Siguiente").click();
      expect(dialogo!.textContent).toContain("A C E");

      botonConTexto(dialogo!, "Saltar tutorial").click();
      expect(root.querySelector('[role="dialog"]')).toBeNull();
    });
  });

  describe("juego: escucha a ciegas, resultado y teoría del beat", () => {
    const SEMILLA = 7;
    const BEAT_ORIGINAL = obtenerBanco()[0];
    const BEAT_ROTO = breakBeat(BEAT_ORIGINAL, erroresPorNivel(1), SEMILLA);
    const CELDAS_A_CORREGIR = celdasDistintas(BEAT_ORIGINAL.cuadricula, BEAT_ROTO.cuadricula);

    function montarJuego() {
      const reproductor = crearReproductorFake();
      const registro = crearRegistroEnMemoria([obtenerTutorial().id]);
      const pantalla = crearPantallaJuego({ reproductor, semillaInicial: SEMILLA, registroTutoriales: registro });
      document.body.append(pantalla.elemento);
      return { reproductor, registro, pantalla, elemento: pantalla.elemento };
    }

    function celda(elemento: HTMLElement, pista: string, paso: number): HTMLButtonElement {
      return elemento.querySelector<HTMLButtonElement>(
        `.cuadricula__fila[data-pista="${pista}"] .cuadricula__celda[data-paso="${paso}"]`,
      )!;
    }

    it("muestra 4 pistas x 16 celdas", () => {
      const { elemento } = montarJuego();
      const filas = elemento.querySelectorAll(".cuadricula__fila");
      expect(filas).toHaveLength(4);
      filas.forEach((fila) => expect(fila.querySelectorAll(".cuadricula__celda")).toHaveLength(16));
    });

    it("'Escuchar el beat roto' arranca el audio solo tras el clic, oculta la cuadrícula y el paso se ve en el indicador; 'Pausar' la devuelve", () => {
      const { reproductor, elemento } = montarJuego();

      expect(reproductor.iniciar).not.toHaveBeenCalled();

      botonConTexto(elemento, "Escuchar el beat roto").click();
      expect(reproductor.iniciar).toHaveBeenCalledTimes(1);
      expect(elemento.querySelector<HTMLElement>(".cuadricula")!.hidden).toBe(true);

      reproductor.emitirPaso(3);
      expect(elemento.querySelector(".pasos")?.getAttribute("aria-label")).toBe("Paso actual: 4 de 16");

      botonConTexto(elemento, "Pausar").click();
      expect(reproductor.pausar).toHaveBeenCalledTimes(1);
      expect(elemento.querySelector<HTMLElement>(".cuadricula")!.hidden).toBe(false);
      expect(elemento.querySelector(".pasos")?.getAttribute("aria-label")).toBe("Paso actual: ninguno");
    });

    it("'Escuchar el correcto' está disponible desde el inicio y carga el beat original", () => {
      const { reproductor, elemento } = montarJuego();

      const ayuda = botonConTexto(elemento, "Escuchar el correcto");
      expect(ayuda.disabled).toBe(false);

      ayuda.click();
      expect(reproductor.cargar).toHaveBeenLastCalledWith(BEAT_ORIGINAL.cuadricula);
      expect(reproductor.iniciar).toHaveBeenCalledTimes(1);
    });

    it("'Comprobar' sin corregir muestra 'Todavía no suena igual' con un motivo que nombra el instrumento y sobra/falta", () => {
      const { elemento } = montarJuego();

      botonConTexto(elemento, "Comprobar").click();

      const resultado = elemento.querySelector<HTMLElement>(".juego__resultado")!;
      expect(resultado.hidden).toBe(false);
      expect(resultado.querySelector("h2")!.textContent).toBe("Todavía no suena igual");

      const motivos = Array.from(resultado.querySelectorAll("li")).map((item) => item.textContent ?? "");
      expect(motivos.length).toBeGreaterThan(0);
      const motivoInstrumento = motivos.find((motivo) => /sobra|falta/.test(motivo));
      expect(motivoInstrumento).not.toBeUndefined();
      const nombresPistas = ["Bombo", "Clap", "Hi-hat cerrado", "Hi-hat abierto"];
      expect(nombresPistas.some((nombre) => motivoInstrumento!.includes(nombre))).toBe(true);
    });

    it("corregir hasta igualar el original y 'Comprobar' muestra '¡Correcto!', racha 1 y puntos > 0", () => {
      const { elemento } = montarJuego();

      for (const { pista, paso } of CELDAS_A_CORREGIR) {
        celda(elemento, pista, paso).click();
      }
      botonConTexto(elemento, "Comprobar").click();

      const resultado = elemento.querySelector(".juego__resultado")!;
      expect(resultado.querySelector("h2")!.textContent).toBe("¡Correcto!");
      expect(elemento.querySelector(".juego__marcador")?.textContent).toContain("Racha 1");
      expect(elemento.querySelector(".juego__resultado-puntaje")?.textContent).toMatch(/Puntos [1-9]/);
    });

    it("'Teoría del beat' abre un diálogo saltable", () => {
      const { elemento } = montarJuego();

      botonConTexto(elemento, "Teoría del beat").click();
      const dialogo = elemento.querySelector('[role="dialog"]');
      expect(dialogo).not.toBeNull();

      botonConTexto(elemento, "Saltar tutorial").click();
      expect(elemento.querySelector('[role="dialog"]')).toBeNull();
    });
  });
});

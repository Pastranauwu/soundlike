/**
 * Prueba de integración punta a punta: "Explora el sinte". Cubre la aceptación
 * global del pedido con la app completa: sinteParams puro, reto, el pad con
 * puntero y teclado, las 6 lecciones, el puntaje, el progreso en localStorage,
 * el tutorial, el menú, las rutas y la regresión de "Arregla el beat". No
 * reemplaza las pruebas unitarias de tests/games/explora-el-sinte ni
 * tests/core/synthParams, que siguen como regresión.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

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
import {
  PARAMETROS,
  valorDesdePosicion,
  posicionDesdeValor,
  formaDesdePosicion,
  textoValor,
} from "../src/core/synthParams";
import {
  generarObjetivo,
  crearReto,
  comprobarReto,
} from "../src/games/explora-el-sinte/reto";
import {
  CLAVE_PROGRESO_SINTE,
  crearProgreso,
} from "../src/games/explora-el-sinte/progreso";
import {
  AVISO_AUDIO,
  crearPantallaSinte,
} from "../src/games/explora-el-sinte/screen";
import { obtenerLecciones } from "../src/games/explora-el-sinte/lecciones";
import type { ProgresoLecciones } from "../src/games/explora-el-sinte/types";
import type { RegistroTutoriales } from "../src/ui/types";
import { iniciarApp } from "../src/main";

function crearSinteFake(): Sinte {
  return {
    ajustar: vi.fn(),
    iniciarNota: vi.fn(),
    soltarNota: vi.fn(),
    destruir: vi.fn(),
  };
}

function crearRegistroEnMemoria(vistosIniciales: string[] = []): RegistroTutoriales {
  const vistos = new Set(vistosIniciales);
  return {
    visto: (id) => vistos.has(id),
    marcarVisto: (id) => void vistos.add(id),
  };
}

function crearProgresoEnMemoria(resueltasIniciales: string[] = []): ProgresoLecciones {
  const resueltas = new Set(resueltasIniciales);
  return {
    resueltas: () => [...resueltas],
    marcarResuelta: (id) => void resueltas.add(id),
  };
}

describe("sinteParams puro", () => {
  it("tono: posición 0 es C2 (≈65.41 Hz) y posición 1 es C6", () => {
    const valorMinimo = valorDesdePosicion("tono", 0);
    const valorMaximo = valorDesdePosicion("tono", 1);
    expect(valorMinimo).toBeCloseTo(65.41, 2);
    expect(textoValor("tono", valorMinimo)).toBe("C2");
    expect(textoValor("tono", valorMaximo)).toBe("C6");
  });

  it("corte: posición 0.5 vale 800 Hz (±1)", () => {
    expect(Math.abs(valorDesdePosicion("corte", 0.5) - 800)).toBeLessThanOrEqual(1);
  });

  it("ida y vuelta en 9 parámetros x 5 posiciones recupera la posición (o la misma zona en forma)", () => {
    const POSICIONES = [0, 0.25, 0.5, 0.75, 1];
    const zona = (posicion: number): number => Math.min(3, Math.floor(posicion * 4));
    for (const definicion of PARAMETROS) {
      for (const posicion of POSICIONES) {
        const ida = valorDesdePosicion(definicion.id, posicion);
        const vuelta = posicionDesdeValor(definicion.id, ida);
        if (definicion.escala === "zonas") {
          expect(zona(vuelta)).toBe(zona(posicion));
        } else {
          expect(vuelta).toBeCloseTo(posicion, 3);
        }
      }
    }
  });

  it("formaDesdePosicion reparte seno, triángulo, sierra y cuadrada", () => {
    expect(formaDesdePosicion(0.1)).toBe("seno");
    expect(formaDesdePosicion(0.3)).toBe("triangulo");
    expect(formaDesdePosicion(0.6)).toBe("sierra");
    expect(formaDesdePosicion(0.9)).toBe("cuadrada");
  });
});

describe("reto puro", () => {
  const EJES_LECCION_1 = { x: "tono", y: "volumen" } as const;

  it("con la misma semilla el objetivo es el mismo", () => {
    const objetivoA = generarObjetivo(EJES_LECCION_1, 7);
    const objetivoB = generarObjetivo(EJES_LECCION_1, 7);
    expect(objetivoB).toEqual(objetivoA);
  });

  it("un punto a 0.12 en ambos ejes acierta", () => {
    const objetivo = generarObjetivo(EJES_LECCION_1, 1);
    const punto = {
      x: Math.round((objetivo.x - 0.12) * 100) / 100,
      y: Math.round((objetivo.y - 0.12) * 100) / 100,
    };
    const resultado = comprobarReto(crearReto(EJES_LECCION_1, 1), punto);
    expect(resultado.acierto).toBe(true);
    expect(resultado.ejesFallidos).toEqual([]);
  });

  it("a 0.13 solo en x falla con ejesFallidos [x] y la pista nombra el tono", () => {
    const objetivo = generarObjetivo(EJES_LECCION_1, 1);
    const punto = {
      x: Math.round((objetivo.x - 0.13) * 100) / 100,
      y: objetivo.y,
    };
    const resultado = comprobarReto(crearReto(EJES_LECCION_1, 1), punto);
    expect(resultado.acierto).toBe(false);
    expect(resultado.ejesFallidos).toEqual(["x"]);
    expect(resultado.pistas.join(" ")).toContain("tono");
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

  function navegarA(hash: string): void {
    currentHash = hash;
    window.dispatchEvent(new Event("hashchange"));
  }

  function botonConTexto(contenedor: ParentNode, texto: string): HTMLButtonElement {
    const boton = Array.from(contenedor.querySelectorAll("button")).find(
      (candidato) => candidato.textContent === texto,
    );
    if (boton === undefined) throw new Error(`No hay botón "${texto}"`);
    return boton;
  }

  interface MontajeSinte {
    sinte: Sinte & Record<"iniciarNota" | "soltarNota", ReturnType<typeof vi.fn>>;
    crearSinte: ReturnType<typeof vi.fn>;
    registro: RegistroTutoriales;
    progreso: ProgresoLecciones;
    pantalla: ReturnType<typeof crearPantallaSinte>;
    elemento: HTMLElement;
    buscar<T extends HTMLElement>(selector: string): T;
  }

  function montarSinte(vistoTutorial: boolean, progresoReal = false): MontajeSinte {
    const sinte = crearSinteFake() as MontajeSinte["sinte"];
    const crearSinte = vi.fn((): Sinte => sinte);
    const registro = crearRegistroEnMemoria(vistoTutorial ? ["explora-el-sinte"] : []);
    const progreso = progresoReal ? crearProgreso() : crearProgresoEnMemoria();
    const opciones: Parameters<typeof crearPantallaSinte>[0] = {
      crearSinte,
      registroTutoriales: registro,
      progreso,
    };
    if (progresoReal) opciones.progreso = crearProgreso(localStorage);
    const pantalla = crearPantallaSinte(opciones);
    document.body.appendChild(pantalla.elemento);
    return {
      sinte,
      crearSinte,
      registro,
      progreso,
      pantalla,
      elemento: pantalla.elemento,
      buscar: (<T extends HTMLElement>(selector: string) =>
        pantalla.elemento.querySelector<T>(selector)!),
    };
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
    return area;
  }

  function moverPad(elemento: HTMLElement, posicion: { x: number; y: number }): void {
    const area = prepararArea(elemento);
    area.dispatchEvent(
      new PointerEvent("pointerdown", {
        pointerId: 1,
        clientX: posicion.x * 200,
        clientY: (1 - posicion.y) * 200,
        bubbles: true,
      }),
    );
    document.dispatchEvent(new PointerEvent("pointerup", { pointerId: 1, bubbles: true }));
  }

  it("del menú, la tarjeta 'Explora el sinte' llega a la pantalla: aviso visible y nada sonó al montar", () => {
    montarApp("#/");

    const tarjeta = root.querySelector<HTMLAnchorElement>('a[href="#/explora-el-sinte"]');
    expect(tarjeta?.textContent).toContain("Explora el sinte");
    tarjeta!.click();
    navegarA("#/explora-el-sinte");

    expect(root.querySelector("h1")?.textContent).toBe("Explora el sinte");
    expect(root.querySelector(".sinte__aviso")?.textContent).toBe(AVISO_AUDIO);
    const aviso = root.querySelector<HTMLElement>(".sinte__aviso")!;
    expect(aviso.hidden).toBe(false);
    const dobles = globalThis as unknown as { envMock?: unknown };
    expect(dobles.envMock).toBeUndefined();
    expect(startTone).not.toHaveBeenCalled();
    expect(envTone).not.toHaveBeenCalled();
  });

  it("pantalla aislada: sin visto el tutorial abre; tras cerrarlo, pointerdown suena, pointerup suelta; presionar otra vez y 'Siguiente' suelta y pasa a 'Lección 2 de 6'", () => {
    const { elemento, buscar, sinte, crearSinte } = montarSinte(false);

    const dialogo = elemento.querySelector('[role="dialog"]');
    expect(dialogo).not.toBeNull();
    botonConTexto(dialogo!, "Saltar tutorial").click();
    expect(elemento.querySelector('[role="dialog"]')).toBeNull();
    expect(crearSinte).not.toHaveBeenCalled();

    const area = prepararArea(elemento);
    area.dispatchEvent(new PointerEvent("pointerdown", { pointerId: 1, bubbles: true }));
    expect(crearSinte).toHaveBeenCalledTimes(1);
    expect(sinte.iniciarNota).toHaveBeenCalledTimes(1);

    document.dispatchEvent(new PointerEvent("pointerup", { pointerId: 1, bubbles: true }));
    expect(sinte.soltarNota).toHaveBeenCalledTimes(1);

    area.dispatchEvent(new PointerEvent("pointerdown", { pointerId: 1, bubbles: true }));
    expect(sinte.iniciarNota).toHaveBeenCalledTimes(2);

    botonConTexto(elemento, "Siguiente").click();
    expect(sinte.soltarNota).toHaveBeenCalledTimes(2);
    expect(buscar(".sinte__paso").textContent).toBe("Lección 2 de 6");
  });

  it("solo teclado: las flechas cambian la lectura, Espacio mantiene y suelta, y flecha/Espacio quedan con defaultPrevented", () => {
    const { elemento, buscar, sinte } = montarSinte(true);
    const area = prepararArea(elemento);
    area.focus();

    const lecturaAntes = buscar(".pad__valor--x").textContent;
    const flecha = new KeyboardEvent("keydown", {
      key: "ArrowRight",
      bubbles: true,
      cancelable: true,
    });
    area.dispatchEvent(flecha);
    expect(flecha.defaultPrevented).toBe(true);
    expect(buscar(".pad__valor--x").textContent).not.toBe(lecturaAntes);

    const espacioAbajo = new KeyboardEvent("keydown", {
      key: " ",
      bubbles: true,
      cancelable: true,
    });
    area.dispatchEvent(espacioAbajo);
    expect(espacioAbajo.defaultPrevented).toBe(true);
    expect(sinte.iniciarNota).toHaveBeenCalledTimes(1);

    const espacioArriba = new KeyboardEvent("keyup", { key: " ", bubbles: true, cancelable: true });
    area.dispatchEvent(espacioArriba);
    expect(sinte.soltarNota).toHaveBeenCalledTimes(1);
  });

  it("'Siguiente' recorre las 6 lecciones con sus 6 títulos; en el patio libre elegir ejes cambia las dos lecturas y 'Anterior' regresa", () => {
    const { elemento, buscar } = montarSinte(true);
    const titulos = obtenerLecciones().map((leccion) => leccion.titulo);

    for (let i = 0; i < titulos.length; i++) {
      expect(buscar(".sinte__titulo").textContent).toBe(titulos[i]);
      if (i < titulos.length - 1) botonConTexto(elemento, "Siguiente").click();
    }
    expect(buscar(".sinte__paso").textContent).toBe("Lección 6 de 6");

    const selectX = elemento.querySelector<HTMLSelectElement>(".sinte__eje-x")!;
    const selectY = elemento.querySelector<HTMLSelectElement>(".sinte__eje-y")!;
    selectX.value = "ataque";
    selectX.dispatchEvent(new Event("change"));
    selectY.value = "volumen";
    selectY.dispatchEvent(new Event("change"));

    expect(buscar(".pad__valor--x").textContent).toContain("Ataque");
    expect(buscar(".pad__valor--y").textContent).toContain("Volumen");

    botonConTexto(elemento, "Anterior").click();
    expect(buscar(".sinte__titulo").textContent).toBe(titulos[4]);
  });

  it("acertar el reto de la lección 1 muestra '¡Correcto!', Puntos 100, reto resuelto en el índice y el progreso en localStorage", () => {
    const { elemento, buscar } = montarSinte(true, true);
    const objetivo = generarObjetivo({ x: "tono", y: "volumen" }, 1);

    moverPad(elemento, objetivo);
    botonConTexto(elemento, "Comprobar").click();

    expect(buscar(".juego__resultado-titulo").textContent).toBe("¡Correcto!");
    expect(buscar(".juego__marcador").textContent).toContain("Puntos 100");
    const boton1 = elemento.querySelectorAll<HTMLButtonElement>(".sinte__indice-boton")[0];
    expect(boton1.dataset.resuelta).toBe("true");
    expect(boton1.textContent).toBe("1 ✓");
    const guardado = localStorage.getItem(CLAVE_PROGRESO_SINTE);
    expect(JSON.parse(guardado!)).toContain("tono-volumen");
  });

  it("'#/arregla-el-beat' sigue con 4 pistas x 16 celdas y sus dos botones de escucha; '#/tutoriales' lista 4 tutoriales", () => {
    montarApp("#/arregla-el-beat");

    const filas = root.querySelectorAll(".cuadricula__fila");
    expect(filas).toHaveLength(4);
    filas.forEach((fila) => expect(fila.querySelectorAll(".cuadricula__celda")).toHaveLength(16));
    botonConTexto(root, "Escuchar el beat roto");
    botonConTexto(root, "Escuchar el correcto");

    navegarA("#/tutoriales");
    expect(root.querySelectorAll(".tutoriales__item")).toHaveLength(4);
  });
});

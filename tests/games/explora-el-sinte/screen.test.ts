import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { Sinte } from "../../../src/core/synthTypes";
import { generarObjetivo } from "../../../src/games/explora-el-sinte/reto";
import {
  AVISO_AUDIO,
  DURACION_OBJETIVO_MS,
  crearPantallaSinte,
} from "../../../src/games/explora-el-sinte/screen";
import type { ProgresoLecciones } from "../../../src/games/explora-el-sinte/types";
import type { RegistroTutoriales } from "../../../src/ui/types";

vi.mock("tone", () => ({}));

function crearSinteFake() {
  return {
    ajustar: vi.fn(),
    iniciarNota: vi.fn(),
    soltarNota: vi.fn(),
    destruir: vi.fn(),
  };
}

function crearRegistroFake(vistos: string[] = []): RegistroTutoriales {
  const conjunto = new Set(vistos);
  return {
    visto: (id) => conjunto.has(id),
    marcarVisto: vi.fn((id: string) => {
      conjunto.add(id);
    }),
  };
}

function crearProgresoFake(resueltasIniciales: string[] = []): ProgresoLecciones {
  const conjunto = new Set(resueltasIniciales);
  return {
    resueltas: () => [...conjunto],
    marcarResuelta: vi.fn((id: string) => {
      conjunto.add(id);
    }),
  };
}

interface OpcionesMontaje {
  registro?: RegistroTutoriales;
  progreso?: ProgresoLecciones;
}

let limpiezas: Array<() => void> = [];

function montar(opciones: OpcionesMontaje = {}) {
  const sinte = crearSinteFake();
  const crearSinte = vi.fn((): Sinte => sinte as unknown as Sinte);
  const registro = opciones.registro ?? crearRegistroFake(["explora-el-sinte"]);
  const progreso = opciones.progreso ?? crearProgresoFake();
  const pantalla = crearPantallaSinte({ crearSinte, registroTutoriales: registro, progreso });
  document.body.appendChild(pantalla.elemento);
  limpiezas.push(() => pantalla.destruir());
  const elemento = pantalla.elemento;
  const buscar = <T extends HTMLElement>(selector: string): T =>
    elemento.querySelector<T>(selector)!;
  return { sinte, crearSinte, registro, progreso, pantalla, elemento, buscar };
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
      clientX: posicion.x * 200,
      clientY: (1 - posicion.y) * 200,
      bubbles: true,
    }),
  );
  document.dispatchEvent(new PointerEvent("pointerup", { bubbles: true }));
}

beforeEach(() => {
  limpiezas = [];
  localStorage.clear();
});

afterEach(() => {
  limpiezas.forEach((limpiar) => limpiar());
  limpiezas = [];
  document.body.replaceChildren();
  vi.useRealTimers();
});

describe("crearPantallaSinte", () => {
  it("monta la lección 1 con aviso, marcador y lectura, sin crear el sinte", () => {
    const { elemento, buscar, crearSinte } = montar();

    expect(elemento.matches("main.juego.sinte")).toBe(true);
    expect(buscar("h1").textContent).toBe("Explora el sinte");
    expect(buscar(".sinte__paso").textContent).toBe("Lección 1 de 6");
    expect(buscar(".sinte__titulo").textContent).toBe("Tono y volumen");
    expect(buscar(".sinte__aviso").hidden).toBe(false);
    expect(buscar(".sinte__aviso").textContent).toBe(AVISO_AUDIO);
    expect(buscar(".juego__marcador").textContent).toBe("Nivel 1 · Puntos 0 · Racha 0");
    expect(buscar(".pad__valor--x").textContent).toContain("Horizontal · Tono:");
    expect(buscar(".pad__valor--y").textContent).toContain("Vertical · Volumen:");
    expect(buscar(".sinte__libre").hidden).toBe(true);
    expect(buscar(".sinte__reto").hidden).toBe(false);
    expect(crearSinte).not.toHaveBeenCalled();
  });

  it("el primer gesto del pad crea el sinte, suena y oculta el aviso; soltar lo detiene", () => {
    const { elemento, buscar, sinte, crearSinte } = montar();
    const area = prepararArea(elemento);

    area.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));

    expect(crearSinte).toHaveBeenCalledTimes(1);
    expect(sinte.ajustar).toHaveBeenCalled();
    expect(sinte.iniciarNota).toHaveBeenCalledTimes(1);
    expect(buscar(".sinte__aviso").hidden).toBe(true);

    document.dispatchEvent(new PointerEvent("pointerup", { bubbles: true }));
    expect(sinte.soltarNota).toHaveBeenCalledTimes(1);
  });

  it("Siguiente con la nota mantenida la suelta y cambia de lección y de ejes", () => {
    const { elemento, buscar, sinte } = montar();
    const area = elemento.querySelector<HTMLElement>(".pad__area")!;
    area.focus();
    area.dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true, cancelable: true }));
    expect(sinte.iniciarNota).toHaveBeenCalledTimes(1);

    buscar(".sinte__siguiente").click();

    expect(sinte.soltarNota).toHaveBeenCalled();
    expect(buscar(".sinte__paso").textContent).toBe("Lección 2 de 6");
    expect(buscar(".sinte__titulo").textContent).toBe("Forma de onda y tono");
    expect(buscar(".pad__valor--x").textContent).toContain("Horizontal · Forma de onda:");
  });

  it("el botón 3 del índice cambia a filtro y marca aria-current", () => {
    const { elemento, buscar } = montar();
    const botones = elemento.querySelectorAll<HTMLButtonElement>(".sinte__indice-boton");

    botones[2].click();

    expect(buscar(".sinte__titulo").textContent).toBe("Filtro: corte y resonancia");
    expect(botones[2].getAttribute("aria-current")).toBe("step");
    expect(botones[0].getAttribute("aria-current")).toBeNull();
  });

  it("el patio libre muestra dos listas de 9 opciones, oculta el reto y elegir eje relee el pad", () => {
    const { elemento, buscar } = montar();
    for (let i = 0; i < 5; i++) buscar(".sinte__siguiente").click();

    expect(buscar(".sinte__libre").hidden).toBe(false);
    expect(buscar(".sinte__reto").hidden).toBe(true);
    expect(elemento.querySelectorAll(".sinte__eje-x option")).toHaveLength(9);
    expect(elemento.querySelectorAll(".sinte__eje-y option")).toHaveLength(9);

    const selectX = buscar<HTMLSelectElement>(".sinte__eje-x");
    selectX.value = "ataque";
    selectX.dispatchEvent(new Event("change"));

    expect(buscar(".pad__valor--x").textContent).toContain("Horizontal · Ataque:");
  });

  it("Escuchar el objetivo suena y se suelta a los 1500 ms", () => {
    vi.useFakeTimers();
    const { buscar, sinte } = montar();

    buscar(".sinte__escuchar").click();
    expect(sinte.iniciarNota).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(DURACION_OBJETIVO_MS);
    expect(sinte.soltarNota).toHaveBeenCalledTimes(1);
  });

  it("imitar el objetivo acierta, suma puntos y marca la lección resuelta", () => {
    const { elemento, buscar, progreso } = montar();
    const objetivo = generarObjetivo({ x: "tono", y: "volumen" }, 1);

    moverPad(elemento, objetivo);
    buscar(".juego__comprobar").click();

    expect(buscar(".juego__resultado-titulo").textContent).toBe("¡Correcto!");
    expect(buscar(".juego__marcador").textContent).toBe("Nivel 1 · Puntos 100 · Racha 1");
    expect(progreso.resueltas()).toContain("tono-volumen");
    const boton1 = elemento.querySelectorAll<HTMLButtonElement>(".sinte__indice-boton")[0];
    expect(boton1.dataset.resuelta).toBe("true");
    expect(boton1.textContent).toBe("1 ✓");
  });

  it("tras 3 fallos la pista nombra el parámetro y el objetivo se dibuja en el pad", () => {
    const { elemento, buscar } = montar();
    const objetivo = generarObjetivo({ x: "tono", y: "volumen" }, 1);
    const lejos = {
      x: objetivo.x > 0.5 ? 0.1 : 0.9,
      y: objetivo.y > 0.5 ? 0.1 : 0.9,
    };

    moverPad(elemento, lejos);
    for (let intento = 0; intento < 3; intento++) buscar(".juego__comprobar").click();

    const motivos = [...elemento.querySelectorAll<HTMLLIElement>(".juego__resultado-motivos li")];
    expect(motivos.length).toBeGreaterThanOrEqual(1);
    expect(motivos.map((li) => li.textContent).join(" ")).toContain("tono");
    expect(buscar(".juego__resultado-titulo").textContent).toBe("Todavía no suena igual");
    expect(elemento.querySelector<HTMLElement>(".pad__objetivo")!.hidden).toBe(false);
  });

  it("con el tutorial sin ver se abre el diálogo sin crear el sinte y 'Saltar' lo marca visto", () => {
    const registro = crearRegistroFake([]);
    const { elemento, buscar, crearSinte } = montar({ registro });

    const dialogo = elemento.querySelector<HTMLElement>('[role="dialog"]');
    expect(dialogo).not.toBeNull();
    expect(crearSinte).not.toHaveBeenCalled();

    dialogo!.querySelector<HTMLButtonElement>(".tutorial__saltar")!.click();

    expect(registro.marcarVisto).toHaveBeenCalledWith("explora-el-sinte");
    expect(elemento.querySelector('[role="dialog"]')).toBeNull();

    buscar(".juego__como").click();
    expect(elemento.querySelector('[role="dialog"]')).not.toBeNull();
  });

  it("sin lecciones lanza Error", () => {
    expect(() => crearPantallaSinte({ lecciones: [] })).toThrow("No hay lecciones");
  });
});

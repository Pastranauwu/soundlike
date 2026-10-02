import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { Mock } from "vitest";
import type { Sinte } from "../../../src/core/synthTypes";
import { crearPantallaSinte } from "../../../src/games/explora-el-sinte/screen";
import type {
  PresetPatio,
  PresetsPatio,
  ProgresoLecciones,
} from "../../../src/games/explora-el-sinte/types";
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

function crearProgresoFake(): ProgresoLecciones {
  const conjunto = new Set<string>();
  return {
    resueltas: () => [...conjunto],
    marcarResuelta: vi.fn((id: string) => {
      conjunto.add(id);
    }),
  };
}

function copiarPreset(preset: PresetPatio): PresetPatio {
  return { ...preset, ejes: { ...preset.ejes }, posicion: { ...preset.posicion } };
}

interface PresetsFake extends PresetsPatio {
  guardar: Mock<(preset: PresetPatio) => void>;
  borrar: Mock<(nombre: string) => void>;
}

function crearPresetsFake(iniciales: PresetPatio[] = []): PresetsFake {
  let lista = iniciales.map(copiarPreset);
  return {
    listar: () => lista.map(copiarPreset),
    guardar: vi.fn<(preset: PresetPatio) => void>((preset) => {
      lista = lista.filter((guardado) => guardado.nombre !== preset.nombre);
      lista.push(copiarPreset(preset));
    }),
    borrar: vi.fn<(nombre: string) => void>((nombre) => {
      lista = lista.filter((preset) => preset.nombre !== nombre);
    }),
  };
}

let limpiezas: Array<() => void> = [];

function montar(presets: PresetsFake = crearPresetsFake()) {
  const sinte = crearSinteFake();
  const crearSinte = vi.fn((): Sinte => sinte as unknown as Sinte);
  const pantalla = crearPantallaSinte({
    crearSinte,
    registroTutoriales: crearRegistroFake(["explora-el-sinte"]),
    progreso: crearProgresoFake(),
    presets,
  });
  document.body.appendChild(pantalla.elemento);
  limpiezas.push(() => pantalla.destruir());
  const elemento = pantalla.elemento;
  const buscar = <T extends HTMLElement>(selector: string): T =>
    elemento.querySelector<T>(selector)!;
  const avanzarAPatioLibre = (): void => {
    for (let i = 0; i < 5; i++) buscar(".sinte__siguiente").click();
  };
  return { sinte, crearSinte, presets, pantalla, elemento, buscar, avanzarAPatioLibre };
}

function enviarGuardar(elemento: HTMLElement): void {
  const form = elemento.querySelector<HTMLFormElement>(".sinte__presets")!;
  form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
}

beforeEach(() => {
  limpiezas = [];
});

afterEach(() => {
  limpiezas.forEach((limpiar) => limpiar());
  limpiezas = [];
  document.body.replaceChildren();
});

describe("patio libre: estilos y presets", () => {
  it("al llegar a la lección 6 pinta 6 estilos y el primero queda activo en el pad", () => {
    const { elemento, buscar, avanzarAPatioLibre, crearSinte } = montar();
    avanzarAPatioLibre();

    expect(buscar(".sinte__libre").hidden).toBe(false);
    const botones = elemento.querySelectorAll<HTMLButtonElement>(".sinte__estilo");
    expect(botones).toHaveLength(6);
    expect(botones[0].getAttribute("aria-pressed")).toBe("true");
    expect(botones[1].getAttribute("aria-pressed")).toBe("false");

    const pad = elemento.querySelector<HTMLElement>(".pad")!;
    expect(pad.dataset.estilo).toBe(botones[0].dataset.estilo);
    expect(buscar(".pad__estilo").hidden).toBe(false);
    expect(buscar(".pad__estilo").textContent).toBe(botones[0].textContent);
    expect(crearSinte).not.toHaveBeenCalled();
  });

  it("pulsar un estilo lo activa, cambia el pad y no crea el sinte", () => {
    const { elemento, buscar, avanzarAPatioLibre, crearSinte } = montar();
    avanzarAPatioLibre();

    const rave = elemento.querySelector<HTMLButtonElement>(".sinte__estilo[data-estilo='rave']")!;
    rave.click();

    expect(rave.getAttribute("aria-pressed")).toBe("true");
    const botones = [...elemento.querySelectorAll<HTMLButtonElement>(".sinte__estilo")];
    expect(botones.filter((boton) => boton.getAttribute("aria-pressed") === "true")).toEqual([rave]);
    expect(elemento.querySelector<HTMLElement>(".pad")!.dataset.estilo).toBe("rave");
    expect(crearSinte).not.toHaveBeenCalled();
  });

  it("salir del patio libre oculta el selector y quita el estilo del pad", () => {
    const { elemento, buscar, avanzarAPatioLibre } = montar();
    avanzarAPatioLibre();
    expect(elemento.querySelector<HTMLElement>(".pad")!.dataset.estilo).toBeDefined();

    buscar(".sinte__anterior").click();

    expect(buscar(".sinte__libre").hidden).toBe(true);
    expect(elemento.querySelector<HTMLElement>(".pad")!.hasAttribute("data-estilo")).toBe(false);
  });

  it("guardar con nombre envía el preset y lo lista; borrar lo quita", () => {
    const { elemento, buscar, avanzarAPatioLibre, presets } = montar();
    avanzarAPatioLibre();

    elemento.querySelector<HTMLButtonElement>(".sinte__estilo[data-estilo='rave']")!.click();
    buscar<HTMLInputElement>(".sinte__preset-nombre").value = "mi rave";
    enviarGuardar(elemento);

    expect(presets.guardar).toHaveBeenCalledWith({
      nombre: "mi rave",
      idEstilo: "rave",
      ejes: { x: "corte", y: "resonancia" },
      posicion: { x: 0.5, y: 0.5 },
    });
    expect(buscar<HTMLInputElement>(".sinte__preset-nombre").value).toBe("");
    expect(buscar(".sinte__preset-titulo").textContent).toBe("mi rave");

    elemento.querySelector<HTMLButtonElement>(".sinte__preset-borrar")!.click();

    expect(presets.borrar).toHaveBeenCalledWith("mi rave");
    expect(elemento.querySelector(".sinte__preset")).toBeNull();
  });

  it("guardar sin nombre no hace nada", () => {
    const { elemento, buscar, avanzarAPatioLibre, presets } = montar();
    avanzarAPatioLibre();

    buscar<HTMLInputElement>(".sinte__preset-nombre").value = "   ";
    enviarGuardar(elemento);

    expect(presets.guardar).not.toHaveBeenCalled();
  });

  it("cargar un preset deja selects y pad en sus ejes y posición", () => {
    const guardado: PresetPatio = {
      nombre: "acid max",
      idEstilo: "acid",
      ejes: { x: "ataque", y: "relajacion" },
      posicion: { x: 0.75, y: 0.25 },
    };
    const { elemento, buscar, avanzarAPatioLibre } = montar(crearPresetsFake([guardado]));
    avanzarAPatioLibre();

    elemento.querySelector<HTMLButtonElement>(".sinte__preset-cargar")!.click();

    expect(buscar<HTMLSelectElement>(".sinte__eje-x").value).toBe("ataque");
    expect(buscar<HTMLSelectElement>(".sinte__eje-y").value).toBe("relajacion");
    expect(elemento.querySelector<HTMLElement>(".pad")!.dataset.estilo).toBe("acid");
    const punto = elemento.querySelector<HTMLElement>(".pad__punto")!;
    expect(punto.style.left).toBe("75%");
    expect(punto.style.bottom).toBe("25%");
    expect(buscar(".pad__valor--x").textContent).toContain("Ataque:");
    expect(buscar(".pad__valor--y").textContent).toContain("Relajación:");
  });
});

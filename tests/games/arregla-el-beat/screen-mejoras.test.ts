import { vi } from "vitest";
import type { Cuadricula, Reproductor } from "../../../src/core/types";
import { crearPantallaJuego } from "../../../src/games/arregla-el-beat/screen";
import type { PantallaJuego } from "../../../src/games/arregla-el-beat/screen";
import type { Beat } from "../../../src/games/arregla-el-beat/types";
import type { RegistroTutoriales, Tutorial } from "../../../src/ui/types";

// La pantalla importa el reproductor real; en jsdom no hay audio.
vi.mock("tone", () => ({}));

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

const TUTORIAL: Tutorial = {
  id: "juego-de-prueba",
  juego: "Juego de prueba",
  ruta: "#/juego-de-prueba",
  objetivo: "Deja la cuadrícula igual que el original.",
  aprendes: "A probar pantallas.",
  pasos: [
    { titulo: "Primera pantalla", texto: "Texto uno.", puntos: [] },
    { titulo: "Segunda pantalla", texto: "Texto dos.", puntos: ["Un punto."] },
  ],
};

function crearReproductorFake() {
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
    alPaso: vi.fn(() => () => undefined),
    destruir: vi.fn(),
  };
  return fake satisfies Reproductor;
}

function crearRegistroFake(vistosIniciales: string[] = []): RegistroTutoriales {
  const vistos = new Set(vistosIniciales);
  return {
    visto: (id) => vistos.has(id),
    marcarVisto: (id) => void vistos.add(id),
  };
}

let pantallaMontada: PantallaJuego | null = null;

function montar(registro: RegistroTutoriales = crearRegistroFake([TUTORIAL.id])) {
  const reproductor = crearReproductorFake();
  const pantalla = crearPantallaJuego({
    reproductor,
    beats: [BEAT],
    semillaInicial: 1,
    tutorial: TUTORIAL,
    registroTutoriales: registro,
  });
  pantallaMontada = pantalla;
  const elemento = pantalla.elemento;
  document.body.append(elemento);
  const buscar = <T extends HTMLElement>(selector: string) => elemento.querySelector<T>(selector)!;
  return { reproductor, pantalla, elemento, buscar, registro };
}

function botonConTexto(elemento: HTMLElement, texto: string): HTMLButtonElement {
  const boton = Array.from(elemento.querySelectorAll("button")).find(
    (candidato) => candidato.textContent === texto,
  );
  if (boton === undefined) throw new Error(`No hay botón "${texto}"`);
  return boton;
}

function celda(elemento: HTMLElement, pista: string, paso: number): HTMLButtonElement {
  return elemento.querySelector<HTMLButtonElement>(
    `.cuadricula__fila[data-pista="${pista}"] .cuadricula__celda[data-paso="${paso}"]`,
  )!;
}

function celdasPulsadas(elemento: HTMLElement): Array<string | null> {
  return Array.from(elemento.querySelectorAll(".cuadricula__celda")).map((boton) =>
    boton.getAttribute("aria-pressed"),
  );
}

function fallar(elemento: HTMLElement, veces: number): void {
  for (let intento = 0; intento < veces; intento++) botonConTexto(elemento, "Comprobar").click();
}

afterEach(() => {
  pantallaMontada?.destruir();
  pantallaMontada = null;
});

describe("crearPantallaJuego: tutorial", () => {
  it("con el registro vacío abre el tutorial al montar", () => {
    const { elemento } = montar(crearRegistroFake());
    const dialogo = elemento.querySelector('[role="dialog"]');
    expect(dialogo).not.toBeNull();
    expect(dialogo!.textContent).toContain("Primera pantalla");
  });

  it("saltar el tutorial lo cierra, lo marca como visto y enfoca Escuchar", () => {
    const { elemento, buscar, registro } = montar(crearRegistroFake());
    botonConTexto(elemento, "Saltar tutorial").click();
    expect(elemento.querySelector('[role="dialog"]')).toBeNull();
    expect(registro.visto(TUTORIAL.id)).toBe(true);
    expect(document.activeElement).toBe(buscar(".juego__play"));
  });

  it("con el tutorial ya visto no abre el diálogo y ¿Cómo se juega? lo abre", () => {
    const { elemento } = montar();
    expect(elemento.querySelector('[role="dialog"]')).toBeNull();
    botonConTexto(elemento, "¿Cómo se juega?").click();
    expect(elemento.querySelectorAll('[role="dialog"]')).toHaveLength(1);
    botonConTexto(elemento, "¿Cómo se juega?").click();
    expect(elemento.querySelectorAll('[role="dialog"]')).toHaveLength(1);
  });

  it("destruir quita el tutorial abierto", () => {
    const { pantalla, elemento } = montar(crearRegistroFake());
    pantalla.destruir();
    expect(elemento.querySelector('[role="dialog"]')).toBeNull();
  });
});

describe("crearPantallaJuego: encabezado", () => {
  it("muestra el título del juego y el objetivo del tutorial", () => {
    const { elemento, buscar } = montar();
    expect(elemento.querySelector("h1")!.textContent).toBe("Arregla el beat");
    expect(elemento.getAttribute("aria-labelledby")).toBe(elemento.querySelector("h1")!.id);
    expect(buscar(".juego__objetivo").textContent).toBe(`Objetivo: ${TUTORIAL.objetivo}`);
    expect(buscar(".juego__marcador").getAttribute("aria-live")).toBe("polite");
  });

  it("agrupa los controles con nombre accesible", () => {
    const { elemento } = montar();
    const grupo = elemento.querySelector('[role="group"][aria-label="Controles"]')!;
    expect(grupo.contains(botonConTexto(elemento, "Reiniciar"))).toBe(true);
    expect(grupo.closest("header")).toBeNull();
  });
});

describe("crearPantallaJuego: reiniciar", () => {
  it("devuelve la cuadrícula al inicio de la ronda sin tocar el marcador", () => {
    const { elemento, buscar } = montar();
    const celdasAlEmpezar = celdasPulsadas(elemento);
    const marcadorAlEmpezar = buscar(".juego__marcador").textContent;

    celda(elemento, "kick", 3).click();
    celda(elemento, "clap", 7).click();
    expect(celdasPulsadas(elemento)).not.toEqual(celdasAlEmpezar);
    botonConTexto(elemento, "Reiniciar").click();

    expect(celdasPulsadas(elemento)).toEqual(celdasAlEmpezar);
    expect(buscar(".juego__mensaje").textContent).toBe(
      "Cuadrícula reiniciada: está igual que al empezar la ronda.",
    );
    expect(buscar(".juego__marcador").textContent).toBe(marcadorAlEmpezar);
  });

  it("no pierde las marcas ya desbloqueadas ni el resultado", () => {
    const { elemento, buscar } = montar();
    fallar(elemento, 3);
    botonConTexto(elemento, "Reiniciar").click();
    expect(elemento.querySelectorAll('.cuadricula__celda[aria-label$="equivocada"]')).toHaveLength(1);
    expect(buscar(".juego__ayuda-pista").textContent).toBe(
      "Las celdas equivocadas están marcadas en rojo.",
    );
    expect(buscar(".juego__resultado").hidden).toBe(false);
  });
});

describe("crearPantallaJuego: Escuchar el correcto", () => {
  it("al montar está visible, habilitado y la pista cuenta (0/3)", () => {
    const { buscar } = montar();
    const ayuda = buscar<HTMLButtonElement>(".juego__ayuda");
    expect(ayuda.hidden).toBe(false);
    expect(ayuda.disabled).toBe(false);
    expect(buscar(".juego__ayuda-pista").textContent).toBe(
      "Tras 3 intentos fallidos se marcan en rojo las celdas equivocadas (0/3)",
    );
  });

  it("la pista cuenta los fallos y al tercero avisa de las celdas marcadas", () => {
    const { elemento, buscar } = montar();
    fallar(elemento, 1);
    expect(buscar(".juego__ayuda-pista").textContent).toContain("(1/3)");
    fallar(elemento, 2);
    expect(buscar(".juego__ayuda-pista").textContent).toBe(
      "Las celdas equivocadas están marcadas en rojo.",
    );
  });

  it("al pulsarla suena el beat original y lo anuncia", () => {
    const { reproductor, buscar } = montar();
    buscar(".juego__ayuda").click();
    expect(reproductor.cargar).toHaveBeenLastCalledWith(BEAT.cuadricula);
    expect(buscar(".juego__escucha-estado").textContent).toContain("Suena el beat correcto");
  });
});

describe("crearPantallaJuego: accesibilidad de los controles", () => {
  it("el slider anuncia el tempo en bpm", () => {
    const { buscar } = montar();
    const slider = buscar<HTMLInputElement>(".juego__tempo-slider");
    expect(slider.getAttribute("aria-valuetext")).toBe("100 bpm");
    slider.value = "140";
    slider.dispatchEvent(new Event("input"));
    expect(slider.getAttribute("aria-valuetext")).toBe("140 bpm");
  });

  it("Escuchar el beat roto cambia texto y aria-label a Pausar", () => {
    const { buscar } = montar();
    const play = buscar(".juego__play");
    expect(play.getAttribute("aria-label")).toBe("Escuchar el beat roto");
    play.click();
    expect(play.textContent).toBe("Pausar");
    expect(play.getAttribute("aria-label")).toBe("Pausar");
  });
});

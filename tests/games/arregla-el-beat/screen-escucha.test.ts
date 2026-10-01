import { afterEach, describe, expect, it, vi } from "vitest";
import { celdasDistintas } from "../../../src/core/sequencer";
import type { Cuadricula, Reproductor } from "../../../src/core/types";
import { breakBeat } from "../../../src/games/arregla-el-beat/breakBeat";
import { crearPantallaJuego } from "../../../src/games/arregla-el-beat/screen";
import type { PantallaJuego } from "../../../src/games/arregla-el-beat/screen";
import { obtenerTutorialTeoriaBeat } from "../../../src/games/arregla-el-beat/tutorialTeoria";
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

const SEGUNDO_BEAT: Beat = {
  id: "segundo",
  nombre: "Segundo beat de prueba",
  genero: "house",
  tempo: 124,
  cuadricula: {
    kick: filaCon([0, 4, 8, 12]),
    clap: filaCon([4, 12]),
    "closed-hat": filaCon([2, 6, 10, 14]),
    "open-hat": filaCon([]),
  },
};

const SEMILLA = 1;
const CUADRICULA_ROTA = breakBeat(BEAT, 1, SEMILLA).cuadricula;

const TUTORIAL: Tutorial = {
  id: "juego-de-prueba",
  juego: "Juego de prueba",
  ruta: "#/juego-de-prueba",
  objetivo: "Deja la cuadrícula igual que el original.",
  aprendes: "A probar pantallas.",
  pasos: [{ titulo: "Primera pantalla", texto: "Texto uno.", puntos: [] }],
};

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
    beats: [BEAT, SEGUNDO_BEAT],
    semillaInicial: SEMILLA,
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

function cuadriculaEnPantalla(elemento: HTMLElement): Cuadricula {
  const cuadricula: Cuadricula = {};
  elemento.querySelectorAll<HTMLElement>(".cuadricula__fila").forEach((fila) => {
    cuadricula[fila.dataset.pista!] = Array.from(
      fila.querySelectorAll(".cuadricula__celda"),
    ).map((boton) => boton.getAttribute("aria-pressed") === "true");
  });
  return cuadricula;
}

function corregirCuadricula(elemento: HTMLElement): void {
  for (const { pista, paso } of celdasDistintas(BEAT.cuadricula, cuadriculaEnPantalla(elemento))) {
    celda(elemento, pista, paso).click();
  }
}

function fallar(elemento: HTMLElement, veces: number): void {
  for (let intento = 0; intento < veces; intento++) botonConTexto(elemento, "Comprobar").click();
}

function cuadriculaDe(elemento: HTMLElement): HTMLElement {
  return elemento.querySelector<HTMLElement>(".cuadricula")!;
}

afterEach(() => {
  pantallaMontada?.destruir();
  pantallaMontada = null;
});

describe("pantalla del juego: al montar", () => {
  it("muestra los dos botones de escucha habilitados y la cuadrícula visible", () => {
    const { elemento } = montar();
    expect(botonConTexto(elemento, "Escuchar el beat roto").disabled).toBe(false);
    expect(botonConTexto(elemento, "Escuchar el correcto").disabled).toBe(false);
    expect(cuadriculaDe(elemento).hidden).toBe(false);
    expect(elemento.querySelectorAll(".cuadricula__fila")).toHaveLength(4);
    expect(elemento.querySelectorAll(".cuadricula__celda")).toHaveLength(64);
    expect(cuadriculaEnPantalla(elemento)).toEqual(CUADRICULA_ROTA);
  });

  it("muestra 16 casillas de pasos sin ninguna iluminada y el resultado oculto", () => {
    const { elemento, buscar } = montar();
    expect(elemento.querySelectorAll(".pasos__paso")).toHaveLength(16);
    expect(buscar(".pasos").getAttribute("aria-label")).toBe("Paso actual: ninguno");
    expect(buscar(".juego__resultado").hidden).toBe(true);
    expect(buscar(".juego__oculta").hidden).toBe(true);
  });

  it("no arranca el audio", () => {
    const { reproductor } = montar();
    expect(reproductor.iniciar).not.toHaveBeenCalled();
  });

  it("muestra lo que se aprende con el tutorial de teoría", () => {
    const { buscar } = montar();
    expect(buscar(".juego__aprendes").textContent).toBe(
      `Aprendes: ${obtenerTutorialTeoriaBeat().aprendes}`,
    );
  });
});

describe("pantalla del juego: escuchar el beat roto", () => {
  it("carga la cuadrícula rota, arranca el audio y el botón pasa a Pausar", () => {
    const { reproductor, elemento, buscar } = montar();
    botonConTexto(elemento, "Escuchar el beat roto").click();
    expect(reproductor.iniciar).toHaveBeenCalledTimes(1);
    expect(reproductor.cargar).toHaveBeenLastCalledWith(CUADRICULA_ROTA);
    const play = buscar(".juego__play");
    expect(play.textContent).toBe("Pausar");
    expect(play.getAttribute("aria-label")).toBe("Pausar");
    expect(play.getAttribute("aria-pressed")).toBe("true");
    expect(buscar(".juego__ayuda").getAttribute("aria-pressed")).toBe("false");
  });

  it("oculta la cuadrícula y lo avisa", () => {
    const { elemento, buscar } = montar();
    botonConTexto(elemento, "Escuchar el beat roto").click();
    expect(cuadriculaDe(elemento).hidden).toBe(true);
    expect(buscar(".juego__oculta").hidden).toBe(false);
    expect(buscar(".juego__oculta").textContent).toContain(
      "La cuadrícula está oculta mientras escuchas",
    );
    expect(buscar(".juego__escucha-estado").textContent).toContain("Suena el beat roto");
  });

  it("ilumina solo el indicador de pasos, nunca una columna de la cuadrícula", () => {
    const { reproductor, elemento, buscar } = montar();
    botonConTexto(elemento, "Escuchar el beat roto").click();
    reproductor.emitirPaso(4);
    expect(buscar(".pasos").getAttribute("aria-label")).toBe("Paso actual: 5 de 16");
    expect(elemento.querySelectorAll(".cuadricula__celda--actual")).toHaveLength(0);
  });

  it("suena con las correcciones del jugador", () => {
    const { reproductor, elemento } = montar();
    celda(elemento, "kick", 3).click();
    const editada = cuadriculaEnPantalla(elemento);
    botonConTexto(elemento, "Escuchar el beat roto").click();
    expect(reproductor.cargar).toHaveBeenLastCalledWith(editada);
  });

  it("Pausar detiene el audio, devuelve la cuadrícula y apaga el indicador", () => {
    const { reproductor, elemento, buscar } = montar();
    botonConTexto(elemento, "Escuchar el beat roto").click();
    reproductor.emitirPaso(4);
    botonConTexto(elemento, "Pausar").click();
    expect(reproductor.pausar).toHaveBeenCalledTimes(1);
    expect(cuadriculaDe(elemento).hidden).toBe(false);
    expect(buscar(".juego__oculta").hidden).toBe(true);
    expect(buscar(".pasos").getAttribute("aria-label")).toBe("Paso actual: ninguno");
    expect(buscar(".juego__play").textContent).toBe("Escuchar el beat roto");
    expect(buscar(".juego__play").getAttribute("aria-pressed")).toBe("false");
  });

  it("si el audio no arranca vuelve a pausa y lo dice", async () => {
    const { reproductor, elemento, buscar } = montar();
    reproductor.iniciar.mockRejectedValueOnce(new Error("sin audio"));
    botonConTexto(elemento, "Escuchar el beat roto").click();
    await vi.waitFor(() =>
      expect(buscar(".juego__escucha-estado").textContent).toBe(
        "No se pudo iniciar el audio. Vuelve a intentarlo.",
      ),
    );
    expect(cuadriculaDe(elemento).hidden).toBe(false);
    expect(buscar(".juego__play").textContent).toBe("Escuchar el beat roto");
  });
});

describe("pantalla del juego: escuchar el correcto", () => {
  it("sin fallos previos carga la cuadrícula original y oculta la cuadrícula", () => {
    const { reproductor, elemento, buscar } = montar();
    botonConTexto(elemento, "Escuchar el correcto").click();
    expect(reproductor.cargar).toHaveBeenLastCalledWith(BEAT.cuadricula);
    expect(reproductor.iniciar).toHaveBeenCalledTimes(1);
    expect(cuadriculaDe(elemento).hidden).toBe(true);
    expect(buscar(".juego__ayuda").textContent).toBe("Pausar");
    expect(buscar(".juego__ayuda").getAttribute("aria-pressed")).toBe("true");
  });

  it("pasa del roto al correcto sin pausar en medio", () => {
    const { reproductor, elemento, buscar } = montar();
    botonConTexto(elemento, "Escuchar el beat roto").click();
    botonConTexto(elemento, "Escuchar el correcto").click();
    expect(reproductor.pausar).not.toHaveBeenCalled();
    expect(reproductor.iniciar).toHaveBeenCalledTimes(2);
    expect(reproductor.cargar).toHaveBeenLastCalledWith(BEAT.cuadricula);
    expect(buscar(".juego__play").textContent).toBe("Escuchar el beat roto");
  });

  it("sigue habilitado después de fallar", () => {
    const { elemento } = montar();
    fallar(elemento, 3);
    expect(botonConTexto(elemento, "Escuchar el correcto").disabled).toBe(false);
  });
});

describe("pantalla del juego: resultado de la jugada", () => {
  it("comprobar sin cambiar nada explica el fallo y no suma puntos", () => {
    const { elemento, buscar } = montar();
    fallar(elemento, 1);
    const resultado = buscar(".juego__resultado");
    expect(resultado.hidden).toBe(false);
    expect(resultado.dataset.estado).toBe("fallo");
    expect(resultado.querySelector("h2")!.textContent).toBe("Todavía no suena igual");
    expect(buscar(".juego__resultado-resumen").textContent).toBe(
      "Hay 1 celda distinta al beat correcto.",
    );
    const motivos = Array.from(resultado.querySelectorAll("li")).map((item) => item.textContent);
    expect(motivos).toContain("No cambiaste nada: la cuadrícula sigue igual que el beat roto.");
    expect(buscar(".juego__resultado-puntaje").textContent).toBe(
      "Nivel 1 · Puntos 0 · Racha 0 · Intentos fallidos 1",
    );
    expect(buscar(".juego__marcador").textContent).toBe("Nivel 1 · Puntos 0 · Racha 0");
    expect(buscar(".juego__mensaje").textContent).toBe("");
  });

  it("los motivos dicen los pasos exactos a partir del tercer fallo", () => {
    const { elemento, buscar } = montar();
    fallar(elemento, 1);
    expect(buscar(".juego__resultado-motivos").textContent).not.toContain("en el paso");
    fallar(elemento, 2);
    expect(buscar(".juego__resultado-motivos").textContent).toContain("en el paso");
  });

  it("corregir y comprobar muestra el acierto y el siguiente beat roto", () => {
    const { elemento, buscar } = montar();
    corregirCuadricula(elemento);
    botonConTexto(elemento, "Comprobar").click();
    const resultado = buscar(".juego__resultado");
    expect(resultado.hidden).toBe(false);
    expect(resultado.dataset.estado).toBe("acierto");
    expect(resultado.querySelector("h2")!.textContent).toBe("¡Correcto!");
    expect(resultado.querySelector("ul")).toBeNull();
    expect(buscar(".juego__resultado-puntaje").textContent).toBe(
      "Nivel 1 · Puntos 100 · Racha 1 · Intentos fallidos 0",
    );
    expect(buscar(".juego__marcador").textContent).toBe("Nivel 1 · Puntos 100 · Racha 1");
    expect(cuadriculaEnPantalla(elemento)).toEqual(
      breakBeat(SEGUNDO_BEAT, 1, SEMILLA + 1).cuadricula,
    );
    expect(buscar<HTMLInputElement>(".juego__tempo-slider").value).toBe("124");
  });

  it("comprobar mientras suena pausa la escucha y devuelve la cuadrícula", () => {
    const { reproductor, elemento } = montar();
    botonConTexto(elemento, "Escuchar el beat roto").click();
    botonConTexto(elemento, "Comprobar").click();
    expect(reproductor.pausar).toHaveBeenCalledTimes(1);
    expect(cuadriculaDe(elemento).hidden).toBe(false);
  });
});

describe("pantalla del juego: celdas equivocadas tras 3 fallos", () => {
  it("la pista cuenta los fallos y al tercero avisa de las marcas", () => {
    const { elemento, buscar } = montar();
    expect(buscar(".juego__ayuda-pista").textContent).toBe(
      "Tras 3 intentos fallidos se marcan en rojo las celdas equivocadas (0/3)",
    );
    fallar(elemento, 2);
    expect(buscar(".juego__ayuda-pista").textContent).toContain("(2/3)");
    expect(elemento.querySelectorAll('.cuadricula__celda[aria-label$="equivocada"]')).toHaveLength(0);
    fallar(elemento, 1);
    expect(buscar(".juego__ayuda-pista").textContent).toBe(
      "Las celdas equivocadas están marcadas en rojo.",
    );
    expect(elemento.querySelectorAll('.cuadricula__celda[aria-label$="equivocada"]')).toHaveLength(1);
  });

  it("vuelve a calcular las marcas en cada edición", () => {
    const { elemento } = montar();
    fallar(elemento, 3);
    const marcadas = () =>
      elemento.querySelectorAll<HTMLButtonElement>('.cuadricula__celda[aria-label$="equivocada"]');
    marcadas()[0].click();
    expect(marcadas()).toHaveLength(0);
    celda(elemento, "kick", 3).click();
    expect(marcadas()).toHaveLength(1);
  });
});

describe("pantalla del juego: teoría del beat", () => {
  it("abre el tutorial de teoría y al cerrarlo el foco vuelve al botón", () => {
    const { elemento, buscar, registro } = montar();
    botonConTexto(elemento, "Teoría del beat").click();
    const dialogo = elemento.querySelector('[role="dialog"]')!;
    expect(dialogo.textContent).toContain("Pulso, compás y pasos");
    botonConTexto(elemento, "Saltar tutorial").click();
    expect(elemento.querySelector('[role="dialog"]')).toBeNull();
    expect(document.activeElement).toBe(buscar(".juego__teoria"));
    expect(registro.visto(obtenerTutorialTeoriaBeat().id)).toBe(false);
  });

  it("solo hay un diálogo a la vez", () => {
    const { elemento } = montar();
    botonConTexto(elemento, "Teoría del beat").click();
    botonConTexto(elemento, "¿Cómo se juega?").click();
    expect(elemento.querySelectorAll('[role="dialog"]')).toHaveLength(1);
  });

  it("abrir un tutorial pausa la escucha", () => {
    const { reproductor, elemento } = montar();
    botonConTexto(elemento, "Escuchar el beat roto").click();
    botonConTexto(elemento, "Teoría del beat").click();
    expect(reproductor.pausar).toHaveBeenCalledTimes(1);
    expect(cuadriculaDe(elemento).hidden).toBe(false);
  });
});

describe("pantalla del juego: destruir", () => {
  it("pausa el audio y deja de escuchar los pasos", () => {
    const { reproductor, pantalla, buscar, elemento } = montar();
    botonConTexto(elemento, "Escuchar el beat roto").click();
    pantalla.destruir();
    expect(reproductor.pausar).toHaveBeenCalled();
    reproductor.emitirPaso(2);
    expect(buscar(".pasos").getAttribute("aria-label")).toBe("Paso actual: ninguno");
  });
});

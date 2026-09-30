import { vi } from "vitest";
import type { Cuadricula, Reproductor } from "../../../src/core/types";
import { crearPantallaJuego } from "../../../src/games/arregla-el-beat/screen";
import type { Beat } from "../../../src/games/arregla-el-beat/types";
import { MENSAJE_FALLO } from "../../../src/games/arregla-el-beat/juego";

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

function montar() {
  const reproductor = crearReproductorFake();
  const pantalla = crearPantallaJuego({ reproductor, beats: [BEAT], semillaInicial: 1 });
  const elemento = pantalla.elemento;
  const buscar = <T extends HTMLElement>(selector: string) => elemento.querySelector<T>(selector)!;
  return { reproductor, pantalla, elemento, buscar };
}

function celda(elemento: HTMLElement, pista: string, paso: number): HTMLButtonElement {
  return elemento.querySelector<HTMLButtonElement>(
    `.cuadricula__fila[data-pista="${pista}"] .cuadricula__celda[data-paso="${paso}"]`,
  )!;
}

function corregirCuadricula(elemento: HTMLElement): void {
  for (const [pista, fila] of Object.entries(BEAT.cuadricula)) {
    fila.forEach((activa, paso) => {
      const boton = celda(elemento, pista, paso);
      if ((boton.getAttribute("aria-pressed") === "true") !== activa) boton.click();
    });
  }
}

function fallar(buscar: (selector: string) => HTMLElement, veces: number): void {
  for (let intento = 0; intento < veces; intento++) buscar(".juego__comprobar").click();
}

describe("crearPantallaJuego", () => {
  it("renderiza 4 pistas x 16 celdas, los controles y el marcador inicial", () => {
    const { elemento, buscar } = montar();
    expect(elemento.matches("section.juego")).toBe(true);
    expect(elemento.querySelectorAll(".cuadricula__fila")).toHaveLength(4);
    expect(elemento.querySelectorAll(".cuadricula__celda")).toHaveLength(64);
    expect(buscar(".juego__play").textContent).toBe("Escuchar");
    expect(buscar(".juego__comprobar").textContent).toBe("Comprobar");
    expect(buscar(".juego__ayuda").hidden).toBe(true);
    expect(buscar(".juego__marcador").textContent).toBe("Nivel 1 · Puntos 0 · Racha 0");
    expect(buscar(".juego__mensaje").getAttribute("aria-live")).toBe("polite");
    expect(buscar<HTMLAnchorElement>(".juego__volver").getAttribute("href")).toBe("#/");
  });

  it("al montar carga el beat roto y toma su tempo, sin arrancar el audio", () => {
    const { reproductor, buscar } = montar();
    expect(reproductor.iniciar).not.toHaveBeenCalled();
    expect(reproductor.setTempo).toHaveBeenCalledWith(100);
    expect(buscar<HTMLInputElement>(".juego__tempo-slider").value).toBe("100");
    expect(buscar(".juego__tempo-valor").textContent).toBe("100 bpm");
    const cargada = reproductor.cargar.mock.calls.at(-1)![0];
    expect(cargada).not.toEqual(BEAT.cuadricula);
  });

  it("clic en Escuchar llama iniciar y el texto pasa a Pausar; otro clic pausa", async () => {
    const { reproductor, buscar } = montar();
    const play = buscar(".juego__play");
    play.click();
    await Promise.resolve();
    expect(reproductor.iniciar).toHaveBeenCalledTimes(1);
    expect(play.textContent).toBe("Pausar");
    play.click();
    expect(reproductor.pausar).toHaveBeenCalledTimes(1);
    expect(play.textContent).toBe("Escuchar");
  });

  it("alPaso resalta la columna y al pausar se quita el resaltado", async () => {
    const { reproductor, elemento, buscar } = montar();
    buscar(".juego__play").click();
    await Promise.resolve();
    reproductor.emitirPaso(4);
    expect(elemento.querySelectorAll(".cuadricula__celda--actual")).toHaveLength(4);
    buscar(".juego__play").click();
    expect(elemento.querySelectorAll(".cuadricula__celda--actual")).toHaveLength(0);
  });

  it("el slider de tempo llama setTempo y actualiza el output", () => {
    const { reproductor, buscar } = montar();
    const slider = buscar<HTMLInputElement>(".juego__tempo-slider");
    slider.value = "140";
    slider.dispatchEvent(new Event("input"));
    expect(reproductor.setTempo).toHaveBeenLastCalledWith(140);
    expect(buscar(".juego__tempo-valor").textContent).toBe("140 bpm");
  });

  it("editar la cuadrícula recarga el reproductor", () => {
    const { reproductor, elemento } = montar();
    const cargasAntes = reproductor.cargar.mock.calls.length;
    celda(elemento, "kick", 3).click();
    expect(reproductor.cargar).toHaveBeenCalledTimes(cargasAntes + 1);
  });

  it("corregir y comprobar muestra el acierto, suma puntos y arranca otra ronda", () => {
    const { reproductor, elemento, buscar } = montar();
    corregirCuadricula(elemento);
    const cargasAntes = reproductor.cargar.mock.calls.length;
    buscar(".juego__comprobar").click();
    const mensaje = buscar(".juego__mensaje").textContent!;
    expect(mensaje).not.toBe("");
    expect(mensaje).not.toBe(MENSAJE_FALLO);
    expect(mensaje).toMatch(/^El /);
    expect(buscar(".juego__marcador").textContent).toBe("Nivel 1 · Puntos 100 · Racha 1");
    expect(reproductor.cargar).toHaveBeenCalledTimes(cargasAntes + 1);
    expect(reproductor.cargar.mock.calls.at(-1)![0]).not.toEqual(BEAT.cuadricula);
    buscar(".juego__comprobar").click();
    expect(buscar(".juego__mensaje").textContent).toBe(MENSAJE_FALLO);
  });

  it("un fallo muestra el mensaje de fallo y la ayuda sigue oculta", () => {
    const { buscar } = montar();
    fallar(buscar, 1);
    expect(buscar(".juego__mensaje").textContent).toBe(MENSAJE_FALLO);
    expect(buscar(".juego__ayuda").hidden).toBe(true);
  });

  it("3 fallos seguidos muestran el botón Escuchar el correcto", () => {
    const { buscar } = montar();
    fallar(buscar, 2);
    expect(buscar(".juego__ayuda").hidden).toBe(true);
    fallar(buscar, 1);
    expect(buscar(".juego__ayuda").hidden).toBe(false);
    expect(buscar(".juego__ayuda").textContent).toBe("Escuchar el correcto");
  });

  it("la ayuda carga la cuadrícula original y marca las celdas con error", () => {
    const { reproductor, elemento, buscar } = montar();
    fallar(buscar, 3);
    buscar(".juego__ayuda").click();
    expect(reproductor.cargar).toHaveBeenLastCalledWith(BEAT.cuadricula);
    expect(elemento.querySelectorAll(".cuadricula__celda--error")).toHaveLength(1);
  });

  it("destruir pausa y desuscribe alPaso", async () => {
    const { reproductor, pantalla, elemento, buscar } = montar();
    buscar(".juego__play").click();
    await Promise.resolve();
    pantalla.destruir();
    expect(reproductor.pausar).toHaveBeenCalled();
    reproductor.emitirPaso(2);
    expect(elemento.querySelectorAll(".cuadricula__celda--actual")).toHaveLength(0);
  });
});

/**
 * Pruebas de src/ui/tutorial.ts con un Tutorial fake montado en document.body.
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import { crearTutorialUI } from "../../src/ui/tutorial";
import type { MotivoCierreTutorial, Tutorial } from "../../src/ui/types";

function crearTutorialFake(cantidadDePasos: 0 | 1 | 2): Tutorial {
  return {
    id: "juego-prueba",
    juego: "Juego de prueba",
    ruta: "#/juego-prueba",
    objetivo: "Ganar la ronda",
    aprendes: "Ritmo",
    pasos: Array.from({ length: cantidadDePasos }, (_, indice) => ({
      titulo: `Título ${indice + 1}`,
      texto: `Texto ${indice + 1}`,
      puntos: [],
    })),
  };
}

function montar(tutorial: Tutorial, alCerrar: (motivo: MotivoCierreTutorial) => void) {
  const ui = crearTutorialUI(tutorial, { alCerrar });
  document.body.appendChild(ui.elemento);
  ui.abrir();
  return ui;
}

afterEach(() => {
  document.body.replaceChildren();
});

describe("crearTutorialUI", () => {
  it("tutorial de 2 pasos muestra la pantalla 0 con Anterior oculto", () => {
    const tutorial = crearTutorialFake(2);
    const ui = montar(tutorial, vi.fn());

    expect(ui.elemento.querySelector(".tutorial__progreso")?.textContent).toBe("Pantalla 1 de 2");
    expect(ui.elemento.querySelector(".tutorial__titulo")?.textContent).toBe("Título 1");
    expect((ui.elemento.querySelector(".tutorial__anterior") as HTMLElement).hidden).toBe(true);
    expect(ui.elemento.querySelector(".tutorial__siguiente")?.textContent).toBe("Siguiente");
  });

  it("clic en Siguiente avanza de pantalla y termina en '¡A jugar!' cerrando con 'terminar'", () => {
    const alCerrar = vi.fn();
    const tutorial = crearTutorialFake(2);
    const ui = montar(tutorial, alCerrar);
    const siguiente = ui.elemento.querySelector(".tutorial__siguiente") as HTMLButtonElement;

    siguiente.click();

    expect(ui.elemento.querySelector(".tutorial__progreso")?.textContent).toBe("Pantalla 2 de 2");
    expect(ui.elemento.querySelector(".tutorial__titulo")?.textContent).toBe("Título 2");
    expect(siguiente.textContent).toBe("¡A jugar!");

    siguiente.click();

    expect(alCerrar).toHaveBeenCalledTimes(1);
    expect(alCerrar).toHaveBeenCalledWith("terminar");
    expect(document.body.contains(ui.elemento)).toBe(false);
  });

  it("clic en Saltar tutorial cierra con 'saltar' una sola vez", () => {
    const alCerrar = vi.fn();
    const ui = montar(crearTutorialFake(2), alCerrar);

    (ui.elemento.querySelector(".tutorial__saltar") as HTMLButtonElement).click();

    expect(alCerrar).toHaveBeenCalledTimes(1);
    expect(alCerrar).toHaveBeenCalledWith("saltar");
  });

  it("tecla Escape sobre el elemento cierra con 'saltar'", () => {
    const alCerrar = vi.fn();
    const ui = montar(crearTutorialFake(2), alCerrar);

    ui.elemento.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));

    expect(alCerrar).toHaveBeenCalledWith("saltar");
  });

  it("tutorial de 1 paso muestra 'Pantalla 1 de 1' y Siguiente dice '¡A jugar!'", () => {
    const ui = montar(crearTutorialFake(1), vi.fn());

    expect(ui.elemento.querySelector(".tutorial__progreso")?.textContent).toBe("Pantalla 1 de 1");
    expect(ui.elemento.querySelector(".tutorial__siguiente")?.textContent).toBe("¡A jugar!");
    expect((ui.elemento.querySelector(".tutorial__anterior") as HTMLElement).hidden).toBe(true);
  });

  it("pasos = [] lanza Error", () => {
    expect(() => crearTutorialUI(crearTutorialFake(0), { alCerrar: vi.fn() })).toThrow(
      "El tutorial no tiene pantallas",
    );
  });
});

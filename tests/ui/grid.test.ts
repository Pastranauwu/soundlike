import { describe, expect, it, vi } from "vitest";
import { PISTAS_BATERIA } from "../../src/core/types";
import { crearCuadriculaUI } from "../../src/ui/grid";

describe("crearCuadriculaUI", () => {
  it("renderiza 4 filas x 16 botones con PISTAS_BATERIA y los números 1..16 al pie", () => {
    const cuadriculaUI = crearCuadriculaUI(PISTAS_BATERIA, () => {});

    const filas = cuadriculaUI.elemento.querySelectorAll(".cuadricula__fila");
    expect(filas.length).toBe(4);
    for (const fila of filas) {
      expect(fila.querySelectorAll(".cuadricula__celda").length).toBe(16);
    }

    const numeros = cuadriculaUI.elemento.querySelectorAll(".cuadricula__numero");
    expect(Array.from(numeros).map((n) => n.textContent)).toEqual(
      Array.from({ length: 16 }, (_, i) => String(i + 1)),
    );

    const celdaKick0 = cuadriculaUI.elemento.querySelector(
      '.cuadricula__fila[data-pista="kick"] .cuadricula__celda[data-paso="0"]',
    );
    expect(celdaKick0?.getAttribute("aria-label")).toBe("Bombo paso 1");
  });

  it("clic en la celda data-paso=0 de kick llama alAlternar(kick, 0) y marca --activa", () => {
    const alAlternar = vi.fn();
    const cuadriculaUI = crearCuadriculaUI(PISTAS_BATERIA, alAlternar);

    const celda = cuadriculaUI.elemento.querySelector(
      '.cuadricula__fila[data-pista="kick"] .cuadricula__celda[data-paso="0"]',
    ) as HTMLButtonElement;

    celda.click();

    expect(alAlternar).toHaveBeenCalledWith("kick", 0);
    expect(celda.classList.contains("cuadricula__celda--activa")).toBe(true);
    expect(celda.getAttribute("aria-pressed")).toBe("true");

    celda.click();
    expect(celda.classList.contains("cuadricula__celda--activa")).toBe(false);
    expect(celda.getAttribute("aria-pressed")).toBe("false");
  });

  it("ponerPasoActual(4) resalta las celdas data-paso=4 de todas las pistas; null limpia", () => {
    const cuadriculaUI = crearCuadriculaUI(PISTAS_BATERIA, () => {});

    cuadriculaUI.ponerPasoActual(4);

    const celdasPaso4 = cuadriculaUI.elemento.querySelectorAll(
      '.cuadricula__celda[data-paso="4"]',
    );
    expect(celdasPaso4.length).toBe(4);
    for (const celda of celdasPaso4) {
      expect(celda.classList.contains("cuadricula__celda--actual")).toBe(true);
    }

    cuadriculaUI.ponerPasoActual(null);
    for (const celda of celdasPaso4) {
      expect(celda.classList.contains("cuadricula__celda--actual")).toBe(false);
    }
  });

  it("marcarErrores marca la celda indicada con --error; limpiarErrores la quita", () => {
    const cuadriculaUI = crearCuadriculaUI(PISTAS_BATERIA, () => {});

    cuadriculaUI.marcarErrores([{ pista: "clap", paso: 4 }]);

    const celda = cuadriculaUI.elemento.querySelector(
      '.cuadricula__fila[data-pista="clap"] .cuadricula__celda[data-paso="4"]',
    );
    expect(celda?.classList.contains("cuadricula__celda--error")).toBe(true);

    cuadriculaUI.limpiarErrores();
    expect(celda?.classList.contains("cuadricula__celda--error")).toBe(false);
  });

  it("habilitar(false) deshabilita todos los botones", () => {
    const cuadriculaUI = crearCuadriculaUI(PISTAS_BATERIA, () => {});

    cuadriculaUI.habilitar(false);

    const botones = cuadriculaUI.elemento.querySelectorAll<HTMLButtonElement>(
      ".cuadricula__celda",
    );
    for (const boton of botones) {
      expect(boton.disabled).toBe(true);
    }

    cuadriculaUI.habilitar(true);
    for (const boton of botones) {
      expect(boton.disabled).toBe(false);
    }
  });

  it("ponerCuadricula refleja el estado completo: enciende --activa y aria-pressed", () => {
    const cuadriculaUI = crearCuadriculaUI(PISTAS_BATERIA, () => {});

    const cuadricula = Object.fromEntries(
      PISTAS_BATERIA.map((pista) => [pista.id, new Array(16).fill(false)]),
    );
    cuadricula.kick[0] = true;

    cuadriculaUI.ponerCuadricula(cuadricula);

    const celdaKick0 = cuadriculaUI.elemento.querySelector(
      '.cuadricula__fila[data-pista="kick"] .cuadricula__celda[data-paso="0"]',
    );
    expect(celdaKick0?.classList.contains("cuadricula__celda--activa")).toBe(true);
    expect(celdaKick0?.getAttribute("aria-pressed")).toBe("true");

    const celdaKick1 = cuadriculaUI.elemento.querySelector(
      '.cuadricula__fila[data-pista="kick"] .cuadricula__celda[data-paso="1"]',
    );
    expect(celdaKick1?.classList.contains("cuadricula__celda--activa")).toBe(false);
    expect(celdaKick1?.getAttribute("aria-pressed")).toBe("false");
  });
});

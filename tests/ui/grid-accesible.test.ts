import { afterEach, describe, expect, it } from "vitest";
import { PISTAS_BATERIA } from "../../src/core/types";
import { crearCuadriculaUI } from "../../src/ui/grid";

function obtenerCelda(raiz: HTMLElement, pista: string, paso: number): HTMLButtonElement {
  return raiz.querySelector(
    `.cuadricula__fila[data-pista="${pista}"] .cuadricula__celda[data-paso="${paso}"]`,
  ) as HTMLButtonElement;
}

function presionar(celda: HTMLButtonElement, tecla: string): void {
  celda.dispatchEvent(
    new KeyboardEvent("keydown", { key: tecla, bubbles: true, cancelable: true }),
  );
}

describe("crearCuadriculaUI: accesibilidad", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("al crear, solo kick paso 0 tiene tabindex 0 y las otras 63 celdas -1", () => {
    const cuadriculaUI = crearCuadriculaUI(PISTAS_BATERIA, () => {});
    document.body.appendChild(cuadriculaUI.elemento);

    const botones = cuadriculaUI.elemento.querySelectorAll<HTMLButtonElement>(
      ".cuadricula__celda",
    );
    expect(botones.length).toBe(64);

    const kick0 = obtenerCelda(cuadriculaUI.elemento, "kick", 0);
    expect(kick0.getAttribute("tabindex")).toBe("0");

    const otras = Array.from(botones).filter((boton) => boton !== kick0);
    expect(otras.length).toBe(63);
    for (const boton of otras) {
      expect(boton.getAttribute("tabindex")).toBe("-1");
    }
  });

  it("ArrowRight en kick/0 mueve el foco a kick/1 y actualiza el tabindex itinerante", () => {
    const cuadriculaUI = crearCuadriculaUI(PISTAS_BATERIA, () => {});
    document.body.appendChild(cuadriculaUI.elemento);

    const kick0 = obtenerCelda(cuadriculaUI.elemento, "kick", 0);
    const kick1 = obtenerCelda(cuadriculaUI.elemento, "kick", 1);

    presionar(kick0, "ArrowRight");

    expect(kick1.getAttribute("tabindex")).toBe("0");
    expect(document.activeElement).toBe(kick1);
    expect(kick0.getAttribute("tabindex")).toBe("-1");
  });

  it("ArrowLeft en kick/0 se queda en kick/0", () => {
    const cuadriculaUI = crearCuadriculaUI(PISTAS_BATERIA, () => {});
    document.body.appendChild(cuadriculaUI.elemento);

    const kick0 = obtenerCelda(cuadriculaUI.elemento, "kick", 0);

    presionar(kick0, "ArrowLeft");

    expect(kick0.getAttribute("tabindex")).toBe("0");
    expect(document.activeElement).toBe(kick0);
  });

  it("ArrowDown en kick/3 enfoca clap/3; ArrowUp en kick/3 se queda", () => {
    const cuadriculaUI = crearCuadriculaUI(PISTAS_BATERIA, () => {});
    document.body.appendChild(cuadriculaUI.elemento);

    const kick3 = obtenerCelda(cuadriculaUI.elemento, "kick", 3);
    const clap3 = obtenerCelda(cuadriculaUI.elemento, "clap", 3);

    presionar(kick3, "ArrowDown");
    expect(document.activeElement).toBe(clap3);
    expect(clap3.getAttribute("tabindex")).toBe("0");

    presionar(kick3, "ArrowUp");
    expect(document.activeElement).toBe(kick3);
    expect(kick3.getAttribute("tabindex")).toBe("0");
  });

  it("End en clap/2 va a clap/15 y Home vuelve a clap/0", () => {
    const cuadriculaUI = crearCuadriculaUI(PISTAS_BATERIA, () => {});
    document.body.appendChild(cuadriculaUI.elemento);

    const clap2 = obtenerCelda(cuadriculaUI.elemento, "clap", 2);
    const clap15 = obtenerCelda(cuadriculaUI.elemento, "clap", 15);
    const clap0 = obtenerCelda(cuadriculaUI.elemento, "clap", 0);

    presionar(clap2, "End");
    expect(document.activeElement).toBe(clap15);

    presionar(clap15, "Home");
    expect(document.activeElement).toBe(clap0);
  });

  it("marcarErrores pone aria-label con ', equivocada' y limpiarErrores lo restaura", () => {
    const cuadriculaUI = crearCuadriculaUI(PISTAS_BATERIA, () => {});
    document.body.appendChild(cuadriculaUI.elemento);

    cuadriculaUI.marcarErrores([{ pista: "clap", paso: 4 }]);

    const celda = obtenerCelda(cuadriculaUI.elemento, "clap", 4);
    expect(celda.getAttribute("aria-label")).toBe("Clap paso 5, equivocada");

    cuadriculaUI.limpiarErrores();
    expect(celda.getAttribute("aria-label")).toBe("Clap paso 5");
  });

  it("la raíz y cada fila tienen role=group; la fila kick tiene aria-label Bombo", () => {
    const cuadriculaUI = crearCuadriculaUI(PISTAS_BATERIA, () => {});
    document.body.appendChild(cuadriculaUI.elemento);

    expect(cuadriculaUI.elemento.getAttribute("role")).toBe("group");

    const filas = cuadriculaUI.elemento.querySelectorAll(".cuadricula__fila");
    for (const fila of filas) {
      expect(fila.getAttribute("role")).toBe("group");
    }

    const filaKick = cuadriculaUI.elemento.querySelector(
      '.cuadricula__fila[data-pista="kick"]',
    );
    expect(filaKick?.getAttribute("aria-label")).toBe("Bombo");
  });
});

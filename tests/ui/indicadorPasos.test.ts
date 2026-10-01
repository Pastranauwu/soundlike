import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { PASOS } from "../../src/core/types";
import { crearIndicadorPasos } from "../../src/ui/indicadorPasos";

describe("indicadorPasos", () => {
  let contenedor: HTMLElement;

  beforeEach(() => {
    contenedor = document.createElement("div");
    document.body.appendChild(contenedor);
  });

  afterEach(() => {
    document.body.removeChild(contenedor);
  });

  it("crea 16 pasos por defecto con textos 1..16 y ninguno activo", () => {
    const indicador = crearIndicadorPasos();
    contenedor.appendChild(indicador.elemento);

    const pasos = indicador.elemento.querySelectorAll(".pasos__paso");
    expect(pasos).toHaveLength(16);

    pasos.forEach((paso, i) => {
      expect(paso.textContent).toBe(String(i + 1));
      expect(paso.getAttribute("data-paso")).toBe(String(i));
      expect(paso.classList.contains("pasos__paso--actual")).toBe(false);
      expect(paso.getAttribute("aria-current")).toBeNull();
    });

    expect(indicador.elemento.getAttribute("aria-label")).toBe(
      "Paso actual: ninguno"
    );
  });

  it("marca los tiempos (data-paso 0, 4, 8, 12) con clase --tiempo", () => {
    const indicador = crearIndicadorPasos();
    contenedor.appendChild(indicador.elemento);

    const pasos = indicador.elemento.querySelectorAll(".pasos__paso");
    const tiempos = [0, 4, 8, 12];

    pasos.forEach((paso, i) => {
      if (tiempos.includes(i)) {
        expect(paso.classList.contains("pasos__paso--tiempo")).toBe(true);
      } else {
        expect(paso.classList.contains("pasos__paso--tiempo")).toBe(false);
      }
    });
  });

  it("ponerPasoActual(4) marca solo data-paso=4 como actual", () => {
    const indicador = crearIndicadorPasos();
    contenedor.appendChild(indicador.elemento);

    indicador.ponerPasoActual(4);

    const pasos = indicador.elemento.querySelectorAll(".pasos__paso");
    pasos.forEach((paso, i) => {
      if (i === 4) {
        expect(paso.classList.contains("pasos__paso--actual")).toBe(true);
        expect(paso.getAttribute("aria-current")).toBe("step");
      } else {
        expect(paso.classList.contains("pasos__paso--actual")).toBe(false);
        expect(paso.getAttribute("aria-current")).toBeNull();
      }
    });

    expect(indicador.elemento.getAttribute("aria-label")).toBe(
      "Paso actual: 5 de 16"
    );
  });

  it("alterna correctamente entre ponerPasoActual(4) y ponerPasoActual(5)", () => {
    const indicador = crearIndicadorPasos();
    contenedor.appendChild(indicador.elemento);

    indicador.ponerPasoActual(4);
    let pasos = indicador.elemento.querySelectorAll(".pasos__paso");
    expect(pasos[4].classList.contains("pasos__paso--actual")).toBe(true);
    expect(pasos[5].classList.contains("pasos__paso--actual")).toBe(false);

    indicador.ponerPasoActual(5);
    pasos = indicador.elemento.querySelectorAll(".pasos__paso");
    expect(pasos[4].classList.contains("pasos__paso--actual")).toBe(false);
    expect(pasos[5].classList.contains("pasos__paso--actual")).toBe(true);

    expect(indicador.elemento.getAttribute("aria-label")).toBe(
      "Paso actual: 6 de 16"
    );
  });

  it("ponerPasoActual(null) apaga todo y restaura aria-label", () => {
    const indicador = crearIndicadorPasos();
    contenedor.appendChild(indicador.elemento);

    indicador.ponerPasoActual(4);
    indicador.ponerPasoActual(null);

    const pasos = indicador.elemento.querySelectorAll(".pasos__paso");
    pasos.forEach((paso) => {
      expect(paso.classList.contains("pasos__paso--actual")).toBe(false);
      expect(paso.getAttribute("aria-current")).toBeNull();
    });

    expect(indicador.elemento.getAttribute("aria-label")).toBe(
      "Paso actual: ninguno"
    );
  });

  it("ponerPasoActual(-1) apaga todo", () => {
    const indicador = crearIndicadorPasos();
    contenedor.appendChild(indicador.elemento);

    indicador.ponerPasoActual(0);
    indicador.ponerPasoActual(-1);

    const pasos = indicador.elemento.querySelectorAll(".pasos__paso");
    pasos.forEach((paso) => {
      expect(paso.classList.contains("pasos__paso--actual")).toBe(false);
    });

    expect(indicador.elemento.getAttribute("aria-label")).toBe(
      "Paso actual: ninguno"
    );
  });

  it("trata NaN y fuera de rango como null", () => {
    const indicador = crearIndicadorPasos();
    contenedor.appendChild(indicador.elemento);

    indicador.ponerPasoActual(4);
    expect(
      indicador.elemento.querySelector(".pasos__paso--actual")
    ).toBeTruthy();

    indicador.ponerPasoActual(NaN);
    expect(
      indicador.elemento.querySelector(".pasos__paso--actual")
    ).toBeFalsy();

    indicador.ponerPasoActual(4);
    indicador.ponerPasoActual(16);
    expect(
      indicador.elemento.querySelector(".pasos__paso--actual")
    ).toBeFalsy();

    indicador.ponerPasoActual(4);
    indicador.ponerPasoActual(-2);
    expect(
      indicador.elemento.querySelector(".pasos__paso--actual")
    ).toBeFalsy();
  });

  it("crea un número personalizado de pasos con crearIndicadorPasos(8)", () => {
    const indicador = crearIndicadorPasos(8);
    contenedor.appendChild(indicador.elemento);

    const pasos = indicador.elemento.querySelectorAll(".pasos__paso");
    expect(pasos).toHaveLength(8);

    pasos.forEach((paso, i) => {
      expect(paso.textContent).toBe(String(i + 1));
      expect(paso.getAttribute("data-paso")).toBe(String(i));
    });

    expect(indicador.elemento.getAttribute("aria-label")).toBe(
      "Paso actual: ninguno"
    );
  });

  it("marca tiempos correctamente en indicador de 8 pasos (0, 4)", () => {
    const indicador = crearIndicadorPasos(8);
    contenedor.appendChild(indicador.elemento);

    const pasos = indicador.elemento.querySelectorAll(".pasos__paso");
    const tiempos = [0, 4];

    pasos.forEach((paso, i) => {
      if (tiempos.includes(i)) {
        expect(paso.classList.contains("pasos__paso--tiempo")).toBe(true);
      } else {
        expect(paso.classList.contains("pasos__paso--tiempo")).toBe(false);
      }
    });
  });

  it("ponerPasoActual en indicador de 8 pasos actualiza aria-label con el total correcto", () => {
    const indicador = crearIndicadorPasos(8);
    contenedor.appendChild(indicador.elemento);

    indicador.ponerPasoActual(3);
    expect(indicador.elemento.getAttribute("aria-label")).toBe(
      "Paso actual: 4 de 8"
    );
  });

  it("tiene rol img y estructura correcta del DOM", () => {
    const indicador = crearIndicadorPasos();
    contenedor.appendChild(indicador.elemento);

    expect(indicador.elemento.getAttribute("role")).toBe("img");
    expect(indicador.elemento.classList.contains("pasos")).toBe(true);

    const pasos = indicador.elemento.querySelectorAll(".pasos__paso");
    pasos.forEach((paso) => {
      expect(paso.getAttribute("aria-hidden")).toBe("true");
    });
  });
});

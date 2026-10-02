import { describe, expect, it } from "vitest";
import { obtenerTutorialSinte } from "../../../src/games/explora-el-sinte/tutorial";

describe("obtenerTutorialSinte", () => {
  it("tiene id 'explora-el-sinte' y ruta '#/explora-el-sinte'", () => {
    const tutorial = obtenerTutorialSinte();
    expect(tutorial.id).toBe("explora-el-sinte");
    expect(tutorial.ruta).toBe("#/explora-el-sinte");
  });

  it("tiene juego 'Explora el sinte'", () => {
    const tutorial = obtenerTutorialSinte();
    expect(tutorial.juego).toBe("Explora el sinte");
  });

  it("tiene exactamente 2 pasos", () => {
    const tutorial = obtenerTutorialSinte();
    expect(tutorial.pasos.length).toBe(2);
  });

  it("el primer paso tiene título 'El pad'", () => {
    const tutorial = obtenerTutorialSinte();
    expect(tutorial.pasos[0].titulo).toBe("El pad");
  });

  it("el segundo paso tiene título 'Lecciones y reto'", () => {
    const tutorial = obtenerTutorialSinte();
    expect(tutorial.pasos[1].titulo).toBe("Lecciones y reto");
  });

  it("aprendes contiene 'filtro', 'envolvente' y 'LFO'", () => {
    const tutorial = obtenerTutorialSinte();
    expect(tutorial.aprendes).toContain("filtro");
    expect(tutorial.aprendes).toContain("envolvente");
    expect(tutorial.aprendes).toContain("LFO");
  });

  it("no tiene textos vacíos", () => {
    const tutorial = obtenerTutorialSinte();
    expect(tutorial.id).toBeTruthy();
    expect(tutorial.juego).toBeTruthy();
    expect(tutorial.ruta).toBeTruthy();
    expect(tutorial.objetivo).toBeTruthy();
    expect(tutorial.aprendes).toBeTruthy();
    for (const paso of tutorial.pasos) {
      expect(paso.titulo).toBeTruthy();
      expect(paso.texto).toBeTruthy();
      for (const punto of paso.puntos) {
        expect(punto).toBeTruthy();
      }
    }
  });

  it("cada paso tiene de 1 a 5 puntos", () => {
    const tutorial = obtenerTutorialSinte();
    for (const paso of tutorial.pasos) {
      expect(paso.puntos.length).toBeGreaterThanOrEqual(1);
      expect(paso.puntos.length).toBeLessThanOrEqual(5);
    }
  });

  it("dos llamadas devuelven objetos distintos con el mismo contenido", () => {
    const tutorial1 = obtenerTutorialSinte();
    const tutorial2 = obtenerTutorialSinte();
    expect(tutorial1).not.toBe(tutorial2);
    expect(tutorial1).toEqual(tutorial2);
  });
});

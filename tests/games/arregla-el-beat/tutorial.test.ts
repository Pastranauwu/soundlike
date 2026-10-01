import { describe, expect, it } from "vitest";
import { obtenerTutorial } from "../../../src/games/arregla-el-beat/tutorial";

describe("obtenerTutorial", () => {
  it("tiene id 'arregla-el-beat' y ruta '#/arregla-el-beat'", () => {
    const tutorial = obtenerTutorial();
    expect(tutorial.id).toBe("arregla-el-beat");
    expect(tutorial.ruta).toBe("#/arregla-el-beat");
  });

  it("tiene exactamente 2 pasos", () => {
    const tutorial = obtenerTutorial();
    expect(tutorial.pasos.length).toBe(2);
  });

  it("el primer paso tiene título 'La cuadrícula'", () => {
    const tutorial = obtenerTutorial();
    expect(tutorial.pasos[0].titulo).toBe("La cuadrícula");
  });

  it("el objetivo contiene '3 aciertos seguidos'", () => {
    const tutorial = obtenerTutorial();
    expect(tutorial.objetivo).toContain("3 aciertos seguidos");
  });

  it("no tiene textos vacíos", () => {
    const tutorial = obtenerTutorial();
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

  it("ningún paso tiene más de 5 puntos", () => {
    const tutorial = obtenerTutorial();
    for (const paso of tutorial.pasos) {
      expect(paso.puntos.length).toBeLessThanOrEqual(5);
    }
  });

  it("tiene juego 'Arregla el beat'", () => {
    const tutorial = obtenerTutorial();
    expect(tutorial.juego).toBe("Arregla el beat");
  });

  it("los pasos tienen los títulos exactos especificados", () => {
    const tutorial = obtenerTutorial();
    expect(tutorial.pasos[1].titulo).toBe("Controles y objetivo");
  });
});

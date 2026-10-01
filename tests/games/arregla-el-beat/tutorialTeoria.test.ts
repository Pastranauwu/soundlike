import { describe, expect, it } from "vitest";
import { obtenerTutorialTeoriaBeat } from "../../../src/games/arregla-el-beat/tutorialTeoria";

describe("obtenerTutorialTeoriaBeat", () => {
  it("tiene id 'teoria-beat' y ruta '#/arregla-el-beat'", () => {
    const tutorial = obtenerTutorialTeoriaBeat();
    expect(tutorial.id).toBe("teoria-beat");
    expect(tutorial.ruta).toBe("#/arregla-el-beat");
  });

  it("tiene exactamente 2 pasos", () => {
    const tutorial = obtenerTutorialTeoriaBeat();
    expect(tutorial.pasos.length).toBe(2);
  });

  it("el primer paso tiene título 'Pulso, compás y pasos'", () => {
    const tutorial = obtenerTutorialTeoriaBeat();
    expect(tutorial.pasos[0].titulo).toBe("Pulso, compás y pasos");
  });

  it("el segundo paso tiene título 'Quién toca qué'", () => {
    const tutorial = obtenerTutorialTeoriaBeat();
    expect(tutorial.pasos[1].titulo).toBe("Quién toca qué");
  });

  it("el texto de todos los pasos contiene 'backbeat', '4 tiempos' y 'pasos 5 y 13'", () => {
    const tutorial = obtenerTutorialTeoriaBeat();
    const textoCompleto =
      tutorial.pasos.map((p) => p.texto + " " + p.puntos.join(" ")).join(" ");

    expect(textoCompleto).toContain("backbeat");
    expect(textoCompleto).toContain("4 tiempos");
    expect(textoCompleto).toContain("pasos 5 y 13");
  });

  it("no tiene campos de texto vacíos", () => {
    const tutorial = obtenerTutorialTeoriaBeat();
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
    const tutorial = obtenerTutorialTeoriaBeat();
    for (const paso of tutorial.pasos) {
      expect(paso.puntos.length).toBeLessThanOrEqual(5);
    }
  });

  it("dos llamadas devuelven objetos distintos pero con igual contenido", () => {
    const tutorial1 = obtenerTutorialTeoriaBeat();
    const tutorial2 = obtenerTutorialTeoriaBeat();

    expect(tutorial1).not.toBe(tutorial2);
    expect(tutorial1.pasos).not.toBe(tutorial2.pasos);
    expect(tutorial1).toEqual(tutorial2);
  });
});

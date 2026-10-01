import { describe, it, expect } from "vitest";
import { obtenerTutorialEscalasAcordes } from "../../src/content/escalasYAcordes";

describe("obtenerTutorialEscalasAcordes", () => {
  it("devuelve un Tutorial con id y ruta correctos", () => {
    const tutorial = obtenerTutorialEscalasAcordes();
    expect(tutorial.id).toBe("escalas-y-acordes");
    expect(tutorial.ruta).toBe("");
  });

  it("tiene exactamente 2 pasos", () => {
    const tutorial = obtenerTutorialEscalasAcordes();
    expect(tutorial.pasos).toHaveLength(2);
  });

  it("paso 1 tiene título 'Escalas'", () => {
    const tutorial = obtenerTutorialEscalasAcordes();
    expect(tutorial.pasos[0].titulo).toBe("Escalas");
  });

  it("paso 2 tiene título 'Acordes'", () => {
    const tutorial = obtenerTutorialEscalasAcordes();
    expect(tutorial.pasos[1].titulo).toBe("Acordes");
  });

  it("paso 1 (Escalas) contiene las notas de la escala mayor de Do (C D E F G A B)", () => {
    const tutorial = obtenerTutorialEscalasAcordes();
    const contenidoPaso1 = tutorial.pasos[0].puntos.join(" ");
    expect(contenidoPaso1).toContain("C D E F G A B");
  });

  it("paso 1 (Escalas) contiene las notas de la escala menor natural de La (A B C D E F G)", () => {
    const tutorial = obtenerTutorialEscalasAcordes();
    const contenidoPaso1 = tutorial.pasos[0].puntos.join(" ");
    expect(contenidoPaso1).toContain("A B C D E F G");
  });

  it("paso 1 (Escalas) contiene la frecuencia de A4 (440 Hz)", () => {
    const tutorial = obtenerTutorialEscalasAcordes();
    const contenidoPaso1 = tutorial.pasos[0].puntos.join(" ");
    expect(contenidoPaso1).toContain("440");
  });

  it("paso 1 (Escalas) contiene la frecuencia de C4 (261.63 Hz)", () => {
    const tutorial = obtenerTutorialEscalasAcordes();
    const contenidoPaso1 = tutorial.pasos[0].puntos.join(" ");
    expect(contenidoPaso1).toContain("261.63");
  });

  it("paso 2 (Acordes) contiene las notas del acorde mayor de Do (C E G)", () => {
    const tutorial = obtenerTutorialEscalasAcordes();
    const contenidoPaso2 = tutorial.pasos[1].puntos.join(" ");
    expect(contenidoPaso2).toContain("C E G");
  });

  it("paso 2 (Acordes) contiene las notas del acorde menor de La (A C E)", () => {
    const tutorial = obtenerTutorialEscalasAcordes();
    const contenidoPaso2 = tutorial.pasos[1].puntos.join(" ");
    expect(contenidoPaso2).toContain("A C E");
  });

  it("ningún texto vacío en los puntos", () => {
    const tutorial = obtenerTutorialEscalasAcordes();
    tutorial.pasos.forEach((paso) => {
      paso.puntos.forEach((punto) => {
        expect(punto).toBeTruthy();
        expect(punto.trim()).not.toBe("");
      });
    });
  });

  it("ningún paso tiene más de 5 puntos", () => {
    const tutorial = obtenerTutorialEscalasAcordes();
    tutorial.pasos.forEach((paso) => {
      expect(paso.puntos.length).toBeLessThanOrEqual(5);
    });
  });

  it("dos llamadas devuelven objetos distintos con el mismo contenido", () => {
    const tutorial1 = obtenerTutorialEscalasAcordes();
    const tutorial2 = obtenerTutorialEscalasAcordes();
    expect(tutorial1).not.toBe(tutorial2);
    expect(tutorial1).toEqual(tutorial2);
  });

  it("cada paso tiene texto no vacío", () => {
    const tutorial = obtenerTutorialEscalasAcordes();
    tutorial.pasos.forEach((paso) => {
      expect(paso.texto).toBeTruthy();
      expect(paso.texto.trim()).not.toBe("");
    });
  });

  it("objetivo y aprendes no están vacíos", () => {
    const tutorial = obtenerTutorialEscalasAcordes();
    expect(tutorial.objetivo).toBeTruthy();
    expect(tutorial.aprendes).toBeTruthy();
  });
});

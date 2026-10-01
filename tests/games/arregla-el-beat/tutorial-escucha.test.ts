import { describe, expect, it } from "vitest";
import { obtenerTutorial } from "../../../src/games/arregla-el-beat/tutorial";

describe("obtenerTutorial - escucha a ciegas", () => {
  it("pasos[1].puntos tiene exactamente 5 elementos", () => {
    const tutorial = obtenerTutorial();
    expect(tutorial.pasos[1].puntos.length).toBe(5);
  });

  it("pasos[1].puntos contiene 'Escuchar el beat roto'", () => {
    const tutorial = obtenerTutorial();
    const puntosJunto = tutorial.pasos[1].puntos.join(" ");
    expect(puntosJunto).toContain("Escuchar el beat roto");
  });

  it("pasos[1].puntos contiene 'Escuchar el correcto'", () => {
    const tutorial = obtenerTutorial();
    const puntosJunto = tutorial.pasos[1].puntos.join(" ");
    expect(puntosJunto).toContain("Escuchar el correcto");
  });

  it("pasos[1].puntos contiene 'se oculta'", () => {
    const tutorial = obtenerTutorial();
    const puntosJunto = tutorial.pasos[1].puntos.join(" ");
    expect(puntosJunto).toContain("se oculta");
  });

  it("ningún texto del tutorial contiene 'columna iluminada'", () => {
    const tutorial = obtenerTutorial();
    const todosLosTextos = [
      tutorial.id,
      tutorial.juego,
      tutorial.ruta,
      tutorial.objetivo,
      tutorial.aprendes,
      ...tutorial.pasos.map((p) => p.titulo + " " + p.texto),
      ...tutorial.pasos.flatMap((p) => p.puntos),
    ].join(" ");
    expect(todosLosTextos).not.toContain("columna iluminada");
  });

  it("pasos[0].puntos contiene 'en pausa'", () => {
    const tutorial = obtenerTutorial();
    const puntosJunto = tutorial.pasos[0].puntos.join(" ");
    expect(puntosJunto).toContain("en pausa");
  });

  it("id es 'arregla-el-beat' y pasos.length es 2", () => {
    const tutorial = obtenerTutorial();
    expect(tutorial.id).toBe("arregla-el-beat");
    expect(tutorial.pasos.length).toBe(2);
  });
});

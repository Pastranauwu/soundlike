import { describe, it, expect } from "vitest";
import {
  crearPuntaje,
  registrarAcierto,
  registrarFallo,
  PUNTOS_POR_ACIERTO,
} from "../../src/core/scoring";
import { NIVEL_MAX } from "../../src/core/types";

describe("scoring", () => {
  describe("crearPuntaje", () => {
    it("devuelve puntaje inicial con 0 puntos, racha 0 y nivel 1", () => {
      const puntaje = crearPuntaje();
      expect(puntaje).toEqual({
        puntos: 0,
        racha: 0,
        nivel: 1,
      });
    });
  });

  describe("registrarAcierto", () => {
    it("suma puntos según el nivel actual (100 * nivel)", () => {
      const puntaje = { puntos: 0, racha: 0, nivel: 1 };
      const resultado = registrarAcierto(puntaje);
      expect(resultado.puntos).toBe(100);
      expect(resultado.racha).toBe(1);
      expect(resultado.nivel).toBe(1);
    });

    it("suma el nivel actual de puntos (100 * nivel=2)", () => {
      const puntaje = { puntos: 0, racha: 0, nivel: 2 };
      const resultado = registrarAcierto(puntaje);
      expect(resultado.puntos).toBe(200);
      expect(resultado.racha).toBe(1);
      expect(resultado.nivel).toBe(2);
    });

    it("suma el nivel actual de puntos (100 * nivel=3)", () => {
      const puntaje = { puntos: 0, racha: 0, nivel: 3 };
      const resultado = registrarAcierto(puntaje);
      expect(resultado.puntos).toBe(300);
      expect(resultado.racha).toBe(1);
      expect(resultado.nivel).toBe(3);
    });

    it("incrementa la racha en 1", () => {
      const puntaje = { puntos: 100, racha: 2, nivel: 1 };
      const resultado = registrarAcierto(puntaje);
      expect(resultado.racha).toBe(3);
    });

    it("sube de nivel cuando racha es múltiplo de 3", () => {
      const puntaje = { puntos: 200, racha: 2, nivel: 1 };
      const resultado = registrarAcierto(puntaje);
      expect(resultado.nivel).toBe(2);
      expect(resultado.racha).toBe(3);
    });

    it("no sube de nivel si racha no es múltiplo de 3", () => {
      const puntaje = { puntos: 0, racha: 1, nivel: 2 };
      const resultado = registrarAcierto(puntaje);
      expect(resultado.nivel).toBe(2);
      expect(resultado.racha).toBe(2);
    });

    it("respeta el techo de nivel (NIVEL_MAX)", () => {
      const puntaje = { puntos: 0, racha: 2, nivel: 3 };
      const resultado = registrarAcierto(puntaje);
      expect(resultado.nivel).toBe(3);
      expect(resultado.racha).toBe(3);
      expect(resultado.puntos).toBe(300);
    });

    it("puede subir de nivel 2 a 3", () => {
      const puntaje = { puntos: 100, racha: 2, nivel: 2 };
      const resultado = registrarAcierto(puntaje);
      expect(resultado.nivel).toBe(3);
      expect(resultado.racha).toBe(3);
      expect(resultado.puntos).toBe(300);
    });

    it("respeta nivelMax personalizado", () => {
      const puntaje = { puntos: 0, racha: 2, nivel: 2 };
      const resultado = registrarAcierto(puntaje, 2);
      expect(resultado.nivel).toBe(2);
      expect(resultado.racha).toBe(3);
    });

    it("acumula puntos correctamente", () => {
      const puntaje = { puntos: 500, racha: 1, nivel: 2 };
      const resultado = registrarAcierto(puntaje);
      expect(resultado.puntos).toBe(700);
    });

    it("devuelve un objeto nuevo sin mutar el original", () => {
      const original = { puntos: 100, racha: 1, nivel: 1 };
      const resultado = registrarAcierto(original);
      expect(original).toEqual({ puntos: 100, racha: 1, nivel: 1 });
      expect(resultado).not.toBe(original);
    });

    it("caso del contrato: {puntos:0,racha:0,nivel:1} -> {puntos:100,racha:1,nivel:1}", () => {
      const resultado = registrarAcierto({ puntos: 0, racha: 0, nivel: 1 });
      expect(resultado).toEqual({ puntos: 100, racha: 1, nivel: 1 });
    });

    it("caso del contrato: {puntos:200,racha:2,nivel:1} -> {puntos:300,racha:3,nivel:2}", () => {
      const resultado = registrarAcierto({ puntos: 200, racha: 2, nivel: 1 });
      expect(resultado).toEqual({ puntos: 300, racha: 3, nivel: 2 });
    });

    it("caso del contrato: {puntos:0,racha:2,nivel:3} -> {puntos:300,racha:3,nivel:3} (techo)", () => {
      const resultado = registrarAcierto({ puntos: 0, racha: 2, nivel: 3 });
      expect(resultado).toEqual({ puntos: 300, racha: 3, nivel: 3 });
    });

    it("caso del contrato: {puntos:0,racha:1,nivel:2} -> {puntos:200,racha:2,nivel:2}", () => {
      const resultado = registrarAcierto({ puntos: 0, racha: 1, nivel: 2 });
      expect(resultado).toEqual({ puntos: 200, racha: 2, nivel: 2 });
    });
  });

  describe("registrarFallo", () => {
    it("resetea la racha a 0 sin perder puntos ni nivel", () => {
      const puntaje = { puntos: 300, racha: 2, nivel: 2 };
      const resultado = registrarFallo(puntaje);
      expect(resultado).toEqual({
        puntos: 300,
        racha: 0,
        nivel: 2,
      });
    });

    it("resetea racha a 0 desde nivel 3", () => {
      const puntaje = { puntos: 500, racha: 3, nivel: 3 };
      const resultado = registrarFallo(puntaje);
      expect(resultado).toEqual({
        puntos: 500,
        racha: 0,
        nivel: 3,
      });
    });

    it("resetea racha a 0 desde racha 0 (sin cambio)", () => {
      const puntaje = { puntos: 100, racha: 0, nivel: 1 };
      const resultado = registrarFallo(puntaje);
      expect(resultado).toEqual({
        puntos: 100,
        racha: 0,
        nivel: 1,
      });
    });

    it("devuelve un objeto nuevo sin mutar el original", () => {
      const original = { puntos: 300, racha: 2, nivel: 2 };
      const resultado = registrarFallo(original);
      expect(original).toEqual({ puntos: 300, racha: 2, nivel: 2 });
      expect(resultado).not.toBe(original);
    });

    it("caso del contrato: {puntos:300,racha:2,nivel:2} -> {puntos:300,racha:0,nivel:2}", () => {
      const resultado = registrarFallo({ puntos: 300, racha: 2, nivel: 2 });
      expect(resultado).toEqual({ puntos: 300, racha: 0, nivel: 2 });
    });
  });

  describe("integración entre funciones", () => {
    it("secuencia: 3 aciertos seguidos suben de nivel, el 4to es con nivel nuevo", () => {
      let puntaje = crearPuntaje();
      expect(puntaje.nivel).toBe(1);
      expect(puntaje.racha).toBe(0);

      puntaje = registrarAcierto(puntaje);
      expect(puntaje.puntos).toBe(100);
      expect(puntaje.racha).toBe(1);
      expect(puntaje.nivel).toBe(1);

      puntaje = registrarAcierto(puntaje);
      expect(puntaje.puntos).toBe(200);
      expect(puntaje.racha).toBe(2);
      expect(puntaje.nivel).toBe(1);

      puntaje = registrarAcierto(puntaje);
      expect(puntaje.puntos).toBe(300);
      expect(puntaje.racha).toBe(3);
      expect(puntaje.nivel).toBe(2);

      puntaje = registrarAcierto(puntaje);
      expect(puntaje.puntos).toBe(500);
      expect(puntaje.racha).toBe(4);
      expect(puntaje.nivel).toBe(2);
    });

    it("fallo resetea racha pero permite seguir acumulando puntos", () => {
      let puntaje = crearPuntaje();
      puntaje = registrarAcierto(puntaje); // racha=1, puntos=100
      puntaje = registrarAcierto(puntaje); // racha=2, puntos=200
      puntaje = registrarFallo(puntaje); // racha=0, puntos=200

      expect(puntaje.racha).toBe(0);
      expect(puntaje.puntos).toBe(200);

      puntaje = registrarAcierto(puntaje); // racha=1, puntos=300
      expect(puntaje.racha).toBe(1);
      expect(puntaje.puntos).toBe(300);
    });
  });
});

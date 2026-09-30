import { describe, it, expect } from "vitest";
import {
  crearCuadricula,
  alternarPaso,
  celdasDistintas,
  cuadriculasIguales,
  validarTempo,
} from "../../src/core/sequencer";
import { PISTAS_BATERIA, PASOS, TEMPO_MIN, TEMPO_MAX } from "../../src/core/types";

describe("sequencer", () => {
  describe("crearCuadricula", () => {
    it("crea una cuadrícula vacía con las pistas de batería", () => {
      const c = crearCuadricula(PISTAS_BATERIA);
      expect(Object.keys(c)).toHaveLength(4);
      expect(Object.keys(c)).toEqual(["kick", "clap", "closed-hat", "open-hat"]);
      Object.values(c).forEach((fila) => {
        expect(fila).toHaveLength(16);
        expect(fila).toEqual(new Array(16).fill(false));
      });
    });

    it("devuelve objeto vacío para un array vacío", () => {
      const c = crearCuadricula([]);
      expect(c).toEqual({});
    });

    it("lanza error si hay pistas con ids repetidos", () => {
      expect(() => {
        crearCuadricula([
          { id: "a", nombre: "A" },
          { id: "a", nombre: "B" },
        ]);
      }).toThrow();
    });

    it("crea arrays de exactamente 16 pasos", () => {
      const c = crearCuadricula([
        { id: "test", nombre: "Test" },
      ]);
      expect(c.test).toHaveLength(16);
    });
  });

  describe("alternarPaso", () => {
    it("alterna un paso de false a true sin mutar la original", () => {
      const c = crearCuadricula(PISTAS_BATERIA);
      const c2 = alternarPaso(c, "kick", 0);
      expect(c.kick[0]).toBe(false);
      expect(c2.kick[0]).toBe(true);
    });

    it("alterna de true a false al llamar nuevamente", () => {
      const c = crearCuadricula(PISTAS_BATERIA);
      const c2 = alternarPaso(c, "kick", 0);
      const c3 = alternarPaso(c2, "kick", 0);
      expect(c3.kick[0]).toBe(false);
    });

    it("lanza error si el paso está fuera de rango (>= 16)", () => {
      const c = crearCuadricula(PISTAS_BATERIA);
      expect(() => alternarPaso(c, "kick", 16)).toThrow();
    });

    it("lanza error si el paso es negativo", () => {
      const c = crearCuadricula(PISTAS_BATERIA);
      expect(() => alternarPaso(c, "kick", -1)).toThrow();
    });

    it("lanza error si la pista no existe", () => {
      const c = crearCuadricula(PISTAS_BATERIA);
      expect(() => alternarPaso(c, "tom", 0)).toThrow();
    });

    it("devuelve una cuadrícula nueva sin alterar la original", () => {
      const c = crearCuadricula(PISTAS_BATERIA);
      const original = JSON.parse(JSON.stringify(c));
      alternarPaso(c, "clap", 5);
      expect(c).toEqual(original);
    });

    it("alterna correctamente pasos en diferentes posiciones", () => {
      const c = crearCuadricula(PISTAS_BATERIA);
      const c2 = alternarPaso(c, "clap", 7);
      expect(c2.clap[7]).toBe(true);
      expect(c2.clap[6]).toBe(false);
      expect(c2.clap[8]).toBe(false);
    });
  });

  describe("celdasDistintas", () => {
    it("devuelve array vacío si son idénticas", () => {
      const c = crearCuadricula(PISTAS_BATERIA);
      expect(celdasDistintas(c, c)).toEqual([]);
    });

    it("detecta una diferencia en una celda", () => {
      const c = crearCuadricula(PISTAS_BATERIA);
      const c2 = alternarPaso(c, "kick", 3);
      const diff = celdasDistintas(c, c2);
      expect(diff).toEqual([{ pista: "kick", paso: 3 }]);
    });

    it("detecta múltiples diferencias en orden: primero por pista, luego por paso", () => {
      const c = crearCuadricula(PISTAS_BATERIA);
      const c2 = alternarPaso(c, "clap", 4);
      const c3 = alternarPaso(c2, "clap", 12);
      const diff = celdasDistintas(c, c3);
      expect(diff).toEqual([
        { pista: "clap", paso: 4 },
        { pista: "clap", paso: 12 },
      ]);
    });

    it("mantiene orden de pistas del primer argumento", () => {
      const c1 = crearCuadricula([
        { id: "a", nombre: "A" },
        { id: "b", nombre: "B" },
      ]);
      const c2 = alternarPaso(c1, "b", 0);
      const c2b = alternarPaso(c2, "a", 1);
      const diff = celdasDistintas(c1, c2b);
      expect(diff[0].pista).toBe("a");
      expect(diff[1].pista).toBe("b");
    });

    it("solo compara pistas presentes en el primer argumento", () => {
      const c1 = crearCuadricula([{ id: "a", nombre: "A" }]);
      const c2 = crearCuadricula([
        { id: "a", nombre: "A" },
        { id: "b", nombre: "B" },
      ]);
      const c2_alt = alternarPaso(c2, "b", 0);
      const diff = celdasDistintas(c1, c2_alt);
      expect(diff).toEqual([]);
    });
  });

  describe("cuadriculasIguales", () => {
    it("devuelve true para la misma cuadrícula", () => {
      const c = crearCuadricula(PISTAS_BATERIA);
      expect(cuadriculasIguales(c, c)).toBe(true);
    });

    it("devuelve true para dos cuadrículas con idéntico contenido", () => {
      const c1 = crearCuadricula(PISTAS_BATERIA);
      const c2 = crearCuadricula(PISTAS_BATERIA);
      expect(cuadriculasIguales(c1, c2)).toBe(true);
    });

    it("devuelve false después de alternar un paso", () => {
      const c1 = crearCuadricula(PISTAS_BATERIA);
      const c2 = alternarPaso(c1, "kick", 0);
      expect(cuadriculasIguales(c1, c2)).toBe(false);
    });

    it("devuelve false si dos cuadrículas tienen diferentes pistas activas", () => {
      const c1 = crearCuadricula(PISTAS_BATERIA);
      const c2 = alternarPaso(crearCuadricula(PISTAS_BATERIA), "kick", 5);
      expect(cuadriculasIguales(c1, c2)).toBe(false);
    });
  });

  describe("validarTempo", () => {
    it("devuelve el mismo número si es válido", () => {
      expect(validarTempo(120)).toBe(120);
    });

    it("acepta el tempo mínimo (60)", () => {
      expect(validarTempo(60)).toBe(60);
    });

    it("acepta el tempo máximo (180)", () => {
      expect(validarTempo(180)).toBe(180);
    });

    it("lanza error si el tempo es menor al mínimo (59)", () => {
      expect(() => validarTempo(59)).toThrow();
    });

    it("lanza error si el tempo es mayor al máximo (181)", () => {
      expect(() => validarTempo(181)).toThrow();
    });

    it("lanza error para NaN", () => {
      expect(() => validarTempo(NaN)).toThrow();
    });

    it("lanza error para infinito positivo", () => {
      expect(() => validarTempo(Infinity)).toThrow();
    });

    it("lanza error para infinito negativo", () => {
      expect(() => validarTempo(-Infinity)).toThrow();
    });

    it("lanza error para números muy pequeños", () => {
      expect(() => validarTempo(0)).toThrow();
    });

    it("lanza error para números negativos", () => {
      expect(() => validarTempo(-120)).toThrow();
    });
  });
});

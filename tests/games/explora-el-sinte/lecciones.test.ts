import { describe, it, expect } from "vitest";
import { obtenerLecciones } from "../../../src/games/explora-el-sinte/lecciones";

describe("obtenerLecciones", () => {
  it("devuelve 6 lecciones", () => {
    const lecciones = obtenerLecciones();
    expect(lecciones).toHaveLength(6);
  });

  it("títulos correctos en orden", () => {
    const lecciones = obtenerLecciones();
    const titulos = lecciones.map((l) => l.titulo);
    expect(titulos).toEqual([
      "Tono y volumen",
      "Forma de onda y tono",
      "Filtro: corte y resonancia",
      "Envolvente: ataque y relajación",
      "LFO: velocidad y profundidad",
      "Patio libre",
    ]);
  });

  it("ejes correctos en cada lección", () => {
    const lecciones = obtenerLecciones();
    expect(lecciones[1].ejes).toEqual({ x: "forma", y: "tono" });
    expect(lecciones[2].ejes).toEqual({ x: "corte", y: "resonancia" });
    expect(lecciones[4].ejes).toEqual({ x: "lfoVelocidad", y: "lfoProfundidad" });
  });

  it("cada lección tiene 2 o 3 frases no vacías", () => {
    const lecciones = obtenerLecciones();
    for (const leccion of lecciones) {
      expect(leccion.frases.length).toBeGreaterThanOrEqual(2);
      expect(leccion.frases.length).toBeLessThanOrEqual(3);
      for (const frase of leccion.frases) {
        expect(frase).toBeTruthy();
        expect(frase.length).toBeGreaterThan(0);
      }
    }
  });

  it("primeras 5 lecciones tienen reto y explicación de acierto", () => {
    const lecciones = obtenerLecciones();
    for (let i = 0; i < 5; i++) {
      expect(lecciones[i].conReto).toBe(true);
      expect(lecciones[i].explicacionAcierto).toBeTruthy();
      expect(lecciones[i].explicacionAcierto.length).toBeGreaterThan(0);
    }
  });

  it("última lección es libre sin reto", () => {
    const lecciones = obtenerLecciones();
    const ultima = lecciones[5];
    expect(ultima.libre).toBe(true);
    expect(ultima.conReto).toBe(false);
    expect(ultima.explicacionAcierto).toBe("");
  });

  it("ids únicos", () => {
    const lecciones = obtenerLecciones();
    const ids = lecciones.map((l) => l.id);
    const idsUnicos = new Set(ids);
    expect(idsUnicos.size).toBe(6);
  });

  it("mutar ajustes de una lección no afecta llamadas posteriores", () => {
    const primero = obtenerLecciones();
    const ajustesOriginales = { ...primero[0].ajustes };

    // Mutar los ajustes
    primero[0].ajustes.corte = 9999;

    // Obtener nuevas lecciones
    const segundo = obtenerLecciones();

    // El ajuste no debe cambiar
    expect(segundo[0].ajustes.corte).not.toBe(9999);
    expect(segundo[0].ajustes.corte).toBe(ajustesOriginales.corte);
  });

  it("ids correctos", () => {
    const lecciones = obtenerLecciones();
    const ids = lecciones.map((l) => l.id);
    expect(ids).toEqual([
      "tono-volumen",
      "forma-tono",
      "filtro",
      "envolvente",
      "lfo",
      "patio-libre",
    ]);
  });

  it("primeras 5 lecciones no son libres", () => {
    const lecciones = obtenerLecciones();
    for (let i = 0; i < 5; i++) {
      expect(lecciones[i].libre).toBe(false);
    }
  });
});

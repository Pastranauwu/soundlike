import { describe, expect, it } from "vitest";
import { alternarEscucha, vistaEscucha } from "../../../src/games/arregla-el-beat/escucha";

describe("alternarEscucha", () => {
  it('("ninguna", "roto") -> "roto"', () => {
    expect(alternarEscucha("ninguna", "roto")).toBe("roto");
  });

  it('("roto", "roto") -> "ninguna"', () => {
    expect(alternarEscucha("roto", "roto")).toBe("ninguna");
  });

  it('("roto", "correcto") -> "correcto"', () => {
    expect(alternarEscucha("roto", "correcto")).toBe("correcto");
  });

  it('("correcto", "correcto") -> "ninguna"', () => {
    expect(alternarEscucha("correcto", "correcto")).toBe("ninguna");
  });
});

describe("vistaEscucha", () => {
  it('("ninguna").cuadriculaVisible -> true', () => {
    expect(vistaEscucha("ninguna").cuadriculaVisible).toBe(true);
  });

  it('("ninguna").etiquetaRoto -> "Escuchar el beat roto"', () => {
    expect(vistaEscucha("ninguna").etiquetaRoto).toBe("Escuchar el beat roto");
  });

  it('("ninguna").etiquetaCorrecto -> "Escuchar el correcto"', () => {
    expect(vistaEscucha("ninguna").etiquetaCorrecto).toBe("Escuchar el correcto");
  });

  it('("ninguna").estado -> "En pausa. Elige qué beat escuchar: el paso que suena se ilumina aquí."', () => {
    expect(vistaEscucha("ninguna").estado).toBe(
      "En pausa. Elige qué beat escuchar: el paso que suena se ilumina aquí.",
    );
  });

  it('("roto").etiquetaRoto -> "Pausar"', () => {
    expect(vistaEscucha("roto").etiquetaRoto).toBe("Pausar");
  });

  it('("roto").etiquetaCorrecto -> "Escuchar el correcto"', () => {
    expect(vistaEscucha("roto").etiquetaCorrecto).toBe("Escuchar el correcto");
  });

  it('("roto").cuadriculaVisible -> false', () => {
    expect(vistaEscucha("roto").cuadriculaVisible).toBe(false);
  });

  it('("roto").estado -> "Suena el beat roto. La cuadrícula se oculta mientras escuchas: sigue el paso iluminado."', () => {
    expect(vistaEscucha("roto").estado).toBe(
      "Suena el beat roto. La cuadrícula se oculta mientras escuchas: sigue el paso iluminado.",
    );
  });

  it('("correcto").etiquetaRoto -> "Escuchar el beat roto"', () => {
    expect(vistaEscucha("correcto").etiquetaRoto).toBe("Escuchar el beat roto");
  });

  it('("correcto").etiquetaCorrecto -> "Pausar"', () => {
    expect(vistaEscucha("correcto").etiquetaCorrecto).toBe("Pausar");
  });

  it('("correcto").cuadriculaVisible -> false', () => {
    expect(vistaEscucha("correcto").cuadriculaVisible).toBe(false);
  });

  it('("correcto").estado -> comienza con "Suena el beat correcto."', () => {
    const estado = vistaEscucha("correcto").estado;
    expect(estado.startsWith("Suena el beat correcto.")).toBe(true);
  });

  it('vistaEscucha devuelve objeto nuevo en cada llamada', () => {
    const vista1 = vistaEscucha("ninguna");
    const vista2 = vistaEscucha("ninguna");
    expect(vista1).not.toBe(vista2);
  });
});

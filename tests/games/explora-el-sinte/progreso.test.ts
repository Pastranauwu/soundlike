import { describe, it, expect, beforeEach } from "vitest";
import { crearProgreso, CLAVE_PROGRESO_SINTE } from "../../../src/games/explora-el-sinte/progreso";

describe("progreso", () => {
  let almacenFake: { [key: string]: string };

  beforeEach(() => {
    almacenFake = {};
  });

  function crearStorageFake(): Storage {
    return {
      getItem(clave: string) {
        return almacenFake[clave] ?? null;
      },
      setItem(clave: string, valor: string) {
        almacenFake[clave] = valor;
      },
      removeItem(clave: string) {
        delete almacenFake[clave];
      },
      clear() {
        almacenFake = {};
      },
      key(indice: number) {
        return Object.keys(almacenFake)[indice] ?? null;
      },
      get length() {
        return Object.keys(almacenFake).length;
      },
    };
  }

  it("almacén vacío: resueltas retorna []", () => {
    const storage = crearStorageFake();
    const progreso = crearProgreso(storage);

    expect(progreso.resueltas()).toEqual([]);
  });

  it("marcarResuelta agrega y resueltas retorna la lista", () => {
    const storage = crearStorageFake();
    const progreso = crearProgreso(storage);

    progreso.marcarResuelta("filtro");

    expect(progreso.resueltas()).toEqual(["filtro"]);
    expect(storage.getItem(CLAVE_PROGRESO_SINTE)).toBe('["filtro"]');
  });

  it("marcar dos veces el mismo id: sin duplicados", () => {
    const storage = crearStorageFake();
    const progreso = crearProgreso(storage);

    progreso.marcarResuelta("filtro");
    progreso.marcarResuelta("filtro");

    expect(progreso.resueltas()).toEqual(["filtro"]);
    expect(storage.getItem(CLAVE_PROGRESO_SINTE)).toBe('["filtro"]');
  });

  it("JSON corrupto: resueltas retorna [] sin lanzar", () => {
    const storage = crearStorageFake();
    almacenFake[CLAVE_PROGRESO_SINTE] = "{no-json";
    const progreso = crearProgreso(storage);

    expect(() => progreso.resueltas()).not.toThrow();
    expect(progreso.resueltas()).toEqual([]);
  });

  it("almacén null: marcarResuelta y resueltas usan memoria", () => {
    const progreso = crearProgreso(null);

    expect(progreso.resueltas()).toEqual([]);
    progreso.marcarResuelta("filtro");
    expect(progreso.resueltas()).toEqual(["filtro"]);
  });

  it("otro crearProgreso sobre el mismo almacén carga datos guardados", () => {
    const storage = crearStorageFake();
    const progreso1 = crearProgreso(storage);

    progreso1.marcarResuelta("filtro");

    const progreso2 = crearProgreso(storage);
    expect(progreso2.resueltas()).toEqual(["filtro"]);
  });

  it("múltiples lecciones resueltas", () => {
    const storage = crearStorageFake();
    const progreso = crearProgreso(storage);

    progreso.marcarResuelta("tono-volumen");
    progreso.marcarResuelta("filtro");
    progreso.marcarResuelta("envolvente");

    expect(progreso.resueltas()).toEqual(["tono-volumen", "filtro", "envolvente"]);
    expect(storage.getItem(CLAVE_PROGRESO_SINTE)).toBe('["tono-volumen","filtro","envolvente"]');
  });

  it("cargar lista existente del almacén", () => {
    const storage = crearStorageFake();
    almacenFake[CLAVE_PROGRESO_SINTE] = '["tono-volumen","filtro"]';
    const progreso = crearProgreso(storage);

    expect(progreso.resueltas()).toEqual(["tono-volumen", "filtro"]);
  });

  it("setItem lanzando: se sigue recordando en memoria", () => {
    const storage: Storage = {
      getItem: (clave: string) => almacenFake[clave] ?? null,
      setItem: () => {
        throw new Error("cuota agotada");
      },
      removeItem: () => {},
      clear: () => {},
      key: () => null,
      length: 0,
    };

    const progreso = crearProgreso(storage);
    expect(() => progreso.marcarResuelta("filtro")).not.toThrow();
    expect(progreso.resueltas()).toEqual(["filtro"]);
  });

  it("resueltas() devuelve una copia, no la Set original", () => {
    const storage = crearStorageFake();
    const progreso = crearProgreso(storage);

    progreso.marcarResuelta("filtro");

    const copia1 = progreso.resueltas();
    const copia2 = progreso.resueltas();

    expect(copia1).not.toBe(copia2);
    expect(copia1).toEqual(copia2);
  });
});

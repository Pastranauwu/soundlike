import { describe, it, expect, beforeEach } from "vitest";
import { crearRegistroTutoriales, CLAVE_TUTORIALES_VISTOS } from "../../src/ui/registroTutoriales";

describe("registroTutoriales", () => {
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

  it("almacén vacío: visto retorna false", () => {
    const storage = crearStorageFake();
    const registro = crearRegistroTutoriales(storage);

    expect(registro.visto("arregla-el-beat")).toBe(false);
  });

  it("marcarVisto agrega y visto retorna true", () => {
    const storage = crearStorageFake();
    const registro = crearRegistroTutoriales(storage);

    registro.marcarVisto("arregla-el-beat");

    expect(registro.visto("arregla-el-beat")).toBe(true);
    expect(storage.getItem(CLAVE_TUTORIALES_VISTOS)).toBe('["arregla-el-beat"]');
  });

  it("marcar dos veces el mismo id: sin duplicados", () => {
    const storage = crearStorageFake();
    const registro = crearRegistroTutoriales(storage);

    registro.marcarVisto("arregla-el-beat");
    registro.marcarVisto("arregla-el-beat");

    expect(storage.getItem(CLAVE_TUTORIALES_VISTOS)).toBe('["arregla-el-beat"]');
  });

  it("JSON corrupto: visto retorna false sin lanzar", () => {
    const storage = crearStorageFake();
    almacenFake[CLAVE_TUTORIALES_VISTOS] = "{no-json";
    const registro = crearRegistroTutoriales(storage);

    expect(() => registro.visto("x")).not.toThrow();
    expect(registro.visto("x")).toBe(false);
  });

  it("almacén null: marcarVisto y visto usan memoria", () => {
    const registro = crearRegistroTutoriales(null);

    expect(registro.visto("x")).toBe(false);
    registro.marcarVisto("x");
    expect(registro.visto("x")).toBe(true);
  });

  it("múltiples tutoriales diferentes", () => {
    const storage = crearStorageFake();
    const registro = crearRegistroTutoriales(storage);

    registro.marcarVisto("arregla-el-beat");
    registro.marcarVisto("otro-juego");

    expect(registro.visto("arregla-el-beat")).toBe(true);
    expect(registro.visto("otro-juego")).toBe(true);
    expect(registro.visto("desconocido")).toBe(false);
    expect(storage.getItem(CLAVE_TUTORIALES_VISTOS)).toBe('["arregla-el-beat","otro-juego"]');
  });

  it("cargar lista existente del almacén", () => {
    const storage = crearStorageFake();
    almacenFake[CLAVE_TUTORIALES_VISTOS] = '["arregla-el-beat"]';
    const registro = crearRegistroTutoriales(storage);

    expect(registro.visto("arregla-el-beat")).toBe(true);
    expect(registro.visto("otro")).toBe(false);
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

    const registro = crearRegistroTutoriales(storage);
    expect(() => registro.marcarVisto("x")).not.toThrow();
    expect(registro.visto("x")).toBe(true);
  });
});

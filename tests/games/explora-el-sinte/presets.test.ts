import { describe, it, expect, beforeEach } from "vitest";
import { crearPresets, CLAVE_PRESETS_PATIO } from "../../../src/games/explora-el-sinte/presets";
import type { PresetPatio } from "../../../src/games/explora-el-sinte/types";

describe("presets del patio libre", () => {
  let almacenFake: { [clave: string]: string };

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

  function crearPreset(nombre: string): PresetPatio {
    return {
      nombre,
      idEstilo: "noventero",
      ejes: { x: "tono", y: "volumen" },
      posicion: { x: 0.25, y: 0.5 },
    };
  }

  it("almacén vacío: listar retorna []", () => {
    const presets = crearPresets(crearStorageFake());

    expect(presets.listar()).toEqual([]);
  });

  it("almacén null: listar retorna [] sin lanzar", () => {
    const presets = crearPresets(null);

    expect(presets.listar()).toEqual([]);
  });

  it("guardar dos presets distintos: listar los devuelve en orden de guardado", () => {
    const presets = crearPresets(crearStorageFake());

    presets.guardar(crearPreset("A"));
    presets.guardar(crearPreset("B"));

    expect(presets.listar().map((preset) => preset.nombre)).toEqual(["A", "B"]);
    expect(presets.listar()[0]).toEqual(crearPreset("A"));
  });

  it("guardar un preset lo escribe en el almacén con la clave del juego", () => {
    const storage = crearStorageFake();
    const presets = crearPresets(storage);

    presets.guardar(crearPreset("A"));

    expect(JSON.parse(storage.getItem(CLAVE_PRESETS_PATIO) ?? "null")).toEqual([crearPreset("A")]);
  });

  it("guardar de nuevo el mismo nombre: reemplaza los datos sin duplicar y sin cambiar de posición", () => {
    const presets = crearPresets(crearStorageFake());
    const actualizado: PresetPatio = {
      nombre: "A",
      idEstilo: "acid",
      ejes: { x: "corte", y: "resonancia" },
      posicion: { x: 0.8, y: 0.1 },
    };

    presets.guardar(crearPreset("A"));
    presets.guardar(crearPreset("B"));
    presets.guardar(actualizado);

    expect(presets.listar().map((preset) => preset.nombre)).toEqual(["A", "B"]);
    expect(presets.listar()[0]).toEqual(actualizado);
  });

  it("borrar quita el preset con ese nombre", () => {
    const presets = crearPresets(crearStorageFake());

    presets.guardar(crearPreset("A"));
    presets.guardar(crearPreset("B"));
    presets.borrar("A");

    expect(presets.listar().map((preset) => preset.nombre)).toEqual(["B"]);
  });

  it("borrar un nombre que no existe: no lanza y no cambia la lista", () => {
    const presets = crearPresets(crearStorageFake());
    presets.guardar(crearPreset("B"));

    expect(() => presets.borrar("Z")).not.toThrow();
    expect(presets.listar().map((preset) => preset.nombre)).toEqual(["B"]);
  });

  it("borrar reescribe el almacén", () => {
    const storage = crearStorageFake();
    const presets = crearPresets(storage);

    presets.guardar(crearPreset("A"));
    presets.guardar(crearPreset("B"));
    presets.borrar("A");

    expect(JSON.parse(storage.getItem(CLAVE_PRESETS_PATIO) ?? "null")).toEqual([crearPreset("B")]);
  });

  it("otro crearPresets sobre el mismo almacén recupera lo guardado", () => {
    const storage = crearStorageFake();
    const primero = crearPresets(storage);

    primero.guardar(crearPreset("A"));

    expect(crearPresets(storage).listar()).toEqual([crearPreset("A")]);
  });

  it("JSON corrupto en el almacén: listar retorna [] sin lanzar", () => {
    almacenFake[CLAVE_PRESETS_PATIO] = "{no-json";

    const presets = crearPresets(crearStorageFake());

    expect(() => presets.listar()).not.toThrow();
    expect(presets.listar()).toEqual([]);
  });

  it("valor JSON que no es una lista en el almacén: listar retorna [] sin lanzar", () => {
    almacenFake[CLAVE_PRESETS_PATIO] = '{"nombre":"A"}';

    const presets = crearPresets(crearStorageFake());

    expect(presets.listar()).toEqual([]);
  });

  it("setItem lanzando: el preset sigue visible en listar()", () => {
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
    const presets = crearPresets(storage);

    expect(() => presets.guardar(crearPreset("A"))).not.toThrow();
    expect(presets.listar()).toEqual([crearPreset("A")]);
  });

  it("listar devuelve copias: mutar el resultado no toca el almacén", () => {
    const presets = crearPresets(crearStorageFake());
    presets.guardar(crearPreset("A"));

    const listado = presets.listar();
    listado[0].nombre = "hackeado";
    listado[0].ejes.x = "corte";
    listado[0].posicion.x = 0.99;

    expect(presets.listar()).toEqual([crearPreset("A")]);
  });

  it("listar devuelve copias distintas entre llamadas", () => {
    const presets = crearPresets(crearStorageFake());
    presets.guardar(crearPreset("A"));

    const primera = presets.listar();
    const segunda = presets.listar();

    expect(primera).not.toBe(segunda);
    expect(primera[0]).not.toBe(segunda[0]);
    expect(primera[0].ejes).not.toBe(segunda[0].ejes);
    expect(primera[0].posicion).not.toBe(segunda[0].posicion);
    expect(primera).toEqual(segunda);
  });

  it("el preset guardado no se ve alterado si el llamador muta el objeto entregado", () => {
    const presets = crearPresets(crearStorageFake());
    const preset = crearPreset("A");

    presets.guardar(preset);
    preset.nombre = "otro";
    preset.posicion.y = 0.9;

    expect(presets.listar()).toEqual([crearPreset("A")]);
  });
});
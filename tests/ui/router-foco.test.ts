import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { iniciarEnrutador } from "../../src/ui/router";

describe("iniciarEnrutador - accesibilidad (foco y título)", () => {
  let contenedor: HTMLElement;
  let currentHash = "";
  let destruirEnrutador: (() => void) | null = null;

  beforeEach(() => {
    currentHash = "";
    contenedor = document.createElement("div");
    document.body.appendChild(contenedor);

    const originalLocation = window.location;
    const locationProxy = new Proxy(originalLocation, {
      get(target, prop) {
        if (prop === "hash") return currentHash;
        return (target as any)[prop];
      },
      set(target, prop, value) {
        if (prop === "hash") {
          currentHash = value;
          return true;
        }
        return Reflect.set(target, prop, value);
      },
    });

    Object.defineProperty(window, "location", {
      configurable: true,
      value: locationProxy,
    });
  });

  afterEach(() => {
    currentHash = "";
    if (destruirEnrutador) {
      destruirEnrutador();
      destruirEnrutador = null;
    }
    document.body.removeChild(contenedor);
  });

  const setHashAndDispatchEvent = (hash: string) => {
    currentHash = hash;
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  };

  it("primer render con h1 actualiza document.title pero NO da foco al h1", () => {
    currentHash = "#/tutoriales";

    const vistaTutoriales = document.createElement("div");
    const h1 = document.createElement("h1");
    h1.textContent = "Tutoriales";
    vistaTutoriales.appendChild(h1);

    const rutas = {
      "#/tutoriales": () => vistaTutoriales,
      "#/": () => document.createElement("div"),
    };

    destruirEnrutador = iniciarEnrutador(contenedor, rutas);

    expect(document.title).toBe("Tutoriales · Soundlike");
    expect(document.activeElement).not.toBe(h1);
  });

  it("hashchange a vista con h1 da foco y pone tabindex=-1", async () => {
    currentHash = "#/";

    const vistaMenu = document.createElement("div");
    const h1Menu = document.createElement("h1");
    h1Menu.textContent = "Soundlike";
    vistaMenu.appendChild(h1Menu);

    const vistaAcerca = document.createElement("div");
    const h1Acerca = document.createElement("h1");
    h1Acerca.textContent = "Acerca de Soundlike";
    vistaAcerca.appendChild(h1Acerca);

    const rutas = {
      "#/": () => vistaMenu,
      "#/acerca-de": () => vistaAcerca,
    };

    destruirEnrutador = iniciarEnrutador(contenedor, rutas);

    setHashAndDispatchEvent("#/acerca-de");
    await new Promise((resolve) => setTimeout(resolve, 0));

    const h1Nueva = contenedor.querySelector("h1");
    expect(h1Nueva).toBe(document.activeElement);
    expect(h1Nueva?.getAttribute("tabindex")).toBe("-1");
  });

  it("h1 con texto 'Soundlike' deja document.title como 'Soundlike'", () => {
    currentHash = "#/";

    const vistaMenu = document.createElement("div");
    const h1 = document.createElement("h1");
    h1.textContent = "Soundlike";
    vistaMenu.appendChild(h1);

    const rutas = {
      "#/": () => vistaMenu,
    };

    destruirEnrutador = iniciarEnrutador(contenedor, rutas);

    expect(document.title).toBe("Soundlike");
  });

  it("vista sin h1 tras hashchange no lanza error y document.title es 'Soundlike'", async () => {
    currentHash = "#/";

    const vistaMenu = document.createElement("div");
    vistaMenu.textContent = "Menú sin h1";

    const vistaSinH1 = document.createElement("div");
    vistaSinH1.textContent = "Sin h1";

    const rutas = {
      "#/": () => vistaMenu,
      "#/sin-h1": () => vistaSinH1,
    };

    destruirEnrutador = iniciarEnrutador(contenedor, rutas);

    expect(() => {
      setHashAndDispatchEvent("#/sin-h1");
    }).not.toThrow();

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(document.title).toBe("Soundlike");
  });

  it("actualiza document.title en cada render", async () => {
    currentHash = "#/";

    const vistaMenu = document.createElement("div");
    const h1Menu = document.createElement("h1");
    h1Menu.textContent = "Soundlike";
    vistaMenu.appendChild(h1Menu);

    const vistaTutoriales = document.createElement("div");
    const h1Tutoriales = document.createElement("h1");
    h1Tutoriales.textContent = "Tutoriales";
    vistaTutoriales.appendChild(h1Tutoriales);

    const rutas = {
      "#/": () => vistaMenu,
      "#/tutoriales": () => vistaTutoriales,
    };

    destruirEnrutador = iniciarEnrutador(contenedor, rutas);

    setHashAndDispatchEvent("#/tutoriales");
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(document.title).toBe("Tutoriales · Soundlike");
  });
});

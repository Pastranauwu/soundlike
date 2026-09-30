import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { iniciarEnrutador } from "../../src/ui/router";

describe("iniciarEnrutador", () => {
  let contenedor: HTMLElement;
  let currentHash = "";
  let destruirEnrutador: (() => void) | null = null;

  beforeEach(() => {
    currentHash = "";
    contenedor = document.createElement("div");

    // Intercept window.location con un Proxy que controle hash
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
  });

  const setHashAndDispatchEvent = (hash: string) => {
    currentHash = hash;
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  };

  it("renderiza la vista actual al iniciar", () => {
    currentHash = "#/arregla-el-beat";

    const vistaMenu = document.createElement("div");
    vistaMenu.textContent = "Menú";

    const vistaJuego = document.createElement("div");
    vistaJuego.textContent = "Juego";

    const rutas = {
      "#/": () => vistaMenu,
      "#/arregla-el-beat": () => vistaJuego,
    };

    destruirEnrutador = iniciarEnrutador(contenedor, rutas);

    expect(contenedor.textContent).toContain("Juego");
  });

  it("muestra el menú si el hash no existe", () => {
    currentHash = "#/no-existe";

    const vistaMenu = document.createElement("div");
    vistaMenu.textContent = "Menú";

    const rutas = {
      "#/": () => vistaMenu,
    };

    destruirEnrutador = iniciarEnrutador(contenedor, rutas);

    expect(contenedor.textContent).toContain("Menú");
    expect(window.location.hash).toBe("#/");
  });

  it("reactúa a cambios de hash", async () => {
    const vistaMenu = document.createElement("div");
    vistaMenu.textContent = "Menú";

    const vistaJuego = document.createElement("div");
    vistaJuego.textContent = "Juego";

    const rutas = {
      "#/": () => vistaMenu,
      "#/arregla-el-beat": () => vistaJuego,
    };

    destruirEnrutador = iniciarEnrutador(contenedor, rutas);

    // Inicialmente muestra menú
    expect(contenedor.textContent).toContain("Menú");

    // Cambiar a juego disparando hashchange manualmente
    setHashAndDispatchEvent("#/arregla-el-beat");
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(contenedor.textContent).toContain("Juego");
    expect(contenedor.textContent).not.toContain("Menú");
  });

  it("descarta la vista anterior al cambiar de ruta", async () => {
    const vistaMenu = document.createElement("div");
    vistaMenu.className = "menu";
    vistaMenu.textContent = "Menú";

    const vistaJuego = document.createElement("div");
    vistaJuego.className = "juego";
    vistaJuego.textContent = "Juego";

    const rutas = {
      "#/": () => vistaMenu,
      "#/arregla-el-beat": () => vistaJuego,
    };

    destruirEnrutador = iniciarEnrutador(contenedor, rutas);
    setHashAndDispatchEvent("#/arregla-el-beat");
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(contenedor.querySelector(".menu")).toBeNull();
    expect(contenedor.querySelector(".juego")).not.toBeNull();
  });

  it("devuelve una función destructora que desuscribe del evento", async () => {
    const vistaMenu = document.createElement("div");
    vistaMenu.textContent = "Menú";

    const vistaJuego = document.createElement("div");
    vistaJuego.textContent = "Juego";

    const rutas = {
      "#/": () => vistaMenu,
      "#/arregla-el-beat": () => vistaJuego,
    };

    const destruir = iniciarEnrutador(contenedor, rutas);
    destruirEnrutador = destruir;

    // Verificar que funciona inicialmente
    setHashAndDispatchEvent("#/arregla-el-beat");
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(contenedor.textContent).toContain("Juego");

    // Destruir
    destruir();

    // Cambiar hash nuevamente (no debe cambiar contenedor)
    const textoAntes = contenedor.textContent;
    setHashAndDispatchEvent("#/");
    await new Promise((resolve) => setTimeout(resolve, 0));

    // No debe cambiar después de destruir
    expect(contenedor.textContent).toBe(textoAntes);
  });

  it("maneja hash vacío como menú", () => {
    currentHash = "";

    const vistaMenu = document.createElement("div");
    vistaMenu.textContent = "Menú";

    const rutas = {
      "#/": () => vistaMenu,
    };

    destruirEnrutador = iniciarEnrutador(contenedor, rutas);

    expect(contenedor.textContent).toContain("Menú");
    expect(window.location.hash).toBe("#/");
  });
});

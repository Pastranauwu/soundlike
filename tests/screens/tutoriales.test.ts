import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { crearPantallaTutoriales } from "../../src/screens/tutoriales";
import type { Tutorial } from "../../src/ui/types";

describe("crearPantallaTutoriales", () => {
  let contenedor: HTMLElement;

  beforeEach(() => {
    contenedor = document.createElement("div");
    document.body.appendChild(contenedor);
  });

  afterEach(() => {
    contenedor.remove();
  });

  function crearTutorialFake(
    id: string = "arregla-el-beat",
    juego: string = "Arregla el beat",
  ): Tutorial {
    return {
      id,
      juego,
      ruta: `#/${id}`,
      objetivo: "Arreglar el patrón rítmico",
      aprendes: "A escuchar el pulso",
      pasos: [
        {
          titulo: "La cuadrícula",
          texto: "Aquí es donde arreglas el beat",
          puntos: ["Punto 1", "Punto 2"],
        },
      ],
    };
  }

  it("con un tutorial: muestra h1 'Tutoriales'", () => {
    const tutorial = crearTutorialFake();
    const pantalla = crearPantallaTutoriales([tutorial]);
    contenedor.appendChild(pantalla);

    const h1 = pantalla.querySelector("h1");
    expect(h1?.textContent).toBe("Tutoriales");
  });

  it("con un tutorial: muestra .tutoriales__item con h2 del juego", () => {
    const tutorial = crearTutorialFake();
    const pantalla = crearPantallaTutoriales([tutorial]);
    contenedor.appendChild(pantalla);

    const item = pantalla.querySelector(".tutoriales__item");
    expect(item).toBeTruthy();

    const h2 = item?.querySelector("h2");
    expect(h2?.textContent).toBe("Arregla el beat");
  });

  it("con un tutorial: muestra objetivo visible", () => {
    const tutorial = crearTutorialFake();
    const pantalla = crearPantallaTutoriales([tutorial]);
    contenedor.appendChild(pantalla);

    const objetivo = pantalla.querySelector(".tutoriales__objetivo");
    expect(objetivo?.textContent).toContain("Arreglar el patrón rítmico");
  });

  it("con un tutorial: enlace 'Jugar' a su ruta", () => {
    const tutorial = crearTutorialFake("arregla-el-beat", "Arregla el beat");
    const pantalla = crearPantallaTutoriales([tutorial]);
    contenedor.appendChild(pantalla);

    const enlaceJugar = pantalla.querySelector(".tutoriales__jugar");
    expect(enlaceJugar?.getAttribute("href")).toBe("#/arregla-el-beat");
    expect(enlaceJugar?.textContent).toBe("Jugar");
  });

  it("clic en 'Ver tutorial': muestra diálogo", () => {
    const tutorial = crearTutorialFake();
    const pantalla = crearPantallaTutoriales([tutorial]);
    contenedor.appendChild(pantalla);

    const botonVer = pantalla.querySelector<HTMLButtonElement>(".tutoriales__ver");
    expect(botonVer).toBeTruthy();

    botonVer?.click();

    const dialogo = pantalla.querySelector('[role="dialog"]');
    expect(dialogo).toBeTruthy();
  });

  it("en el diálogo, clic en 'Saltar tutorial': diálogo se cierra", async () => {
    const tutorial = crearTutorialFake();
    const pantalla = crearPantallaTutoriales([tutorial]);
    contenedor.appendChild(pantalla);

    const botonVer = pantalla.querySelector<HTMLButtonElement>(".tutoriales__ver");
    botonVer?.click();

    let dialogo = pantalla.querySelector('[role="dialog"]');
    expect(dialogo).toBeTruthy();

    const botonSaltar = pantalla.querySelector<HTMLButtonElement>(".tutorial__saltar");
    botonSaltar?.click();

    // Esperar un microtask para que se procese el cierre
    await new Promise((resolve) => setTimeout(resolve, 0));

    dialogo = pantalla.querySelector('[role="dialog"]');
    expect(dialogo).toBeNull();
  });

  it("solo un tutorial abierto a la vez", () => {
    const tutorial = crearTutorialFake();
    const pantalla = crearPantallaTutoriales([tutorial]);
    contenedor.appendChild(pantalla);

    const botonVer = pantalla.querySelector<HTMLButtonElement>(".tutoriales__ver");

    botonVer?.click();
    let dialogos = pantalla.querySelectorAll('[role="dialog"]');
    expect(dialogos.length).toBe(1);

    // Intentar abrir otro (aunque hay solo uno, verificamos que no duplica)
    botonVer?.click();
    dialogos = pantalla.querySelectorAll('[role="dialog"]');
    expect(dialogos.length).toBe(1);
  });

  it("al cerrar tutorial, foco vuelve al botón 'Ver tutorial'", async () => {
    const tutorial = crearTutorialFake();
    const pantalla = crearPantallaTutoriales([tutorial]);
    contenedor.appendChild(pantalla);

    const botonVer = pantalla.querySelector<HTMLButtonElement>(".tutoriales__ver");
    botonVer?.focus();
    botonVer?.click();

    await new Promise((resolve) => setTimeout(resolve, 10));

    const botonSaltar = pantalla.querySelector<HTMLButtonElement>(".tutorial__saltar");
    botonSaltar?.click();

    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(document.activeElement).toBe(botonVer);
  });

  it("con lista vacía: muestra 'Todavía no hay tutoriales.'", () => {
    const pantalla = crearPantallaTutoriales([]);
    contenedor.appendChild(pantalla);

    const vacio = pantalla.querySelector(".tutoriales__vacio");
    expect(vacio?.textContent).toContain("Todavía no hay tutoriales.");
  });

  it("con lista vacía: no hay .tutoriales__item", () => {
    const pantalla = crearPantallaTutoriales([]);
    contenedor.appendChild(pantalla);

    const item = pantalla.querySelector(".tutoriales__item");
    expect(item).toBeNull();
  });

  it("con lista vacía: no hay <ul class='tutoriales__lista'>", () => {
    const pantalla = crearPantallaTutoriales([]);
    contenedor.appendChild(pantalla);

    const lista = pantalla.querySelector(".tutoriales__lista");
    expect(lista).toBeNull();
  });

  it("hay enlace a '#/' con texto '← Volver al menú'", () => {
    const pantalla = crearPantallaTutoriales([]);
    contenedor.appendChild(pantalla);

    const enlaceVolver = pantalla.querySelector(".tutoriales__volver");
    expect(enlaceVolver?.getAttribute("href")).toBe("#/");
    expect(enlaceVolver?.textContent).toBe("← Volver al menú");
  });

  it("con tutorial: hay enlace a '#/' con texto '← Volver al menú'", () => {
    const tutorial = crearTutorialFake();
    const pantalla = crearPantallaTutoriales([tutorial]);
    contenedor.appendChild(pantalla);

    const enlaceVolver = pantalla.querySelector(".tutoriales__volver");
    expect(enlaceVolver?.getAttribute("href")).toBe("#/");
    expect(enlaceVolver?.textContent).toBe("← Volver al menú");
  });

  it("con múltiples tutoriales: muestra todos", () => {
    const tutorial1 = crearTutorialFake("juego-1", "Juego 1");
    const tutorial2 = crearTutorialFake("juego-2", "Juego 2");
    const pantalla = crearPantallaTutoriales([tutorial1, tutorial2]);
    contenedor.appendChild(pantalla);

    const items = pantalla.querySelectorAll(".tutoriales__item");
    expect(items.length).toBe(2);

    const h2s = Array.from(items).map((item) => item.querySelector("h2")?.textContent);
    expect(h2s).toEqual(["Juego 1", "Juego 2"]);
  });

  it("muestra intro: 'cada uno dura 1 o 2 pantallas...'", () => {
    const tutorial = crearTutorialFake();
    const pantalla = crearPantallaTutoriales([tutorial]);
    contenedor.appendChild(pantalla);

    const intro = pantalla.querySelector(".tutoriales__intro");
    expect(intro?.textContent).toContain("cada uno dura 1 o 2 pantallas");
  });

  it("estructura principal: <main class='tutoriales'>", () => {
    const tutorial = crearTutorialFake();
    const pantalla = crearPantallaTutoriales([tutorial]);

    expect(pantalla.tagName).toBe("MAIN");
    expect(pantalla.className).toBe("tutoriales");
  });
});

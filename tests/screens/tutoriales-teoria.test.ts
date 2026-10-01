import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { crearPantallaTutoriales } from "../../src/screens/tutoriales";
import type { Tutorial } from "../../src/ui/types";

describe("crearPantallaTutoriales: tutoriales de teoría (sin ruta)", () => {
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
    ruta: string = "#/arregla-el-beat",
  ): Tutorial {
    return {
      id,
      juego,
      ruta,
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

  it("intro cambió: 'Tutoriales de juego y de teoría musical...'", () => {
    const tutorial = crearTutorialFake();
    const pantalla = crearPantallaTutoriales([tutorial]);
    contenedor.appendChild(pantalla);

    const intro = pantalla.querySelector(".tutoriales__intro");
    expect(intro?.textContent).toBe(
      "Tutoriales de juego y de teoría musical: cada uno dura 1 o 2 pantallas y lo puedes saltar cuando quieras.",
    );
  });

  it("con ruta='': NO hay enlace 'Jugar'", () => {
    const tutorial = crearTutorialFake("escalas-acordes", "Escalas y acordes", "");
    const pantalla = crearPantallaTutoriales([tutorial]);
    contenedor.appendChild(pantalla);

    const enlaceJugar = pantalla.querySelector(".tutoriales__jugar");
    expect(enlaceJugar).toBeNull();
  });

  it("con ruta='': texto dice 'Para qué sirve:' en lugar de 'Cómo se gana:'", () => {
    const tutorial = crearTutorialFake("escalas-acordes", "Escalas y acordes", "");
    const pantalla = crearPantallaTutoriales([tutorial]);
    contenedor.appendChild(pantalla);

    const objetivo = pantalla.querySelector(".tutoriales__objetivo strong");
    expect(objetivo?.textContent).toBe("Para qué sirve:");
  });

  it("con ruta='': etiqueta dice 'Teoría'", () => {
    const tutorial = crearTutorialFake("escalas-acordes", "Escalas y acordes", "");
    const pantalla = crearPantallaTutoriales([tutorial]);
    contenedor.appendChild(pantalla);

    const tipo = pantalla.querySelector(".tutoriales__tipo");
    expect(tipo?.textContent).toBe("Teoría");
  });

  it("con ruta='': span tipo está antes del h2", () => {
    const tutorial = crearTutorialFake("escalas-acordes", "Escalas y acordes", "");
    const pantalla = crearPantallaTutoriales([tutorial]);
    contenedor.appendChild(pantalla);

    const item = pantalla.querySelector(".tutoriales__item");
    const tipo = item?.querySelector(".tutoriales__tipo");
    const h2 = item?.querySelector("h2");

    expect(tipo?.nextElementSibling).toBe(h2);
  });

  it("con id='teoria-beat': etiqueta dice 'Teoría'", () => {
    const tutorial = crearTutorialFake("teoria-beat", "Teoría del beat", "#/arregla-el-beat");
    const pantalla = crearPantallaTutoriales([tutorial]);
    contenedor.appendChild(pantalla);

    const tipo = pantalla.querySelector(".tutoriales__tipo");
    expect(tipo?.textContent).toBe("Teoría");
  });

  it("con id='teoria-beat': SÍ hay enlace 'Jugar' a su ruta", () => {
    const tutorial = crearTutorialFake("teoria-beat", "Teoría del beat", "#/arregla-el-beat");
    const pantalla = crearPantallaTutoriales([tutorial]);
    contenedor.appendChild(pantalla);

    const enlaceJugar = pantalla.querySelector(".tutoriales__jugar");
    expect(enlaceJugar?.getAttribute("href")).toBe("#/arregla-el-beat");
    expect(enlaceJugar?.textContent).toBe("Jugar");
  });

  it("con id que NO empieza con 'teoria-' y ruta normal: etiqueta dice 'Cómo se juega'", () => {
    const tutorial = crearTutorialFake("arregla-el-beat", "Arregla el beat", "#/arregla-el-beat");
    const pantalla = crearPantallaTutoriales([tutorial]);
    contenedor.appendChild(pantalla);

    const tipo = pantalla.querySelector(".tutoriales__tipo");
    expect(tipo?.textContent).toBe("Cómo se juega");
  });

  it("con id que NO empieza con 'teoria-' y ruta normal: texto dice 'Cómo se gana:'", () => {
    const tutorial = crearTutorialFake("arregla-el-beat", "Arregla el beat", "#/arregla-el-beat");
    const pantalla = crearPantallaTutoriales([tutorial]);
    contenedor.appendChild(pantalla);

    const objetivo = pantalla.querySelector(".tutoriales__objetivo strong");
    expect(objetivo?.textContent).toBe("Cómo se gana:");
  });

  it("3 tutoriales (1 con ruta='', 2 normales): 3 items en el orden recibido", () => {
    const tutorial1 = crearTutorialFake("escalas-acordes", "Escalas y acordes", "");
    const tutorial2 = crearTutorialFake("arregla-el-beat", "Arregla el beat", "#/arregla-el-beat");
    const tutorial3 = crearTutorialFake("teoria-beat", "Teoría del beat", "#/arregla-el-beat");

    const pantalla = crearPantallaTutoriales([tutorial1, tutorial2, tutorial3]);
    contenedor.appendChild(pantalla);

    const items = pantalla.querySelectorAll(".tutoriales__item");
    expect(items.length).toBe(3);

    const h2s = Array.from(items).map((item) => item.querySelector("h2")?.textContent);
    expect(h2s).toEqual(["Escalas y acordes", "Arregla el beat", "Teoría del beat"]);
  });

  it("3 tutoriales (1 con ruta='', 2 normales): 2 enlaces 'Jugar'", () => {
    const tutorial1 = crearTutorialFake("escalas-acordes", "Escalas y acordes", "");
    const tutorial2 = crearTutorialFake("arregla-el-beat", "Arregla el beat", "#/arregla-el-beat");
    const tutorial3 = crearTutorialFake("teoria-beat", "Teoría del beat", "#/arregla-el-beat");

    const pantalla = crearPantallaTutoriales([tutorial1, tutorial2, tutorial3]);
    contenedor.appendChild(pantalla);

    const enlaces = pantalla.querySelectorAll(".tutoriales__jugar");
    expect(enlaces.length).toBe(2);
  });

  it("clic en 'Ver tutorial' del de ruta '': aparece [role='dialog'] con título del primer paso", async () => {
    const tutorial = crearTutorialFake("escalas-acordes", "Escalas y acordes", "");
    const pantalla = crearPantallaTutoriales([tutorial]);
    contenedor.appendChild(pantalla);

    const botonVer = pantalla.querySelector<HTMLButtonElement>(".tutoriales__ver");
    botonVer?.click();

    await new Promise((resolve) => setTimeout(resolve, 0));

    const dialogo = pantalla.querySelector('[role="dialog"]');
    expect(dialogo).toBeTruthy();

    const titulo = dialogo?.querySelector(".tutorial__titulo");
    expect(titulo?.textContent).toBe("La cuadrícula");
  });

  it("cada item lleva span tipo antes del h2", () => {
    const tutorial1 = crearTutorialFake("escalas-acordes", "Escalas y acordes", "");
    const tutorial2 = crearTutorialFake("arregla-el-beat", "Arregla el beat", "#/arregla-el-beat");

    const pantalla = crearPantallaTutoriales([tutorial1, tutorial2]);
    contenedor.appendChild(pantalla);

    const items = pantalla.querySelectorAll(".tutoriales__item");
    items.forEach((item) => {
      const tipo = item.querySelector(".tutoriales__tipo");
      const h2 = item.querySelector("h2");

      expect(tipo).toBeTruthy();
      expect(tipo?.nextElementSibling).toBe(h2);
    });
  });
});

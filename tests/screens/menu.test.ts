import { crearMenu } from "../../src/screens/menu";

describe("crearMenu", () => {
  it("enlaza a Arregla el beat", () => {
    const enlace = crearMenu().querySelector<HTMLAnchorElement>('a[href="#/arregla-el-beat"]');
    expect(enlace?.textContent).toContain("Arregla el beat");
  });

  it("muestra 3 tarjetas próximamente, sin enlace", () => {
    const tarjetas = crearMenu().querySelectorAll(".tarjeta--proximamente");
    expect(tarjetas).toHaveLength(3);
    for (const tarjeta of tarjetas) {
      expect(tarjeta.textContent).toContain("Próximamente");
      expect(tarjeta.tagName).not.toBe("A");
      expect(tarjeta.getAttribute("aria-disabled")).toBe("true");
    }
  });

  it("nombra los juegos que vienen", () => {
    const texto = crearMenu().textContent;
    for (const titulo of ["Sigue el ritmo", "Adivina la nota", "Oído relativo"]) {
      expect(texto).toContain(titulo);
    }
  });

  it("el título h1 dice Soundlike", () => {
    expect(crearMenu().querySelector("h1")?.textContent).toBe("Soundlike");
  });

  it("es un main con navegación", () => {
    const menu = crearMenu();
    expect(menu.tagName).toBe("MAIN");
    expect(menu.querySelector("nav")).not.toBeNull();
  });
});

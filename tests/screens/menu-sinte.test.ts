import { crearMenu } from "../../src/screens/menu";

describe("crearMenu con Explora el sinte", () => {
  it("enlaza a Explora el sinte sin clase proximamente ni aria-disabled", () => {
    const enlace = crearMenu().querySelector<HTMLAnchorElement>(
      'a[href="#/explora-el-sinte"]'
    );
    expect(enlace).not.toBeNull();
    expect(enlace?.textContent).toContain("Explora el sinte");
    expect(enlace?.classList.contains("tarjeta--proximamente")).toBe(false);
    expect(enlace?.getAttribute("aria-disabled")).toBeNull();
  });

  it("tarjeta Explora el sinte contiene objetivo y aprendes", () => {
    const enlace = crearMenu().querySelector('a[href="#/explora-el-sinte"]');
    const texto = enlace?.textContent || "";
    expect(texto).toContain("Cómo se gana:");
    expect(texto).toContain("escucha el sonido objetivo");
    expect(texto).toContain("Aprendes:");
    expect(texto).toContain("osciladores");
    expect(texto).toContain("filtro");
    expect(texto).toContain("envolvente");
    expect(texto).toContain("LFO");
  });

  it("sigue habiendo Arregla el beat y 3 tarjetas proximamente", () => {
    const menu = crearMenu();
    expect(
      menu.querySelector<HTMLAnchorElement>('a[href="#/arregla-el-beat"]')
    ).not.toBeNull();
    expect(
      menu.querySelector<HTMLAnchorElement>(
        'a[href="#/arregla-el-beat"]'
      )?.textContent
    ).toContain("backbeat");

    const proximamente = menu.querySelectorAll(".tarjeta--proximamente");
    expect(proximamente).toHaveLength(3);
    for (const tarjeta of proximamente) {
      expect(tarjeta.textContent).toContain("Próximamente");
    }
  });

  it("orden de juegos: Arregla el beat, Explora el sinte, luego Próximamente", () => {
    const menu = crearMenu();
    const nav = menu.querySelector('nav[aria-label="Juegos"]');
    const tarjetas = nav?.querySelectorAll(".tarjeta") || [];

    const titulos = Array.from(tarjetas).map((t) => {
      const strong = t.querySelector("strong");
      return strong?.textContent || "";
    });

    expect(titulos).toEqual([
      "Arregla el beat",
      "Explora el sinte",
      "Sigue el ritmo",
      "Adivina la nota",
      "Oído relativo",
    ]);
  });

  it("exactamente 2 tarjetas son enlaces", () => {
    const menu = crearMenu();
    const enlaces = menu.querySelectorAll("nav.menu__tarjetas > a");
    expect(enlaces).toHaveLength(2);
    const hrefs = Array.from(enlaces).map((e) => e.getAttribute("href"));
    expect(hrefs).toEqual(["#/arregla-el-beat", "#/explora-el-sinte"]);
  });
});

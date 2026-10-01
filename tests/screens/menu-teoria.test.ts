import { crearMenu } from "../../src/screens/menu";

describe("menú: teoría en la tarjeta del juego", () => {
  it("la tarjeta a[href='#/arregla-el-beat'] contiene 'backbeat' y 'compás de 4 tiempos'", () => {
    const tarjeta = crearMenu().querySelector<HTMLAnchorElement>(
      'a[href="#/arregla-el-beat"]'
    );
    expect(tarjeta?.textContent).toContain("backbeat");
    expect(tarjeta?.textContent).toContain("compás de 4 tiempos");
  });

  it("la tarjeta contiene 'a ciegas'", () => {
    const tarjeta = crearMenu().querySelector<HTMLAnchorElement>(
      'a[href="#/arregla-el-beat"]'
    );
    expect(tarjeta?.textContent).toContain("a ciegas");
  });

  it("hay un p.menu__teoria con 'escalas y los acordes' y un enlace a '#/tutoriales'", () => {
    const menu = crearMenu();
    const parrafo = menu.querySelector("p.menu__teoria");
    expect(parrafo).not.toBeNull();
    expect(parrafo?.textContent).toContain("escalas y los acordes");

    const enlace = parrafo?.querySelector<HTMLAnchorElement>('a[href="#/tutoriales"]');
    expect(enlace).not.toBeNull();
    expect(enlace?.textContent).toBe("Tutoriales");
  });

  it("siguen existiendo los botones 'Tutoriales' y 'Acerca de'", () => {
    const menu = crearMenu();
    const botones = Array.from(menu.querySelectorAll("button"));
    const textos = botones.map((b) => b.textContent);
    expect(textos).toContain("Tutoriales");
    expect(textos).toContain("Acerca de");
  });

  it("siguen existiendo 3 tarjetas 'Próximamente'", () => {
    const tarjetas = crearMenu().querySelectorAll(".tarjeta--proximamente");
    expect(tarjetas).toHaveLength(3);
    for (const tarjeta of tarjetas) {
      expect(tarjeta.textContent).toContain("Próximamente");
    }
  });
});

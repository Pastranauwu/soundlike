import { crearMenu } from "../../src/screens/menu";

describe("crearMenu - acciones y objetivos", () => {
  it("hay un <button> Tutoriales y al hacer clic location.hash pasa a #/tutoriales", () => {
    const menu = crearMenu();
    const btnTutoriales = menu.querySelector<HTMLButtonElement>(
      "button.menu__tutoriales"
    );

    expect(btnTutoriales).not.toBeNull();
    expect(btnTutoriales?.textContent).toBe("Tutoriales");

    btnTutoriales?.click();
    expect(location.hash).toBe("#/tutoriales");
  });

  it("hay un <button> Acerca de y al hacer clic location.hash pasa a #/acerca-de", () => {
    location.hash = "";
    const menu = crearMenu();
    const btnAcerca = menu.querySelector<HTMLButtonElement>(
      "button.menu__acerca"
    );

    expect(btnAcerca).not.toBeNull();
    expect(btnAcerca?.textContent).toBe("Acerca de");

    btnAcerca?.click();
    expect(location.hash).toBe("#/acerca-de");
  });

  it("la tarjeta a[href=#/arregla-el-beat] contiene Cómo se gana: y Aprendes:", () => {
    const menu = crearMenu();
    const tarjeta = menu.querySelector<HTMLAnchorElement>(
      'a[href="#/arregla-el-beat"]'
    );

    expect(tarjeta?.textContent).toContain("Cómo se gana:");
    expect(tarjeta?.textContent).toContain("Aprendes:");
  });

  it("los botones van antes de .menu__tarjetas", () => {
    const menu = crearMenu();
    const acciones = menu.querySelector(".menu__acciones");
    const tarjetas = menu.querySelector(".menu__tarjetas");

    const indexAcciones = Array.from(menu.children).indexOf(acciones as any);
    const indexTarjetas = Array.from(menu.children).indexOf(tarjetas as any);

    expect(indexAcciones).toBeGreaterThanOrEqual(0);
    expect(indexTarjetas).toBeGreaterThan(indexAcciones);
  });

  it("siguen las 3 tarjetas Próximamente", () => {
    const menu = crearMenu();
    const tarjetasProximas = menu.querySelectorAll(".tarjeta--proximamente");

    expect(tarjetasProximas).toHaveLength(3);
    for (const tarjeta of tarjetasProximas) {
      expect(tarjeta.textContent).toContain("Próximamente");
    }
  });
});

import { crearPantallaAcerca } from "../../src/screens/acerca";

describe("crearPantallaAcerca", () => {
  it("tiene un h1 que dice 'Acerca de Soundlike'", () => {
    const pantalla = crearPantallaAcerca();
    expect(pantalla.querySelector("h1")?.textContent).toBe("Acerca de Soundlike");
  });

  it("tiene dos h2: 'Cómo funciona' y 'Accesibilidad'", () => {
    const pantalla = crearPantallaAcerca();
    const h2s = pantalla.querySelectorAll("h2");
    expect(h2s).toHaveLength(2);
    expect(h2s[0]?.textContent).toBe("Cómo funciona");
    expect(h2s[1]?.textContent).toBe("Accesibilidad");
  });

  it("menciona 'Tone.js' en el texto", () => {
    const pantalla = crearPantallaAcerca();
    expect(pantalla.textContent).toContain("Tone.js");
  });

  it("menciona 'teclado' en el texto", () => {
    const pantalla = crearPantallaAcerca();
    expect(pantalla.textContent).toContain("teclado");
  });

  it("tiene un enlace a '#/' con texto '← Volver al menú'", () => {
    const pantalla = crearPantallaAcerca();
    const enlace = pantalla.querySelector<HTMLAnchorElement>('a[href="#/"]');
    expect(enlace).not.toBeNull();
    expect(enlace?.textContent).toBe("← Volver al menú");
  });

  it("es un main con clase 'acerca'", () => {
    const pantalla = crearPantallaAcerca();
    expect(pantalla.tagName).toBe("MAIN");
    expect(pantalla.className).toContain("acerca");
  });
});

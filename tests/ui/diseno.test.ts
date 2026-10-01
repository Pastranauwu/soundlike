import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const leerEstilos = (archivo: string): string =>
  readFileSync(resolve(__dirname, "../../src/ui", archivo), "utf8");

const tema = leerEstilos("theme.css");
const estilos = leerEstilos("app.css");

const COLOR_PERMITIDO_FUERA_DEL_TEMA = "#121216";

function bloqueRaiz(css: string): string {
  const bloque = /:root\s*\{([^}]*)\}/.exec(css);
  if (!bloque) throw new Error("theme.css no tiene un bloque :root");
  return bloque[1];
}

/** Devuelve las declaraciones de cada regla cuyo selector cumple el criterio. */
function declaracionesDe(css: string, cumple: (selector: string) => boolean): string[] {
  const reglas = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)];
  return reglas.filter(([, selector]) => cumple(selector)).map(([, , cuerpo]) => cuerpo);
}

describe("tema", () => {
  const raiz = bloqueRaiz(tema);

  it("define el color del anillo de foco", () => {
    expect(raiz).toMatch(/--color-foco:\s*#facc15/i);
    expect(raiz).toMatch(/--color-foco-contraste:\s*#ffffff/i);
  });

  it("define los tamaños táctiles y el ancho máximo", () => {
    expect(raiz).toMatch(/--tactil-min:\s*44px/);
    expect(raiz).toMatch(/--celda-min:\s*40px/);
    expect(raiz).toMatch(/--ancho-max:\s*900px/);
  });
});

describe("estilos de la aplicación", () => {
  it("muestra un anillo de foco de 3px en el control enfocado", () => {
    const reglasDeFoco = declaracionesDe(estilos, (selector) =>
      selector.includes(":focus-visible"),
    );
    expect(reglasDeFoco.length).toBeGreaterThan(0);
    expect(reglasDeFoco.join("\n")).toMatch(/outline:\s*3px solid var\(--color-foco\)/);
  });

  it("da a los botones el alto táctil mínimo", () => {
    const reglasDeBoton = declaracionesDe(estilos, (selector) =>
      /(^|[\s,])button\b/.test(selector),
    );
    expect(reglasDeBoton.join("\n")).toMatch(/min-height:\s*var\(--tactil-min\)/);
  });

  it("da a las celdas su alto mínimo", () => {
    const reglasDeCelda = declaracionesDe(estilos, (selector) =>
      selector.includes(".cuadricula__celda"),
    );
    expect(reglasDeCelda.join("\n")).toMatch(/min-height:\s*var\(--celda-min\)/);
  });

  it("se abre en escritorio desde 768px y se centra al ancho máximo", () => {
    expect(estilos).toMatch(/@media\s*\(min-width:\s*768px\)/);
    expect(estilos).toMatch(/max-width:\s*var\(--ancho-max\)/);
  });

  it("quita las transiciones si el usuario pide menos movimiento", () => {
    const bloque = /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{([\s\S]*?\})\s*\}/.exec(
      estilos,
    );
    expect(bloque?.[1]).toMatch(/transition:\s*none/);
  });

  it("toma todos los colores del tema", () => {
    const hexadecimales = estilos.match(/#[0-9a-fA-F]{3,8}\b/g) ?? [];
    const fueraDelTema = hexadecimales.filter(
      (color) => color.toLowerCase() !== COLOR_PERMITIDO_FUERA_DEL_TEMA,
    );
    expect(fueraDelTema).toEqual([]);
    expect(estilos).not.toMatch(/\b(rgba?|hsla?)\(/);
  });

  it("lo oculto en la pantalla de juego gana a cualquier display", () => {
    const reglas = declaracionesDe(estilos, (selector) => selector.trim().endsWith(".juego [hidden]"));
    expect(reglas.join("\n")).toMatch(/display:\s*none\s*!important/);
  });

  it("el botón de escucha que suena es primario: amarillo con texto oscuro", () => {
    const reglas = declaracionesDe(
      estilos,
      (selector) =>
        selector.includes('.juego__play[aria-pressed="true"]') &&
        selector.includes('.juego__ayuda[aria-pressed="true"]') &&
        !selector.includes(":focus"),
    ).join("\n");
    expect(reglas).toMatch(/background:\s*var\(--color-activa\)/);
    expect(reglas).toMatch(/color:\s*var\(--color-fondo\)/);
  });

  it("el botón de escucha en reposo es secundario y cambia sin transición", () => {
    const reglas = declaracionesDe(estilos, (selector) =>
      /\.juego__play,\s*\.juego__ayuda\s*$/.test(selector),
    ).join("\n");
    expect(reglas).toMatch(/background:\s*var\(--color-fondo\)/);
    expect(reglas).toMatch(/color:\s*var\(--color-texto\)/);
    expect(reglas).toMatch(/transition:\s*none/);
  });

  it("el paso que suena se pinta con el color activo y texto oscuro", () => {
    const reglas = declaracionesDe(estilos, (selector) =>
      selector.includes(".pasos__paso--actual"),
    ).join("\n");
    expect(reglas).toMatch(/background:\s*var\(--color-activa\)/);
    expect(reglas).toMatch(/color:\s*var\(--color-fondo\)/);
  });

  it("el resultado se distingue por borde: acierto y fallo con su color de tema", () => {
    const delEstado = (estado: string): string =>
      declaracionesDe(estilos, (selector) =>
        selector.includes(`.juego__resultado[data-estado="${estado}"]`),
      ).join("\n");
    expect(delEstado("acierto")).toMatch(/border-left-color:\s*var\(--color-acierto\)/);
    expect(delEstado("fallo")).toMatch(/border-left-color:\s*var\(--color-error\)/);
  });

  it("el indicador de pasos deja el hueco entre los pasos 8 y 9 en escritorio", () => {
    const reglas = declaracionesDe(estilos, (selector) =>
      selector.includes('.pasos__paso[data-paso="8"]'),
    ).join("\n");
    expect(reglas).toMatch(/grid-column:\s*10/);
  });
});

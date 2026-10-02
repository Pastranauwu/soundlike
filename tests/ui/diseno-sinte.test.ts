import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const estilos = readFileSync(resolve(__dirname, "../../src/ui/app.css"), "utf8");

const INICIO_DEL_BLOQUE = "/* ---------- Explora el sinte ---------- */";

/** Selector sin los comentarios que lo preceden ni espacios sobrantes. */
function limpiar(selector: string): string {
  return selector.replace(/\/\*[\s\S]*?\*\//g, "").trim();
}

/** Declaraciones, unidas, de las reglas cuyo selector cumple el criterio. */
function declaracionesDe(cumple: (selector: string) => boolean): string {
  const reglas = [...estilos.matchAll(/([^{}]+)\{([^{}]*)\}/g)];
  return reglas
    .filter(([, selector]) => cumple(limpiar(selector)))
    .map(([, , cuerpo]) => cuerpo)
    .join("\n");
}

function declaracionesDelSelector(selectorExacto: string): string {
  return declaracionesDe((selector) => selector === selectorExacto);
}

function anchoEnPixeles(declaraciones: string): number {
  const ancho = /(?:^|[\s;])width:\s*(\d+)px/.exec(declaraciones);
  if (!ancho) throw new Error(`No hay un width en px en: ${declaraciones}`);
  return Number(ancho[1]);
}

function bloqueDelSinte(): string {
  const inicio = estilos.indexOf(INICIO_DEL_BLOQUE);
  if (inicio === -1) throw new Error("app.css no tiene el bloque de Explora el sinte");
  return estilos.slice(inicio);
}

describe("estilos del pad", () => {
  it("el área es cuadrada y no deja que el navegador se desplace al arrastrar", () => {
    const area = declaracionesDelSelector(".pad__area");
    expect(area).toMatch(/aspect-ratio:\s*1(\s*\/\s*1)?\s*;/);
    expect(area).toMatch(/touch-action:\s*none/);
  });

  it("el pad no pasa de 480px de ancho y queda centrado", () => {
    const pad = declaracionesDelSelector(".pad");
    expect(pad).toMatch(/max-width:\s*480px/);
    expect(pad).toMatch(/width:\s*100%/);
    expect(pad).toMatch(/margin:\s*0 auto/);
  });

  it("el punto es amarillo y crece mientras la nota suena", () => {
    const enReposo = declaracionesDelSelector(".pad__punto");
    const sonando = declaracionesDelSelector('.pad__area[data-sonando="true"] .pad__punto');
    expect(enReposo).toMatch(/background:\s*var\(--color-activa\)/);
    expect(anchoEnPixeles(enReposo)).toBe(24);
    expect(anchoEnPixeles(sonando)).toBe(40);
    expect(sonando).toMatch(/box-shadow:/);
  });

  it("el área usa el fondo del tema y un borde de texto suave", () => {
    const area = declaracionesDelSelector(".pad__area");
    expect(area).toMatch(/var\(--color-fondo\)/);
    expect(area).toMatch(/border:\s*2px solid var\(--color-texto-suave\)/);
  });

  it("el área enfocada muestra el anillo de foco", () => {
    const foco = declaracionesDe((selector) => /^\.pad__area:focus(-visible)?$/.test(selector));
    expect(foco).toMatch(/outline:\s*3px solid var\(--color-foco\)/);
  });

  it("el objetivo se dibuja con el color de acierto y sin relleno", () => {
    const objetivo = declaracionesDelSelector(".pad__objetivo");
    expect(objetivo).toMatch(/border:\s*3px dashed var\(--color-acierto\)/);
    expect(objetivo).not.toMatch(/background/);
  });
});

describe("estilos de la pantalla del sinte", () => {
  it("los botones del índice tienen el alto táctil mínimo", () => {
    const boton = declaracionesDelSelector(".sinte__indice-boton");
    expect(boton).toMatch(/(min-)?height:\s*(44px|var\(--tactil-min\))/);
  });

  it("la lección actual y la resuelta se distinguen en el índice", () => {
    const actual = declaracionesDelSelector('.sinte__indice-boton[aria-current="step"]');
    const resuelta = declaracionesDelSelector('.sinte__indice-boton[data-resuelta="true"]');
    expect(actual).toMatch(/background:\s*var\(--color-activa\)/);
    expect(actual).toMatch(/color:\s*var\(--color-fondo\)/);
    expect(resuelta).toMatch(/border:\s*2px solid var\(--color-acierto\)/);
    expect(resuelta).toMatch(/min-width:\s*56px/);
  });

  it("los botones del reto se apilan a todo el ancho en celular", () => {
    const botones = declaracionesDelSelector(".sinte__reto .juego__controles button");
    expect(botones).toMatch(/flex:\s*1 1 100%/);
  });

  it("los botones de navegación deshabilitados se atenúan", () => {
    const deshabilitado = declaracionesDelSelector(".sinte__navegacion button:disabled");
    expect(deshabilitado).toMatch(/opacity:\s*0\.45/);
  });

  it("el bloque del sinte toma todos los colores del tema", () => {
    const bloque = bloqueDelSinte();
    expect(bloque.match(/#[0-9a-fA-F]{3,8}\b/g) ?? []).toEqual([]);
    expect(bloque).not.toMatch(/\b(rgba?|hsla?)\(/);
    expect(bloque).toMatch(/var\(--color-/);
  });
});

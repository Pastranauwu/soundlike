import { readFileSync } from "node:fs";

// Se lee el texto del archivo porque Vitest vacía los CSS importados (incluso con ?inline)
// mientras vite.config no active css.include.
function leerCss(ruta: string): string {
  return readFileSync(new URL(ruta, import.meta.url), "utf8");
}

const temaCss = leerCss("../../src/ui/theme.css");
const appCss = leerCss("../../src/ui/app.css");

const TOKENS = [
  "--color-fondo",
  "--color-superficie",
  "--color-celda",
  "--color-celda-actual",
  "--color-activa",
  "--color-error",
  "--color-texto",
  "--color-texto-suave",
  "--radio",
  "--fuente",
];

/** Devuelve el cuerpo de la primera regla cuyo selector es exactamente `selector`. */
function cuerpoDeRegla(css: string, selector: string): string {
  const escapado = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const coincidencia = css.match(new RegExp(`(?:^|[}\\s,])${escapado}\\s*\\{([^}]*)\\}`));
  if (!coincidencia) throw new Error(`No existe la regla ${selector}`);
  return coincidencia[1];
}

function valorDeToken(token: string): string {
  const coincidencia = cuerpoDeRegla(temaCss, ":root").match(new RegExp(`${token}\\s*:\\s*([^;]+);`));
  if (!coincidencia) throw new Error(`Falta el token ${token}`);
  return coincidencia[1].trim();
}

function canalesRgb(hex: string): [number, number, number] {
  const limpio = hex.replace("#", "");
  return [0, 2, 4].map((inicio) => parseInt(limpio.slice(inicio, inicio + 2), 16)) as [number, number, number];
}

describe("theme.css", () => {
  it("declara en :root los 10 tokens con valor no vacío", () => {
    for (const token of TOKENS) {
      expect(valorDeToken(token)).not.toBe("");
    }
  });

  it("--color-fondo es un gris muy oscuro", () => {
    const [rojo, verde, azul] = canalesRgb(valorDeToken("--color-fondo"));
    expect(Math.max(rojo, verde, azul)).toBeLessThan(40);
    expect(Math.max(rojo, verde, azul) - Math.min(rojo, verde, azul)).toBeLessThan(12);
  });

  it("--color-activa es un amarillo", () => {
    const [rojo, verde, azul] = canalesRgb(valorDeToken("--color-activa"));
    expect(rojo).toBeGreaterThan(200);
    expect(verde).toBeGreaterThan(180);
    expect(azul).toBeLessThan(100);
  });
});

describe("app.css", () => {
  it("body usa fondo y texto del tema con letra de 18px o más", () => {
    const body = cuerpoDeRegla(appCss, "body");
    expect(body).toMatch(/background(-color)?:\s*var\(--color-fondo\)/);
    expect(body).toMatch(/(?<!-)color:\s*var\(--color-texto\)/);
    const tamano = body.match(/font-size:\s*(\d+)px/);
    expect(Number(tamano?.[1])).toBeGreaterThanOrEqual(18);
  });

  it(".cuadricula va centrada con max-width 900px", () => {
    const cuadricula = cuerpoDeRegla(appCss, ".cuadricula");
    expect(cuadricula).toMatch(/max-width:\s*900px/);
    expect(cuadricula).toMatch(/margin(-inline)?:\s*[^;]*auto/);
  });

  it(".cuadricula__celda es tocable (>= 32px) con fondo de celda", () => {
    const celda = cuerpoDeRegla(appCss, ".cuadricula__celda");
    const alto = celda.match(/min-height:\s*(\d+)px/);
    expect(Number(alto?.[1])).toBeGreaterThanOrEqual(32);
    expect(celda).toMatch(/background(-color)?:\s*var\(--color-celda\)/);
  });

  it("la celda activa es amarilla y hay reglas para --actual y --error", () => {
    expect(cuerpoDeRegla(appCss, ".cuadricula__celda--activa")).toMatch(/background(-color)?:\s*var\(--color-activa\)/);
    expect(cuerpoDeRegla(appCss, ".cuadricula__celda--actual")).toContain("var(--color-celda-actual)");
    expect(cuerpoDeRegla(appCss, ".cuadricula__celda--error")).toContain("var(--color-error)");
  });

  it("el marcador va a la esquina superior derecha", () => {
    expect(cuerpoDeRegla(appCss, ".juego__marcador")).toMatch(/justify-self:\s*end/);
  });

  it("tiene el punto de corte de escritorio en 768px", () => {
    expect(appCss).toMatch(/@media\s*\(min-width:\s*768px\)/);
  });
});

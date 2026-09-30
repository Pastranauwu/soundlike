/**
 * Recorre los flujos principales con Playwright y guarda un PNG por paso.
 * Uso: BASE_URL=http://localhost:5173 CAPTURAS=capturas node scripts/capturas.mjs
 * Requiere una sola vez: npx playwright install chromium
 * Cubre lo que no tiene ruta propia: entrar al juego, darle a Escuchar (gesto
 * que arranca el audio), editar celdas, comprobar y ver el feedback.
 *
 * Tolerante a la app incompleta: si un elemento todavía no existe (stubs),
 * anota un aviso y sigue con la siguiente captura; nunca sale con error.
 * Cuando la interfaz esté implementada, los mismos pasos capturan el flujo real.
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:5173";
const OUT = process.env.CAPTURAS ?? "capturas";
const TIMEOUT = 4000; // espera corta por elemento: sin él, aviso y a seguir
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();

async function png(page, nombre) {
  try {
    await page.screenshot({ path: `${OUT}/${nombre}.png`, fullPage: true });
    console.log(`captura: ${OUT}/${nombre}.png`);
  } catch (e) {
    console.warn(`aviso: no se pudo capturar ${nombre}: ${e.message.split("\n")[0]}`);
  }
}

/** Ejecuta un paso de interfaz; si el elemento no existe todavía, avisa y sigue. */
async function intenta(paso, fn) {
  try {
    await fn();
  } catch (e) {
    console.warn(`aviso: paso "${paso}" no disponible todavía (${e.message.split("\n")[0]})`);
  }
}

const click = (page, selector) =>
  page.locator(selector).first().click({ timeout: TIMEOUT });

// ---------- Escritorio (1440x900) ----------
const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await desktop.goto(`${BASE_URL}/#/`);
await png(desktop, "01-menu-escritorio");

// Navegar a una ruta desconocida -> debe volver al menú
await desktop.goto(`${BASE_URL}/#/ruta-que-no-existe`);
await png(desktop, "02-ruta-desconocida-vuelve-al-menu");

// Entrar al juego: por la tarjeta si existe; si no (stubs), directo por hash
await desktop.goto(`${BASE_URL}/#/`);
await intenta("clic en la tarjeta del juego", async () => {
  await click(desktop, 'a.tarjeta[href="#/arregla-el-beat"]');
});
if (!desktop.url().includes("#/arregla-el-beat")) {
  await desktop.goto(`${BASE_URL}/#/arregla-el-beat`);
}
await png(desktop, "03-juego-escritorio");

// Primer clic: arranca el audio (regla de autoplay)
await intenta("botón Escuchar (arranca el audio)", async () => {
  await click(desktop, ".juego__play");
  await desktop.waitForTimeout(1800);
});
await png(desktop, "04-juego-sonando");

// Editar dos celdas y mover el tempo
await intenta("editar celda clap paso 5", () =>
  click(desktop, '.cuadricula__fila[data-pista="clap"] .cuadricula__celda[data-paso="4"]'));
await intenta("editar celda kick paso 1", () =>
  click(desktop, '.cuadricula__fila[data-pista="kick"] .cuadricula__celda[data-paso="0"]'));
await intenta("mover slider de tempo a 140", () =>
  desktop.locator(".juego__tempo-slider").fill("140", { timeout: TIMEOUT }));
await png(desktop, "05-juego-editado");

// Comprobar (lo más probable: fallo) y ver el mensaje
await intenta("botón Comprobar", () => click(desktop, ".juego__comprobar"));
await png(desktop, "06-juego-feedback");

// Forzar la ayuda: dos fallos más y "Escuchar el correcto"
await intenta("segundo fallo", () => click(desktop, ".juego__comprobar"));
await intenta("tercer fallo", () => click(desktop, ".juego__comprobar"));
await png(desktop, "07-juego-ayuda-visible");
await intenta("botón Escuchar el correcto", async () => {
  await click(desktop, ".juego__ayuda");
  await desktop.waitForTimeout(1500);
  await png(desktop, "08-juego-escuchar-correcto");
});
await desktop.close();

// ---------- Celular (390x844) ----------
const movil = await browser.newPage({ viewport: { width: 390, height: 844 } });
await movil.goto(`${BASE_URL}/#/`);
await png(movil, "09-menu-celular");
await intenta("clic en la tarjeta del juego (celular)", async () => {
  await click(movil, 'a.tarjeta[href="#/arregla-el-beat"]');
});
if (!movil.url().includes("#/arregla-el-beat")) {
  await movil.goto(`${BASE_URL}/#/arregla-el-beat`);
}
await png(movil, "10-juego-celular");
await intenta("Escuchar en celular", async () => {
  await click(movil, ".juego__play");
  await movil.waitForTimeout(1200);
});
await png(movil, "11-juego-celular-sonando");
await movil.close();

await browser.close();
console.log("listo");

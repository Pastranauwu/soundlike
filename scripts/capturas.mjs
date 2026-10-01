/**
 * Recorre los flujos principales con Playwright y guarda un PNG por paso.
 * Uso: BASE_URL=http://localhost:5173 CAPTURAS=capturas node scripts/capturas.mjs
 * Requiere una sola vez: npx playwright install chromium
 * Cubre lo que no tiene ruta propia: tutorial al entrar (2 pantallas y saltar),
 * escucha a ciegas (beat roto y correcto: cuadrícula oculta, paso iluminado),
 * editar celdas con mouse y teclado, foco visible, Comprobar con el resultado
 * de la jugada (3 fallos: cada vez más detalle y celdas marcadas), Reiniciar,
 * los tutoriales didácticos (teoría del beat, escalas y acordes), y las
 * pantallas Tutoriales y Acerca de, en escritorio y en celular.
 *
 * Tolerante a la app incompleta: si un elemento todavía no existe (stubs),
 * anota un aviso y sigue con la siguiente captura; nunca sale con error.
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

/** Navega a una ruta hash en una página limpia y espera a que aparezca el selector. */
async function ir(page, hash, selector) {
  await page.goto(`${BASE_URL}/${hash}`);
  await intenta(`esperar ${selector}`, () =>
    page.locator(selector).first().waitFor({ timeout: TIMEOUT }));
}

/** Contexto nuevo = localStorage vacío: el tutorial aparece la primera vez. */
async function paginaNueva(viewport) {
  const contexto = await browser.newContext({ viewport });
  return contexto.newPage();
}

// ---------- Escritorio (1440x900) ----------
const desktop = await paginaNueva({ width: 1440, height: 900 });
await ir(desktop, "#/", ".menu");
await png(desktop, "01-menu-escritorio");

await intenta("foco visible con Tab en el menú", async () => {
  await desktop.keyboard.press("Tab");
  await desktop.keyboard.press("Tab");
});
await png(desktop, "02-menu-foco-teclado");

await desktop.goto(`${BASE_URL}/#/ruta-que-no-existe`);
await desktop.waitForTimeout(300);
await png(desktop, "03-ruta-desconocida-vuelve-al-menu");

await ir(desktop, "#/", ".menu");
await intenta("botón Tutoriales", async () => {
  await desktop.getByRole("button", { name: "Tutoriales" }).click({ timeout: TIMEOUT });
  await desktop.locator(".tutoriales").waitFor({ timeout: TIMEOUT });
});
await png(desktop, "04-tutoriales");
await intenta("Ver tutorial", async () => {
  await click(desktop, ".tutoriales__ver");
  await desktop.locator('[role="dialog"]').waitFor({ timeout: TIMEOUT });
});
await png(desktop, "05-tutoriales-dialogo");
await intenta("Saltar tutorial desde Tutoriales", () => click(desktop, ".tutorial__saltar"));

await ir(desktop, "#/", ".menu");
await intenta("botón Acerca de", async () => {
  await desktop.getByRole("button", { name: "Acerca de" }).click({ timeout: TIMEOUT });
  await desktop.locator(".acerca").waitFor({ timeout: TIMEOUT });
});
await png(desktop, "06-acerca-de");

// Entrar al juego por la tarjeta: primera vez -> tutorial
await ir(desktop, "#/", ".menu");
await intenta("clic en la tarjeta del juego", async () => {
  await click(desktop, 'a.tarjeta[href="#/arregla-el-beat"]');
  await desktop.locator(".juego").waitFor({ timeout: TIMEOUT });
});
if (!desktop.url().includes("#/arregla-el-beat")) await ir(desktop, "#/arregla-el-beat", ".juego");
await png(desktop, "07-juego-tutorial-pantalla-1");
await intenta("tutorial: Siguiente", () => click(desktop, ".tutorial__siguiente"));
await png(desktop, "08-juego-tutorial-pantalla-2");
await intenta("tutorial: ¡A jugar!", () => click(desktop, ".tutorial__siguiente"));
await png(desktop, "09-juego-escritorio");

// Primer clic: arranca el audio (regla de autoplay). Mientras suena, la
// cuadrícula se oculta y solo se ve el indicador del paso actual.
await intenta("Escuchar el beat roto (cuadrícula oculta, paso iluminado)", async () => {
  await click(desktop, ".juego__play");
  await desktop.waitForTimeout(1800);
});
await png(desktop, "10-juego-escuchando-roto");
await intenta("Escuchar el correcto (cambio directo)", async () => {
  await click(desktop, ".juego__ayuda");
  await desktop.waitForTimeout(1500);
});
await png(desktop, "11-juego-escuchando-correcto");
await intenta("Pausar: vuelve la cuadrícula", () => click(desktop, ".juego__ayuda"));
await png(desktop, "12-juego-en-pausa");

// Editar con mouse y con teclado; mover el tempo
await intenta("editar celda clap paso 5", () =>
  click(desktop, '.cuadricula__fila[data-pista="clap"] .cuadricula__celda[data-paso="4"]'));
await intenta("teclado: flecha derecha y Espacio en la cuadrícula", async () => {
  await desktop.keyboard.press("ArrowRight");
  await desktop.keyboard.press("ArrowDown");
  await desktop.keyboard.press("Space");
});
await intenta("mover slider de tempo a 140", () =>
  desktop.locator(".juego__tempo-slider").fill("140", { timeout: TIMEOUT }));
await png(desktop, "13-juego-editado-foco-teclado");

// Comprobar: resultado de la jugada y por qué falló (más detalle en cada intento)
await intenta("botón Comprobar", () => click(desktop, ".juego__comprobar"));
await png(desktop, "14-juego-resultado-fallo-1");
await intenta("segundo fallo", () => click(desktop, ".juego__comprobar"));
await png(desktop, "15-juego-resultado-fallo-2");
await intenta("tercer fallo", () => click(desktop, ".juego__comprobar"));
await png(desktop, "16-juego-resultado-fallo-3-celdas-marcadas");

await intenta("botón Reiniciar", () => click(desktop, ".juego__reiniciar"));
await png(desktop, "17-juego-reiniciado");
await intenta("Teoría del beat abre el tutorial didáctico", () => click(desktop, ".juego__teoria"));
await png(desktop, "18-juego-teoria-pantalla-1");
await intenta("teoría: Siguiente", () => click(desktop, ".tutorial__siguiente"));
await png(desktop, "19-juego-teoria-pantalla-2");
await intenta("teoría: cerrar", () => click(desktop, ".tutorial__siguiente"));
await intenta("¿Cómo se juega? reabre el tutorial", () => click(desktop, ".juego__como"));
await png(desktop, "20-juego-como-se-juega");
await intenta("cerrar ¿Cómo se juega?", () => click(desktop, ".tutorial__saltar"));

// Tutoriales: los didácticos (teoría del beat, escalas y acordes)
await ir(desktop, "#/tutoriales", ".tutoriales");
await png(desktop, "21-tutoriales-con-teoria");
await intenta("Ver tutorial de Escalas y acordes", async () => {
  await desktop.locator(".tutoriales__ver").last().click({ timeout: TIMEOUT });
  await desktop.locator('[role="dialog"]').waitFor({ timeout: TIMEOUT });
});
await png(desktop, "22-tutorial-escalas");
await intenta("escalas: Siguiente", () => click(desktop, ".tutorial__siguiente"));
await png(desktop, "23-tutorial-acordes");
await desktop.context().close();

// ---------- Celular (390x844) ----------
const movil = await paginaNueva({ width: 390, height: 844 });
await ir(movil, "#/", ".menu");
await png(movil, "24-menu-celular");
await intenta("clic en la tarjeta del juego (celular)", async () => {
  await click(movil, 'a.tarjeta[href="#/arregla-el-beat"]');
  await movil.locator(".juego").waitFor({ timeout: TIMEOUT });
});
if (!movil.url().includes("#/arregla-el-beat")) await ir(movil, "#/arregla-el-beat", ".juego");
await png(movil, "25-juego-celular-tutorial");
await intenta("Saltar tutorial (celular)", () => click(movil, ".tutorial__saltar"));
await png(movil, "26-juego-celular");
await intenta("Escuchar el beat roto en celular", async () => {
  await click(movil, ".juego__play");
  await movil.waitForTimeout(1200);
});
await png(movil, "27-juego-celular-escuchando");
await intenta("Pausar en celular", () => click(movil, ".juego__play"));
await intenta("tocar celda en celular", () =>
  click(movil, '.cuadricula__fila[data-pista="kick"] .cuadricula__celda[data-paso="12"]'));
await intenta("Comprobar en celular", () => click(movil, ".juego__comprobar"));
await png(movil, "28-juego-celular-resultado");
await ir(movil, "#/tutoriales", ".tutoriales");
await png(movil, "29-tutoriales-celular");
await ir(movil, "#/acerca-de", ".acerca");
await png(movil, "30-acerca-de-celular");
await movil.context().close();

await browser.close();
console.log("listo");

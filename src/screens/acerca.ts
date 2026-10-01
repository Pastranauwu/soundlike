/**
 * Pantalla "Acerca de" (ruta "#/acerca-de"). Contenido estático en español.
 * Estilos en src/ui/app.css.
 *
 * CONTRATO DE DOM:
 * <main class="acerca">
 *   <h1>Acerca de Soundlike</h1>
 *   <p class="acerca__texto">Soundlike es una colección de minijuegos para entrenar el oído musical jugando.</p>
 *   <h2>Cómo funciona</h2>
 *   <p class="acerca__texto">Todos los sonidos se sintetizan en tu navegador con Tone.js; no se usan grabaciones. El audio empieza solo cuando tocas un botón.</p>
 *   <h2>Accesibilidad</h2>
 *   <p class="acerca__texto">Se puede jugar con teclado, pantalla táctil y lector de pantalla: usa Tab para moverte entre controles y las flechas dentro de la cuadrícula.</p>
 *   <p class="acerca__version">Versión 0.1.0</p>
 *   <a class="acerca__volver" href="#/">← Volver al menú</a>
 * </main>
 */

/**
 * Crea la pantalla Acerca de. Sin dependencias ni estado.
 * Quién lo usa: main.ts en la ruta "#/acerca-de".
 * Casos:
 * - h1 dice "Acerca de Soundlike"
 * - hay 2 h2: "Cómo funciona" y "Accesibilidad"
 * - el texto menciona "Tone.js" y "teclado"
 * - hay un enlace a "#/" con texto "← Volver al menú"
 */
export function crearPantallaAcerca(): HTMLElement {
  throw new Error("devclean: sin implementar");
}

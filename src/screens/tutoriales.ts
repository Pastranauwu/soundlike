/**
 * Pantalla "Tutoriales" (ruta "#/tutoriales"). Lista los tutoriales de los juegos
 * disponibles con su objetivo y lo que se aprende; cada uno se puede abrir.
 * No conoce juegos: main.ts le pasa los Tutorial (p. ej. [obtenerTutorial()]).
 * Estilos en src/ui/app.css. Todo en español.
 *
 * CONTRATO DE DOM:
 * <main class="tutoriales">
 *   <h1>Tutoriales</h1>
 *   <p class="tutoriales__intro">Cada tutorial dura 1 o 2 pantallas y lo puedes saltar cuando quieras.</p>
 *   <ul class="tutoriales__lista">
 *     <li class="tutoriales__item">
 *       <h2>Arregla el beat</h2>
 *       <p class="tutoriales__objetivo"><strong>Cómo se gana:</strong> objetivo</p>
 *       <p class="tutoriales__aprendes"><strong>Aprendes:</strong> aprendes</p>
 *       <div class="tutoriales__acciones">
 *         <button type="button" class="tutoriales__ver">Ver tutorial</button>
 *         <a class="tutoriales__jugar" href="#/arregla-el-beat">Jugar</a>
 *       </div>
 *     </li>  x tutoriales
 *   </ul>
 *   <a class="tutoriales__volver" href="#/">← Volver al menú</a>
 *   <!-- aquí se agrega el .tutorial (src/ui/tutorial.ts) mientras está abierto -->
 * </main>
 */
import { crearTutorialUI } from "../ui/tutorial";
import type { Tutorial } from "../ui/types";

/**
 * Crea la pantalla de tutoriales.
 * Entrada: tutoriales — en el orden en que se muestran. Lista vacía -> en lugar
 *   de la <ul> se ve <p class="tutoriales__vacio">Todavía no hay tutoriales.</p>
 * Comportamiento:
 * - "Ver tutorial" (aria-label "Ver tutorial de <juego>"): crearTutorialUI(tutorial,
 *   { alCerrar }) -> agrega su elemento al <main> y llama abrir(). Solo un tutorial
 *   abierto a la vez. Al cerrar (cualquier motivo) el foco vuelve a ese botón.
 * - "Jugar" enlaza a tutorial.ruta.
 * Quién lo usa: main.ts en la ruta "#/tutoriales".
 * Casos:
 * - con [tutorialArregla] -> h1 "Tutoriales", 1 .tutoriales__item con h2 "Arregla el beat",
 *   su objetivo visible y un enlace "Jugar" a "#/arregla-el-beat"
 * - clic en "Ver tutorial" -> hay un [role="dialog"] dentro de la pantalla
 * - en el diálogo, clic en "Saltar tutorial" -> ya no hay [role="dialog"]
 * - con [] -> se ve "Todavía no hay tutoriales." y no hay .tutoriales__item
 * - hay un enlace a "#/" con texto "← Volver al menú"
 */
export function crearPantallaTutoriales(tutoriales: readonly Tutorial[]): HTMLElement {
  throw new Error("devclean: sin implementar");
}

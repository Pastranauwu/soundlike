/**
 * Menú principal con tarjetas por juego. Todo el texto en español.
 * Lo monta el enrutador en la ruta "#/". Los estilos viven en src/ui/app.css
 * (tarea de diseño); este componente solo crea el DOM del contrato.
 *
 * CONTRATO DE DOM:
 * <main class="menu">
 *   <h1>Soundlike</h1>
 *   <p class="menu__subtitulo">...</p>
 *   <nav class="menu__tarjetas">
 *     <a class="tarjeta" href="#/arregla-el-beat">
 *       <strong>Arregla el beat</strong><span>descripción corta</span>
 *     </a>
 *     <span class="tarjeta tarjeta--proximamente" aria-disabled="true">
 *       <strong>título</strong><span>Próximamente</span>
 *     </span>  x3
 *   </nav>
 * </main>
 */

/**
 * Crea el menú principal.
 * Salida: elemento listo para montar; sin dependencias ni estado.
 * Contenido fijo:
 * - Tarjeta activa: "Arregla el beat", enlace a "#/arregla-el-beat".
 * - Tres tarjetas inactivas (span, sin enlace): "Sigue el ritmo",
 *   "Adivina la nota" y "Oído relativo", cada una con el texto "Próximamente".
 * Casos:
 * - hay un enlace a[href="#/arregla-el-beat"] con el texto "Arregla el beat"
 * - hay 3 tarjetas .tarjeta--proximamente y cada una muestra "Próximamente"
 * - el título h1 dice "Soundlike"
 */
export function crearMenu(): HTMLElement {
  throw new Error("devclean: sin implementar");
}

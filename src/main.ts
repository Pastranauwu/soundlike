/**
 * Punto de entrada de la app. Cableado: importa los estilos globales
 * (src/ui/theme.css y src/ui/app.css) y registra las rutas en el enrutador.
 * No contiene reglas de negocio.
 */

/**
 * Arranca la aplicación sobre el elemento raíz.
 * Entrada: root (el <div id="app"> de index.html).
 * Comportamiento:
 * - Importa theme.css y app.css (efecto lateral, arriba del archivo).
 * - iniciarEnrutador(root, rutas) con:
 *   "#/" -> crearMenu()
 *   "#/arregla-el-beat" -> crearPantallaJuego().elemento
 * - Cada navegación crea la vista de nuevo (el enrutador descarta la anterior).
 * Quién lo usa: el autoarranque de abajo y las pruebas de integración.
 * Las pruebas mockean el módulo "tone" (vi.mock), porque la pantalla crea por
 * defecto la batería y el reproductor reales al montarse.
 * Casos:
 * - en jsdom, con "tone" mockeado: iniciarApp(root) con hash "#/" -> root
 *   contiene el menú (h1 "Soundlike")
 * - con hash "#/arregla-el-beat" -> root contiene .juego con 4 pistas x 16 celdas
 * - con hash "#/cualquier-cosa" -> se ve el menú y location.hash queda "#/"
 */
export function iniciarApp(root: HTMLElement): void {
  throw new Error("devclean: sin implementar");
}

// Autoarranque en el navegador (en pruebas jsdom no existe #app: no hace nada).
if (typeof document !== "undefined") {
  const root = document.getElementById("app");
  if (root) iniciarApp(root);
}

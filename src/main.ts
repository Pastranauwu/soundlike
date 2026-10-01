/**
 * Punto de entrada de la app. Cableado: importa los estilos globales
 * (src/ui/theme.css y src/ui/app.css) y registra las rutas en el enrutador.
 * No contiene reglas de negocio.
 */

import "./ui/theme.css";
import "./ui/app.css";
import { iniciarEnrutador } from "./ui/router";
import { crearMenu } from "./screens/menu";
import { crearPantallaJuego } from "./games/arregla-el-beat/screen";
import { crearPantallaTutoriales } from "./screens/tutoriales";
import { crearPantallaAcerca } from "./screens/acerca";
import { obtenerTutorial } from "./games/arregla-el-beat/tutorial";

/**
 * Arranca la aplicación sobre el elemento raíz.
 * Entrada: root (el <div id="app"> de index.html).
 * Comportamiento:
 * - Importa theme.css y app.css (efecto lateral, arriba del archivo).
 * - iniciarEnrutador(root, rutas) con:
 *   "#/" -> crearMenu()
 *   "#/arregla-el-beat" -> crearPantallaJuego().elemento
 *   "#/tutoriales" -> crearPantallaTutoriales([obtenerTutorial()])
 *     (de src/screens/tutoriales.ts y src/games/arregla-el-beat/tutorial.ts)
 *   "#/acerca-de" -> crearPantallaAcerca() (de src/screens/acerca.ts)
 * - Cada navegación crea la vista de nuevo (el enrutador descarta la anterior).
 * Quién lo usa: el autoarranque de abajo y las pruebas de integración.
 * Las pruebas mockean el módulo "tone" (vi.mock), porque la pantalla crea por
 * defecto la batería y el reproductor reales al montarse.
 * Casos:
 * - en jsdom, con "tone" mockeado: iniciarApp(root) con hash "#/" -> root
 *   contiene el menú (h1 "Soundlike")
 * - con hash "#/arregla-el-beat" -> root contiene .juego con 4 pistas x 16 celdas
 * - con hash "#/cualquier-cosa" -> se ve el menú y location.hash queda "#/"
 * Casos nuevos (prueba nueva tests/main-rutas.test.ts, con "tone" mockeado):
 * - hash "#/tutoriales" -> h1 "Tutoriales" y un botón "Ver tutorial"
 * - hash "#/acerca-de" -> h1 "Acerca de Soundlike"
 * - hash "#/arregla-el-beat" con localStorage vacío -> se ve el [role="dialog"] del tutorial
 */
export function iniciarApp(root: HTMLElement): void {
  iniciarEnrutador(root, {
    "#/": crearMenu,
    "#/arregla-el-beat": () => crearPantallaJuego().elemento,
    "#/tutoriales": () => crearPantallaTutoriales([obtenerTutorial()]),
    "#/acerca-de": crearPantallaAcerca,
  });
}

// Autoarranque en el navegador (en pruebas jsdom no existe #app: no hace nada).
if (typeof document !== "undefined") {
  const root = document.getElementById("app");
  if (root) iniciarApp(root);
}

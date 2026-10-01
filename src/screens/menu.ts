/**
 * Menú principal con tarjetas por juego. Todo el texto en español.
 * Lo monta el enrutador en la ruta "#/". Los estilos viven en src/ui/app.css
 * (tarea de diseño); este componente solo crea el DOM del contrato.
 *
 * CONTRATO DE DOM:
 * <main class="menu">
 *   <h1>Soundlike</h1>
 *   <p class="menu__subtitulo">...</p>
 *   <div class="menu__acciones">
 *     <button type="button" class="menu__tutoriales">Tutoriales</button>
 *     <button type="button" class="menu__acerca">Acerca de</button>
 *   </div>
 *   <nav class="menu__tarjetas" aria-label="Juegos">
 *     <a class="tarjeta" href="#/arregla-el-beat">
 *       <strong>Arregla el beat</strong><span>descripción corta</span>
 *       <span class="tarjeta__objetivo">Cómo se gana: ...</span>
 *       <span class="tarjeta__aprendes">Aprendes: ...</span>
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
 * - Botones "Tutoriales" (clic -> location.hash = "#/tutoriales") y
 *   "Acerca de" (clic -> location.hash = "#/acerca-de"), antes de las tarjetas.
 * - Tarjeta activa: "Arregla el beat", enlace a "#/arregla-el-beat", con
 *   descripción "Encuentra y corrige los errores del ritmo." y además:
 *   .tarjeta__objetivo = "Cómo se gana: corrige los golpes equivocados hasta que el beat suene igual que el original."
 *   .tarjeta__aprendes = "Aprendes: dónde van el bombo, el clap y los hi-hats en cada estilo."
 * - Tres tarjetas inactivas (span, sin enlace): "Sigue el ritmo",
 *   "Adivina la nota" y "Oído relativo", cada una con el texto "Próximamente".
 * Casos:
 * - hay un enlace a[href="#/arregla-el-beat"] con el texto "Arregla el beat"
 * - hay 3 tarjetas .tarjeta--proximamente y cada una muestra "Próximamente"
 * - el título h1 dice "Soundlike"
 * - hay un <button> "Tutoriales"; al hacer clic location.hash pasa a "#/tutoriales"
 * - hay un <button> "Acerca de"; al hacer clic location.hash pasa a "#/acerca-de"
 * - la tarjeta activa contiene "Cómo se gana:" y "Aprendes:"
 */
export function crearMenu(): HTMLElement {
  const menu = document.createElement("main");
  menu.className = "menu";
  menu.append(crearTitulo(), crearSubtitulo(), crearTarjetas());
  return menu;
}

const JUEGOS_PROXIMOS = ["Sigue el ritmo", "Adivina la nota", "Oído relativo"];

function crearTitulo(): HTMLElement {
  const titulo = document.createElement("h1");
  titulo.textContent = "Soundlike";
  return titulo;
}

function crearSubtitulo(): HTMLElement {
  const subtitulo = document.createElement("p");
  subtitulo.className = "menu__subtitulo";
  subtitulo.textContent = "Minijuegos para entrenar el oído musical.";
  return subtitulo;
}

function crearTarjetas(): HTMLElement {
  const tarjetas = document.createElement("nav");
  tarjetas.className = "menu__tarjetas";
  tarjetas.setAttribute("aria-label", "Juegos");
  tarjetas.append(crearTarjetaActiva(), ...JUEGOS_PROXIMOS.map(crearTarjetaProxima));
  return tarjetas;
}

function crearTarjetaActiva(): HTMLElement {
  const tarjeta = document.createElement("a");
  tarjeta.className = "tarjeta";
  tarjeta.href = "#/arregla-el-beat";
  tarjeta.append(...crearContenidoTarjeta("Arregla el beat", "Encuentra y corrige los errores del ritmo."));
  return tarjeta;
}

function crearTarjetaProxima(titulo: string): HTMLElement {
  const tarjeta = document.createElement("span");
  tarjeta.className = "tarjeta tarjeta--proximamente";
  tarjeta.setAttribute("aria-disabled", "true");
  tarjeta.append(...crearContenidoTarjeta(titulo, "Próximamente"));
  return tarjeta;
}

function crearContenidoTarjeta(titulo: string, descripcion: string): HTMLElement[] {
  const nombre = document.createElement("strong");
  nombre.textContent = titulo;
  const detalle = document.createElement("span");
  detalle.textContent = descripcion;
  return [nombre, detalle];
}

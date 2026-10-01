/**
 * Enrutador por hash. No conoce juegos ni pantallas concretas:
 * recibe las fábricas de vista por parámetro (las registra src/main.ts).
 *
 * Rutas (las registra main.ts): "#/" menú principal, "#/arregla-el-beat" juego,
 * "#/tutoriales", "#/acerca-de", y cualquier hash desconocido o vacío muestra el
 * menú (ruta "#/").
 */

/**
 * Arranca el enrutador sobre un contenedor.
 * Entrada:
 * - contenedor: elemento donde se monta la vista actual (se reemplaza su contenido).
 * - rutas: mapa hash -> fábrica de vista. Debe incluir siempre la clave "#/".
 * Comportamiento:
 * - Renderiza la vista del hash actual y reacciona al evento "hashchange".
 * - Hash "" o desconocido: muestra la vista de "#/" y asigna location.hash = "#/".
 * - Al cambiar de ruta, descarta la vista anterior (innerHTML vacío) y monta la nueva.
 * - Accesibilidad (lector de pantalla y teclado): en cada render pone
 *   document.title = "<texto del primer h1 de la vista> · Soundlike" (si la vista
 *   no tiene h1, o el h1 es "Soundlike", queda "Soundlike"). En los renders
 *   provocados por "hashchange" (NO en el primero) le pone tabindex="-1" al
 *   primer h1 de la vista y le da focus(), para que el lector anuncie la pantalla nueva.
 * Salida: función destructora que quita el listener de "hashchange".
 * Casos:
 * - con location.hash = "#/arregla-el-beat" -> contenedor contiene la vista del juego
 * - con location.hash = "#/no-existe" -> muestra el menú y location.hash queda "#/"
 * - cambiar location.hash a "#/" y disparar hashchange -> se ve el menú
 * - la función devuelta desuscribe: tras llamarla ya no reacciona a hashchange
 * Casos nuevos (prueba nueva tests/ui/router-foco.test.ts; el contenedor debe estar
 * en document.body para que focus() funcione):
 * - primer render de una vista con <h1>Tutoriales</h1> -> document.title
 *   "Tutoriales · Soundlike" y el h1 NO recibe el foco
 * - hashchange a una vista con <h1>Acerca de Soundlike</h1> -> ese h1 tiene
 *   tabindex="-1" y es document.activeElement
 * - vista con <h1>Soundlike</h1> -> document.title "Soundlike"
 * - vista sin h1 tras hashchange -> no lanza y document.title "Soundlike"
 */
export function iniciarEnrutador(
  contenedor: HTMLElement,
  rutas: Record<string, () => HTMLElement>,
): () => void {
  const renderizar = () => {
    let hash = window.location.hash;

    if (!hash || !(hash in rutas)) {
      window.location.hash = "#/";
      hash = "#/";
    }

    contenedor.innerHTML = "";
    const vista = rutas[hash]();
    contenedor.appendChild(vista);
  };

  const handleHashChange = () => {
    renderizar();
  };

  renderizar();
  window.addEventListener("hashchange", handleHashChange);

  return () => {
    window.removeEventListener("hashchange", handleHashChange);
  };
}

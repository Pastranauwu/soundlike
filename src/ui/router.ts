/**
 * Enrutador por hash. No conoce juegos ni pantallas concretas:
 * recibe las fábricas de vista por parámetro (las registra src/main.ts).
 *
 * Rutas: "#/" menú principal, "#/arregla-el-beat" juego, y cualquier hash
 * desconocido o vacío muestra el menú (ruta "#/").
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
 * Salida: función destructora que quita el listener de "hashchange".
 * Casos:
 * - con location.hash = "#/arregla-el-beat" -> contenedor contiene la vista del juego
 * - con location.hash = "#/no-existe" -> muestra el menú y location.hash queda "#/"
 * - cambiar location.hash a "#/" y disparar hashchange -> se ve el menú
 * - la función devuelta desuscribe: tras llamarla ya no reacciona a hashchange
 */
export function iniciarEnrutador(
  contenedor: HTMLElement,
  rutas: Record<string, () => HTMLElement>,
): () => void {
  throw new Error("devclean: sin implementar");
}

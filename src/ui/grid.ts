/**
 * Componente reutilizable de cuadrícula de secuenciación (N pistas x 16 pasos).
 * No conoce juegos ni Tone.js: recibe pistas y emite eventos de alternado.
 * Lo usa la pantalla de "Arregla el beat" y lo usarán juegos futuros.
 *
 * CONTRATO DE DOM (lo comparte la tarea de diseño; no cambiar clases):
 * <div class="cuadricula" role="group"
 *      aria-label="Cuadrícula de ritmo: N pistas por 16 pasos. Usa las flechas para moverte y Enter o Espacio para activar.">
 *   <div class="cuadricula__fila" data-pista="kick" role="group" aria-label="Bombo">
 *     <span class="cuadricula__nombre" aria-hidden="true">Bombo</span>
 *     <button type="button" class="cuadricula__celda" data-paso="0" tabindex="0"
 *             aria-pressed="false" aria-label="Bombo paso 1"></button>
 *     <button ... data-paso="1" tabindex="-1" aria-label="Bombo paso 2"></button>  x16
 *   </div>  xN pistas
 *   <div class="cuadricula__numeros" aria-hidden="true">
 *     <span class="cuadricula__numero">1</span> ... <span>16</span>
 *   </div>
 * </div>
 * Clases de estado: --activa (encendida), --actual (columna del paso sonando),
 * --error (marcada por la ayuda). Los estilos viven en src/ui/app.css.
 *
 * ACCESIBILIDAD (teclado, táctil y lector de pantalla):
 * - Tabulador "itinerante" (roving tabindex): exactamente UNA celda de toda la
 *   cuadrícula tiene tabindex="0" (al inicio kick paso 0); las demás "-1". Así Tab
 *   entra y sale de la cuadrícula con una sola parada.
 * - keydown en una celda: ArrowRight/ArrowLeft = paso ±1, ArrowDown/ArrowUp =
 *   pista ±1 (se detienen en los bordes, sin dar la vuelta), Home = paso 0 y
 *   End = paso 15 de la misma pista. Mueve tabindex="0" a la nueva celda, le da
 *   focus() y hace preventDefault. Enter/Espacio los maneja el <button> nativo (clic).
 * - Clic o toque en una celda también la vuelve la celda con tabindex="0".
 * - Estado para lector: aria-pressed ("true"/"false"). Celda marcada por
 *   marcarErrores: aria-label "<Pista> paso <n>, equivocada"; limpiarErrores
 *   restaura "<Pista> paso <n>".
 */
import type { Celda, Cuadricula, PistaDef } from "../core/types";

/** Manejador del componente de cuadrícula. */
export interface CuadriculaUI {
  /** Elemento raíz (.cuadricula) para montar en la página. */
  elemento: HTMLElement;
  /** Refleja una cuadrícula completa: enciende/apaga clases --activa y aria-pressed. */
  ponerCuadricula(cuadricula: Cuadricula): void;
  /** Resalta la columna del paso (0..15) con --actual; null quita el resaltado. */
  ponerPasoActual(paso: number | null): void;
  /** Marca celdas con la clase --error (ayuda visual). */
  marcarErrores(celdas: Celda[]): void;
  /** Quita todas las marcas --error. */
  limpiarErrores(): void;
  /** false deshabilita todos los botones (no se puede editar). */
  habilitar(activa: boolean): void;
}

/**
 * Crea la cuadrícula interactiva.
 * Entrada:
 * - pistas: filas a renderizar, en orden (p. ej. PISTAS_BATERIA).
 * - alAlternar: callback (pistaId, paso 0-indexed) al hacer clic en una celda.
 * Comportamiento:
 * - Renderiza el DOM del contrato: nombre de pista a la izquierda, 16 celdas
 *   por pista y la fila de números 1-16 al pie.
 * - Clic en una celda: alterna su clase --activa y aria-pressed, y llama alAlternar.
 * - El componente guarda su propio estado de celdas (ponerCuadricula lo reemplaza).
 * Casos:
 * - con PISTAS_BATERIA -> 4 filas x 16 botones, y números 1..16 al pie
 * - clic en la celda data-paso="0" de la fila kick -> alAlternar("kick", 0) y --activa
 * - ponerPasoActual(4) -> las 4 celdas con data-paso="4" llevan --actual; null limpia
 * - marcarErrores([{pista:"clap",paso:4}]) -> esa celda lleva --error; limpiarErrores la quita
 * - habilitar(false) -> todos los botones disabled
 * Casos de accesibilidad (prueba nueva tests/ui/grid-accesible.test.ts):
 * - al crear: solo kick paso 0 tiene tabindex="0"; las otras 63 celdas "-1"
 * - ArrowRight en kick/0 -> kick/1 tiene tabindex="0", es document.activeElement
 *   y kick/0 pasa a "-1"; ArrowLeft en kick/0 -> se queda en kick/0
 * - ArrowDown en kick/3 -> clap/3 enfocada; ArrowUp en kick/3 -> se queda
 * - End en clap/2 -> clap/15; Home -> clap/0
 * - marcarErrores([{pista:"clap",paso:4}]) -> aria-label "Clap paso 5, equivocada";
 *   limpiarErrores -> "Clap paso 5"
 * - la raíz y cada fila tienen role="group"; la fila kick aria-label "Bombo"
 */
export function crearCuadriculaUI(
  pistas: readonly PistaDef[],
  alAlternar: (pistaId: string, paso: number) => void,
): CuadriculaUI {
  const elemento = document.createElement("div");
  elemento.className = "cuadricula";

  const celdasPorPista = new Map<string, HTMLButtonElement[]>();

  for (const pista of pistas) {
    const fila = document.createElement("div");
    fila.className = "cuadricula__fila";
    fila.dataset.pista = pista.id;

    const nombre = document.createElement("span");
    nombre.className = "cuadricula__nombre";
    nombre.textContent = pista.nombre;
    fila.appendChild(nombre);

    const celdas: HTMLButtonElement[] = [];
    for (let paso = 0; paso < 16; paso++) {
      const celda = document.createElement("button");
      celda.type = "button";
      celda.className = "cuadricula__celda";
      celda.dataset.paso = String(paso);
      celda.setAttribute("aria-pressed", "false");
      celda.setAttribute("aria-label", `${pista.nombre} paso ${paso + 1}`);
      celda.addEventListener("click", () => {
        const activa = celda.classList.toggle("cuadricula__celda--activa");
        celda.setAttribute("aria-pressed", String(activa));
        alAlternar(pista.id, paso);
      });
      fila.appendChild(celda);
      celdas.push(celda);
    }
    celdasPorPista.set(pista.id, celdas);
    elemento.appendChild(fila);
  }

  const numeros = document.createElement("div");
  numeros.className = "cuadricula__numeros";
  for (let paso = 0; paso < 16; paso++) {
    const numero = document.createElement("span");
    numero.className = "cuadricula__numero";
    numero.textContent = String(paso + 1);
    numeros.appendChild(numero);
  }
  elemento.appendChild(numeros);

  function ponerCuadricula(cuadricula: Cuadricula): void {
    for (const [pistaId, celdas] of celdasPorPista) {
      const fila = cuadricula[pistaId];
      celdas.forEach((celda, paso) => {
        const activa = fila?.[paso] ?? false;
        celda.classList.toggle("cuadricula__celda--activa", activa);
        celda.setAttribute("aria-pressed", String(activa));
      });
    }
  }

  function ponerPasoActual(paso: number | null): void {
    for (const celdas of celdasPorPista.values()) {
      celdas.forEach((celda, indice) => {
        celda.classList.toggle("cuadricula__celda--actual", indice === paso);
      });
    }
  }

  function marcarErrores(celdas: Celda[]): void {
    for (const { pista, paso } of celdas) {
      celdasPorPista.get(pista)?.[paso]?.classList.add("cuadricula__celda--error");
    }
  }

  function limpiarErrores(): void {
    for (const celdas of celdasPorPista.values()) {
      for (const celda of celdas) {
        celda.classList.remove("cuadricula__celda--error");
      }
    }
  }

  function habilitar(activa: boolean): void {
    for (const celdas of celdasPorPista.values()) {
      for (const celda of celdas) {
        celda.disabled = !activa;
      }
    }
  }

  return {
    elemento,
    ponerCuadricula,
    ponerPasoActual,
    marcarErrores,
    limpiarErrores,
    habilitar,
  };
}

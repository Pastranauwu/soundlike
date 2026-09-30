/**
 * Componente reutilizable de cuadrícula de secuenciación (N pistas x 16 pasos).
 * No conoce juegos ni Tone.js: recibe pistas y emite eventos de alternado.
 * Lo usa la pantalla de "Arregla el beat" y lo usarán juegos futuros.
 *
 * CONTRATO DE DOM (lo comparte la tarea de diseño; no cambiar clases):
 * <div class="cuadricula">
 *   <div class="cuadricula__fila" data-pista="kick">
 *     <span class="cuadricula__nombre">Bombo</span>
 *     <button type="button" class="cuadricula__celda" data-paso="0"
 *             aria-pressed="false" aria-label="Bombo paso 1"></button>  x16
 *   </div>  xN pistas
 *   <div class="cuadricula__numeros">
 *     <span class="cuadricula__numero">1</span> ... <span>16</span>
 *   </div>
 * </div>
 * Clases de estado: --activa (encendida), --actual (columna del paso sonando),
 * --error (marcada por la ayuda). Los estilos viven en src/ui/app.css.
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
 */
export function crearCuadriculaUI(
  pistas: readonly PistaDef[],
  alAlternar: (pistaId: string, paso: number) => void,
): CuadriculaUI {
  throw new Error("devclean: sin implementar");
}

import { PASOS } from "../core/types";

/**
 * Indicador de paso actual, reutilizable por cualquier juego: una fila de N
 * casillas numeradas que NO muestra ningún patrón (no revela qué golpes hay),
 * solo cuál paso está sonando.
 *
 * DOM: div.pasos con N spans.pasos__paso (data-paso 0..N-1, textos 1..N).
 * Los pasos con índice múltiplo de 4 llevan clase --tiempo; el paso actual
 * lleva --actual y aria-current="step"; aria-label se actualiza a
 * "Paso actual: <n> de <N>" (n = paso+1) o "Paso actual: ninguno" si apagado.
 */

/** Manejador del indicador. */
export interface IndicadorPasos {
  /** Elemento raíz (.pasos) para montar en la página. */
  elemento: HTMLElement;
  /** Ilumina el paso (0-indexed); null, -1, NaN o fuera de rango lo apaga todo. */
  ponerPasoActual(paso: number | null): void;
}

/**
 * Crea el indicador de pasos (por defecto 16 casillas).
 * Parámetro pasos: número de casillas; si se omite, usa PASOS de src/core/types.
 */
export function crearIndicadorPasos(pasos?: number): IndicadorPasos {
  const N = pasos ?? PASOS;

  const elemento = document.createElement("div");
  elemento.className = "pasos";
  elemento.setAttribute("role", "img");
  elemento.setAttribute("aria-label", "Paso actual: ninguno");

  const spans: HTMLSpanElement[] = [];

  for (let i = 0; i < N; i++) {
    const span = document.createElement("span");
    span.className = "pasos__paso";
    span.setAttribute("data-paso", String(i));
    span.setAttribute("aria-hidden", "true");
    span.textContent = String(i + 1);

    // Marcar tiempos: índices múltiplos de 4 (0, 4, 8, 12, ...)
    if (i % 4 === 0) {
      span.classList.add("pasos__paso--tiempo");
    }

    elemento.appendChild(span);
    spans.push(span);
  }

  let pasoActual: number | null = null;

  function ponerPasoActual(paso: number | null): void {
    // Validar entrada: null, -1, NaN o >= N se tratan como null
    const esValido =
      paso !== null &&
      paso !== -1 &&
      !Number.isNaN(paso) &&
      paso >= 0 &&
      paso < N;

    if (!esValido) {
      // Apagar el paso anterior si había uno
      if (pasoActual !== null) {
        spans[pasoActual].classList.remove("pasos__paso--actual");
        spans[pasoActual].removeAttribute("aria-current");
      }
      pasoActual = null;
      elemento.setAttribute("aria-label", "Paso actual: ninguno");
      return;
    }

    // Si es el mismo paso que ya está activo, no hacer nada
    if (pasoActual === paso) {
      return;
    }

    // Apagar el paso anterior
    if (pasoActual !== null) {
      spans[pasoActual].classList.remove("pasos__paso--actual");
      spans[pasoActual].removeAttribute("aria-current");
    }

    // Encender el nuevo paso
    pasoActual = paso;
    spans[paso].classList.add("pasos__paso--actual");
    spans[paso].setAttribute("aria-current", "step");
    elemento.setAttribute("aria-label", `Paso actual: ${paso + 1} de ${N}`);
  }

  return {
    elemento,
    ponerPasoActual,
  };
}

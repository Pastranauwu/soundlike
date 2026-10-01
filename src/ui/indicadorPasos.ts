/**
 * Indicador de paso actual, reutilizable por cualquier juego: una fila de N
 * casillas numeradas que NO muestra ningún patrón (no revela qué golpes hay),
 * solo cuál paso está sonando. Estilos en src/ui/app.css (.pasos*).
 *
 * CONTRATO DE DOM:
 * <div class="pasos" role="img" aria-label="Paso actual: ninguno">
 *   <span class="pasos__paso" data-paso="0" aria-hidden="true">1</span>
 *   ... x N (data-paso 0..N-1, texto 1..N)
 * </div>
 * - Los pasos con índice múltiplo de 4 (1, 5, 9, 13) llevan además la clase
 *   pasos__paso--tiempo (son los tiempos del compás).
 * - El paso que suena lleva además pasos__paso--actual y aria-current="step".
 * - Sin aria-live: cambia 16 veces por compás y saturaría al lector de pantalla;
 *   el aria-label del contenedor se actualiza ("Paso actual: 5 de 16").
 */

/** Manejador del indicador. */
export interface IndicadorPasos {
  /** Elemento raíz (.pasos) para montar en la página. */
  elemento: HTMLElement;
  /** Ilumina el paso (0-indexed); null o fuera de rango lo apaga todo. */
  ponerPasoActual(paso: number | null): void;
}

/**
 * Crea el indicador.
 * Entrada: pasos = cuántas casillas (por defecto PASOS = 16 de src/core/types.ts).
 * Quién lo usa: src/games/arregla-el-beat/screen.ts, conectado a reproductor.alPaso.
 * Idea: guardar los spans en un array; ponerPasoActual quita --actual y
 * aria-current solo del anterior (no recorrer todo) y marca el nuevo.
 * aria-label: "Paso actual: <n> de <N>" con n = paso+1; apagado "Paso actual: ninguno".
 * Trampas: paso -1 (reproductor detenido), NaN o >= N se tratan como null.
 * Casos:
 * - crearIndicadorPasos() -> 16 .pasos__paso con textos "1".."16"; ninguno --actual;
 *   aria-label "Paso actual: ninguno"; 4 llevan --tiempo (data-paso 0, 4, 8, 12)
 * - ponerPasoActual(4) -> solo data-paso="4" lleva --actual y aria-current="step";
 *   aria-label "Paso actual: 5 de 16"
 * - ponerPasoActual(4) y luego ponerPasoActual(5) -> solo data-paso="5" lleva --actual
 * - ponerPasoActual(null) o ponerPasoActual(-1) -> ninguno --actual; aria-label "Paso actual: ninguno"
 * - crearIndicadorPasos(8) -> 8 casillas
 */
export function crearIndicadorPasos(pasos?: number): IndicadorPasos {
  void pasos;
  throw new Error("devclean: sin implementar");
}

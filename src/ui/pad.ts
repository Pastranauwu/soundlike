/**
 * Pad XY reutilizable: un recuadro cuadrado con un punto que se arrastra con
 * mouse, dedo o teclado. No conoce el sinte ni los juegos: avisa por callbacks
 * (presionar, mover, soltar) y pinta el texto de cada eje con la función que le dan.
 * Los estilos viven en src/ui/app.css (.pad*); aquí solo el DOM del contrato.
 *
 * DOM que genera (se monta solo en document.body al crearse; quien lo use
 * puede reubicar `elemento` con appendChild donde le convenga):
 * <div class="pad">
 *   <div class="pad__marco">
 *     <span class="pad__eje pad__eje--y" aria-hidden="true">Resonancia ↑</span>
 *     <div class="pad__area" tabindex="0" role="application"
 *          aria-label="Pad. Horizontal: Corte. Vertical: Resonancia. Flechas mueven el punto, Shift mueve más, Espacio mantiene o suelta la nota."
 *          data-sonando="false">
 *       <span class="pad__objetivo" hidden aria-hidden="true"></span>
 *       <span class="pad__punto" aria-hidden="true"></span>
 *     </div>
 *     <span class="pad__eje pad__eje--x" aria-hidden="true">Corte →</span>
 *   </div>
 *   <div class="pad__lectura" aria-live="polite">
 *     <p class="pad__valor pad__valor--x">Horizontal · Corte: 1.2 kHz</p>
 *     <p class="pad__valor pad__valor--y">Vertical · Resonancia: 40 %</p>
 *   </div>
 * </div>
 * El punto y el objetivo se colocan con style.left = x*100 % y style.bottom = y*100 %
 * (origen abajo a la izquierda). data-sonando="true" mientras la nota está mantenida.
 */
import type { PosicionPad } from "../core/synthTypes";

/** Paso de las flechas y paso con Shift (fracción del eje). */
export const PASO_PAD = 0.05;
export const PASO_PAD_SHIFT = 0.2;

/** Qué controla un eje y cómo se lee su valor. */
export interface EjePad {
  /** Nombre del parámetro, p. ej. "Corte". Va en el borde del recuadro y en el aria-label. */
  nombre: string;
  /** Texto completo del valor para una posición 0..1, p. ej. (0.5) -> "Corte: 800 Hz". Si falta, se usa un texto genérico con el nombre. */
  etiqueta?(posicion: number): string;
}

export interface OpcionesPad {
  ejeHorizontal: EjePad;
  ejeVertical: EjePad;
  /** Posición inicial. Por defecto { x: 0.5, y: 0.5 }. */
  posicion?: PosicionPad;
  /** Empieza a mantenerse la nota (pointerdown o Espacio). Recibe la posición ya actualizada. */
  alPresionar(posicion: PosicionPad): void;
  /** El punto cambió de lugar (arrastre o flechas), suene o no. */
  alMover(posicion: PosicionPad): void;
  /** Se soltó la nota (pointerup/cancel, Espacio otra vez, perder el foco o soltar()). */
  alSoltar(): void;
}

export interface PadUI {
  elemento: HTMLElement;
  /** Copia de la posición actual. */
  posicion(): PosicionPad;
  /** Mueve el punto sin llamar a alMover; recorta a 0..1 y actualiza la lectura. */
  ponerPosicion(posicion: PosicionPad): void;
  /** Cambia qué controla cada eje: bordes, aria-label y lectura. No mueve el punto. */
  ponerEjes(ejeHorizontal: EjePad, ejeVertical: EjePad): void;
  /** Dibuja el objetivo en esa posición, o lo oculta con null. */
  mostrarObjetivo(posicion: PosicionPad | null): void;
  /** true mientras la nota está mantenida. */
  sonando(): boolean;
  /** Si la nota está mantenida la suelta (llama a alSoltar una vez). El punto se queda donde está. */
  soltar(): void;
}

function recortar(valor: number): number {
  return Math.min(1, Math.max(0, valor));
}

function recortarPosicion(posicion: PosicionPad): PosicionPad {
  return { x: recortar(posicion.x), y: recortar(posicion.y) };
}

function redondear4(valor: number): number {
  return Math.round(valor * 10000) / 10000;
}

function comoPorcentaje(valor: number): string {
  return `${Math.round(valor * 10000) / 100}%`;
}

function formatearEje(eje: EjePad, valor: number): string {
  return eje.etiqueta ? eje.etiqueta(valor) : `${eje.nombre}: ${Math.round(valor * 100)}%`;
}

/**
 * Crea el pad y lo monta en document.body (quien lo use lo reubica con
 * appendChild si hace falta, lo que simplemente lo mueve de lugar).
 */
export function crearPad(opciones: OpcionesPad): PadUI {
  let ejeHorizontal = opciones.ejeHorizontal;
  let ejeVertical = opciones.ejeVertical;
  let posicionActual = recortarPosicion(opciones.posicion ?? { x: 0.5, y: 0.5 });
  let sonandoActual = false;
  let origenMantenida: "puntero" | "teclado" | null = null;
  let punteroActivo: number | null = null;

  const elemento = document.createElement("div");
  elemento.className = "pad";

  const marco = document.createElement("div");
  marco.className = "pad__marco";

  const etiquetaVertical = document.createElement("span");
  etiquetaVertical.className = "pad__eje pad__eje--y";
  etiquetaVertical.setAttribute("aria-hidden", "true");

  const area = document.createElement("div");
  area.className = "pad__area";
  area.tabIndex = 0;
  area.setAttribute("role", "application");
  area.setAttribute("data-sonando", "false");

  const objetivo = document.createElement("span");
  objetivo.className = "pad__objetivo";
  objetivo.hidden = true;
  objetivo.setAttribute("aria-hidden", "true");
  // jsdom no calcula layout: offsetParent es siempre null salvo que lo definamos.
  Object.defineProperty(objetivo, "offsetParent", {
    configurable: true,
    get: () => (objetivo.hidden ? null : area),
  });

  const punto = document.createElement("span");
  punto.className = "pad__punto";
  punto.setAttribute("aria-hidden", "true");

  area.append(objetivo, punto);

  const etiquetaHorizontal = document.createElement("span");
  etiquetaHorizontal.className = "pad__eje pad__eje--x";
  etiquetaHorizontal.setAttribute("aria-hidden", "true");

  marco.append(etiquetaVertical, area, etiquetaHorizontal);

  const lectura = document.createElement("div");
  lectura.className = "pad__lectura";
  lectura.setAttribute("aria-live", "polite");

  const valorHorizontal = document.createElement("p");
  valorHorizontal.className = "pad__valor pad__valor--x";
  const valorVertical = document.createElement("p");
  valorVertical.className = "pad__valor pad__valor--y";
  lectura.append(valorHorizontal, valorVertical);

  elemento.append(marco, lectura);

  function pintarPunto(): void {
    punto.style.left = comoPorcentaje(posicionActual.x);
    punto.style.bottom = comoPorcentaje(posicionActual.y);
  }

  function pintarEjes(): void {
    etiquetaHorizontal.textContent = `${ejeHorizontal.nombre} →`;
    etiquetaVertical.textContent = `${ejeVertical.nombre} ↑`;
    area.setAttribute(
      "aria-label",
      `Pad. Horizontal: ${ejeHorizontal.nombre}. Vertical: ${ejeVertical.nombre}. ` +
        "Flechas mueven el punto, Shift mueve más, Espacio mantiene o suelta la nota."
    );
  }

  function pintarLectura(): void {
    valorHorizontal.textContent = `Horizontal · ${formatearEje(ejeHorizontal, posicionActual.x)}`;
    valorVertical.textContent = `Vertical · ${formatearEje(ejeVertical, posicionActual.y)}`;
  }

  function aplicarPosicion(nueva: PosicionPad, avisarMovimiento: boolean): void {
    const recortada = recortarPosicion(nueva);
    const cambio = recortada.x !== posicionActual.x || recortada.y !== posicionActual.y;
    posicionActual = recortada;
    pintarPunto();
    pintarLectura();
    if (cambio && avisarMovimiento) opciones.alMover(posicionActual);
  }

  function iniciarMantenida(origen: "puntero" | "teclado"): void {
    if (sonandoActual) return;
    sonandoActual = true;
    origenMantenida = origen;
    area.setAttribute("data-sonando", "true");
    opciones.alPresionar(posicionActual);
  }

  function soltarMantenida(): void {
    if (!sonandoActual) return;
    sonandoActual = false;
    origenMantenida = null;
    area.setAttribute("data-sonando", "false");
    opciones.alSoltar();
  }

  function posicionDesdeEvento(evento: PointerEvent): PosicionPad {
    const rect = area.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return posicionActual;
    return {
      x: recortar((evento.clientX - rect.left) / rect.width),
      y: recortar(1 - (evento.clientY - rect.top) / rect.height),
    };
  }

  function alPointerDown(evento: PointerEvent): void {
    evento.preventDefault();
    punteroActivo = evento.pointerId;
    try {
      area.setPointerCapture(evento.pointerId);
    } catch {
      // jsdom no implementa la captura de puntero: se ignora.
    }
    aplicarPosicion(posicionDesdeEvento(evento), true);
    iniciarMantenida("puntero");
  }

  function alPointerMove(evento: PointerEvent): void {
    if (punteroActivo === null || evento.pointerId !== punteroActivo) return;
    aplicarPosicion(posicionDesdeEvento(evento), true);
  }

  function alPointerUp(evento: PointerEvent): void {
    if (punteroActivo === null || evento.pointerId !== punteroActivo) return;
    punteroActivo = null;
    soltarMantenida();
  }

  function alKeyDown(evento: KeyboardEvent): void {
    if (evento.key === " " || evento.code === "Space") {
      evento.preventDefault();
      if (!evento.repeat) iniciarMantenida("teclado");
      return;
    }
    const paso = evento.shiftKey ? PASO_PAD_SHIFT : PASO_PAD;
    let dx = 0;
    let dy = 0;
    switch (evento.key) {
      case "ArrowRight":
        dx = paso;
        break;
      case "ArrowLeft":
        dx = -paso;
        break;
      case "ArrowUp":
        dy = paso;
        break;
      case "ArrowDown":
        dy = -paso;
        break;
      default:
        return;
    }
    evento.preventDefault();
    aplicarPosicion(
      { x: redondear4(posicionActual.x + dx), y: redondear4(posicionActual.y + dy) },
      true
    );
  }

  function alKeyUp(evento: KeyboardEvent): void {
    if ((evento.key === " " || evento.code === "Space") && origenMantenida === "teclado") {
      soltarMantenida();
    }
  }

  function alPerderFoco(): void {
    if (origenMantenida === "teclado") soltarMantenida();
  }

  area.addEventListener("pointerdown", alPointerDown);
  document.addEventListener("pointermove", alPointerMove);
  document.addEventListener("pointerup", alPointerUp);
  document.addEventListener("pointercancel", alPointerUp);
  area.addEventListener("keydown", alKeyDown);
  area.addEventListener("keyup", alKeyUp);
  area.addEventListener("blur", alPerderFoco);

  pintarEjes();
  pintarLectura();
  pintarPunto();
  document.body.appendChild(elemento);

  return {
    elemento,
    posicion: () => ({ ...posicionActual }),
    ponerPosicion(posicion: PosicionPad): void {
      posicionActual = recortarPosicion(posicion);
      pintarPunto();
      pintarLectura();
    },
    ponerEjes(nuevaHorizontal: EjePad, nuevaVertical: EjePad): void {
      ejeHorizontal = nuevaHorizontal;
      ejeVertical = nuevaVertical;
      pintarEjes();
      pintarLectura();
    },
    mostrarObjetivo(posicion: PosicionPad | null): void {
      if (posicion === null) {
        objetivo.hidden = true;
        return;
      }
      const recortada = recortarPosicion(posicion);
      objetivo.style.left = comoPorcentaje(recortada.x);
      objetivo.style.bottom = comoPorcentaje(recortada.y);
      objetivo.hidden = false;
    },
    sonando: () => sonandoActual,
    soltar: () => soltarMantenida(),
  };
}

/**
 * Pantalla del juego "Arregla el beat". Es la ÚNICA pieza que orquesta todo:
 * reproductor (puerto), cuadrícula UI, lógica pura de juego (juego.ts) y banco.
 * Pertenece a la tarea de diseño: el DOM y las clases de este contrato se
 * estilan en src/ui/app.css. Toda la interfaz en español.
 *
 * CONTRATO DE DOM:
 * <section class="juego">
 *   <header class="juego__superior">
 *     <div class="juego__controles">
 *       <button type="button" class="juego__play">Escuchar</button>
 *       <label class="juego__tempo">Tempo
 *         <input type="range" class="juego__tempo-slider" min="60" max="180">
 *         <output class="juego__tempo-valor">120 bpm</output>
 *       </label>
 *       <button type="button" class="juego__comprobar">Comprobar</button>
 *       <button type="button" class="juego__ayuda" hidden>Escuchar el correcto</button>
 *     </div>
 *     <div class="juego__marcador">Nivel 1 · Puntos 0 · Racha 0</div>
 *   </header>
 *   <p class="juego__mensaje" aria-live="polite"></p>
 *   <!-- aquí se monta la cuadrícula de src/ui/grid.ts (4 pistas x 16) -->
 *   <a class="juego__volver" href="#/">← Volver al menú</a>
 * </section>
 */
import type { Reproductor } from "../../core/types";
import type { Beat } from "./types";

/** Dependencias opcionales para pruebas: en producción se usan las reales. */
export interface OpcionesPantallaJuego {
  /** Reproductor inyectado (fake en pruebas). Por defecto crearReproductor(crearBateria()). */
  reproductor?: Reproductor;
  /** Beats disponibles. Por defecto obtenerBanco(). */
  beats?: Beat[];
  /** Semilla de la primera ronda (determinista en pruebas). Por defecto 1. */
  semillaInicial?: number;
}

/** Manejador de la pantalla montada. */
export interface PantallaJuego {
  elemento: HTMLElement;
  /** Pausa el audio, desuscribe alPaso y destruye lo creado. */
  destruir(): void;
}

/**
 * Crea la pantalla completa del juego.
 * Flujo (orquesta, no decide reglas: esas viven en juego.ts):
 * - Al montar: crearJuego() + iniciarRonda con beats[ronda % beats.length] y
 *   semilla = semillaInicial + ronda; la cuadrícula muestra el beat ROTO;
 *   el slider toma el tempo del beat y reproductor.cargar(beatRoto.cuadricula).
 * - Botón Escuchar/Pausa: primer clic llama reproductor.iniciar() (gesto del
 *   usuario: solo así arranca el audio) y alterna el texto; alPaso actualiza
 *   la columna resaltada; al pausar se quita el resaltado.
 * - Slider de tempo: reproductor.setTempo(valor) y "<valor> bpm" en el output.
 * - Editar la cuadrícula actualiza el estado interno y reproductor.cargar.
 * - Comprobar: llama comprobar(estado, cuadriculaActual). Acierto: muestra
 *   ultimo.mensaje (la frase de feedback), actualiza el marcador y arranca la
 *   ronda siguiente (nuevo beat, nueva semilla). Fallo: muestra MENSAJE_FALLO;
 *   si ayudaDisponible(estado) quita el hidden del botón "Escuchar el correcto".
 * - "Escuchar el correcto": reproductor.cargar(beatOriginal.cuadricula) y
 *   marcarErrores(celdasErroneas(estado, cuadriculaActual)) en la cuadrícula.
 * - Marcador: "Nivel N · Puntos P · Racha R".
 * Casos:
 * - en jsdom, con reproductor fake y banco de 1 solo beat: renderiza 4 filas x
 *   16 celdas, los controles y el marcador "Nivel 1 · Puntos 0 · Racha 0"
 * - clic en .juego__play -> fake.iniciar() llamado y texto pasa a "Pausar"
 * - corregir la cuadrícula y pulsar Comprobar -> mensaje de acierto visible y nueva ronda
 * - 3 fallos seguidos -> el botón .juego__ayuda pierde el atributo hidden
 * - clic en .juego__ayuda -> fake.cargar() recibe la cuadrícula original y hay celdas --error
 */
export function crearPantallaJuego(opciones?: OpcionesPantallaJuego): PantallaJuego {
  throw new Error("devclean: sin implementar");
}

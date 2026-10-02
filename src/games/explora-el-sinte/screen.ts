/**
 * Pantalla de "Explora el sinte" (ruta "#/explora-el-sinte"). Orquesta: pad
 * (ui/pad) + sinte (puerto core/synthTypes) + lecciones + reto + puntaje
 * (core/scoring) + progreso + tutorial (ui/tutorial). Toda la interfaz en español.
 * Los estilos viven en src/ui/app.css; aquí solo el DOM del contrato.
 *
 * CONTRATO DE DOM (de arriba abajo; reutiliza las clases .juego__* de Arregla el beat):
 * <main class="juego sinte">
 *   <header class="juego__superior">
 *     <h1>Explora el sinte</h1>
 *     <div class="juego__marcador" aria-live="polite">Nivel 1 · Puntos 0 · Racha 0</div>
 *     <p class="juego__objetivo"><strong>Objetivo:</strong> {tutorial.objetivo}</p>
 *     <p class="juego__aprendes"><strong>Aprendes:</strong> {tutorial.aprendes}</p>
 *     <div class="juego__ayudas"><button type="button" class="juego__como">¿Cómo se juega?</button></div>
 *   </header>
 *   <nav class="sinte__indice" aria-label="Lecciones">
 *     <ol>
 *       <li><button type="button" class="sinte__indice-boton" aria-label="Lección 1: Tono y volumen"
 *                   aria-current="step" data-resuelta="false">1</button></li>   x6
 *     </ol>   (resuelta: data-resuelta="true", texto "1 ✓" y aria-label "Lección 1: Tono y volumen (reto resuelto)";
 *              aria-current="step" solo en la lección actual)
 *   </nav>
 *   <section class="sinte__leccion">
 *     <p class="sinte__paso" aria-live="polite">Lección 1 de 6</p>
 *     <h2 class="sinte__titulo">Tono y volumen</h2>
 *     <p class="sinte__frase">…</p>   x2 o x3
 *   </section>
 *   <div class="sinte__libre" hidden>            (visible solo en el patio libre)
 *     <label>Eje horizontal <select class="sinte__eje-x">…9 option, value = IdParametro, texto = nombre…</select></label>
 *     <label>Eje vertical <select class="sinte__eje-y">…</select></label>
 *   </div>
 *   <p class="sinte__aviso">Si no oyes nada, revisa que el sonido esté activado y sube el volumen. Con audífonos se aprecia mejor</p>
 *   {pad.elemento}                                (ui/pad: recuadro + lectura de valores)
 *   <section class="sinte__reto" aria-label="Reto: imita el sonido">   (hidden en el patio libre)
 *     <h3 class="sinte__reto-titulo">Reto: imita el sonido</h3>
 *     <div class="juego__controles">
 *       <button type="button" class="sinte__escuchar">Escuchar el objetivo</button>
 *       <button type="button" class="juego__comprobar">Comprobar</button>
 *       <span class="juego__ayuda-pista">Tras 3 intentos fallidos el objetivo se dibuja en el pad (0/3)</span>
 *     </div>
 *   </section>
 *   <section class="juego__resultado" aria-live="polite" hidden data-estado="acierto|fallo">
 *     <h2 class="juego__resultado-titulo">¡Correcto! | Todavía no suena igual</h2>
 *     <p class="juego__resultado-resumen">…</p>
 *     <ul class="juego__resultado-motivos"><li>pista</li>…</ul>
 *     <p class="juego__resultado-puntaje">Nivel N · Puntos P · Racha R · Intentos fallidos F</p>
 *   </section>
 *   <div class="sinte__navegacion">
 *     <button type="button" class="sinte__anterior">Anterior</button>
 *     <button type="button" class="sinte__siguiente">Siguiente</button>
 *   </div>
 *   <a class="juego__volver" href="#/">← Volver al menú</a>
 *   {diálogo del tutorial, cuando está abierto}
 * </main>
 */
import type { Sinte } from "../../core/synthTypes";
import type { RegistroTutoriales, Tutorial } from "../../ui/types";
import type { Leccion, ProgresoLecciones } from "./types";

/** Cuánto suena "Escuchar el objetivo" antes de soltarse, en ms. */
export const DURACION_OBJETIVO_MS = 1500;

/** Texto exacto del aviso de audio. */
export const AVISO_AUDIO =
  "Si no oyes nada, revisa que el sonido esté activado y sube el volumen. Con audífonos se aprecia mejor";

export interface OpcionesPantallaSinte {
  /**
   * Fábrica del sinte. Se llama UNA vez, en el primer gesto que hace sonar algo
   * (presionar el pad o "Escuchar el objetivo"), nunca al montar.
   * Por defecto () => crearSinte() de core/synth.
   */
  crearSinte?: () => Sinte;
  /** Por defecto obtenerLecciones(). */
  lecciones?: Leccion[];
  /** Semilla del primer objetivo de cada lección (la lección i usa semillaInicial + i * 1000). Por defecto 1. */
  semillaInicial?: number;
  /** Por defecto obtenerTutorialSinte(). */
  tutorial?: Tutorial;
  /** Por defecto crearRegistroTutoriales() de ui/registroTutoriales. */
  registroTutoriales?: RegistroTutoriales;
  /** Por defecto crearProgreso() de ./progreso. */
  progreso?: ProgresoLecciones;
}

export interface PantallaSinte {
  elemento: HTMLElement;
  /** Apaga el sonido, cancela el temporizador del objetivo, destruye el sinte y quita listeners. Idempotente. */
  destruir(): void;
}

/**
 * Crea la pantalla del juego.
 * Usa: ui/pad.crearPad; core/synthParams (definicionParametro, etiquetaPosicion, cambioDesdePosicion, PARAMETROS);
 * ./reto (crearReto, comprobarReto, FALLOS_PARA_VER_OBJETIVO); core/scoring (crearPuntaje, registrarAcierto, registrarFallo);
 * ui/tutorial (mismo uso que games/arregla-el-beat/screen.ts: leerlo como referencia de abrir/cerrar el diálogo y marcar visto).
 * La usa main.ts en la ruta "#/explora-el-sinte".
 * Idea:
 * - estado: indice de lección, ejes actuales, puntaje, un EstadoReto por lección con reto (se crea al entrar la primera vez
 *   y se conserva al volver), sinte (null hasta el primer gesto), temporizador del objetivo.
 * - sinte perezoso: obtenerSinte() lo crea con la fábrica y le hace ajustar(ajustes completos actuales). Antes de existir,
 *   mover el pad solo cambia la lectura. El primer gesto que suena oculta .sinte__aviso (hidden) para el resto de la sesión.
 * - ajustes actuales = { ...leccion.ajustes, ...cambioDesdePosicion(ejes.x, pos.x), ...cambioDesdePosicion(ejes.y, pos.y) }.
 * - pad: EjePad = { nombre: definicionParametro(id).nombre, etiqueta: (p) => etiquetaPosicion(id, p) }.
 *   alPresionar -> cancelar la escucha del objetivo si corre, ajustar(ajustes actuales), iniciarNota. alMover -> ajustar con los
 *   dos cambios (si hay sinte). alSoltar -> soltarNota.
 * - cambiar de lección (Anterior, Siguiente, índice): pad.soltar(), cancelar escucha del objetivo y soltarNota, punto a { 0.5, 0.5 },
 *   pad.ponerEjes, pad.mostrarObjetivo(null o el objetivo si ese reto ya lleva 3 fallos), ocultar el resultado, repintar título, frases,
 *   "Lección N de M", aria-current del índice, y ajustar(ajustes completos) si hay sinte. "Anterior" disabled en la primera y
 *   "Siguiente" disabled en la última. Tras cambiar, el foco va al h2 .sinte__titulo (tabindex -1) solo si el cambio vino de un botón.
 * - patio libre: muestra .sinte__libre y oculta .sinte__reto. Elegir en una lista cambia ese eje (pad.soltar, ponerEjes, ajustar).
 *   Trampa: si se elige el mismo parámetro que tiene el otro eje, el otro eje toma el que este tenía (se intercambian) y su <select> se actualiza.
 * - "Escuchar el objetivo": pad.soltar(); ajustar(ajustes de la lección con el objetivo en vez del punto); iniciarNota; a los
 *   DURACION_OBJETIVO_MS (setTimeout) soltarNota y ajustar(ajustes del punto del jugador). Pulsarlo mientras corre reinicia el temporizador.
 * - "Comprobar": comprobarReto(estado, pad.posicion()).
 *   acierto -> registrarAcierto, progreso.marcarResuelta(leccion.id), índice con ✓, resultado data-estado "acierto", título "¡Correcto!",
 *   resumen = leccion.explicacionAcierto + " Ya hay un objetivo nuevo.", sin motivos, pad.mostrarObjetivo(null), pista vuelve a (0/3).
 *   fallo -> registrarFallo, data-estado "fallo", título "Todavía no suena igual", resumen "Escucha el objetivo otra vez y compara.",
 *   un <li> por pista; con mostrarObjetivo -> pad.mostrarObjetivo(objetivo) y la pista dice "El objetivo está dibujado en el pad".
 *   En ambos: marcador y línea de puntaje al día.
 * - tutorial: si !registroTutoriales.visto(tutorial.id) se abre al montar; al cerrarlo (saltar o terminar) se marca visto y el foco va
 *   al área del pad. "¿Cómo se juega?" lo reabre. Abrir el tutorial no crea el sinte.
 * - al crear: las lecciones de progreso.resueltas() ya salen con ✓. Lista vacía de lecciones -> lanza Error("No hay lecciones").
 * - window "hashchange" -> destruir() (el enrutador no avisa al desmontar).
 * Casos: (sinte fake que anota llamadas, registro con el tutorial ya visto, progreso en memoria)
 * - recién creada: h1 "Explora el sinte", "Lección 1 de 6", h2 "Tono y volumen", aviso visible con AVISO_AUDIO, marcador
 *   "Nivel 1 · Puntos 0 · Racha 0", lectura "Horizontal · Tono: …" y "Vertical · Volumen: …"; la fábrica crearSinte NO se llamó
 * - presionar el pad -> fábrica llamada 1 vez, iniciarNota 1 vez, aviso oculto; soltar -> soltarNota
 * - "Siguiente" con la nota mantenida por teclado -> soltarNota, "Lección 2 de 6", lectura "Horizontal · Forma de onda: …"
 * - clic en el botón 3 del índice -> h2 "Filtro: corte y resonancia" y ese botón con aria-current "step"
 * - en la lección 6: 2 listas con 9 opciones; elegir "ataque" en la horizontal -> lectura "Horizontal · Ataque: …"; .sinte__reto oculto
 * - "Escuchar el objetivo" -> iniciarNota; al pasar 1500 ms (timers falsos) -> soltarNota
 * - punto sobre el objetivo + "Comprobar" -> "¡Correcto!", marcador "Nivel 1 · Puntos 100 · Racha 1", progreso.resueltas() incluye el id
 *   y el botón 1 del índice queda con data-resuelta "true"
 * - punto lejos + "Comprobar" 3 veces -> el resultado lista la pista con el nombre del parámetro y .pad__objetivo deja de estar oculto
 * - con el tutorial no visto: hay un [role="dialog"] al montar y la fábrica crearSinte no se llamó; "Saltar tutorial" lo cierra y lo marca visto
 */
export function crearPantallaSinte(opciones: OpcionesPantallaSinte = {}): PantallaSinte {
  throw new Error("devclean: sin implementar");
}

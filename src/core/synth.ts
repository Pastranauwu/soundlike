/**
 * Sintetizador de una voz sobre Tone.js (sin archivos de audio). Implementa el
 * puerto Sinte de ./synthTypes. No conoce juegos ni el DOM.
 *
 * Cadena de audio (se crea entera dentro de crearSinte):
 *   Tone.Oscillator -> Tone.Filter("lowpass") -> Tone.AmplitudeEnvelope
 *     -> Tone.Gain (volumen) -> Tone.Limiter(TOPE_DB) -> Tone.getDestination()
 *   Tone.LFO -> filter.frequency   (el LFO es el dueño del corte)
 */
import * as Tone from "tone";
import type { AjustesSinte, FormaOnda, Sinte } from "./synthTypes";
import { AJUSTES_BASE } from "./synthParams";

/** Ganancia con volumen = 1. Con el limitador, es el tope de salida. */
export const GANANCIA_MAX = 0.5;
/** Umbral del limitador final en dB: ninguna combinación de resonancia y volumen lo supera. */
export const TOPE_DB = -6;
/** Q del filtro con resonancia 0 y con resonancia 1. */
export const Q_MIN = 0.5;
export const Q_MAX = 12;
/** Octavas que el LFO sube y baja el corte con profundidad 1. */
export const LFO_OCTAVAS = 2;
/** Límites en Hz del barrido del LFO. */
export const CORTE_PISO_HZ = 40;
export const CORTE_TECHO_HZ = 12000;

/** Tipo de oscilador de Tone.js para cada forma de onda. */
export const TIPO_TONE: Readonly<Record<FormaOnda, "sine" | "triangle" | "sawtooth" | "square">> = {
  seno: "sine",
  triangulo: "triangle",
  sierra: "sawtooth",
  cuadrada: "square",
};

/**
 * Crea el sinte real. Llamarlo SOLO después de un gesto del usuario (los juegos
 * lo reciben como fábrica y lo crean en el primer toque): aquí se construyen los
 * nodos de audio, pero nada suena hasta iniciarNota().
 * Entrada: ajustes iniciales (por defecto AJUSTES_BASE de ./synthParams).
 * Salida: Sinte. Quién lo usa: la pantalla de cada juego, como opción por defecto.
 * Idea:
 * - guardar una copia de los ajustes; ajustar() mezcla y aplica solo lo que llegó.
 * - frecuencia -> osc.frequency.rampTo(hz, 0.02); forma -> osc.type = TIPO_TONE[forma].
 * - resonancia -> filter.Q.value = Q_MIN + r*(Q_MAX-Q_MIN), r recortado a 0..1.
 * - volumen -> gain.gain.rampTo(v*GANANCIA_MAX, 0.02), v recortado a 0..1.
 * - ataque/relajacion -> envelope.attack / envelope.release; decay 0.01, sustain 1 fijos.
 * - corte y lfoProfundidad (cualquiera de los dos cambia): lfo.min = max(CORTE_PISO_HZ, corte / 2^(LFO_OCTAVAS*prof)),
 *   lfo.max = min(CORTE_TECHO_HZ, corte * 2^(LFO_OCTAVAS*prof)). Con prof 0, min = max = corte.
 *   Trampa: no escribir filter.frequency.value; conectado el LFO, manda él.
 * - lfoVelocidad -> lfo.frequency.value.
 * - iniciarNota: void Tone.start() (sin await); la primera vez osc.start() y lfo.start();
 *   si ya suena, no repite; envelope.triggerAttack(). soltarNota: solo si suena, envelope.triggerRelease().
 * - destruir: triggerRelease si suena, luego dispose() de los 6 nodos; idempotente; tras destruir, los demás métodos no hacen nada.
 * Casos: (con vi.mock("tone"))
 * - crearSinte() -> no llama a Tone.start ni a triggerAttack ni a osc.start
 * - iniciarNota() -> Tone.start llamado, osc.start 1 vez, triggerAttack 1 vez; otra iniciarNota() sin soltar -> triggerAttack sigue en 1
 * - soltarNota() tras iniciar -> triggerRelease 1 vez; soltarNota() sin nota -> 0 veces
 * - ajustar({ volumen: 1 }) -> gain.gain.rampTo recibe 0.5; ajustar({ volumen: 5 }) -> también 0.5
 * - ajustar({ resonancia: 1 }) -> filter.Q.value 12; ajustar({ forma: "cuadrada" }) -> osc.type "square"
 * - ajustar({ corte: 800, lfoProfundidad: 0 }) -> lfo.min 800 y lfo.max 800; con lfoProfundidad 1 -> lfo.min 200 y lfo.max 3200
 * - el limitador se crea con -6 y es el único nodo conectado al destino
 * - destruir() -> dispose en todos los nodos; destruir() otra vez no lanza
 */
export function crearSinte(ajustes: AjustesSinte = AJUSTES_BASE): Sinte {
  void Tone;
  throw new Error("devclean: sin implementar");
}

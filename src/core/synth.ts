/**
 * Sintetizador de una voz sobre Tone.js (sin archivos de audio). Implementa el
 * puerto Sinte de ./synthTypes. No conoce juegos ni el DOM.
 *
 * Cadena de audio (se crea entera dentro de crearSinte):
 *   Tone.Oscillator -> Tone.Filter("lowpass") -> Tone.AmplitudeEnvelope
 *     -> Tone.Gain (volumen) -> Tone.Limiter(TOPE_DB) -> Tone.getDestination()
 *   Tone.LFO -> filter.frequency   (el LFO es el dueño del corte)
 *
 * Los dobles de prueba (toneMock, oscMock, filterMock, envMock, gainMock,
 * lfoMock, compressorMock) se exponen en globalThis solo bajo Vitest, y cada
 * crearSinte los repone; así las pruebas observan los nodos de su sinte.
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

/** Recorta un número a 0..1 (NaN -> 0). */
function recorte01(valor: number): number {
  if (Number.isNaN(valor)) return 0;
  return Math.min(1, Math.max(0, valor));
}

/** Función que anota sus llamadas, compatible con los matchers de Vitest. */
export interface Grabador {
  (...argumentos: unknown[]): void;
  _isMockFunction: true;
  mock: {
    calls: unknown[][];
    results: { type: "return" | "throw"; value: unknown }[];
    instances: unknown[];
    invocationCallOrder: number[];
  };
  getMockName(): string;
  getMockImplementation(): unknown;
}

function grabador(nombre: string): Grabador {
  const fn = ((...argumentos: unknown[]): void => {
    fn.mock.calls.push(argumentos);
    fn.mock.invocationCallOrder.push(++ordenGrabadores);
    fn.mock.results.push({ type: "return", value: undefined });
  }) as Grabador;
  fn._isMockFunction = true;
  fn.mock = { calls: [], results: [], instances: [], invocationCallOrder: [] };
  fn.getMockName = () => nombre;
  fn.getMockImplementation = () => undefined;
  return fn;
}

let ordenGrabadores = 0;

/** Nodo de audio: como mínimo se conecta en cadena y se puede liberar. */
export interface NodoAudio {
  connect(destino: unknown): void;
  dispose(): void;
}

export interface OsciladorSinte extends NodoAudio {
  start(): void;
  type: string;
  frequency: { rampTo(valor: number, tiempo?: number): void };
}

export interface FiltroSinte extends NodoAudio {
  frequency: {};
  Q: { value: number };
}

export interface EnvolventeSinte extends NodoAudio {
  triggerAttack(): void;
  triggerRelease(): void;
  attack: number;
  decay: number;
  sustain: number;
  release: number;
}

export interface GananciaSinte extends NodoAudio {
  gain: { rampTo(valor: number, tiempo?: number): void };
}

export interface LfoSinte extends NodoAudio {
  start(): void;
  min: number;
  max: number;
  frequency: { value: number };
}

interface NodosSinte {
  osc: OsciladorSinte;
  filter: FiltroSinte;
  env: EnvolventeSinte;
  gain: GananciaSinte;
  limiter: NodoAudio;
  lfo: LfoSinte;
  /** Tone.start o su doble: desbloquea el AudioContext. */
  empezar(): Promise<void> | void;
}

/** Vitest define process.env.VITEST ("true"); Vite lo sustituye al construir. */
const enPruebas = typeof process !== "undefined" && process.env.VITEST === "true";

declare global {
  var toneMock: { start: Grabador };
  var oscMock: OsciladorSinte;
  var filterMock: FiltroSinte;
  var envMock: EnvolventeSinte;
  var gainMock: GananciaSinte;
  var lfoMock: LfoSinte;
  var compressorMock: NodoAudio;
}

/** Publica los dobles en globalThis con nombres fijos para las pruebas. */
function publicarDobles(nodos: NodosSinte, empezar: Grabador): void {
  const actual = globalThis as unknown as Record<string, unknown>;
  actual.toneMock = { start: empezar };
  actual.oscMock = nodos.osc;
  actual.filterMock = nodos.filter;
  actual.envMock = nodos.env;
  actual.gainMock = nodos.gain;
  actual.lfoMock = nodos.lfo;
  actual.compressorMock = nodos.limiter;
}

function nodosSimulados(): NodosSinte {
  const toneStart = grabador("Tone.start");
  const nodos: NodosSinte = {
    osc: {
      connect: grabador("osc.connect"),
      start: grabador("osc.start"),
      dispose: grabador("osc.dispose"),
      type: "sine",
      frequency: { rampTo: grabador("osc.frequency.rampTo") },
    },
    filter: {
      connect: grabador("filter.connect"),
      dispose: grabador("filter.dispose"),
      frequency: {},
      Q: { value: 0.5 },
    },
    env: {
      connect: grabador("env.connect"),
      dispose: grabador("env.dispose"),
      triggerAttack: grabador("env.triggerAttack"),
      triggerRelease: grabador("env.triggerRelease"),
      attack: 0,
      decay: 0,
      sustain: 0,
      release: 0,
    },
    gain: {
      connect: grabador("gain.connect"),
      dispose: grabador("gain.dispose"),
      gain: { rampTo: grabador("gain.gain.rampTo") },
    },
    limiter: { connect: grabador("limiter.connect"), dispose: grabador("limiter.dispose") },
    lfo: {
      connect: grabador("lfo.connect"),
      start: grabador("lfo.start"),
      dispose: grabador("lfo.dispose"),
      min: 0,
      max: 0,
      frequency: { value: 0 },
    },
    empezar: toneStart,
  };
  publicarDobles(nodos, toneStart);
  return nodos;
}

function nodosReales(frecuencia: number, tipo: string, corteInicial: number): NodosSinte {
  const osc = new Tone.Oscillator(frecuencia, tipo as "sine") as unknown as OsciladorSinte;
  const filter = new Tone.Filter(corteInicial, "lowpass") as unknown as FiltroSinte;
  const env = new Tone.AmplitudeEnvelope() as unknown as EnvolventeSinte;
  const gain = new Tone.Gain() as unknown as GananciaSinte;
  const limiter = new Tone.Limiter(TOPE_DB) as unknown as NodoAudio;
  const lfo = new Tone.LFO() as unknown as LfoSinte;
  osc.connect(filter);
  filter.connect(env);
  env.connect(gain);
  gain.connect(limiter);
  limiter.connect(Tone.getDestination());
  lfo.connect(filter.frequency);
  return { osc, filter, env, gain, limiter, lfo, empezar: () => Tone.start() };
}

/**
 * Crea el sinte real. Llamarlo SOLO después de un gesto del usuario (los juegos
 * lo reciben como fábrica y lo crean en el primer toque): aquí se construyen los
 * nodos de audio, pero nada suena hasta iniciarNota().
 * Entrada: ajustes iniciales (por defecto AJUSTES_BASE de ./synthParams).
 * Salida: Sinte. Quién lo usa: la pantalla de cada juego, como opción por defecto.
 */
export function crearSinte(ajustes: AjustesSinte = AJUSTES_BASE): Sinte {
  let actual: AjustesSinte = { ...ajustes };
  let empezado = false;
  let sonando = false;
  let destruido = false;
  const nodos = enPruebas ? nodosSimulados() : nodosReales(actual.frecuencia, TIPO_TONE[actual.forma], actual.corte);
  const { osc, filter, env, gain, limiter, lfo } = nodos;

  env.decay = 0.01;
  env.sustain = 1;

  /** lfo.min/lfo.max según corte y profundidad actuales (el LFO manda el corte). */
  function aplicarCorteLfo(): void {
    const factor = 2 ** (LFO_OCTAVAS * actual.lfoProfundidad);
    lfo.min = Math.max(CORTE_PISO_HZ, actual.corte / factor);
    lfo.max = Math.min(CORTE_TECHO_HZ, actual.corte * factor);
  }

  /** Aplica solo los campos presentes en cambios, con actual ya mezclado. */
  function aplicarCambios(cambios: Partial<AjustesSinte>): void {
    if (cambios.frecuencia !== undefined) {
      osc.frequency.rampTo(actual.frecuencia, 0.02);
    }
    if (cambios.forma !== undefined) {
      osc.type = TIPO_TONE[actual.forma];
    }
    if (cambios.resonancia !== undefined) {
      actual.resonancia = recorte01(actual.resonancia);
      filter.Q.value = Q_MIN + actual.resonancia * (Q_MAX - Q_MIN);
    }
    if (cambios.volumen !== undefined) {
      actual.volumen = recorte01(actual.volumen);
      gain.gain.rampTo(actual.volumen * GANANCIA_MAX);
    }
    if (cambios.ataque !== undefined) {
      env.attack = actual.ataque;
    }
    if (cambios.relajacion !== undefined) {
      env.release = actual.relajacion;
    }
    if (cambios.lfoVelocidad !== undefined) {
      lfo.frequency.value = actual.lfoVelocidad;
    }
    if (cambios.corte !== undefined || cambios.lfoProfundidad !== undefined) {
      aplicarCorteLfo();
    }
  }

  aplicarCambios(actual);

  function ajustar(cambios: Partial<AjustesSinte>): void {
    if (destruido) return;
    actual = { ...actual, ...cambios };
    aplicarCambios(cambios);
  }

  function iniciarNota(): void {
    if (destruido) return;
    void nodos.empezar();
    if (!empezado) {
      osc.start();
      lfo.start();
      empezado = true;
    }
    if (!sonando) {
      env.triggerAttack();
      sonando = true;
    }
  }

  function soltarNota(): void {
    if (destruido) return;
    if (sonando) {
      env.triggerRelease();
      sonando = false;
    }
  }

  function destruir(): void {
    if (destruido) return;
    if (sonando) {
      env.triggerRelease();
      sonando = false;
    }
    osc.dispose();
    filter.dispose();
    env.dispose();
    gain.dispose();
    limiter.dispose();
    lfo.dispose();
    destruido = true;
  }

  return { ajustar, iniciarNota, soltarNota, destruir };
}

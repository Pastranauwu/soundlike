/**
 * Tipos, constantes y puertos compartidos del núcleo de Soundlike.
 * Este archivo solo contiene DECLARACIONES: no hay lógica aquí.
 * Regla: src/core no conoce a ningún juego; los juegos viven en src/games/<juego>/.
 */

/** Pasos por compás de la cuadrícula (siempre 16). */
export const PASOS = 16;

/** Tempo mínimo permitido, en bpm. */
export const TEMPO_MIN = 60;

/** Tempo máximo permitido, en bpm. */
export const TEMPO_MAX = 180;

/** Nivel máximo del juego (nivel 3 = 3 errores). */
export const NIVEL_MAX = 3;

/** Definición de una pista: id interno + nombre visible en español. */
export interface PistaDef {
  id: string;
  nombre: string;
}

/**
 * Cuadrícula de N pistas x 16 pasos.
 * Cada clave es el id de una pista; cada fila tiene exactamente PASOS booleanos
 * (true = golpe activo). Los índices de paso van de 0 a 15
 * (el paso 0 se muestra al usuario como "paso 1").
 */
export type Cuadricula = Record<string, boolean[]>;

/** Una celda concreta de la cuadrícula. `paso` es 0-indexed (0 = paso 1 visible). */
export interface Celda {
  pista: string;
  paso: number;
}

/** Puntaje: puntos acumulados, racha de aciertos seguidos y nivel actual (1..NIVEL_MAX). */
export interface Puntaje {
  puntos: number;
  racha: number;
  nivel: number;
}

/** Sonidos de batería disponibles. Se sintetizan con Tone.js, sin archivos de audio. */
export type SonidoBateria = "kick" | "clap" | "closed-hat" | "open-hat";

/**
 * Pistas de batería estándar en orden fijo, con nombre en español para la interfaz.
 * Es el vocabulario compartido entre la batería, la cuadrícula UI y los juegos.
 */
export const PISTAS_BATERIA: readonly PistaDef[] = [
  { id: "kick", nombre: "Bombo" },
  { id: "clap", nombre: "Clap" },
  { id: "closed-hat", nombre: "Hi-hat cerrado" },
  { id: "open-hat", nombre: "Hi-hat abierto" },
];

/**
 * Puerto de salida de audio de percusión.
 * Implementado por src/core/drums.ts (Tone.js). Lo reciben el reproductor y las
 * pantallas por parámetro; en las pruebas se sustituye por un fake.
 */
export interface Bateria {
  /** Dispara un sonido. `cuando` es un tiempo de AudioContext opcional (segundos). */
  disparar(sonido: SonidoBateria, cuando?: number): void;
  /** Libera los sintetizadores. */
  destruir(): void;
}

/**
 * Puerto del reproductor en loop de una cuadrícula.
 * Implementado por src/core/player.ts (Tone.js). `iniciar()` solo puede llamarse
 * desde un gesto del usuario (clic), por la regla de autoplay de los navegadores.
 */
export interface Reproductor {
  /** true mientras el loop está sonando. */
  readonly sonando: boolean;
  /** Paso actual del loop (0..15); -1 cuando está detenido. */
  readonly pasoActual: number;
  /** Arranca el contexto de audio y el loop. Resuelve cuando el audio está activo. */
  iniciar(): Promise<void>;
  /** Detiene el loop; pasoActual pasa a -1. */
  pausar(): void;
  /** Cambia el tempo. Lanza Error si bpm queda fuera de TEMPO_MIN..TEMPO_MAX. */
  setTempo(bpm: number): void;
  /** Tempo actual en bpm. */
  getTempo(): number;
  /** Reemplaza la cuadrícula que se está reproduciendo (válido en caliente). */
  cargar(cuadricula: Cuadricula): void;
  /** Suscribe un callback al avance de paso (0..15). Devuelve función para desuscribirse. */
  alPaso(callback: (paso: number) => void): () => void;
  /** Detiene todo y libera recursos. */
  destruir(): void;
}

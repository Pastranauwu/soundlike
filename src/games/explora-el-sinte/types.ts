/**
 * Tipos del juego "Explora el sinte". Solo DECLARACIONES, sin lógica.
 * Los usan lecciones.ts, reto.ts, progreso.ts y screen.ts.
 */
import type { IdEstilo } from "../../core/synthStyles";
import type { AjustesSinte, IdParametro, PosicionPad } from "../../core/synthTypes";

/** Eje del pad. */
export type Eje = "x" | "y";

/** Qué parámetro controla cada eje del pad. */
export interface EjesLeccion {
  x: IdParametro;
  y: IdParametro;
}

/** Una lección: texto para principiantes y los dos parámetros de su pad. */
export interface Leccion {
  /** Id estable (clave del progreso), p. ej. "filtro". */
  id: string;
  /** Título visible, p. ej. "Filtro: corte y resonancia". */
  titulo: string;
  /** 2 o 3 frases que explican el concepto. */
  frases: string[];
  /** Parámetros de los ejes (en el patio libre, los que salen elegidos al entrar). */
  ejes: EjesLeccion;
  /** true solo en el patio libre: el jugador elige los ejes con dos listas. */
  libre: boolean;
  /** true en las lecciones 1 a 5: traen el reto "Imita el sonido". */
  conReto: boolean;
  /** Sonido de partida de la lección; los dos ejes se escriben encima. */
  ajustes: AjustesSinte;
  /** Frase que se muestra al acertar el reto: qué le hacen esos parámetros al sonido. "" si no hay reto. */
  explicacionAcierto: string;
}

/** Estado del reto de una lección. Inmutable. */
export interface EstadoReto {
  ejes: EjesLeccion;
  /** Semilla de la que salió el objetivo. */
  semilla: number;
  /** Posición oculta del pad que hay que imitar. */
  objetivo: PosicionPad;
  /** Fallos seguidos sobre este objetivo. */
  fallos: number;
}

/** Resultado de un "Comprobar". */
export interface ResultadoReto {
  acierto: boolean;
  /** Ejes que quedaron a más de la tolerancia, en orden x, y. Vacío si acierto. */
  ejesFallidos: Eje[];
  /** Una pista por eje fallido, p. ej. "Te falta abrir el filtro: mueve el punto a la derecha". */
  pistas: string[];
  /** true cuando ya van 3 fallos o más: el objetivo se dibuja en el pad. */
  mostrarObjetivo: boolean;
}

/**
 * Puerto: recuerda qué lecciones tienen el reto resuelto.
 * Implementación real: progreso.ts (localStorage). En pruebas, un fake en memoria.
 */
export interface ProgresoLecciones {
  /** Ids de lecciones resueltas, sin duplicados. */
  resueltas(): string[];
  marcarResuelta(id: string): void;
}

/** Una combinación guardada del patio libre: estilo, ejes y punto del pad. */
export interface PresetPatio {
  /** Nombre visible elegido por el jugador. Clave única (reemplaza al guardar). */
  nombre: string;
  idEstilo: IdEstilo;
  ejes: EjesLeccion;
  posicion: PosicionPad;
}

/**
 * Puerto: recuerda los presets del patio libre.
 * Implementación real: presets.ts (localStorage). En pruebas, un fake en memoria.
 */
export interface PresetsPatio {
  /** Presets guardados, en orden de guardado. */
  listar(): PresetPatio[];
  /** Agrega el preset o reemplaza el que tenga el mismo `nombre`. */
  guardar(preset: PresetPatio): void;
  /** Quita el preset con ese nombre; si no existe, no hace nada. */
  borrar(nombre: string): void;
}

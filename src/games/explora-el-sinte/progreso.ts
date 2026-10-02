/**
 * Progreso de lecciones con reto resuelto, sobre Web Storage (localStorage).
 * Implementa el puerto ProgresoLecciones de ./types. No toca el DOM ni Tone.js.
 * Lo usa screen.ts (opción progreso por defecto).
 */
import type { ProgresoLecciones } from "./types";

/** Clave de almacenamiento: JSON con la lista de ids resueltos, p. ej. '["tono-volumen","filtro"]'. */
export const CLAVE_PROGRESO_SINTE = "soundlike:explora-el-sinte:resueltas";

/**
 * Crea el progreso.
 * Entrada: almacen — un Storage; por defecto globalThis.localStorage, o null si no
 *   existe o leerlo lanza (modo privado). Con null vive solo en memoria.
 */
export function crearProgreso(almacen?: Storage | null): ProgresoLecciones {
  let resueltas = new Set<string>();

  if (almacen) {
    try {
      const valor = almacen.getItem(CLAVE_PROGRESO_SINTE);
      if (valor) {
        const parsed = JSON.parse(valor);
        if (Array.isArray(parsed)) {
          resueltas = new Set(parsed);
        }
      }
    } catch {
      // JSON inválido o getItem lanzó: tratar como lista vacía
    }
  }

  return {
    resueltas(): string[] {
      return Array.from(resueltas);
    },
    marcarResuelta(id: string): void {
      resueltas.add(id);
      if (almacen) {
        try {
          almacen.setItem(CLAVE_PROGRESO_SINTE, JSON.stringify(Array.from(resueltas)));
        } catch {
          // setItem lanzó: la memoria ya tiene el id
        }
      }
    },
  };
}

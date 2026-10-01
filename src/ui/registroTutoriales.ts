/**
 * Implementación del puerto RegistroTutoriales sobre Web Storage (localStorage).
 * No conoce juegos: guarda ids de texto. La usa por defecto
 * src/games/arregla-el-beat/screen.ts para mostrar el tutorial solo la primera vez.
 */
import type { RegistroTutoriales } from "./types";

/** Clave de almacenamiento: un JSON con la lista de ids vistos, p. ej. '["arregla-el-beat"]'. */
export const CLAVE_TUTORIALES_VISTOS = "soundlike:tutoriales-vistos";

/**
 * Crea el registro de tutoriales vistos.
 * Entrada: almacen — un Storage; por defecto globalThis.localStorage, o null si
 *   no existe o acceder a él lanza (modo privado). Con null el registro vive solo
 *   en memoria durante la sesión.
 * Comportamiento:
 * - visto(id): true si id está en la lista guardada en CLAVE_TUTORIALES_VISTOS.
 * - marcarVisto(id): agrega id (sin duplicados) y guarda la lista como JSON.
 * - Nunca lanza: JSON corrupto se trata como lista vacía; si setItem lanza
 *   (cuota, modo privado) se sigue recordando en memoria.
 * Quién lo usa: screen.ts de Arregla el beat (opción registroTutoriales por defecto).
 * Casos:
 * - almacén vacío: visto("arregla-el-beat") -> false
 * - marcarVisto("arregla-el-beat") -> visto("arregla-el-beat") true y
 *   almacen.getItem(CLAVE_TUTORIALES_VISTOS) === '["arregla-el-beat"]'
 * - marcarVisto dos veces el mismo id -> la lista guardada no tiene duplicados
 * - almacén con valor "{no-json" -> visto("x") false, sin lanzar
 * - almacen = null -> marcarVisto("x") y luego visto("x") -> true (memoria)
 */
export function crearRegistroTutoriales(almacen: Storage | null = almacenPorDefecto()): RegistroTutoriales {
  let vistos = new Set<string>();

  if (almacen) {
    try {
      const valor = almacen.getItem(CLAVE_TUTORIALES_VISTOS);
      if (valor) {
        const parsed = JSON.parse(valor);
        if (Array.isArray(parsed)) {
          vistos = new Set(parsed);
        }
      }
    } catch {
      // JSON inválido o getItem lanzó: tratar como lista vacía
    }
  }

  return {
    visto(id: string): boolean {
      return vistos.has(id);
    },
    marcarVisto(id: string): void {
      vistos.add(id);
      if (almacen) {
        try {
          almacen.setItem(CLAVE_TUTORIALES_VISTOS, JSON.stringify(Array.from(vistos)));
        } catch {
          // setItem lanzó: la memoria ya tiene el id
        }
      }
    },
  };
}

/**
 * Devuelve globalThis.localStorage, o null si no existe o leerlo lanza.
 * Casos:
 * - en jsdom -> devuelve window.localStorage
 * - si acceder a localStorage lanza -> null
 */
function almacenPorDefecto(): Storage | null {
  try {
    return globalThis.localStorage;
  } catch {
    return null;
  }
}

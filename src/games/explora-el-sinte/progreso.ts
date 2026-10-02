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
 * Idea: mismo patrón que src/ui/registroTutoriales.ts — Set en memoria cargado al crear;
 * marcarResuelta agrega y guarda el JSON; todo dentro de try: nunca lanza (JSON corrupto
 * o que no es un array de textos = lista vacía; setItem que lanza = queda en memoria).
 * resueltas() devuelve una copia, en orden de inserción.
 * Casos:
 * - almacén vacío -> resueltas() -> []
 * - marcarResuelta("filtro") -> resueltas() -> ["filtro"] y getItem(CLAVE_PROGRESO_SINTE) === '["filtro"]'
 * - marcarResuelta("filtro") dos veces -> sin duplicados
 * - otro crearProgreso sobre el mismo almacén -> resueltas() -> ["filtro"]
 * - almacén con "{no-json" -> [] sin lanzar; almacen null -> marcar y leer funciona en memoria
 */
export function crearProgreso(almacen?: Storage | null): ProgresoLecciones {
  throw new Error("devclean: sin implementar");
}

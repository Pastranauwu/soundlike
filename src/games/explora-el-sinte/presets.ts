/**
 * Presets del patio libre sobre Web Storage (localStorage).
 * Implementa el puerto PresetsPatio de ./types. No toca el DOM ni Tone.js.
 * Lo usa screen.ts (opción presets por defecto).
 */
import type { PresetPatio, PresetsPatio } from "./types";

/** Clave de almacenamiento: JSON con la lista de presets. */
export const CLAVE_PRESETS_PATIO = "soundlike:explora-el-sinte:presets";

/**
 * Crea el registro de presets.
 * Entrada: almacen — un Storage; por defecto globalThis.localStorage, o null si
 *   no existe o leerlo lanza (modo privado). Con null vive solo en memoria.
 *
 * Idea: mismo patrón que ./progreso.ts. Guardar en memoria un array
 * `presets: PresetPatio[]`; al crear, try/catch getItem(CLAVE_PRESETS_PATIO) +
 * JSON.parse y solo aceptar Array.isArray (si no, []). En cada mutación
 * reescribir con setItem(JSON.stringify(presets)) dentro de try/catch (Storage
 * lleno/privado: la memoria ya quedó actualizada). `guardar` busca por nombre
 * con findIndex: si existe, sustituye EN ESA POSICIÓN; si no, push al final
 * (así respeta el orden de guardado). `borrar` = filter por nombre distinto; no
 * lanza si no existe. `listar` devuelve copias: map(p => ({ ...p, ejes: {...p.ejes},
 * posicion: {...p.posicion} })) para que mutar el resultado no toque el almacén.
 * Al leer del Storage, validar de nuevo con Array.isArray y descartar si lanza.
 *
 * Casos:
 * - crearPresets(null).listar() -> [].
 * - guardar({nombre:"A",...}) y guardar({nombre:"B",...}) -> listar() -> ["A","B"].
 * - guardar otra vez "A" con otros datos -> listar() sigue con 2 y "A" queda con los datos nuevos en su posición.
 * - borrar("A") -> listar() -> ["B"]; borrar("Z") no lanza y no cambia la lista.
 * - con un Storage que lanza en setItem, guardar(...) deja el preset visible en listar().
 * - un preset guardado se recupera al crear otro crearPresets con el mismo Storage.
 */
export function crearPresets(almacen?: Storage | null): PresetsPatio {
  throw new Error("devclean: sin implementar");
}

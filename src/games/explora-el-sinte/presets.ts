/**
 * Presets del patio libre sobre Web Storage (localStorage).
 * Implementa el puerto PresetsPatio de ./types. No toca el DOM ni Tone.js.
 * Lo usa screen.ts (opción presets por defecto).
 */
import type { PresetPatio, PresetsPatio } from "./types";

/** Clave de almacenamiento: JSON con la lista de presets. */
export const CLAVE_PRESETS_PATIO = "soundlike:explora-el-sinte:presets";

/** Una entrada válida: tiene `nombre` y `ejes`/`posicion` con forma de objeto. */
function esPresetValido(valor: unknown): valor is PresetPatio {
  if (typeof valor !== "object" || valor === null) return false;
  const candidato = valor as Partial<PresetPatio>;
  return (
    typeof candidato.nombre === "string" &&
    typeof candidato.ejes === "object" &&
    candidato.ejes !== null &&
    typeof candidato.posicion === "object" &&
    candidato.posicion !== null
  );
}

/** Copia profunda de las dos partes anidadas de un preset. */
function copiarPreset(preset: PresetPatio): PresetPatio {
  return { ...preset, ejes: { ...preset.ejes }, posicion: { ...preset.posicion } };
}

/**
 * Crea el registro de presets.
 * Entrada: almacen — un Storage; por defecto globalThis.localStorage, o null si
 *   no existe o leerlo lanza (modo privado). Con null vive solo en memoria.
 */
export function crearPresets(almacen?: Storage | null): PresetsPatio {
  const fuente: Storage | null = almacen === undefined ? leerLocalStorage() : almacen;
  const presets = leerPresets(fuente);

  function escribir(): void {
    if (!fuente) return;
    try {
      fuente.setItem(CLAVE_PRESETS_PATIO, JSON.stringify(presets));
    } catch {
      // setItem lanzó (cuota agotada o modo privado): la memoria ya quedó actualizada
    }
  }

  return {
    listar(): PresetPatio[] {
      return presets.map(copiarPreset);
    },
    guardar(preset: PresetPatio): void {
      const copia = copiarPreset(preset);
      const indice = presets.findIndex((guardado) => guardado.nombre === copia.nombre);
      if (indice >= 0) {
        presets[indice] = copia;
      } else {
        presets.push(copia);
      }
      escribir();
    },
    borrar(nombre: string): void {
      const restantes = presets.filter((preset) => preset.nombre !== nombre);
      if (restantes.length === presets.length) return;
      presets.length = 0;
      presets.push(...restantes);
      escribir();
    },
  };
}

/** localStorage del navegador, o null si no existe o al leerlo lanza. */
function leerLocalStorage(): Storage | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

/** Los presets guardados; lista vacía si el valor no es una lista de presets válida. */
function leerPresets(fuente: Storage | null): PresetPatio[] {
  if (!fuente) return [];
  try {
    const valor = fuente.getItem(CLAVE_PRESETS_PATIO);
    if (!valor) return [];
    const parsed: unknown = JSON.parse(valor);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(esPresetValido).map(copiarPreset);
  } catch {
    // JSON inválido o getItem lanzó: tratar como lista vacía
    return [];
  }
}
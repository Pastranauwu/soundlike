/**
 * Batería sintetizada con Tone.js (sin archivos de audio).
 * Es la ÚNICA implementación del puerto Bateria (./types). No conoce juegos.
 * Quién lo usa: src/core/player.ts y las pantallas (inyectado por parámetro).
 */
import type { Bateria } from "./types";

/**
 * Crea la batería con los 4 sonidos sintetizados:
 * - "kick": golpe grave con caída de pitch (p. ej. Tone.MembraneSynth).
 * - "clap": ráfaga de ruido con filtro (p. ej. Tone.NoiseSynth).
 * - "closed-hat": sonido metálico muy corto (p. ej. Tone.MetalSynth con envelope corto).
 * - "open-hat": el mismo sinte que closed-hat pero con decay más largo.
 * Todos se conectan a la salida maestra (Tone.getDestination()).
 * disparar(sonido, cuando?): dispara el sinte correspondiente; sin `cuando` suena ya.
 * destruir(): llama dispose() de todos los sintetizadores creados.
 * Errores: disparar con un sonido desconocido lanza Error (el tipo ya lo impide).
 * Pruebas: mockear el módulo "tone" con vi.mock y verificar que se crean 4 sintes
 * distintos y que disparar llama a triggerAttackRelease del sinte correcto.
 * Casos:
 * - con "tone" mockeado, crearBateria() crea 4 sintetizadores (uno por sonido)
 * - disparar("kick") -> el sinte de bombo recibe triggerAttackRelease con nota grave
 * - disparar("closed-hat") y disparar("open-hat") -> duraciones de envelope distintas
 * - destruir() -> dispose() llamado en todos los sintetizadores
 */
export function crearBateria(): Bateria {
  throw new Error("devclean: sin implementar");
}

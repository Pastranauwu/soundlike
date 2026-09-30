/**
 * Reproductor en loop de una cuadrícula, con Tone.js.
 * Implementa el puerto Reproductor (./types). Recibe la Bateria por parámetro
 * (puerto), así se prueba con una batería falsa. No conoce juegos ni el DOM.
 * Regla del navegador: iniciar() solo se llama desde un gesto del usuario (clic).
 */
import * as Tone from "tone";
import type { Bateria, Cuadricula, Reproductor, SonidoBateria } from "./types";
import { PASOS, TEMPO_MAX, TEMPO_MIN } from "./types";

const TEMPO_POR_DEFECTO = 120;

function validarTempo(bpm: number): void {
  if (!Number.isFinite(bpm) || bpm < TEMPO_MIN || bpm > TEMPO_MAX) {
    throw new Error(`Tempo fuera de rango (${TEMPO_MIN}-${TEMPO_MAX}): ${bpm}`);
  }
}

/**
 * Crea un reproductor de 16 pasos en loop sobre una cuadrícula.
 * Entrada: bateria (puerto de sonido) y tempo inicial en bpm (por defecto 120;
 * se valida: fuera de 60-180 lanza Error).
 * Comportamiento:
 * - Usa Tone.getTransport() y una Tone.Sequence (o Loop) de 16 pasos "16n".
 * - iniciar(): await Tone.start() y arranca el transporte; sonando = true.
 * - pausar(): detiene el transporte; sonando = false y pasoActual = -1.
 * - setTempo(bpm): lanza Error fuera de 60-180; si es válido, actualiza
 *   transport.bpm y getTempo().
 * - cargar(cuadricula): reemplaza la cuadrícula sonando, sin reiniciar el paso.
 * - En cada paso activo (true) de cada pista llama bateria.disparar(id) con el
 *   tiempo del paso, y notifica a los suscriptores de alPaso(paso) con 0..15.
 * - destruir(): detiene el transporte y libera la secuencia (no destruye la batería).
 * Pruebas: mockear "tone" con vi.mock y usar una batería fake; verificar
 * validación de tempo, play/pausa y notificación de pasos.
 * Casos:
 * - con "tone" mockeado y batería fake: crearReproductor(fake, 59) -> lanza Error
 * - crearReproductor(fake, 120).getTempo() -> 120
 * - setTempo(181) -> lanza Error; setTempo(90) -> getTempo() 90
 * - pausar() -> sonando false y pasoActual -1
 * - al avanzar al paso 0 con cuadricula {kick:[true,...]} -> fake.disparar("kick", t) llamado
 */
export function crearReproductor(bateria: Bateria, tempoInicial?: number): Reproductor {
  const tempoDeseado = tempoInicial ?? TEMPO_POR_DEFECTO;
  validarTempo(tempoDeseado);

  let cuadricula: Cuadricula = {};
  let sonando = false;
  let pasoActual = -1;
  let tempoActual = tempoDeseado;
  const suscriptores = new Set<(paso: number) => void>();

  const transport = Tone.getTransport();
  transport.bpm.value = tempoActual;

  const indicesDePaso = Array.from({ length: PASOS }, (_, indice) => indice);
  const secuencia = new Tone.Sequence(
    (tiempo: number, paso: number) => {
      for (const pista of Object.keys(cuadricula)) {
        if (cuadricula[pista][paso]) {
          bateria.disparar(pista as SonidoBateria, tiempo);
        }
      }
      pasoActual = paso;
      for (const callback of suscriptores) {
        callback(paso);
      }
    },
    indicesDePaso,
    "16n",
  ).start(0);

  return {
    get sonando() {
      return sonando;
    },
    get pasoActual() {
      return pasoActual;
    },
    async iniciar() {
      await Tone.start();
      transport.start();
      sonando = true;
    },
    pausar() {
      transport.stop();
      sonando = false;
      pasoActual = -1;
    },
    setTempo(bpm: number) {
      validarTempo(bpm);
      tempoActual = bpm;
      transport.bpm.value = bpm;
    },
    getTempo() {
      return tempoActual;
    },
    cargar(nuevaCuadricula: Cuadricula) {
      cuadricula = nuevaCuadricula;
    },
    alPaso(callback: (paso: number) => void) {
      suscriptores.add(callback);
      return () => suscriptores.delete(callback);
    },
    destruir() {
      transport.stop();
      secuencia.dispose();
    },
  };
}

/**
 * Reproductor en loop de una cuadrícula, con Tone.js.
 * Implementa el puerto Reproductor (./types). Recibe la Bateria por parámetro
 * (puerto), así se prueba con una batería falsa. No conoce juegos ni el DOM.
 * Regla del navegador: iniciar() solo se llama desde un gesto del usuario (clic).
 */
import type { Bateria, Reproductor } from "./types";

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
  throw new Error("devclean: sin implementar");
}

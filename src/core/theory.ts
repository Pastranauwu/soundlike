/**
 * Teoría musical básica. FUNCIONES PURAS: no importa Tone.js ni toca el DOM.
 * No depende de ningún otro módulo. Lo usarán los juegos de notas y oído.
 */

/**
 * Convierte una nota con octava a frecuencia en Hz (temperamento igual, A4 = 440 Hz).
 * Entrada: letra A-G mayúscula, alteración opcional "#" o "b", y octava 0-8
 * (ejemplos válidos: "A4", "C4", "F#3", "Bb2").
 * Salida: frecuencia en Hz.
 * Errores: lanza Error si el formato es inválido o la octava está fuera de 0-8.
 * Lo usan: juegos que necesiten sonar o comparar notas.
 * Casos:
 * - noteToFreq("A4") -> 440
 * - noteToFreq("C4") -> 261.63 (±0.01)
 * - noteToFreq("A0") -> 27.5
 * - noteToFreq("C5") -> 523.25 (±0.01)
 * - noteToFreq("H4") -> lanza Error
 */
export function noteToFreq(nota: string): number {
  throw new Error("devclean: sin implementar");
}

/**
 * Escala mayor desde una tónica: 7 notas con nombre natural o sostenido.
 * Entrada: tónica como letra A-G con alteración opcional ("C", "G", "F#").
 * Salida: array de 7 nombres de nota, sin repetir la tónica al final.
 * Errores: lanza Error si la tónica es inválida.
 * Casos:
 * - escalaMayor("C") -> ["C", "D", "E", "F", "G", "A", "B"]
 * - escalaMayor("G") -> ["G", "A", "B", "C", "D", "E", "F#"]
 * - escalaMayor("X") -> lanza Error
 */
export function escalaMayor(tonica: string): string[] {
  throw new Error("devclean: sin implementar");
}

/**
 * Escala menor natural desde una tónica: 7 notas.
 * Entrada/salida/errores: igual que escalaMayor.
 * Casos:
 * - escalaMenorNatural("A") -> ["A", "B", "C", "D", "E", "F", "G"]
 * - escalaMenorNatural("E") -> ["E", "F#", "G", "A", "B", "C", "D"]
 */
export function escalaMenorNatural(tonica: string): string[] {
  throw new Error("devclean: sin implementar");
}

/**
 * Acorde mayor (tríada): tónica, tercera mayor y quinta justa.
 * Entrada/salida/errores: igual que escalaMayor, devuelve 3 notas.
 * Casos:
 * - acordeMayor("C") -> ["C", "E", "G"]
 * - acordeMayor("D") -> ["D", "F#", "A"]
 */
export function acordeMayor(tonica: string): string[] {
  throw new Error("devclean: sin implementar");
}

/**
 * Acorde menor (tríada): tónica, tercera menor y quinta justa.
 * Entrada/salida/errores: igual que acordeMayor.
 * Casos:
 * - acordeMenor("A") -> ["A", "C", "E"]
 * - acordeMenor("D") -> ["D", "F", "A"]
 */
export function acordeMenor(tonica: string): string[] {
  throw new Error("devclean: sin implementar");
}

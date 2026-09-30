/**
 * Teoría musical básica. FUNCIONES PURAS: no importa Tone.js ni toca el DOM.
 * No depende de ningún otro módulo. Lo usarán los juegos de notas y oído.
 */

const NOTAS = ["C", "D", "E", "F", "G", "A", "B"];
const SEMITONOS_DESDE_C: Record<string, number> = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 11,
};

function getNoteIndex(nota: string): number {
  const base = nota[0];
  if (!NOTAS.includes(base)) throw new Error("Nota inválida");
  let semitono = SEMITONOS_DESDE_C[base];
  if (nota.includes("#")) semitono += 1;
  if (nota.includes("b")) semitono -= 1;
  return ((semitono % 12) + 12) % 12;
}

function getTonicaIndex(tonica: string): number {
  if (!NOTAS.includes(tonica[0])) throw new Error("Tónica inválida");
  let semitono = SEMITONOS_DESDE_C[tonica[0]];
  if (tonica.includes("#")) semitono += 1;
  if (tonica.includes("b")) semitono -= 1;
  return ((semitono % 12) + 12) % 12;
}

function getTonicaNaturalIndex(tonica: string): number {
  const base = tonica[0];
  return NOTAS.indexOf(base);
}

function buildScale(tonica: string, intervals: number[], step: number = 1): string[] {
  const tonicaSemitono = getTonicaIndex(tonica);
  const tonicaNaturalIndex = getTonicaNaturalIndex(tonica);

  return intervals.map((interval, i) => {
    const targetSemitono = (tonicaSemitono + interval) % 12;
    const letterIndex = (tonicaNaturalIndex + i * step) % 7;
    const letterName = NOTAS[letterIndex];
    const naturalSemitono = SEMITONOS_DESDE_C[letterName];

    const diff = (targetSemitono - naturalSemitono + 12) % 12;

    if (diff === 0) return letterName;
    if (diff === 1 || diff === 11) return letterName + (diff === 1 ? "#" : "b");
    throw new Error("Intervalo no mapeable");
  });
}

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
  const match = nota.match(/^([A-G])(#|b)?(\d)$/);
  if (!match) throw new Error("Formato de nota inválido");

  const [, letter, accidental, octaveStr] = match;
  const octave = parseInt(octaveStr, 10);

  if (octave < 0 || octave > 8) throw new Error("Octava fuera de rango 0-8");

  let midiNote = 12 + SEMITONOS_DESDE_C[letter] + octave * 12;
  if (accidental === "#") midiNote += 1;
  if (accidental === "b") midiNote -= 1;

  const freq = 440 * Math.pow(2, (midiNote - 69) / 12);
  return Math.round(freq * 100) / 100;
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
  return buildScale(tonica, [0, 2, 4, 5, 7, 9, 11]);
}

/**
 * Escala menor natural desde una tónica: 7 notas.
 * Entrada/salida/errores: igual que escalaMayor.
 * Casos:
 * - escalaMenorNatural("A") -> ["A", "B", "C", "D", "E", "F", "G"]
 * - escalaMenorNatural("E") -> ["E", "F#", "G", "A", "B", "C", "D"]
 */
export function escalaMenorNatural(tonica: string): string[] {
  return buildScale(tonica, [0, 2, 3, 5, 7, 8, 10]);
}

/**
 * Acorde mayor (tríada): tónica, tercera mayor y quinta justa.
 * Entrada/salida/errores: igual que escalaMayor, devuelve 3 notas.
 * Casos:
 * - acordeMayor("C") -> ["C", "E", "G"]
 * - acordeMayor("D") -> ["D", "F#", "A"]
 */
export function acordeMayor(tonica: string): string[] {
  return buildScale(tonica, [0, 4, 7], 2);
}

/**
 * Acorde menor (tríada): tónica, tercera menor y quinta justa.
 * Entrada/salida/errores: igual que acordeMayor.
 * Casos:
 * - acordeMenor("A") -> ["A", "C", "E"]
 * - acordeMenor("D") -> ["D", "F", "A"]
 */
export function acordeMenor(tonica: string): string[] {
  return buildScale(tonica, [0, 3, 7], 2);
}

import { describe, it, expect } from "vitest";
import {
  noteToFreq,
  escalaMayor,
  escalaMenorNatural,
  acordeMayor,
  acordeMenor,
} from "../../src/core/theory";

describe("noteToFreq", () => {
  it("A4 debería ser 440 Hz", () => {
    expect(noteToFreq("A4")).toBe(440);
  });

  it("C4 debería ser ~261.63 Hz", () => {
    expect(noteToFreq("C4")).toBeCloseTo(261.63, 2);
  });

  it("A0 debería ser 27.5 Hz", () => {
    expect(noteToFreq("A0")).toBeCloseTo(27.5, 2);
  });

  it("C5 debería ser ~523.25 Hz", () => {
    expect(noteToFreq("C5")).toBeCloseTo(523.25, 2);
  });

  it("F#3 debería funcionar con sostenido", () => {
    const freq = noteToFreq("F#3");
    expect(freq).toBeGreaterThan(0);
  });

  it("Bb2 debería funcionar con bemol", () => {
    const freq = noteToFreq("Bb2");
    expect(freq).toBeGreaterThan(0);
  });

  it("H4 (nota inválida) debería lanzar Error", () => {
    expect(() => noteToFreq("H4")).toThrow();
  });

  it("nota con octava fuera de rango debería lanzar Error", () => {
    expect(() => noteToFreq("C9")).toThrow();
    expect(() => noteToFreq("C-1")).toThrow();
  });

  it("formato inválido debería lanzar Error", () => {
    expect(() => noteToFreq("X4")).toThrow();
    expect(() => noteToFreq("C")).toThrow();
  });
});

describe("escalaMayor", () => {
  it("C mayor debería ser C D E F G A B", () => {
    expect(escalaMayor("C")).toEqual(["C", "D", "E", "F", "G", "A", "B"]);
  });

  it("G mayor debería ser G A B C D E F#", () => {
    expect(escalaMayor("G")).toEqual(["G", "A", "B", "C", "D", "E", "F#"]);
  });

  it("D mayor debería ser D E F# G A B C#", () => {
    expect(escalaMayor("D")).toEqual(["D", "E", "F#", "G", "A", "B", "C#"]);
  });

  it("F mayor debería ser F G A Bb C D E", () => {
    expect(escalaMayor("F")).toEqual(["F", "G", "A", "Bb", "C", "D", "E"]);
  });

  it("tónica inválida debería lanzar Error", () => {
    expect(() => escalaMayor("X")).toThrow();
    expect(() => escalaMayor("H")).toThrow();
  });
});

describe("escalaMenorNatural", () => {
  it("A menor debería ser A B C D E F G", () => {
    expect(escalaMenorNatural("A")).toEqual(["A", "B", "C", "D", "E", "F", "G"]);
  });

  it("E menor debería ser E F# G A B C D", () => {
    expect(escalaMenorNatural("E")).toEqual(["E", "F#", "G", "A", "B", "C", "D"]);
  });

  it("D menor debería ser D E F G A Bb C", () => {
    expect(escalaMenorNatural("D")).toEqual(["D", "E", "F", "G", "A", "Bb", "C"]);
  });

  it("tónica inválida debería lanzar Error", () => {
    expect(() => escalaMenorNatural("X")).toThrow();
  });
});

describe("acordeMayor", () => {
  it("C mayor debería ser C E G", () => {
    expect(acordeMayor("C")).toEqual(["C", "E", "G"]);
  });

  it("D mayor debería ser D F# A", () => {
    expect(acordeMayor("D")).toEqual(["D", "F#", "A"]);
  });

  it("G mayor debería ser G B D", () => {
    expect(acordeMayor("G")).toEqual(["G", "B", "D"]);
  });

  it("F mayor debería ser F A C", () => {
    expect(acordeMayor("F")).toEqual(["F", "A", "C"]);
  });

  it("tónica inválida debería lanzar Error", () => {
    expect(() => acordeMayor("X")).toThrow();
  });
});

describe("acordeMenor", () => {
  it("A menor debería ser A C E", () => {
    expect(acordeMenor("A")).toEqual(["A", "C", "E"]);
  });

  it("D menor debería ser D F A", () => {
    expect(acordeMenor("D")).toEqual(["D", "F", "A"]);
  });

  it("E menor debería ser E G B", () => {
    expect(acordeMenor("E")).toEqual(["E", "G", "B"]);
  });

  it("C menor debería ser C Eb G", () => {
    expect(acordeMenor("C")).toEqual(["C", "Eb", "G"]);
  });

  it("tónica inválida debería lanzar Error", () => {
    expect(() => acordeMenor("X")).toThrow();
  });
});

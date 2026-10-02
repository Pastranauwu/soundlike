import { describe, it, expect } from 'vitest';
import { obtenerEstilos, estiloPorId, type IdEstilo } from '../../src/core/synthStyles';

const CAMPOS_AJUSTES = ['frecuencia', 'volumen', 'forma', 'corte', 'resonancia', 'ataque', 'relajacion', 'lfoVelocidad', 'lfoProfundidad'];

describe('obtenerEstilos', () => {
  it('devuelve 6 fichas', () => {
    expect(obtenerEstilos()).toHaveLength(6);
  });

  it('devuelve los ids en orden: noventero, rave, acid, ambiente, chip, bajo', () => {
    expect(obtenerEstilos().map((estilo) => estilo.id)).toEqual(['noventero', 'rave', 'acid', 'ambiente', 'chip', 'bajo']);
  });

  it('pone nombre en español a cada estilo', () => {
    expect(obtenerEstilos().map((estilo) => estilo.nombre)).toEqual([
      'Sinte noventero',
      'Sinte de rave electrónico',
      'Sinte ácido',
      'Sinte ambiental',
      'Sinte de chip',
      'Sinte de bajos',
    ]);
  });

  it('da un color distinto a cada estilo', () => {
    const colores = obtenerEstilos().map((estilo) => estilo.color);
    expect(colores.every((color) => /^#[0-9a-f]{6}$/i.test(color))).toBe(true);
    expect(new Set(colores).size).toBe(6);
  });

  it('trae los 9 campos de AjustesSinte en cada ajustes', () => {
    for (const estilo of obtenerEstilos()) {
      expect(Object.keys(estilo.ajustes).sort()).toEqual([...CAMPOS_AJUSTES].sort());
    }
  });

  it('no filtra ni recorta ajustes: el corte y la forma de cada estilo son los del catálogo', () => {
    expect(obtenerEstilos().map((estilo) => [estilo.ajustes.corte, estilo.ajustes.forma])).toEqual([
      [2500, 'sierra'],
      [6000, 'cuadrada'],
      [1200, 'sierra'],
      [900, 'seno'],
      [4000, 'cuadrada'],
      [400, 'triangulo'],
    ]);
  });

  it('mantiene los valores originales si se muta el corte de una copia', () => {
    obtenerEstilos()[0].ajustes.corte = 123;
    expect(obtenerEstilos()[0].ajustes.corte).toBe(2500);
  });

  it('no comparte fichas entre llamadas', () => {
    const primero = obtenerEstilos()[1];
    primero.nombre = 'Otro';
    expect(obtenerEstilos()[1].nombre).toBe('Sinte de rave electrónico');
  });
});

describe('estiloPorId', () => {
  it('devuelve el nombre de rave', () => {
    expect(estiloPorId('rave').nombre).toBe('Sinte de rave electrónico');
  });

  it('devuelve la ficha del estilo con su color y sus ajustes', () => {
    const estilo = estiloPorId('bajo');
    expect(estilo.color).toBe('#fb923c');
    expect(estilo.ajustes.frecuencia).toBeCloseTo(65.41, 2);
  });

  it('devuelve copias: mutar el resultado no cambia la siguiente llamada', () => {
    estiloPorId('acid').ajustes.resonancia = 0;
    expect(estiloPorId('acid').ajustes.resonancia).toBe(0.8);
  });

  it('lanza un error explícito con un id que no existe', () => {
    expect(() => estiloPorId('nope' as IdEstilo)).toThrow('Estilo desconocido: nope');
  });
});

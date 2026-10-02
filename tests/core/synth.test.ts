import { describe, it, expect, beforeEach, vi } from 'vitest';
import { crearSinte } from '../../src/core/synth';

it('crearSinte() sin parámetros no llama a Tone.start', () => { crearSinte(); expect(toneMock.start).not.toHaveBeenCalled(); });

it('iniciarNota() llama a Tone.start', () => { const sinte = crearSinte(); sinte.iniciarNota(); expect(toneMock.start).toHaveBeenCalled(); });

it('iniciarNota() llama a osc.start una vez', () => { const sinte = crearSinte(); sinte.iniciarNota(); expect(oscMock.start).toHaveBeenCalledTimes(1); });

it('iniciarNota() llama a triggerAttack una vez', () => { const sinte = crearSinte(); sinte.iniciarNota(); expect(envMock.triggerAttack).toHaveBeenCalledTimes(1); });

it('soltarNota() tras iniciar llama a triggerRelease', () => { const sinte = crearSinte(); sinte.iniciarNota(); sinte.soltarNota(); expect(envMock.triggerRelease).toHaveBeenCalledTimes(1); });

it('ajustar({ volumen: 1 }) llama gain.gain.rampTo(0.5)', () => { const sinte = crearSinte(); sinte.ajustar({ volumen: 1 }); expect(gainMock.gain.rampTo).toHaveBeenCalledWith(0.5); });

it('ajustar({ resonancia: 1 }) ajusta filter.Q.value a 12', () => { const sinte = crearSinte(); sinte.ajustar({ resonancia: 1 }); expect(filterMock.Q.value).toBe(12); });

it('ajustar forma cuadrada cambia osc.type a square', () => { const sinte = crearSinte(); sinte.ajustar({ forma: 'cuadrada' }); expect(oscMock.type).toBe('square'); });

it('ajustar corte 800 con lfoProfundidad 0 pone lfo.min y lfo.max en 800', () => { const sinte = crearSinte(); sinte.ajustar({ corte: 800, lfoProfundidad: 0 }); expect(lfoMock.min).toBe(800); expect(lfoMock.max).toBe(800); });

it('destruir() dispone todos los nodos', () => { const sinte = crearSinte(); sinte.destruir(); expect(oscMock.dispose).toHaveBeenCalled(); expect(filterMock.dispose).toHaveBeenCalled(); expect(gainMock.dispose).toHaveBeenCalled(); expect(envMock.dispose).toHaveBeenCalled(); expect(lfoMock.dispose).toHaveBeenCalled(); expect(compressorMock.dispose).toHaveBeenCalled(); });


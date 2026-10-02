import { describe, it, expect } from 'vitest';
import { definicionParametro, valorDesdePosicion, posicionDesdeValor, formaDesdePosicion, textoValor, etiquetaPosicion, cambioDesdePosicion } from '../../src/core/synthParams';

it('definicionParametro retorna nombre correcto para corte', () => { const def = definicionParametro('corte'); expect(def.nombre).toBe('Corte'); });

it('definicionParametro retorna unidad Hz para corte', () => { const def = definicionParametro('corte'); expect(def.unidad).toBe('Hz'); });

it('definicionParametro retorna rango correcto para corte', () => { const def = definicionParametro('corte'); expect(def.min).toBe(80); expect(def.max).toBe(8000); });

it('definicionParametro retorna nombre correcto para relajacion', () => { const def = definicionParametro('relajacion'); expect(def.nombre).toBe('Relajación'); });

it('valorDesdePosicion convierte posición 0 a C2 para tono', () => { expect(valorDesdePosicion('tono', 0)).toBeCloseTo(65.406, 2); });

it('valorDesdePosicion convierte posición 1 a C6 para tono', () => { expect(valorDesdePosicion('tono', 1)).toBeCloseTo(1046.502, 2); });

it('valorDesdePosicion convierte posición 0.5 a 800 Hz para corte', () => { expect(valorDesdePosicion('corte', 0.5)).toBeCloseTo(800, 0); });

it('valorDesdePosicion convierte posición 0.4 a 0.4 para volumen', () => { expect(valorDesdePosicion('volumen', 0.4)).toBeCloseTo(0.4, 2); });

it('valorDesdePosicion convierte posición 0 a 0.005 para ataque', () => { expect(valorDesdePosicion('ataque', 0)).toBeCloseTo(0.005, 3); });

it('valorDesdePosicion convierte posición 1 a 3 para relajacion', () => { expect(valorDesdePosicion('relajacion', 1)).toBeCloseTo(3, 1); });

it('valorDesdePosicion convierte posición 0 a 0.1 para lfoVelocidad', () => { expect(valorDesdePosicion('lfoVelocidad', 0)).toBeCloseTo(0.1, 2); });

it('valorDesdePosicion convierte posición 1 a 20 para lfoVelocidad', () => { expect(valorDesdePosicion('lfoVelocidad', 1)).toBeCloseTo(20, 1); });

it('valorDesdePosicion devuelve 0 para forma en posición 0.1', () => { expect(valorDesdePosicion('forma', 0.1)).toBe(0); });

it('valorDesdePosicion devuelve 1 para forma en posición 0.3', () => { expect(valorDesdePosicion('forma', 0.3)).toBe(1); });

it('valorDesdePosicion devuelve 2 para forma en posición 0.6', () => { expect(valorDesdePosicion('forma', 0.6)).toBe(2); });

it('valorDesdePosicion devuelve 3 para forma en posición 0.9', () => { expect(valorDesdePosicion('forma', 0.9)).toBe(3); });

it('posicionDesdeValor convierte 800 Hz a posición 0.5 para corte', () => { expect(posicionDesdeValor('corte', 800)).toBeCloseTo(0.5, 2); });

it('posicionDesdeValor convierte C2 a posición 0 para tono', () => { expect(posicionDesdeValor('tono', 65.406)).toBeCloseTo(0, 2); });

it('posicionDesdeValor convierte C6 a posición 1 para tono', () => { expect(posicionDesdeValor('tono', 1046.502)).toBeCloseTo(1, 2); });

it('posicionDesdeValor convierte 2 a posición 0.625 para forma', () => { expect(posicionDesdeValor('forma', 2)).toBeCloseTo(0.625, 2); });

it('formaDesdePosicion devuelve seno para posición 0', () => { expect(formaDesdePosicion(0)).toBe('seno'); });

it('formaDesdePosicion devuelve seno para posición 0.24', () => { expect(formaDesdePosicion(0.24)).toBe('seno'); });

it('formaDesdePosicion devuelve triangulo para posición 0.25', () => { expect(formaDesdePosicion(0.25)).toBe('triangulo'); });

it('formaDesdePosicion devuelve sierra para posición 0.6', () => { expect(formaDesdePosicion(0.6)).toBe('sierra'); });

it('formaDesdePosicion devuelve cuadrada para posición 0.8', () => { expect(formaDesdePosicion(0.8)).toBe('cuadrada'); });

it('formaDesdePosicion devuelve cuadrada para posición 1', () => { expect(formaDesdePosicion(1)).toBe('cuadrada'); });

it('textoValor formatea 1200 Hz como 1.2 kHz para corte', () => { expect(textoValor('corte', 1200)).toBe('1.2 kHz'); });

it('textoValor formatea 800 Hz como 800 Hz para corte', () => { expect(textoValor('corte', 800)).toBe('800 Hz'); });

it('textoValor convierte 220 Hz a nota A3 para tono', () => { expect(textoValor('tono', 220)).toBe('A3'); });

it('textoValor convierte 65.41 Hz a nota C2 para tono', () => { expect(textoValor('tono', 65.41)).toBe('C2'); });

it('textoValor convierte 1046.5 Hz a nota C6 para tono', () => { expect(textoValor('tono', 1046.5)).toBe('C6'); });

it('textoValor formatea 0.4 como 40 % para resonancia', () => { expect(textoValor('resonancia', 0.4)).toBe('40 %'); });

it('textoValor formatea 0.005 s como 5 ms para ataque', () => { expect(textoValor('ataque', 0.005)).toBe('5 ms'); });

it('textoValor formatea 3 s como 3.0 s para relajacion', () => { expect(textoValor('relajacion', 3)).toBe('3.0 s'); });

it('textoValor formatea 2 Hz como 2.0 Hz para lfoVelocidad', () => { expect(textoValor('lfoVelocidad', 2)).toBe('2.0 Hz'); });

it('textoValor devuelve Sierra para índice 2 de forma', () => { expect(textoValor('forma', 2)).toBe('Sierra'); });

it('etiquetaPosicion combina nombre y valor para corte', () => { expect(etiquetaPosicion('corte', 0.5)).toBe('Corte: 800 Hz'); });

it('etiquetaPosicion combina nombre y valor para tono', () => { expect(etiquetaPosicion('tono', 0)).toBe('Tono: C2'); });

it('etiquetaPosicion usa nombre de onda para forma', () => { expect(etiquetaPosicion('forma', 0.9)).toBe('Forma de onda: Cuadrada'); });

it('cambioDesdePosicion retorna objeto con corte para parámetro corte', () => { const cambio = cambioDesdePosicion('corte', 0.5); expect(cambio.corte).toBeCloseTo(800, 0); });

it('cambioDesdePosicion mapea tono a frecuencia', () => { const cambio = cambioDesdePosicion('tono', 0); expect(cambio.frecuencia).toBeCloseTo(65.406, 1); });

it('cambioDesdePosicion mapea forma a forma', () => { const cambio = cambioDesdePosicion('forma', 0.3); expect(cambio.forma).toBe('triangulo'); });

it('cambioDesdePosicion mapea lfoProfundidad a lfoProfundidad', () => { const cambio = cambioDesdePosicion('lfoProfundidad', 0.25); expect(cambio.lfoProfundidad).toBeCloseTo(0.25, 2); });


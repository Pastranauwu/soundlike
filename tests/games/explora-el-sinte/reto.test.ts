import { describe, it, expect } from 'vitest';
import { generarObjetivo, crearReto, pistaEje, comprobarReto } from '../../../src/games/explora-el-sinte/reto';

it('generarObjetivo: determinismo con la misma semilla', () => { const ejes = { x: 'corte', y: 'resonancia' }; const r1 = generarObjetivo(ejes, 7); const r2 = generarObjetivo(ejes, 7); expect(r1).toEqual(r2); });

it('generarObjetivo: rango 0.15-0.85 en semillas 1-20', () => { const ejes = { x: 'corte', y: 'resonancia' }; for (let i = 1; i <= 20; i++) { const r = generarObjetivo(ejes, i); expect(r.x).toBeGreaterThanOrEqual(0.15); expect(r.x).toBeLessThanOrEqual(0.85); expect(r.y).toBeGreaterThanOrEqual(0.15); expect(r.y).toBeLessThanOrEqual(0.85); } });

it('generarObjetivo: al menos 2 objetivos distintos en 20 semillas', () => { const ejes = { x: 'corte', y: 'resonancia' }; const resultados = []; for (let i = 1; i <= 20; i++) resultados.push(generarObjetivo(ejes, i)); const unicos = new Set(resultados.map(r => JSON.stringify(r))); expect(unicos.size).toBeGreaterThanOrEqual(2); });

it('generarObjetivo: eje x forma devuelve valores discretos 0.125 0.375 0.625 0.875', () => { const ejes = { x: 'forma', y: 'tono' }; const discretos = [0.125, 0.375, 0.625, 0.875]; for (let i = 1; i <= 20; i++) expect(discretos).toContain(generarObjetivo(ejes, i).x); });

it('generarObjetivo: semillas 1 y 2 generan objetivos distintos', () => { const ejes = { x: 'corte', y: 'resonancia' }; const r1 = generarObjetivo(ejes, 1); const r2 = generarObjetivo(ejes, 2); expect(r1).not.toEqual(r2); });

it('crearReto: estructura con ejes semilla objetivo fallos', () => { const ejes = { x: 'corte', y: 'resonancia' }; const r = crearReto(ejes, 3); expect(r).toHaveProperty('ejes'); expect(r).toHaveProperty('semilla'); expect(r).toHaveProperty('objetivo'); expect(r).toHaveProperty('fallos'); expect(r.semilla).toBe(3); expect(r.fallos).toBe(0); expect(r.ejes).toEqual(ejes); });

it('crearReto: objetivo coincide con generarObjetivo semilla', () => { const ejes = { x: 'corte', y: 'resonancia' }; const reto = crearReto(ejes, 3); const obj = generarObjetivo(ejes, 3); expect(reto.objetivo).toEqual(obj); });

it('pistaEje corte x subir', () => { const pista = pistaEje('corte', 'x', true); expect(pista).toBe('Te falta abrir el filtro: mueve el punto a la derecha'); });

it('pistaEje resonancia y bajar', () => { const pista = pistaEje('resonancia', 'y', false); expect(pista).toBe('Te falta bajar la resonancia: mueve el punto hacia abajo'); });

it('pistaEje forma x bajar', () => { const pista = pistaEje('forma', 'x', false); expect(pista).toBe('Te falta cambiar la forma de onda: mueve el punto a la izquierda'); });

it('pistaEje relajacion y subir', () => { const pista = pistaEje('relajacion', 'y', true); expect(pista).toBe('Te falta alargar la relajación: mueve el punto hacia arriba'); });

it('comprobarReto: acierto dentro tolerancia 12%', () => { const ejes = { x: 'corte', y: 'resonancia' }; const est = { ejes, semilla: 1, objetivo: { x: 0.5, y: 0.5 }, fallos: 0 }; const r = comprobarReto(est, { x: 0.62, y: 0.38 }); expect(r.acierto).toBe(true); expect(r.pistas).toEqual([]); expect(r.estado.fallos).toBe(0); expect(r.estado.semilla).toBe(2); });

it('comprobarReto: fallo en x fuera tolerancia', () => { const ejes = { x: 'corte', y: 'resonancia' }; const est = { ejes, semilla: 1, objetivo: { x: 0.5, y: 0.5 }, fallos: 0 }; const r = comprobarReto(est, { x: 0.63, y: 0.5 }); expect(r.acierto).toBe(false); expect(r.ejesFallidos).toContain('x'); expect(r.pistas).toContain('Te falta cerrar el filtro: mueve el punto a la izquierda'); expect(r.estado.fallos).toBe(1); });

it('comprobarReto: fallos en ejes x y', () => { const ejes = { x: 'corte', y: 'resonancia' }; const est = { ejes, semilla: 1, objetivo: { x: 0.5, y: 0.5 }, fallos: 0 }; const r = comprobarReto(est, { x: 0.1, y: 0.9 }); expect(r.ejesFallidos).toEqual(expect.arrayContaining(['x', 'y'])); expect(r.pistas.length).toBe(2); expect(r.pistas.some(p => p.includes('hacia abajo'))).toBe(true); });

it('comprobarReto: mostrarObjetivo false con fallos 0', () => { const ejes = { x: 'corte', y: 'resonancia' }; const est = { ejes, semilla: 1, objetivo: { x: 0.5, y: 0.5 }, fallos: 0 }; const r = comprobarReto(est, { x: 0.1, y: 0.1 }); expect(r.mostrarObjetivo).toBe(false); });

it('comprobarReto: mostrarObjetivo true con fallos 2 y fallo', () => { const ejes = { x: 'corte', y: 'resonancia' }; const est = { ejes, semilla: 1, objetivo: { x: 0.5, y: 0.5 }, fallos: 2 }; const r = comprobarReto(est, { x: 0.1, y: 0.1 }); expect(r.estado.fallos).toBe(3); expect(r.mostrarObjetivo).toBe(true); });

it('comprobarReto: estado entrada no cambia', () => { const ejes = { x: 'corte', y: 'resonancia' }; const est = { ejes, semilla: 1, objetivo: { x: 0.5, y: 0.5 }, fallos: 0 }; const copia = JSON.stringify(est); comprobarReto(est, { x: 0.1, y: 0.1 }); expect(JSON.stringify(est)).toBe(copia); });


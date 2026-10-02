import { it, expect, vi, afterEach } from 'vitest';
import { crearPad } from '../../src/ui/pad';

function crearPadDePrueba() {
  return crearPad({
    ejeHorizontal: { nombre: 'Corte' },
    ejeVertical: { nombre: 'Resonancia' },
    alPresionar: vi.fn(),
    alMover: vi.fn(),
    alSoltar: vi.fn(),
  });
}

afterEach(() => {
  document.body.innerHTML = '';
});

it('ponerEstilo pinta data-estilo, --pad-color y el nombre visible', () => {
  const pad = crearPadDePrueba();
  pad.ponerEstilo({ id: 'rave', nombre: 'Sinte de rave electrónico', color: '#22d3ee' });

  const raiz = pad.elemento;
  expect(raiz.classList.contains('pad')).toBe(true);
  expect(raiz.dataset.estilo).toBe('rave');
  expect(raiz.style.getPropertyValue('--pad-color')).toBe('#22d3ee');

  const etiqueta = raiz.querySelector('.pad__estilo') as HTMLElement;
  expect(etiqueta.textContent).toBe('Sinte de rave electrónico');
  expect(etiqueta.hidden).toBe(false);
});

it('ponerEstilo(null) vuelve al tema', () => {
  const pad = crearPadDePrueba();
  pad.ponerEstilo({ id: 'rave', nombre: 'Sinte de rave electrónico', color: '#22d3ee' });
  pad.ponerEstilo(null);

  const raiz = pad.elemento;
  expect(raiz.dataset.estilo).toBeUndefined();
  expect(raiz.style.getPropertyValue('--pad-color')).toBe('');

  const etiqueta = raiz.querySelector('.pad__estilo') as HTMLElement;
  expect(etiqueta.hidden).toBe(true);
});

it('cambiar de estilo actualiza el color sin mover el punto', () => {
  const pad = crearPadDePrueba();
  pad.ponerPosicion({ x: 0.3, y: 0.7 });
  pad.ponerEstilo({ id: 'acid', nombre: 'Sinte ácido', color: '#84cc16' });
  pad.ponerEstilo({ id: 'chip', nombre: 'Sinte de chip', color: '#f472b6' });

  expect(pad.elemento.dataset.estilo).toBe('chip');
  expect(pad.elemento.style.getPropertyValue('--pad-color')).toBe('#f472b6');
  expect(pad.posicion()).toEqual({ x: 0.3, y: 0.7 });
});

it('ponerEstilo no cambia la posición', () => {
  const pad = crearPadDePrueba();
  const antes = pad.posicion();
  pad.ponerEstilo({ id: 'ambiente', nombre: 'Sinte ambiental', color: '#38bdf8' });
  pad.ponerEstilo(null);
  expect(pad.posicion()).toEqual(antes);
});

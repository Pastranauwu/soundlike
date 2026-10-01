/**
 * Componente reutilizable de tutorial: diálogo modal de 1 o 2 pantallas que se
 * puede saltar. No conoce juegos ni Tone.js: recibe un Tutorial por parámetro.
 * Lo usan la pantalla de juego (al entrar la primera vez y con "¿Cómo se juega?")
 * y la pantalla de Tutoriales (botón "Ver tutorial"). Estilos en src/ui/app.css.
 *
 * CONTRATO DE DOM (lo comparte la tarea de diseño; no cambiar clases):
 * <div class="tutorial" role="dialog" aria-modal="true"
 *      aria-labelledby="tutorial-titulo-<id>" aria-describedby="tutorial-texto-<id>">
 *   <div class="tutorial__panel">
 *     <p class="tutorial__juego">Arregla el beat · Tutorial</p>
 *     <p class="tutorial__progreso">Pantalla 1 de 2</p>
 *     <h2 class="tutorial__titulo" id="tutorial-titulo-<id>" tabindex="-1">título del paso</h2>
 *     <p class="tutorial__texto" id="tutorial-texto-<id>">texto del paso</p>
 *     <ul class="tutorial__puntos"><li>punto</li>...</ul>   (sin <li> si puntos = [])
 *     <p class="tutorial__objetivo"><strong>Cómo se gana:</strong> objetivo</p>
 *     <p class="tutorial__aprendes"><strong>Aprendes:</strong> aprendes</p>
 *     <div class="tutorial__acciones">
 *       <button type="button" class="tutorial__saltar">Saltar tutorial</button>
 *       <button type="button" class="tutorial__anterior">Anterior</button>
 *       <button type="button" class="tutorial__siguiente">Siguiente</button>
 *     </div>
 *   </div>
 * </div>
 * En la última pantalla .tutorial__siguiente dice "¡A jugar!". En la primera,
 * .tutorial__anterior lleva hidden. Con 1 sola pantalla: "Pantalla 1 de 1",
 * Anterior oculto y Siguiente dice "¡A jugar!".
 */
import type { MotivoCierreTutorial, Tutorial } from "./types";

/** Opciones del tutorial. */
export interface OpcionesTutorialUI {
  /** Se llama una sola vez al cerrar, con el motivo. */
  alCerrar: (motivo: MotivoCierreTutorial) => void;
}

/** Manejador del tutorial montado. */
export interface TutorialUI {
  /** Raíz .tutorial; quien lo crea lo agrega al DOM y luego llama abrir(). */
  elemento: HTMLElement;
  /** Índice (0-based) de la pantalla visible. */
  readonly pasoActual: number;
  /** Muestra la pantalla 0 y enfoca .tutorial__titulo (lector de pantalla lo lee). */
  abrir(): void;
  /** Quita el elemento del DOM sin llamar alCerrar (para destruir la vista que lo contiene). */
  destruir(): void;
}

/**
 * Crea el diálogo de tutorial.
 * Entrada: tutorial (1 o 2 pasos; con 0 pasos lanza Error("El tutorial no tiene pantallas")),
 *          opciones.alCerrar.
 * Comportamiento:
 * - Renderiza el DOM del contrato con la pantalla 0. Guarda document.activeElement
 *   al crear para devolverle el foco al cerrar.
 * - "Siguiente": pasa a la pantalla siguiente y enfoca .tutorial__titulo; en la
 *   última ("¡A jugar!") cierra con motivo "terminar".
 * - "Anterior": vuelve una pantalla y enfoca el título.
 * - "Saltar tutorial" o tecla Escape dentro del diálogo: cierra con motivo "saltar".
 * - Tab / Shift+Tab quedan atrapados dentro del diálogo (del último botón visible
 *   al primero y al revés; preventDefault).
 * - Cerrar = quitar el elemento del DOM, llamar alCerrar(motivo) una sola vez y
 *   devolver el foco al elemento guardado si sigue en el documento.
 * Quién lo usa: src/games/arregla-el-beat/screen.ts y src/screens/tutoriales.ts.
 * Casos:
 * - tutorial de 2 pasos -> .tutorial__progreso "Pantalla 1 de 2", título del paso 0,
 *   .tutorial__anterior hidden, .tutorial__siguiente "Siguiente"
 * - clic Siguiente -> "Pantalla 2 de 2", título del paso 1, Siguiente dice "¡A jugar!";
 *   otro clic -> alCerrar("terminar") y el elemento ya no está en el documento
 * - clic en "Saltar tutorial" -> alCerrar("saltar") una vez
 * - keydown Escape sobre el elemento -> alCerrar("saltar")
 * - tutorial de 1 paso -> "Pantalla 1 de 1" y Siguiente dice "¡A jugar!"
 * - pasos = [] -> lanza Error("El tutorial no tiene pantallas")
 */
export function crearTutorialUI(tutorial: Tutorial, opciones: OpcionesTutorialUI): TutorialUI {
  if (tutorial.pasos.length === 0) {
    throw new Error("El tutorial no tiene pantallas");
  }

  const elementoConFocoPrevio = document.activeElement as HTMLElement | null;
  const idDialogo = tutorial.id;
  let pasoActual = 0;
  let cerrado = false;

  const raiz = document.createElement("div");
  raiz.className = "tutorial";
  raiz.setAttribute("role", "dialog");
  raiz.setAttribute("aria-modal", "true");
  raiz.setAttribute("aria-labelledby", `tutorial-titulo-${idDialogo}`);
  raiz.setAttribute("aria-describedby", `tutorial-texto-${idDialogo}`);

  const panel = document.createElement("div");
  panel.className = "tutorial__panel";
  raiz.appendChild(panel);

  const parrafoJuego = document.createElement("p");
  parrafoJuego.className = "tutorial__juego";
  parrafoJuego.textContent = `${tutorial.juego} · Tutorial`;
  panel.appendChild(parrafoJuego);

  const parrafoProgreso = document.createElement("p");
  parrafoProgreso.className = "tutorial__progreso";
  panel.appendChild(parrafoProgreso);

  const titulo = document.createElement("h2");
  titulo.className = "tutorial__titulo";
  titulo.id = `tutorial-titulo-${idDialogo}`;
  titulo.tabIndex = -1;
  panel.appendChild(titulo);

  const texto = document.createElement("p");
  texto.className = "tutorial__texto";
  texto.id = `tutorial-texto-${idDialogo}`;
  panel.appendChild(texto);

  const listaPuntos = document.createElement("ul");
  listaPuntos.className = "tutorial__puntos";
  panel.appendChild(listaPuntos);

  const objetivo = document.createElement("p");
  objetivo.className = "tutorial__objetivo";
  const fuerteObjetivo = document.createElement("strong");
  fuerteObjetivo.textContent = "Cómo se gana:";
  objetivo.appendChild(fuerteObjetivo);
  objetivo.append(` ${tutorial.objetivo}`);
  panel.appendChild(objetivo);

  const aprendes = document.createElement("p");
  aprendes.className = "tutorial__aprendes";
  const fuerteAprendes = document.createElement("strong");
  fuerteAprendes.textContent = "Aprendes:";
  aprendes.appendChild(fuerteAprendes);
  aprendes.append(` ${tutorial.aprendes}`);
  panel.appendChild(aprendes);

  const acciones = document.createElement("div");
  acciones.className = "tutorial__acciones";
  panel.appendChild(acciones);

  const botonSaltar = document.createElement("button");
  botonSaltar.type = "button";
  botonSaltar.className = "tutorial__saltar";
  botonSaltar.textContent = "Saltar tutorial";
  acciones.appendChild(botonSaltar);

  const botonAnterior = document.createElement("button");
  botonAnterior.type = "button";
  botonAnterior.className = "tutorial__anterior";
  botonAnterior.textContent = "Anterior";
  acciones.appendChild(botonAnterior);

  const botonSiguiente = document.createElement("button");
  botonSiguiente.type = "button";
  botonSiguiente.className = "tutorial__siguiente";
  acciones.appendChild(botonSiguiente);

  function renderizarPaso(): void {
    const paso = tutorial.pasos[pasoActual];
    const esUltimoPaso = pasoActual === tutorial.pasos.length - 1;

    parrafoProgreso.textContent = `Pantalla ${pasoActual + 1} de ${tutorial.pasos.length}`;
    titulo.textContent = paso.titulo;
    texto.textContent = paso.texto;

    listaPuntos.replaceChildren(
      ...paso.puntos.map((punto) => {
        const item = document.createElement("li");
        item.textContent = punto;
        return item;
      }),
    );

    botonAnterior.hidden = pasoActual === 0;
    botonSiguiente.textContent = esUltimoPaso ? "¡A jugar!" : "Siguiente";
  }

  function cerrar(motivo: MotivoCierreTutorial): void {
    if (cerrado) return;
    cerrado = true;
    raiz.remove();
    opciones.alCerrar(motivo);
    if (elementoConFocoPrevio && document.contains(elementoConFocoPrevio)) {
      elementoConFocoPrevio.focus();
    }
  }

  function irAPaso(indice: number): void {
    pasoActual = indice;
    renderizarPaso();
    titulo.focus();
  }

  botonSiguiente.addEventListener("click", () => {
    if (pasoActual === tutorial.pasos.length - 1) {
      cerrar("terminar");
      return;
    }
    irAPaso(pasoActual + 1);
  });

  botonAnterior.addEventListener("click", () => {
    irAPaso(pasoActual - 1);
  });

  botonSaltar.addEventListener("click", () => {
    cerrar("saltar");
  });

  raiz.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape") {
      cerrar("saltar");
      return;
    }
    if (evento.key === "Tab") {
      const focosPosibles = Array.from(acciones.querySelectorAll<HTMLButtonElement>("button")).filter(
        (boton) => !boton.hidden,
      );
      const primero = focosPosibles[0];
      const ultimo = focosPosibles[focosPosibles.length - 1];
      if (evento.shiftKey && document.activeElement === primero) {
        evento.preventDefault();
        ultimo.focus();
      } else if (!evento.shiftKey && document.activeElement === ultimo) {
        evento.preventDefault();
        primero.focus();
      }
    }
  });

  renderizarPaso();

  return {
    elemento: raiz,
    get pasoActual() {
      return pasoActual;
    },
    abrir(): void {
      pasoActual = 0;
      renderizarPaso();
      titulo.focus();
    },
    destruir(): void {
      raiz.remove();
    },
  };
}

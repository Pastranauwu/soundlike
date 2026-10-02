/**
 * Pantalla de "Explora el sinte" (ruta "#/explora-el-sinte"). Orquesta pad,
 * sinte, lecciones, reto, puntaje, progreso y tutorial. Toda la interfaz en
 * español. Los estilos viven en src/ui/app.css; aquí solo el DOM.
 *
 * DOM: <main class="juego sinte"> con encabezado (.juego__superior), índice
 * (.sinte__indice), lección (.sinte__leccion), patio libre (.sinte__libre),
 * aviso (.sinte__aviso), el pad de ui/pad, el reto (.sinte__reto), el resultado
 * (.juego__resultado), la navegación (.sinte__navegacion) y el enlace al menú.
 */
import { crearPuntaje, registrarAcierto, registrarFallo } from "../../core/scoring";
import { crearSinte as crearSinteCore } from "../../core/synth";
import {
  cambioDesdePosicion,
  definicionParametro,
  etiquetaPosicion,
  PARAMETROS,
} from "../../core/synthParams";
import type { AjustesSinte, IdParametro, PosicionPad, Sinte } from "../../core/synthTypes";
import type { Puntaje } from "../../core/types";
import { crearPad } from "../../ui/pad";
import type { EjePad, PadUI } from "../../ui/pad";
import { crearRegistroTutoriales } from "../../ui/registroTutoriales";
import { crearTutorialUI } from "../../ui/tutorial";
import type { TutorialUI } from "../../ui/tutorial";
import type { RegistroTutoriales, Tutorial } from "../../ui/types";
import { obtenerLecciones } from "./lecciones";
import { crearProgreso } from "./progreso";
import { comprobarReto, crearReto, FALLOS_PARA_VER_OBJETIVO } from "./reto";
import { obtenerTutorialSinte } from "./tutorial";
import type {
  Eje,
  EjesLeccion,
  EstadoReto,
  Leccion,
  ProgresoLecciones,
} from "./types";

/** Cuánto suena "Escuchar el objetivo" antes de soltarse, en ms. */
export const DURACION_OBJETIVO_MS = 1500;

/** Texto exacto del aviso de audio. */
export const AVISO_AUDIO =
  "Si no oyes nada, revisa que el sonido esté activado y sube el volumen. Con audífonos se aprecia mejor";

const PISTA_BASE = "Tras 3 intentos fallidos el objetivo se dibuja en el pad";
const PISTA_OBJETIVO = "El objetivo está dibujado en el pad";

export interface OpcionesPantallaSinte {
  /**
   * Fábrica del sinte. Se llama UNA vez, en el primer gesto que hace sonar algo
   * (presionar el pad o "Escuchar el objetivo"), nunca al montar.
   * Por defecto () => crearSinte() de core/synth.
   */
  crearSinte?: () => Sinte;
  /** Por defecto obtenerLecciones(). */
  lecciones?: Leccion[];
  /** Semilla del primer objetivo de cada lección (la lección i usa semillaInicial + i * 1000). Por defecto 1. */
  semillaInicial?: number;
  /** Por defecto obtenerTutorialSinte(). */
  tutorial?: Tutorial;
  /** Por defecto crearRegistroTutoriales() de ui/registroTutoriales. */
  registroTutoriales?: RegistroTutoriales;
  /** Por defecto crearProgreso() de ./progreso. */
  progreso?: ProgresoLecciones;
}

export interface PantallaSinte {
  elemento: HTMLElement;
  /** Apaga el sonido, cancela el temporizador del objetivo, destruye el sinte y quita listeners. Idempotente. */
  destruir(): void;
}

interface DomSinte {
  seccion: HTMLElement;
  marcador: HTMLElement;
  paso: HTMLElement;
  leccion: HTMLElement;
  tituloLeccion: HTMLElement;
  libre: HTMLElement;
  selectX: HTMLSelectElement;
  selectY: HTMLSelectElement;
  reto: HTMLElement;
  ayudaPista: HTMLElement;
  escuchar: HTMLButtonElement;
  comprobar: HTMLButtonElement;
  como: HTMLButtonElement;
  aviso: HTMLElement;
  resultado: HTMLElement;
  resultadoTitulo: HTMLElement;
  resultadoResumen: HTMLElement;
  resultadoMotivos: HTMLUListElement;
  resultadoPuntaje: HTMLElement;
  anterior: HTMLButtonElement;
  siguiente: HTMLButtonElement;
  botonesIndice: HTMLButtonElement[];
}

/**
 * Crea la pantalla del juego.
 * El sinte es perezoso: solo se construye en el primer gesto que suena. Cambiar
 * de lección o de ruta suelta la nota. La usa main.ts en "#/explora-el-sinte".
 */
export function crearPantallaSinte(opciones: OpcionesPantallaSinte = {}): PantallaSinte {
  const lecciones = opciones.lecciones ?? obtenerLecciones();
  if (lecciones.length === 0) throw new Error("No hay lecciones");

  const fabricaSinte = opciones.crearSinte ?? ((): Sinte => crearSinteCore());
  const semillaInicial = opciones.semillaInicial ?? 1;
  const tutorial = opciones.tutorial ?? obtenerTutorialSinte();
  const registroTutoriales = opciones.registroTutoriales ?? crearRegistroTutoriales();
  const progreso = opciones.progreso ?? crearProgreso();

  const dom = crearDom(tutorial, lecciones);

  let indice = 0;
  let ejesActuales: EjesLeccion = { ...lecciones[0].ejes };
  let puntaje: Puntaje = crearPuntaje();
  const estadosReto = new Map<number, EstadoReto>();
  const resueltas = new Set(progreso.resueltas());
  let sinte: Sinte | null = null;
  let temporizadorObjetivo: ReturnType<typeof setTimeout> | null = null;
  let objetivoSonando = false;
  let tutorialAbierto: TutorialUI | null = null;
  let destruido = false;

  const pad: PadUI = crearPad({
    ejeHorizontal: ejePad(ejesActuales.x),
    ejeVertical: ejePad(ejesActuales.y),
    alPresionar: (posicion) => {
      detenerObjetivo();
      const sinteActual = obtenerSinte();
      dom.aviso.hidden = true;
      sinteActual.ajustar(ajustesEnPosicion(posicion));
      sinteActual.iniciarNota();
    },
    alMover: (posicion) => {
      if (sinte !== null) sinte.ajustar(ajustesEnPosicion(posicion));
    },
    alSoltar: () => {
      sinte?.soltarNota();
    },
  });
  dom.seccion.insertBefore(pad.elemento, dom.reto);

  function ejePad(id: IdParametro): EjePad {
    return { nombre: definicionParametro(id).nombre, etiqueta: (p) => etiquetaPosicion(id, p) };
  }

  function ajustesEnPosicion(posicion: PosicionPad): AjustesSinte {
    return {
      ...lecciones[indice].ajustes,
      ...cambioDesdePosicion(ejesActuales.x, posicion.x),
      ...cambioDesdePosicion(ejesActuales.y, posicion.y),
    };
  }

  function ajustesEnObjetivo(objetivo: PosicionPad): AjustesSinte {
    return {
      ...lecciones[indice].ajustes,
      ...cambioDesdePosicion(ejesActuales.x, objetivo.x),
      ...cambioDesdePosicion(ejesActuales.y, objetivo.y),
    };
  }

  function obtenerSinte(): Sinte {
    if (sinte === null) {
      sinte = fabricaSinte();
      sinte.ajustar(ajustesEnPosicion(pad.posicion()));
    }
    return sinte;
  }

  function obtenerEstadoReto(i: number): EstadoReto {
    const existente = estadosReto.get(i);
    if (existente) return existente;
    const nuevo = crearReto(lecciones[i].ejes, semillaInicial + i * 1000);
    estadosReto.set(i, nuevo);
    return nuevo;
  }

  function cancelarTemporizador(): void {
    if (temporizadorObjetivo !== null) {
      clearTimeout(temporizadorObjetivo);
      temporizadorObjetivo = null;
    }
  }

  function detenerObjetivo(): void {
    cancelarTemporizador();
    if (objetivoSonando) {
      sinte?.soltarNota();
      objetivoSonando = false;
    }
  }

  function pintarPista(fallos: number): void {
    dom.ayudaPista.textContent =
      fallos >= FALLOS_PARA_VER_OBJETIVO
        ? PISTA_OBJETIVO
        : `${PISTA_BASE} (${fallos}/3)`;
  }

  function pintarIndice(): void {
    lecciones.forEach((leccion, i) => {
      const boton = dom.botonesIndice[i];
      const resuelta = resueltas.has(leccion.id);
      boton.dataset.resuelta = String(resuelta);
      boton.textContent = resuelta ? `${i + 1} ✓` : String(i + 1);
      boton.setAttribute(
        "aria-label",
        `Lección ${i + 1}: ${leccion.titulo}${resuelta ? " (reto resuelto)" : ""}`,
      );
      if (i === indice) boton.setAttribute("aria-current", "step");
      else boton.removeAttribute("aria-current");
    });
  }

  function pintarFrases(frases: string[]): void {
    dom.leccion.querySelectorAll(".sinte__frase").forEach((frase) => frase.remove());
    dom.leccion.append(
      ...frases.map((frase) => crearElemento("p", "sinte__frase", frase)),
    );
  }

  function pintarLeccion(enfocar: boolean): void {
    const leccion = lecciones[indice];
    ejesActuales = { ...leccion.ejes };
    pad.ponerEjes(ejePad(ejesActuales.x), ejePad(ejesActuales.y));
    pad.ponerPosicion({ x: 0.5, y: 0.5 });
    dom.selectX.value = ejesActuales.x;
    dom.selectY.value = ejesActuales.y;

    dom.paso.textContent = `Lección ${indice + 1} de ${lecciones.length}`;
    dom.tituloLeccion.textContent = leccion.titulo;
    pintarFrases(leccion.frases);

    dom.libre.hidden = !leccion.libre;
    dom.reto.hidden = !leccion.conReto;
    dom.anterior.disabled = indice === 0;
    dom.siguiente.disabled = indice === lecciones.length - 1;

    if (leccion.conReto) {
      const estado = obtenerEstadoReto(indice);
      pad.mostrarObjetivo(estado.fallos >= FALLOS_PARA_VER_OBJETIVO ? estado.objetivo : null);
      pintarPista(estado.fallos);
    } else {
      pad.mostrarObjetivo(null);
    }

    dom.resultado.hidden = true;
    pintarIndice();

    if (sinte !== null) sinte.ajustar(ajustesEnPosicion(pad.posicion()));

    if (enfocar) dom.tituloLeccion.focus();
  }

  function irALeccion(nuevo: number, enfocar: boolean): void {
    if (nuevo < 0 || nuevo >= lecciones.length) return;
    const cambio = nuevo !== indice;
    if (cambio) {
      pad.soltar();
      detenerObjetivo();
      indice = nuevo;
    }
    pintarLeccion(enfocar);
  }

  function cambiarEje(eje: Eje, id: IdParametro): void {
    const otro: Eje = eje === "x" ? "y" : "x";
    const anterior = ejesActuales[eje];
    if (ejesActuales[otro] === id) ejesActuales[otro] = anterior;
    ejesActuales[eje] = id;
    pad.soltar();
    pad.ponerEjes(ejePad(ejesActuales.x), ejePad(ejesActuales.y));
    dom.selectX.value = ejesActuales.x;
    dom.selectY.value = ejesActuales.y;
    if (sinte !== null) sinte.ajustar(ajustesEnPosicion(pad.posicion()));
  }

  function escucharObjetivo(): void {
    const leccion = lecciones[indice];
    if (!leccion.conReto) return;
    cancelarTemporizador();
    pad.soltar();
    const sinteActual = obtenerSinte();
    dom.aviso.hidden = true;
    sinteActual.ajustar(ajustesEnObjetivo(obtenerEstadoReto(indice).objetivo));
    sinteActual.iniciarNota();
    objetivoSonando = true;
    temporizadorObjetivo = setTimeout(() => {
      temporizadorObjetivo = null;
      objetivoSonando = false;
      sinteActual.soltarNota();
      sinteActual.ajustar(ajustesEnPosicion(pad.posicion()));
    }, DURACION_OBJETIVO_MS);
  }

  function pintarResultado(
    tipo: "acierto" | "fallo",
    titulo: string,
    resumen: string,
    motivos: string[],
    intentosFallidos: number,
  ): void {
    dom.resultadoTitulo.textContent = titulo;
    dom.resultadoResumen.textContent = resumen;
    dom.resultadoMotivos.replaceChildren(
      ...motivos.map((motivo) => crearElemento("li", "", motivo)),
    );
    dom.resultadoMotivos.hidden = motivos.length === 0;
    dom.resultadoPuntaje.textContent = `${textoMarcador(puntaje)} · Intentos fallidos ${intentosFallidos}`;
    dom.resultado.dataset.estado = tipo;
    dom.resultado.hidden = false;
  }

  function comprobar(): void {
    const leccion = lecciones[indice];
    if (!leccion.conReto) return;
    const resultado = comprobarReto(obtenerEstadoReto(indice), pad.posicion());
    estadosReto.set(indice, resultado.estado);

    if (resultado.acierto) {
      puntaje = registrarAcierto(puntaje);
      resueltas.add(leccion.id);
      progreso.marcarResuelta(leccion.id);
      pad.mostrarObjetivo(null);
      pintarPista(resultado.estado.fallos);
      pintarResultado(
        "acierto",
        "¡Correcto!",
        `${leccion.explicacionAcierto} Ya hay un objetivo nuevo.`,
        [],
        resultado.estado.fallos,
      );
    } else {
      puntaje = registrarFallo(puntaje);
      if (resultado.mostrarObjetivo) pad.mostrarObjetivo(resultado.estado.objetivo);
      pintarPista(resultado.estado.fallos);
      pintarResultado(
        "fallo",
        "Todavía no suena igual",
        "Escucha el objetivo otra vez y compara.",
        resultado.pistas,
        resultado.estado.fallos,
      );
    }
    dom.marcador.textContent = textoMarcador(puntaje);
    pintarIndice();
  }

  function enfocarPad(): void {
    pad.elemento.querySelector<HTMLElement>(".pad__area")?.focus();
  }

  function abrirTutorial(): void {
    if (tutorialAbierto !== null) return;
    enfocarPad();
    const ui = crearTutorialUI(tutorial, {
      alCerrar: () => {
        tutorialAbierto = null;
        registroTutoriales.marcarVisto(tutorial.id);
        enfocarPad();
      },
    });
    tutorialAbierto = ui;
    dom.seccion.append(ui.elemento);
    ui.abrir();
  }

  function destruir(): void {
    if (destruido) return;
    destruido = true;
    window.removeEventListener("hashchange", destruir);
    detenerObjetivo();
    sinte?.soltarNota();
    sinte?.destruir();
    sinte = null;
    tutorialAbierto?.destruir();
    tutorialAbierto = null;
    pad.elemento.remove();
  }

  dom.anterior.addEventListener("click", () => irALeccion(indice - 1, true));
  dom.siguiente.addEventListener("click", () => irALeccion(indice + 1, true));
  dom.botonesIndice.forEach((boton, i) => {
    boton.addEventListener("click", () => irALeccion(i, true));
  });
  dom.selectX.addEventListener("change", () => {
    cambiarEje("x", dom.selectX.value as IdParametro);
  });
  dom.selectY.addEventListener("change", () => {
    cambiarEje("y", dom.selectY.value as IdParametro);
  });
  dom.escuchar.addEventListener("click", escucharObjetivo);
  dom.comprobar.addEventListener("click", comprobar);
  dom.como.addEventListener("click", abrirTutorial);

  pintarLeccion(false);
  if (!registroTutoriales.visto(tutorial.id)) abrirTutorial();
  window.addEventListener("hashchange", destruir);

  return { elemento: dom.seccion, destruir };
}

function textoMarcador({ nivel, puntos, racha }: Puntaje): string {
  return `Nivel ${nivel} · Puntos ${puntos} · Racha ${racha}`;
}

function crearElemento<K extends keyof HTMLElementTagNameMap>(
  etiqueta: K,
  clase: string,
  texto = "",
): HTMLElementTagNameMap[K] {
  const elemento = document.createElement(etiqueta);
  if (clase !== "") elemento.className = clase;
  elemento.textContent = texto;
  return elemento;
}

function crearBoton(clase: string, texto: string): HTMLButtonElement {
  const boton = crearElemento("button", clase, texto);
  boton.type = "button";
  return boton;
}

function crearLineaEtiquetada(
  clase: string,
  etiqueta: string,
  texto: string,
): HTMLParagraphElement {
  const linea = crearElemento("p", clase);
  linea.append(crearElemento("strong", "", etiqueta), ` ${texto}`);
  return linea;
}

function crearSelect(clase: string): HTMLSelectElement {
  const select = crearElemento("select", clase);
  for (const parametro of PARAMETROS) {
    const opcion = crearElemento("option", "", parametro.nombre);
    opcion.value = parametro.id;
    select.append(opcion);
  }
  return select;
}

function crearDom(tutorial: Tutorial, lecciones: Leccion[]): DomSinte {
  const seccion = crearElemento("main", "juego sinte");

  const superior = crearElemento("header", "juego__superior");
  const marcador = crearElemento("div", "juego__marcador", textoMarcador(crearPuntaje()));
  marcador.setAttribute("aria-live", "polite");
  const ayudas = crearElemento("div", "juego__ayudas");
  const como = crearBoton("juego__como", "¿Cómo se juega?");
  ayudas.append(como);
  superior.append(
    crearElemento("h1", "", "Explora el sinte"),
    marcador,
    crearLineaEtiquetada("juego__objetivo", "Objetivo:", tutorial.objetivo),
    crearLineaEtiquetada("juego__aprendes", "Aprendes:", tutorial.aprendes),
    ayudas,
  );

  const indiceNav = crearElemento("nav", "sinte__indice");
  indiceNav.setAttribute("aria-label", "Lecciones");
  const lista = crearElemento("ol", "");
  const botonesIndice = lecciones.map((leccion, i) => {
    const boton = crearBoton("sinte__indice-boton", String(i + 1));
    boton.setAttribute("aria-label", `Lección ${i + 1}: ${leccion.titulo}`);
    boton.dataset.resuelta = "false";
    const item = crearElemento("li", "");
    item.append(boton);
    lista.append(item);
    return boton;
  });
  indiceNav.append(lista);

  const leccion = crearElemento("section", "sinte__leccion");
  const paso = crearElemento("p", "sinte__paso", "");
  paso.setAttribute("aria-live", "polite");
  const tituloLeccion = crearElemento("h2", "sinte__titulo", "");
  tituloLeccion.tabIndex = -1;
  leccion.append(paso, tituloLeccion);

  const libre = crearElemento("div", "sinte__libre");
  libre.hidden = true;
  const selectX = crearSelect("sinte__eje-x");
  const selectY = crearSelect("sinte__eje-y");
  const labelX = crearElemento("label", "");
  labelX.append("Eje horizontal ", selectX);
  const labelY = crearElemento("label", "");
  labelY.append("Eje vertical ", selectY);
  libre.append(labelX, labelY);

  const aviso = crearElemento("p", "sinte__aviso", AVISO_AUDIO);

  const reto = crearElemento("section", "sinte__reto");
  reto.setAttribute("aria-label", "Reto: imita el sonido");
  const controles = crearElemento("div", "juego__controles");
  const escuchar = crearBoton("sinte__escuchar", "Escuchar el objetivo");
  const comprobar = crearBoton("juego__comprobar", "Comprobar");
  const ayudaPista = crearElemento("span", "juego__ayuda-pista", `${PISTA_BASE} (0/3)`);
  controles.append(escuchar, comprobar, ayudaPista);
  reto.append(crearElemento("h3", "sinte__reto-titulo", "Reto: imita el sonido"), controles);

  const resultado = crearElemento("section", "juego__resultado");
  resultado.setAttribute("aria-live", "polite");
  resultado.hidden = true;
  const resultadoTitulo = crearElemento("h2", "juego__resultado-titulo", "");
  const resultadoResumen = crearElemento("p", "juego__resultado-resumen", "");
  const resultadoMotivos = crearElemento("ul", "juego__resultado-motivos");
  const resultadoPuntaje = crearElemento("p", "juego__resultado-puntaje", "");
  resultado.append(resultadoTitulo, resultadoResumen, resultadoMotivos, resultadoPuntaje);

  const navegacion = crearElemento("div", "sinte__navegacion");
  const anterior = crearBoton("sinte__anterior", "Anterior");
  const siguiente = crearBoton("sinte__siguiente", "Siguiente");
  navegacion.append(anterior, siguiente);

  const volver = crearElemento("a", "juego__volver", "← Volver al menú");
  volver.href = "#/";

  seccion.append(
    superior,
    indiceNav,
    leccion,
    libre,
    aviso,
    reto,
    resultado,
    navegacion,
    volver,
  );

  return {
    seccion,
    marcador,
    paso,
    leccion,
    tituloLeccion,
    libre,
    selectX,
    selectY,
    reto,
    ayudaPista,
    escuchar,
    comprobar,
    como,
    aviso,
    resultado,
    resultadoTitulo,
    resultadoResumen,
    resultadoMotivos,
    resultadoPuntaje,
    anterior,
    siguiente,
    botonesIndice,
  };
}

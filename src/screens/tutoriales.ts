/**
 * Pantalla "Tutoriales" (ruta "#/tutoriales"). Lista los tutoriales de los juegos
 * disponibles con su objetivo y lo que se aprende; cada uno se puede abrir.
 * No conoce juegos: main.ts le pasa los Tutorial (p. ej. [obtenerTutorial()]).
 * Estilos en src/ui/app.css. Todo en español.
 *
 * CONTRATO DE DOM:
 * <main class="tutoriales">
 *   <h1>Tutoriales</h1>
 *   <p class="tutoriales__intro">Cada tutorial dura 1 o 2 pantallas y lo puedes saltar cuando quieras.</p>
 *   <ul class="tutoriales__lista">
 *     <li class="tutoriales__item">
 *       <h2>Arregla el beat</h2>
 *       <p class="tutoriales__objetivo"><strong>Cómo se gana:</strong> objetivo</p>
 *       <p class="tutoriales__aprendes"><strong>Aprendes:</strong> aprendes</p>
 *       <div class="tutoriales__acciones">
 *         <button type="button" class="tutoriales__ver">Ver tutorial</button>
 *         <a class="tutoriales__jugar" href="#/arregla-el-beat">Jugar</a>
 *       </div>
 *     </li>  x tutoriales
 *   </ul>
 *   <a class="tutoriales__volver" href="#/">← Volver al menú</a>
 *   <!-- aquí se agrega el .tutorial (src/ui/tutorial.ts) mientras está abierto -->
 * </main>
 */
import { crearTutorialUI } from "../ui/tutorial";
import type { Tutorial } from "../ui/types";

/**
 * Crea la pantalla de tutoriales.
 * Entrada: tutoriales — en el orden en que se muestran. Lista vacía -> en lugar
 *   de la <ul> se ve <p class="tutoriales__vacio">Todavía no hay tutoriales.</p>
 * Comportamiento:
 * - "Ver tutorial" (aria-label "Ver tutorial de <juego>"): crearTutorialUI(tutorial,
 *   { alCerrar }) -> agrega su elemento al <main> y llama abrir(). Solo un tutorial
 *   abierto a la vez. Al cerrar (cualquier motivo) el foco vuelve a ese botón.
 * - "Jugar" enlaza a tutorial.ruta.
 * Quién lo usa: main.ts en la ruta "#/tutoriales".
 * Casos:
 * - con [tutorialArregla] -> h1 "Tutoriales", 1 .tutoriales__item con h2 "Arregla el beat",
 *   su objetivo visible y un enlace "Jugar" a "#/arregla-el-beat"
 * - clic en "Ver tutorial" -> hay un [role="dialog"] dentro de la pantalla
 * - en el diálogo, clic en "Saltar tutorial" -> ya no hay [role="dialog"]
 * - con [] -> se ve "Todavía no hay tutoriales." y no hay .tutoriales__item
 * - hay un enlace a "#/" con texto "← Volver al menú"
 */
export function crearPantallaTutoriales(tutoriales: readonly Tutorial[]): HTMLElement {
  const raiz = document.createElement("main");
  raiz.className = "tutoriales";

  const h1 = document.createElement("h1");
  h1.textContent = "Tutoriales";
  raiz.appendChild(h1);

  const intro = document.createElement("p");
  intro.className = "tutoriales__intro";
  intro.textContent = "Cada tutorial dura 1 o 2 pantallas y lo puedes saltar cuando quieras.";
  raiz.appendChild(intro);

  let tutorialAbierto: ReturnType<typeof crearTutorialUI> | null = null;

  if (tutoriales.length === 0) {
    const vacio = document.createElement("p");
    vacio.className = "tutoriales__vacio";
    vacio.textContent = "Todavía no hay tutoriales.";
    raiz.appendChild(vacio);
  } else {
    const lista = document.createElement("ul");
    lista.className = "tutoriales__lista";

    tutoriales.forEach((tutorial) => {
      const item = document.createElement("li");
      item.className = "tutoriales__item";

      const h2 = document.createElement("h2");
      h2.textContent = tutorial.juego;
      item.appendChild(h2);

      const objetivo = document.createElement("p");
      objetivo.className = "tutoriales__objetivo";
      const fuerteObjetivo = document.createElement("strong");
      fuerteObjetivo.textContent = "Cómo se gana:";
      objetivo.appendChild(fuerteObjetivo);
      objetivo.append(` ${tutorial.objetivo}`);
      item.appendChild(objetivo);

      const aprendes = document.createElement("p");
      aprendes.className = "tutoriales__aprendes";
      const fuerteAprendes = document.createElement("strong");
      fuerteAprendes.textContent = "Aprendes:";
      aprendes.appendChild(fuerteAprendes);
      aprendes.append(` ${tutorial.aprendes}`);
      item.appendChild(aprendes);

      const acciones = document.createElement("div");
      acciones.className = "tutoriales__acciones";
      item.appendChild(acciones);

      const botonVer = document.createElement("button");
      botonVer.type = "button";
      botonVer.className = "tutoriales__ver";
      botonVer.textContent = "Ver tutorial";
      botonVer.setAttribute("aria-label", `Ver tutorial de ${tutorial.juego}`);
      acciones.appendChild(botonVer);

      const enlaceJugar = document.createElement("a");
      enlaceJugar.className = "tutoriales__jugar";
      enlaceJugar.href = tutorial.ruta;
      enlaceJugar.textContent = "Jugar";
      acciones.appendChild(enlaceJugar);

      botonVer.addEventListener("click", () => {
        if (tutorialAbierto) {
          tutorialAbierto.destruir();
          tutorialAbierto = null;
        }

        tutorialAbierto = crearTutorialUI(tutorial, {
          alCerrar: () => {
            tutorialAbierto = null;
          },
        });

        raiz.appendChild(tutorialAbierto.elemento);
        tutorialAbierto.abrir();
      });

      lista.appendChild(item);
    });

    raiz.appendChild(lista);
  }

  const enlaceVolver = document.createElement("a");
  enlaceVolver.className = "tutoriales__volver";
  enlaceVolver.href = "#/";
  enlaceVolver.textContent = "← Volver al menú";
  raiz.appendChild(enlaceVolver);

  return raiz;
}

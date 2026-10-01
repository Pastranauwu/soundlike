/**
 * Pantalla "Tutoriales" (ruta "#/tutoriales"). Lista los tutoriales de los juegos
 * y de teoría disponibles con su objetivo y lo que se aprende; cada uno se puede abrir.
 * No conoce juegos: main.ts le pasa los Tutorial (p. ej. [obtenerTutorial()]).
 * Estilos en src/ui/app.css. Todo en español.
 *
 * CONTRATO DE DOM:
 * <main class="tutoriales">
 *   <h1>Tutoriales</h1>
 *   <p class="tutoriales__intro">Tutoriales de juego y de teoría musical: cada uno dura 1 o 2 pantallas y lo puedes saltar cuando quieras.</p>
 *   <ul class="tutoriales__lista">
 *     <li class="tutoriales__item">
 *       <span class="tutoriales__tipo">Cómo se juega</span>
 *       <h2>Arregla el beat</h2>
 *       <p class="tutoriales__objetivo"><strong>Cómo se gana:</strong> objetivo</p>
 *       <p class="tutoriales__aprendes"><strong>Aprendes:</strong> aprendes</p>
 *       <div class="tutoriales__acciones">
 *         <button type="button" class="tutoriales__ver">Ver tutorial</button>
 *         <a class="tutoriales__jugar" href="#/arregla-el-beat">Jugar</a>
 *       </div>
 *     </li>
 *     <li class="tutoriales__item">
 *       <span class="tutoriales__tipo">Teoría</span>
 *       <h2>Escalas y acordes</h2>
 *       <p class="tutoriales__objetivo"><strong>Para qué sirve:</strong> objetivo</p>
 *       <p class="tutoriales__aprendes"><strong>Aprendes:</strong> aprendes</p>
 *       <div class="tutoriales__acciones">
 *         <button type="button" class="tutoriales__ver">Ver tutorial</button>
 *       </div>
 *     </li>
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
 * - Si tutorial.ruta === '' (teoría sin juego), no se crea el enlace "Jugar".
 * - "Ver tutorial" (aria-label "Ver tutorial de <juego>"): crearTutorialUI(tutorial,
 *   { alCerrar }) -> agrega su elemento al <main> y llama abrir(). Solo un tutorial
 *   abierto a la vez. Al cerrar (cualquier motivo) el foco vuelve a ese botón.
 * - "Jugar" enlaza a tutorial.ruta (solo si ruta !== '').
 * - Cada item lleva un <span class="tutoriales__tipo"> antes del h2 que dice
 *   "Teoría" si ruta === '' o id empieza con 'teoria-', si no "Cómo se juega".
 * - El objetivo dice "Para qué sirve:" si es teoría, "Cómo se gana:" si no.
 * Quién lo usa: main.ts en la ruta "#/tutoriales".
 * Casos:
 * - con [tutorialArregla] -> h1 "Tutoriales", 1 .tutoriales__item con span tipo
 *   "Cómo se juega", h2 "Arregla el beat", su objetivo visible y un enlace
 *   "Jugar" a "#/arregla-el-beat"
 * - con [tutorialTeoria] (ruta '') -> 1 item con span tipo "Teoría", h2 del juego,
 *   objetivo con "Para qué sirve:", botón "Ver tutorial" pero sin enlace "Jugar"
 * - con [tutorialTeoría] (id='teoria-*') -> etiqueta "Teoría" pero SÍ enlace "Jugar"
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
  intro.textContent = "Tutoriales de juego y de teoría musical: cada uno dura 1 o 2 pantallas y lo puedes saltar cuando quieras.";
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

      const esTeoria = tutorial.ruta === "" || tutorial.id.startsWith("teoria-");

      const tipo = document.createElement("span");
      tipo.className = "tutoriales__tipo";
      tipo.textContent = esTeoria ? "Teoría" : "Cómo se juega";
      item.appendChild(tipo);

      const h2 = document.createElement("h2");
      h2.textContent = tutorial.juego;
      item.appendChild(h2);

      const objetivo = document.createElement("p");
      objetivo.className = "tutoriales__objetivo";
      const fuerteObjetivo = document.createElement("strong");
      fuerteObjetivo.textContent = esTeoria ? "Para qué sirve:" : "Cómo se gana:";
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

      if (tutorial.ruta !== "") {
        const enlaceJugar = document.createElement("a");
        enlaceJugar.className = "tutoriales__jugar";
        enlaceJugar.href = tutorial.ruta;
        enlaceJugar.textContent = "Jugar";
        acciones.appendChild(enlaceJugar);
      }

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

// Función para limpiar caracteres invisibles en la página
function cleanPage() {
  // Usar la expresión regular más completa
  const regex = /[\u0000-\u001F\u007F-\u009F\u00AD\u034F\u061C\u115F\u1160\u17B4\u17B5\u180E\u200B-\u200F\u2028\u2029\u2060-\u206F\u3164\uFEFF\uFFA0-\uFFEF\uFFF9-\uFFFB\uFE00-\uFE0F]/g;
  function traverse(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      node.nodeValue = node.nodeValue.replace(regex, '');
    } else {
      for (let child of node.childNodes) {
        traverse(child);
      }
    }
  }
  traverse(document.body);
  // Opcional: mostrar una alerta o mensaje de confirmación después de la limpieza manual
  // alert("Limpieza manual completada.");
}


// Al abrir el popup, obtenemos y mostramos los datos
document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.local.get(["cleanCount", "cleanPages"], (data) => {
    const count = data.cleanCount || 0;
    const pages = data.cleanPages || [];
    // Mostrar el contador y la cantidad de páginas únicas
    const statsElement = document.getElementById("stats");
    if (statsElement) {
        statsElement.textContent = `Páginas limpiadas: ${pages.length} — Veces total: ${count}`;
    }
  });

  chrome.storage.sync.get(["autoClean", "advancedClean"], (data) => {
    const autoCleanCheckbox = document.getElementById("autoClean");
    if (autoCleanCheckbox) {
        autoCleanCheckbox.checked = data.autoClean || false;
    }
    const advancedCleanCheckbox = document.getElementById("advancedClean");
    if (advancedCleanCheckbox) {
        advancedCleanCheckbox.checked = data.advancedClean || false;
    }
  });

  // Botón de limpieza manual
  const cleanButton = document.getElementById("clean");
  if (cleanButton) {
    cleanButton.addEventListener("click", () => {
      chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          function: cleanPage // Usar la función nombrada aquí
        });
      });
    });
  }

  // Guardar preferencia de autoClean
  const autoCleanCheckboxChange = document.getElementById("autoClean");
  if (autoCleanCheckboxChange) {
    autoCleanCheckboxChange.addEventListener("change", (e) => {
      chrome.storage.sync.set({ autoClean: e.target.checked });
    });
  }

  // Guardar preferencia de advancedClean
  const advancedCleanCheckboxChange = document.getElementById("advancedClean");
  if (advancedCleanCheckboxChange) {
    advancedCleanCheckboxChange.addEventListener("change", (e) => {
      chrome.storage.sync.set({ advancedClean: e.target.checked });
    });
  }

  // Solicitar y mostrar el puntaje de basura web al abrir el popup
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    if (tab) {
      // --- Mostrar Favicon y Dominio ---
      const faviconElement = document.getElementById("website-favicon");
      const domainElement = document.getElementById("website-domain");

      if (faviconElement && tab.favIconUrl) {
          faviconElement.src = tab.favIconUrl;
          faviconElement.style.display = 'inline-block'; // Asegura que se muestre
      } else if (faviconElement) {
          faviconElement.style.display = 'none'; // Oculta si no hay favicon
      }

      if (domainElement && tab.url) {
          try {
              const url = new URL(tab.url);
              domainElement.textContent = `Dominio: ${url.hostname}`; // Añade "Dominio:"
          } catch (e) {
              console.error('Invisible Cleaner Popup: Error parsing URL', e);
              domainElement.textContent = 'Dominio no disponible';
          }
      } else if (domainElement) {
          domainElement.textContent = 'Dominio no disponible';
      }
      // --- Fin Mostrar Favicon y Dominio ---


      chrome.tabs.sendMessage(tab.id, { action: "getGarbageScore" }, (response) => {
        const scoreElement = document.getElementById("score");
        if (scoreElement && response && typeof response.score === 'number') {
          const score = response.score;
          // --- Actualizar Lógica de Nivel para la Nueva Escala ---
          const level = score >= 7 ? '🟢 Limpia' : // Puntaje 7 o más es Limpia
                        score >= 4 ? '🟡 Dudosa' : // Puntaje entre 4 y 6 es Dudosa
                        '🔴 Contaminada'; // Puntaje 3 o menos es Contaminada
          // --- Fin Actualizar Lógica de Nivel ---

          // --- Actualizar Puntaje y Clases CSS ---
          scoreElement.textContent = `Puntaje de limpieza: ${score}/10 — ${level}`;

          // Elimina clases anteriores y añade la nueva según el puntaje
          scoreElement.classList.remove("clean", "medium", "dirty");
          if (score >= 7) { // Usar el nuevo umbral para 'clean'
              scoreElement.classList.add("clean");
          } else if (score >= 4) { // Usar el nuevo umbral para 'medium'
              scoreElement.classList.add("medium");
          } else { // Todo lo demás es 'dirty'
              scoreElement.classList.add("dirty");
          }
          // --- Fin Actualizar Puntaje y Clases CSS ---

        } else if (scoreElement) {
            scoreElement.textContent = 'Puntaje no disponible';
             scoreElement.classList.remove("clean", "medium", "dirty"); // Limpia las clases si no hay puntaje
        }
      });
    } else {
        const scoreElement = document.getElementById("score");
        if (scoreElement) {
            scoreElement.textContent = 'Puntaje no disponible (No active tab)';
             scoreElement.classList.remove("clean", "medium", "dirty"); // Limpia las clases si no hay puntaje
        }
        const faviconElement = document.getElementById("website-favicon");
        if (faviconElement) faviconElement.style.display = 'none';
        const domainElement = document.getElementById("website-domain");
        if (domainElement) domainElement.textContent = 'Dominio no disponible';
    }
  });
});
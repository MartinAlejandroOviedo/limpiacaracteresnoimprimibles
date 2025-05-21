document.addEventListener("DOMContentLoaded", () => {
  const stats = document.getElementById("stats");
  const score = document.getElementById("score");
  const domainSpan = document.getElementById("website-domain");
  const faviconImg = document.getElementById("website-favicon");
  const revertBtn = document.getElementById("revert");
  const ignoreBtn = document.getElementById("ignore");
  const whitelistBtn = document.getElementById("whitelist");
  const identityMode = document.getElementById("identityMode");
  const identitySection = document.getElementById("identitySection");
  const header = document.getElementById("header");

  // NUEVO: About elements
  const aboutBtn = document.getElementById("aboutBtn");
  const aboutModal = document.getElementById("aboutModal");
  const closeAbout = document.getElementById("closeAbout");

  let clickCount = 0;

  // Mostrar favicon y dominio
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    try {
      const url = new URL(tab.url);
      domainSpan.textContent = url.hostname;
      faviconImg.src = "https://www.google.com/s2/favicons?domain=" + url.hostname;
      faviconImg.style.display = "inline";
    } catch (e) {
      domainSpan.textContent = "Error al obtener dominio";
    }

    // Cargar y mostrar diagnóstico
    chrome.storage.local.get("diagnostico", ({ diagnostico }) => {
      if (!diagnostico) {
        stats.textContent = "No se pudo recuperar el diagnóstico.";
        score.textContent = "Diagnóstico no disponible";
        return;
      }

      const { sintomas, grado, estado, detalles } = diagnostico;

      // Establecer clase CSS según gravedad
      score.classList.remove("clean", "medium", "dirty");
      if (grado === 0) {
        score.classList.add("clean");
        score.textContent = `${estado} (Grado ${grado})`;
      } else if (grado < 3) {
        score.classList.add("medium");
        score.textContent = `${estado} (Grado ${grado})`;
      } else {
        score.classList.add("dirty");
        score.textContent = `${estado} (Grado ${grado})`;
      }

      // Construir HTML con detalles
      let htmlContent = `
        <div style="margin-bottom: 10px;">
          <strong>Resumen:</strong> ${estado} (${grado}/4)
        </div>
        <div style="margin-bottom: 10px;">
          <strong>Síntomas detectados:</strong>
          <ul style="margin-top: 5px; padding-left: 20px;">
      `;

      // Listar cada síntoma con su cantidad
      sintomas.forEach(sintoma => {
        htmlContent += `<li>${sintoma}</li>`;
      });

      htmlContent += `
          </ul>
        </div>
      `;

      // Mostrar detalles técnicos si existen
      if (detalles) {
        htmlContent += `
          <div style="margin-top: 10px;">
            <strong>Detalles técnicos:</strong>
            <table style="width: 100%; margin-top: 5px; border-collapse: collapse;">
              <tr>
                <td style="padding: 3px 0; border-bottom: 1px solid #eee;">Trackers:</td>
                <td style="text-align: right; border-bottom: 1px solid #eee;">${detalles.trackers}</td>
              </tr>
              <tr>
                <td style="padding: 3px 0; border-bottom: 1px solid #eee;">Iframes ocultos:</td>
                <td style="text-align: right; border-bottom: 1px solid #eee;">${detalles.iframesOcultos}</td>
              </tr>
              <tr>
                <td style="padding: 3px 0; border-bottom: 1px solid #eee;">Caracteres invisibles:</td>
                <td style="text-align: right; border-bottom: 1px solid #eee;">${detalles.caracteresInvisibles}</td>
              </tr>
              <tr>
                <td style="padding: 3px 0; border-bottom: 1px solid #eee;">Scripts con eval:</td>
                <td style="text-align: right; border-bottom: 1px solid #eee;">${detalles.evalObfuscado}</td>
              </tr>
              <tr>
                <td style="padding: 3px 0;">Fingerprinting:</td>
                <td style="text-align: right;">${detalles.fingerprinting ? '✅ Sí' : '❌ No'}</td>
              </tr>
            </table>
          </div>
        `;
      }

      stats.innerHTML = htmlContent;
    });

    // Botón para revertir tratamiento
    revertBtn.addEventListener("click", () => {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => location.reload()
      });
      window.close();
    });

    // Botón para ignorar tratamiento
    ignoreBtn.addEventListener("click", () => {
      chrome.storage.local.remove("diagnostico", () => {
        alert("Tratamiento ignorado para esta sesión. Recargue la página para aplicar cambios.");
        window.close();
      });
    });
  });

  // Botón para agregar a lista blanca
  whitelistBtn.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      try {
        const url = new URL(tab.url);
        const hostname = url.hostname;

        chrome.storage.sync.get("whitelist", ({ whitelist }) => {
          const lista = Array.isArray(whitelist) ? whitelist : [];
          if (!lista.includes(hostname)) {
            lista.push(hostname);
            chrome.storage.sync.set({ whitelist: lista }, () => {
              alert(`✅ ${hostname} agregado a la lista blanca.
La página se recargará.`);
              chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: () => location.reload()
              });
              window.close();
            });
          } else {
            alert(`ℹ️ ${hostname} ya está en la lista blanca.`);
          }
        });
      } catch (e) {
        alert("Error al obtener dominio para lista blanca");
      }
    });
  });

  // Mostrar el modo de identidad guardado
  chrome.storage.sync.get("identityMode", ({ identityMode: savedMode }) => {
    if (savedMode) {
      identityMode.value = savedMode;
    }
  });

  // Guardar cambios en el modo de identidad
  identityMode.addEventListener("change", () => {
    chrome.storage.sync.set({ identityMode: identityMode.value });
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => location.reload()
      });
      window.close();
    });
  });

  // Desbloquear sección avanzada con 3 clicks
  header.addEventListener("click", () => {
    clickCount++;
    if (clickCount >= 3) {
      identitySection.style.display = "block";
      // Guardar preferencia para no ocultar nuevamente
      chrome.storage.sync.set({ advancedUnlocked: true });
    }
  });

  // Verificar si la sección avanzada ya estaba desbloqueada
  chrome.storage.sync.get("advancedUnlocked", ({ advancedUnlocked }) => {
    if (advancedUnlocked) {
      identitySection.style.display = "block";
    }
  });

  // NUEVO: Manejar about/donación SOLO si existen los elementos
  if (aboutBtn && aboutModal && closeAbout) {
    aboutBtn.addEventListener("click", () => {
      aboutModal.style.display = "block";

      if (!document.querySelector('script[src*="buymeacoffee"]')) {
        const script = document.createElement("script");
        script.src = "https://cdnjs.buymeacoffee.com/1.0.0/button.prod.min.js";
        script.setAttribute("data-name", "bmc-button");
        script.setAttribute("data-slug", "martinaloviedo");  // Cambia acá tu usuario real si querés
        script.setAttribute("data-color", "#FFDD00");
        script.setAttribute("data-emoji", "☕");
        script.setAttribute("data-font", "Lato");
        script.setAttribute("data-text", "Invítame un café");
        script.setAttribute("data-outline-color", "#000000");
        script.setAttribute("data-font-color", "#000000");
        script.setAttribute("data-coffee-color", "#ffffff");
        document.getElementById("donationButton").appendChild(script);
      }
    });

    closeAbout.addEventListener("click", () => {
      aboutModal.style.display = "none";
    });
  }
});

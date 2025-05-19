
document.addEventListener("DOMContentLoaded", () => {
  const stats = document.getElementById("stats");
  const score = document.getElementById("score");
  const domainSpan = document.getElementById("website-domain");
  const faviconImg = document.getElementById("website-favicon");
  const revertBtn = document.getElementById("revert");
  const ignoreBtn = document.getElementById("ignore");

  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    try {
      const url = new URL(tab.url);
      domainSpan.textContent = url.hostname;
      faviconImg.src = "https://www.google.com/s2/favicons?domain=" + url.hostname;
      faviconImg.style.display = "inline";
    } catch (e) {
      domainSpan.textContent = "Error al obtener dominio";
    }

    chrome.storage.local.get("diagnostico", ({ diagnostico }) => {
      if (!diagnostico) {
        stats.textContent = "No se pudo recuperar el diagnóstico.";
        return;
      }

      const { sintomas, grado, estado } = diagnostico;

      score.classList.remove("clean", "medium", "dirty");
      if (grado === 0) score.classList.add("clean");
      else if (grado < 3) score.classList.add("medium");
      else score.classList.add("dirty");

      score.textContent = `Diagnóstico: ${estado} (Grado ${grado})`;

      stats.innerHTML = `<strong>Síntomas:</strong><ul style="padding-left:20px;">` +
        sintomas.map(s => `<li>${s}</li>`).join('') + `</ul>`;
    });

    revertBtn.addEventListener("click", () => {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => location.reload()
      });
    });

    ignoreBtn.addEventListener("click", () => {
      chrome.storage.local.remove("diagnostico", () => {
        alert("Tratamiento ignorado para esta sesión.");
      });
    });
  });
});

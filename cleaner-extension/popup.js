document.addEventListener("DOMContentLoaded", () => {
  const stats = document.getElementById("stats");
  const score = document.getElementById("score");
  const whitelistList = document.getElementById("whitelist-list");
  const exportReportsBtn = document.getElementById("export-reports");
  const exportWhitelistBtn = document.getElementById("export-whitelist");
  const generateBtn = document.getElementById("generate-report");

  // Botón para exportar reportes
  exportReportsBtn?.addEventListener("click", () => {
    chrome.storage.local.get("reportesPorDominio", ({ reportesPorDominio }) => {
      if (reportesPorDominio) {
        const blob = new Blob([JSON.stringify(reportesPorDominio, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "reportesPorDominio.json";
        a.click();
        URL.revokeObjectURL(url);
      } else {
        alert("No hay reportes para exportar.");
      }
    });
  });

  // Botón para exportar lista blanca
  exportWhitelistBtn?.addEventListener("click", () => {
    chrome.storage.sync.get("whitelist", ({ whitelist }) => {
      const blob = new Blob([JSON.stringify(whitelist || [], null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "whitelist.json";
      a.click();
      URL.revokeObjectURL(url);
    });
  });

  // Botón generar diagnóstico manual
  generateBtn?.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      if (!tab || !tab.id || tab.url.startsWith("chrome://") || tab.url.startsWith("chrome-extension://")) {
        alert("Esta extensión no funciona en esta pestaña.");
        return;
      }

      chrome.tabs.sendMessage(tab.id, { action: "reanalyzeNow" }, (response) => {
        if (chrome.runtime.lastError) {
          alert("No se pudo conectar al contenido: " + chrome.runtime.lastError.message);
          return;
        }

        if (response?.diagnostico) {
          const reportData = response.diagnostico;
          localStorage.setItem("reporte", JSON.stringify(reportData));
          window.open(chrome.runtime.getURL("report.html"), "_blank");
        } else {
          alert("No se pudo generar el informe.");
        }
      });
    });
  });

  // Cargar diagnóstico actual
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    if (!tab || !tab.id) return;
    chrome.tabs.sendMessage(tab.id, { action: "reanalyzeNow" }, (response) => {
      if (!response || response.status !== "ok") {
        stats.textContent = "No se pudo obtener diagnóstico en tiempo real.";
        score.textContent = "Diagnóstico no disponible";
        return;
      }

      const diagnostico = response.diagnostico;
      const grado = diagnostico.grado ?? Math.min(4,
        (diagnostico.trackers?.length > 0 ? 1 : 0) +
        (diagnostico.hiddenIframes?.length > 0 ? 1 : 0) +
        (diagnostico.evalScripts?.length > 0 ? 1 : 0) +
        (diagnostico.invisibleCharacterCount > 20 ? 1 : 0)
      );

      const estados = ["Limpia", "Leve", "Moderada", "Contaminada", "Abominación"];
      const estado = diagnostico.estado || estados[grado];

      score.className = "estado";
      if (grado === 0) score.classList.add("estado-verde");
      else if (grado < 3) score.classList.add("estado-naranja");
      else score.classList.add("estado-rojo");

      score.textContent = `${estado} (Grado ${grado})`;

      const sintomas = diagnostico.sintomas || [];
      if (sintomas.length === 0) {
        const d = diagnostico;
        if (d.trackers?.length > 0) sintomas.push(`Trackers detectados (${d.trackers.length})`);
        if (d.hiddenIframes?.length > 0) sintomas.push(`Iframes ocultos (${d.hiddenIframes.length})`);
        if (d.invisibleCharacterCount > 10) sintomas.push(`Caracteres invisibles (${d.invisibleCharacterCount})`);
        if (d.evalScripts?.length > 0) sintomas.push(`Uso de eval/Function (${d.evalScripts.length})`);
        if (d.usesSendBeacon) sintomas.push("Uso de sendBeacon");
        if (d.usesFingerprinting) sintomas.push("Fingerprinting activo");
      }

      stats.innerHTML = `<ul>${sintomas.map(s => `<li>${s}</li>`).join("")}</ul>`;
    });
  });

  // 🔁 Cargar y mostrar lista blanca
  chrome.storage.sync.get("whitelist", ({ whitelist }) => {
    const lista = whitelist || [];
    whitelistList.innerHTML = "";

    if (lista.length === 0) {
      whitelistList.innerHTML = "<li>La lista blanca está vacía.</li>";
      return;
    }

    lista.forEach((dominio) => {
      const li = document.createElement("li");
      li.textContent = dominio;

      const borrarBtn = document.createElement("button");
      borrarBtn.textContent = "🗑️";
      borrarBtn.style.marginLeft = "10px";
      borrarBtn.style.cursor = "pointer";
      borrarBtn.onclick = () => {
        const nuevaLista = lista.filter(d => d !== dominio);
        chrome.storage.sync.set({ whitelist: nuevaLista }, () => {
          alert(`❌ ${dominio} eliminado de la lista blanca.`);
          location.reload(); // Más simple que re-renderizar a mano
        });
      };

      li.appendChild(borrarBtn);
      whitelistList.appendChild(li);
    });
  });
});

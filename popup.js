
document.addEventListener("DOMContentLoaded", () => {
  const stats = document.getElementById("stats");
  const score = document.getElementById("score");
  const whitelistList = document.getElementById("whitelist-list");

  // Botones de exportación
  const exportReportsBtn = document.createElement("button");
  exportReportsBtn.textContent = "Exportar Reportes";
  exportReportsBtn.className = "btn";

  const exportWhitelistBtn = document.createElement("button");
  exportWhitelistBtn.textContent = "Exportar Lista Blanca";
  exportWhitelistBtn.className = "btn";

  document.querySelector(".actions-section").appendChild(exportReportsBtn);
  document.querySelector(".actions-section").appendChild(exportWhitelistBtn);

  exportReportsBtn.addEventListener("click", () => {
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

  exportWhitelistBtn.addEventListener("click", () => {
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

  // Botón: Generar Informe Detallado
  const generateBtn = document.getElementById("generate-report");
  generateBtn.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      chrome.tabs.sendMessage(tab.id, { action: "reanalyzeNow" }, (response) => {
        if (response?.diagnostico) {
          const reportData = response.diagnostico;
          const html = buildReportHtml(reportData);
          const blob = new Blob([html], { type: "text/html" });
          const url = URL.createObjectURL(blob);
          window.open(url, "_blank");
        } else {
          alert("No se pudo generar el informe.");
        }
      });
    });
  });

  // Mostrar Lista Blanca
  chrome.storage.sync.get("whitelist", ({ whitelist }) => {
    whitelistList.innerHTML = "";
    if (whitelist && whitelist.length > 0) {
      whitelist.forEach(domain => {
        const li = document.createElement("li");
        li.textContent = domain;
        whitelistList.appendChild(li);
      });
    } else {
      whitelistList.innerHTML = "<li>La lista blanca está vacía.</li>";
    }
  });

  // Diagnóstico
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
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
        (diagnostico.invisibleCharacterCount > 20 ? 1 : 0) +
        (diagnostico.usesFingerprinting ? 1 : 0)
      );
      const estado = diagnostico.estado || ["Limpia", "Leve", "Moderada", "Contaminada", "Abominación"][grado];
      const detalles = diagnostico.detalles || diagnostico;
      const sintomas = diagnostico.sintomas || [];

      if (sintomas.length === 0) {
        if (detalles.trackers?.length > 0) sintomas.push(`Trackers detectados (${detalles.trackers.length})`);
        if (detalles.hiddenIframes?.length > 0) sintomas.push(`Iframes ocultos (${detalles.hiddenIframes.length})`);
        if (detalles.invisibleCharacterCount > 10) sintomas.push(`Caracteres invisibles (${detalles.invisibleCharacterCount})`);
        if (detalles.evalScripts?.length > 0) sintomas.push(`Uso de eval/función dinámica (${detalles.evalScripts.length})`);
        if (detalles.usesSendBeacon) sintomas.push("Uso de sendBeacon");
        if (detalles.usesFingerprinting) sintomas.push("Fingerprinting activo");
      }

      score.classList.remove("clean", "medium", "dirty");
      if (grado === 0) {
        score.classList.add("clean");
        score.textContent = `🟢 ${estado} (Grado ${grado})`;
      } else if (grado < 3) {
        score.classList.add("medium");
        score.textContent = `🟠 ${estado} (Grado ${grado})`;
      } else {
        score.classList.add("dirty");
        score.textContent = `🔴 ${estado} (Grado ${grado})`;
      }

      let htmlContent = `<div><ul>`;
      sintomas.forEach(sintoma => {
        htmlContent += `<li>${sintoma}</li>`;
      });
      htmlContent += `</ul></div>`;
      stats.innerHTML = htmlContent;
    });
  });
});

// Para usar buildReportHtml desde popup
function buildReportHtml(reportData) {
  let html = `
    <html>
    <head><meta charset="UTF-8"><title>Informe Detallado</title></head>
    <body>
    <h1>Informe de Invisible Cleaner</h1>
    <p><strong>URL:</strong> ${reportData.url}</p>
    <p><strong>Fecha:</strong> ${new Date(reportData.timestamp).toLocaleString()}</p>
    <hr>
  `;
  if (reportData.trackers?.length) {
    html += `<h2>Trackers</h2><ul>` + reportData.trackers.map(t => `<li>${t.src}</li>`).join("") + `</ul>`;
  }
  if (reportData.hiddenIframes?.length) {
    html += `<h2>Iframes ocultos</h2><ul>` + reportData.hiddenIframes.map(i => `<li>${i.src}</li>`).join("") + `</ul>`;
  }
  if (reportData.evalScripts?.length) {
    html += `<h2>Eval Scripts</h2><ul>` + reportData.evalScripts.map(e => `<li><pre>${e.snippet}</pre></li>`).join("") + `</ul>`;
  }
  html += `<p><strong>Caracteres invisibles:</strong> ${reportData.invisibleCharacterCount}</p>`;
  html += `<p><strong>sendBeacon:</strong> ${reportData.usesSendBeacon ? "Sí" : "No"}</p>`;
  html += `<p><strong>Fingerprinting:</strong> ${reportData.usesFingerprinting ? "Sí" : "No"}</p>`;
  html += `</body></html>`;
  return html;
}

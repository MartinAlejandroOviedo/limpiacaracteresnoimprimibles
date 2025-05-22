
document.addEventListener("DOMContentLoaded", () => {
  const generateBtn = document.getElementById("generate-report");

  generateBtn.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      chrome.tabs.sendMessage(tab.id, { action: "reanalyzeNow" }, (response) => {
        if (response?.diagnostico) {
          const markdown = buildReportMarkdown(response.diagnostico);
          const blob = new Blob([markdown], { type: "text/plain;charset=utf-8" });
          const url = URL.createObjectURL(blob);

          // Abrir nueva pestaña con el MD plano
          window.open(url, "_blank");

          // Copiar al portapapeles automáticamente
          navigator.clipboard.writeText(markdown).then(() => {
            console.log("Informe copiado al portapapeles.");
          }).catch(err => {
            console.warn("No se pudo copiar el informe:", err);
          });
        } else {
          alert("No se pudo generar el informe.");
        }
      });
    });
  });
});

// buildReportMarkdown integrado
function buildReportMarkdown(reportData) {
  const emoji = (riesgo) => {
    return {
      adorable: "🧸",
      basura: "🗑️",
      inservible: "😶‍🌫️",
      desconocido: "❓",
      nulo: "🪫",
      malintencionado: "😈"
    }[riesgo] || "🔍";
  };

  let md = `# 🧽 Informe de Invisible Cleaner

**URL:** ${reportData.url}
**Fecha y Hora:** ${new Date(reportData.timestamp).toLocaleString()}

---

`;

  const renderCategoria = (item) => `
${emoji(item.riesgo)} **${item.nombre}**
*${item.tipo}* — Riesgo: \`${item.riesgo}\`
_${item.comentario || "Sin comentario adicional."}_
Dominio: \`${item.dominio}\`
`;

  if (reportData.trackers?.length) {
    md += `## 🎯 Trackers Detectados (${reportData.trackers.length})\n`;
    reportData.trackers.forEach(t => { md += renderCategoria(t) + "\n"; });
  }

  if (reportData.hiddenIframes?.length) {
    md += `\n## 🪟 Iframes Ocultos (${reportData.hiddenIframes.length})\n`;
    reportData.hiddenIframes.forEach(i => { md += renderCategoria(i) + "\n"; });
  }

  if (reportData.evalScripts?.length) {
    md += `\n## ⚠️ Scripts con Eval / Function\n`;
    reportData.evalScripts.forEach(s => {
      md += "```js\n" + s.snippet + "\n```";
    });
  }

  md += `\n## 🕵️ Otros Indicadores
- Caracteres invisibles: ${reportData.invisibleCharacterCount}
- Uso de sendBeacon: ${reportData.usesSendBeacon ? "✅ Sí" : "❌ No"}
- Fingerprinting: ${reportData.usesFingerprinting ? "✅ Sí" : "❌ No"}

---

*Invisible Cleaner v1.0.1 — generado el ${new Date().toLocaleString()}*
`;

  return md;
}


function emoji(riesgo) {
  return {
    adorable: "🧸",
    basura: "🗑️",
    inservible: "😶‍🌫️",
    desconocido: "❓",
    nulo: "🪫",
    malintencionado: "😈"
  }[riesgo] || "🔍";
}

function renderCategoria(item) {
  return `
  <div class="card shadow-sm mb-3">
    <div class="card-body">
      <h5 class="card-title">
        <i class="bx bx-shield-quarter me-2"></i> ${item.nombre}
      </h5>
      <h6 class="card-subtitle text-muted mb-2">${item.tipo} — Riesgo: ${item.riesgo} ${item.emoji || emoji(item.riesgo)}</h6>
      <p class="card-text"><strong>Comentario:</strong> ${item.comentario || "Sin comentario adicional."}</p>
      <small class="text-muted">Dominio: ${item.dominio || "N/A"}</small>
    </div>
  </div>
  `;
}

function renderReporte(reportData) {
  let html = `
    <p><strong>URL:</strong> ${reportData.url}</p>
    <p><strong>Fecha y Hora:</strong> ${new Date(reportData.timestamp).toLocaleString()}</p>
    <hr>
  `;

  if (reportData.trackers?.length) {
    html += `<h3>🎯 Trackers Detectados (${reportData.trackers.length})</h3>`;
    reportData.trackers.forEach(t => { html += renderCategoria(t); });
  }

  if (reportData.hiddenIframes?.length) {
    html += `<h3>🪟 Iframes Ocultos (${reportData.hiddenIframes.length})</h3>`;
    reportData.hiddenIframes.forEach(i => { html += renderCategoria(i); });
  }

  if (reportData.evalScripts?.length) {
    html += `<h3>⚠️ Scripts con Eval / Function</h3>`;
    html += '<div class="accordion" id="evalAccordion">';
    reportData.evalScripts.forEach((s, index) => {
      html += `
      <div class="accordion-item">
        <h2 class="accordion-header" id="heading${index}">
          <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${index}">
            Script #${index + 1}
          </button>
        </h2>
        <div id="collapse${index}" class="accordion-collapse collapse" data-bs-parent="#evalAccordion">
          <div class="accordion-body"><pre>${s.snippet}</pre></div>
        </div>
      </div>
      `;
    });
    html += '</div>';
  }

  html += `
    <h3>🕵️ Otros Indicadores</h3>
    <ul class="list-group mb-4">
      <li class="list-group-item">Caracteres invisibles: ${reportData.invisibleCharacterCount}</li>
      <li class="list-group-item">Uso de sendBeacon: ${reportData.usesSendBeacon ? "✅ Sí" : "❌ No"}</li>
      <li class="list-group-item">Fingerprinting: ${reportData.usesFingerprinting ? "✅ Sí" : "❌ No"}</li>
    </ul>
    <footer class="text-center text-muted mt-5">
      <small>Invisible Cleaner v1.0.9 — generado el ${new Date().toLocaleString()}</small>
    </footer>
  `;

  document.getElementById("reporteContenido").innerHTML = html;
}

chrome.storage.local.get("ultimoReporte", ({ ultimoReporte }) => {
  if (ultimoReporte) {
    renderReporte(ultimoReporte);
  } else {
    document.getElementById("reporteContenido").innerHTML = "<p>No se encontró un informe reciente.</p>";
  }
});


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
  <div class="panel sombra margen-abajo">
    <div class="panel-cuerpo">
      <h3 class="titulo-secundario">${item.nombre}</h3>
      <p class="subtitulo texto-suave">${item.tipo} — Riesgo: ${item.riesgo} ${item.emoji || emoji(item.riesgo)}</p>
      <p><strong>Comentario:</strong> ${item.comentario || "Sin comentario adicional."}</p>
      <p class="texto-chico">Dominio: ${item.dominio || "N/A"}</p>
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
    html += `<h2 class="titulo-secundario">Rastros Detectados</h2>`;
    reportData.trackers.forEach(item => {
      html += renderCategoria(item);
    });
  } else {
    html += `<div class="panel advertencia">No se detectaron rastreadores.</div>`;
  }

  return html;
}

document.addEventListener("DOMContentLoaded", () => {
  let reportData = {};

  try {
    reportData = JSON.parse(localStorage.getItem("reporte"));
  } catch (e) {
    console.error("Error al cargar el reporte desde localStorage:", e);
  }

  const contenedor = document.getElementById("reporteContenido");

  if (!reportData || !reportData.url) {
    contenedor.innerHTML = "<div class='panel error'>No se encontró información para mostrar.</div>";
  } else {
    contenedor.innerHTML = renderReporte(reportData);
  }
});

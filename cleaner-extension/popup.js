
document.addEventListener("DOMContentLoaded", () => {
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
});

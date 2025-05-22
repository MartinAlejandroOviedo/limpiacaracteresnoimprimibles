
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "reanalyzeNow") {
    if (typeof generateDetailedReportData === 'function') {
      const report = generateDetailedReportData();
      const hostname = new URL(location.href).hostname;
      chrome.storage.local.get("reportesPorDominio", ({ reportesPorDominio }) => {
        const reportes = reportesPorDominio || {};
        reportes[hostname] = report;
        chrome.storage.local.set({ diagnostico: report, reportesPorDominio: report }, () => {
          sendResponse({ status: "ok", diagnostico: report });
        });
      });
      return true;
    } else {
      sendResponse({ status: "error", message: "generateDetailedReportData not available" });
    }
  }
});

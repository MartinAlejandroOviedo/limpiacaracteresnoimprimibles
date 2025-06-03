chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "reanalyzeNow") {
    const hostname = new URL(location.href).hostname;

    // Verificar si está en la lista blanca
    chrome.storage.local.get("listaBlanca", ({ listaBlanca }) => {
      const lista = listaBlanca || [];

      if (lista.includes(hostname)) {
        console.log(`🛡️ Dominio en lista blanca: ${hostname}. Análisis omitido.`);
        sendResponse({ status: "omitido", message: "Dominio en lista blanca" });
        return;
      }

      if (typeof generateDetailedReportData === 'function') {
        const report = generateDetailedReportData();

        chrome.storage.local.get("reportesPorDominio", ({ reportesPorDominio }) => {
          const reportes = reportesPorDominio || {};
          reportes[hostname] = report;

          chrome.storage.local.set({ diagnostico: report, reportesPorDominio: reportes }, () => {
            sendResponse({ status: "ok", diagnostico: report });
          });
        });
      } else {
        sendResponse({ status: "error", message: "generateDetailedReportData not available" });
      }
    });

    return true; // indica que sendResponse será llamado de forma asíncrona
  }
});

function generateDetailedReportData() {
  const trackers = [...document.querySelectorAll('script[src*="track"], script[src*="analytics"], script[src*="ads"], script[src*="facebook"], script[src*="google"], script[src*="gtm"]')].map(s => ({
    nombre: "Tracker detectado",
    tipo: "Script externo",
    riesgo: "adorable",
    comentario: "Script con patrón típico de rastreo",
    dominio: (new URL(s.src)).hostname,
    src: s.src,
    emoji: "🧸"
  }));

  const hiddenIframes = [...document.querySelectorAll("iframe")].filter(i =>
    i.width <= 1 || i.height <= 1 || i.style.display === "none" || i.style.visibility === "hidden"
  ).map(i => ({ src: i.src || "iframe sin src" }));

  const evalScripts = [...document.querySelectorAll("script:not([src])")].filter(s =>
    s.innerText.includes("eval(") || s.innerText.includes("new Function")
  ).map(s => ({
    snippet: s.innerText.slice(0, 300) + (s.innerText.length > 300 ? "..." : "")
  }));

  const invisibleCharacterCount = (document.body.innerText.match(/[​-‏﻿⁠]/g) || []).length;
  const usesSendBeacon = typeof navigator.sendBeacon === "function";
  const usesFingerprinting = !!(navigator.deviceMemory || navigator.hardwareConcurrency);

  const timestamp = Date.now();
  const url = location.href;

  const grado = Math.min(4,
    (trackers.length > 0 ? 1 : 0) +
    (hiddenIframes.length > 0 ? 1 : 0) +
    (evalScripts.length > 0 ? 1 : 0) +
    (invisibleCharacterCount > 20 ? 1 : 0)
  );

  const estado = ["Limpia", "Leve", "Moderada", "Contaminada", "Abominación"][grado];

  return {
    url,
    timestamp,
    trackers,
    hiddenIframes,
    evalScripts,
    invisibleCharacterCount,
    usesSendBeacon,
    usesFingerprinting,
    grado,
    estado
  };
}

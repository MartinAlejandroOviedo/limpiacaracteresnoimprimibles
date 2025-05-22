
chrome.runtime.onStartup.addListener(() => {
  console.log("Extension started.");
});

chrome.runtime.onSuspend.addListener(() => {
  chrome.storage.local.remove("reportesPorDominio", () => {
    console.log("reportesPorDominio limpiado al cerrar.");
  });
});

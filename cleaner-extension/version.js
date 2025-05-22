
document.addEventListener("DOMContentLoaded", () => {
  try {
    const version = chrome.runtime.getManifest().version;
    const target = document.getElementById("version-info");
    if (target) {
      target.textContent += " v" + version;
    }
  } catch (e) {
    console.warn("No se pudo cargar la versión de la extensión:", e);
  }
});

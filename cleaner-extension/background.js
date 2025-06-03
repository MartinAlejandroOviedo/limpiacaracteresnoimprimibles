// background.js

const EASYPRIVACY_URL = "https://easylist.to/easylist/easyprivacy.txt";
const STORAGE_KEY = "easyprivacy_trackers";
const LAST_UPDATE_KEY = "easyprivacy_last_update";
const UPDATE_INTERVAL_MS = 4 * 24 * 60 * 60 * 1000; // 4 días

// Extrae dominios tipo ||dominio.com^
function extractDomainsFromEasyList(text) {
  const lines = text.split("\n");
  const domainRegex = /^\|\|([a-zA-Z0-9\-_.]+)\^/;
  const domains = new Set();

  for (const line of lines) {
    const match = line.match(domainRegex);
    if (match) {
      domains.add(match[1]);
    }
  }

  return Array.from(domains);
}

// Descargar y guardar lista
async function fetchEasyPrivacy() {
  try {
    const response = await fetch(EASYPRIVACY_URL);
    if (!response.ok) throw new Error("No se pudo descargar la lista.");
    const text = await response.text();
    const domains = extractDomainsFromEasyList(text);

    await chrome.storage.local.set({
      [STORAGE_KEY]: domains,
      [LAST_UPDATE_KEY]: Date.now(),
    });

    console.log(`✅ Lista EasyPrivacy actualizada con ${domains.length} dominios.`);
  } catch (error) {
    console.error("❌ Error al actualizar EasyPrivacy:", error.message);
  }
}

// Verifica si necesita actualizar y lo hace
async function verificarYActualizarEasyPrivacy() {
  const result = await chrome.storage.local.get([LAST_UPDATE_KEY]);
  const ultima = result[LAST_UPDATE_KEY] || 0;
  const ahora = Date.now();

  if ((ahora - ultima) > UPDATE_INTERVAL_MS) {
    console.log("⏳ Actualizando lista EasyPrivacy...");
    await fetchEasyPrivacy();
  } else {
    console.log("🆗 Lista EasyPrivacy aún vigente.");
  }
}

// Eventos de arranque e instalación
chrome.runtime.onStartup.addListener(verificarYActualizarEasyPrivacy);
chrome.runtime.onInstalled.addListener(verificarYActualizarEasyPrivacy);

// Verifica periódicamente
setInterval(verificarYActualizarEasyPrivacy, 6 * 60 * 60 * 1000); // cada 6 horas

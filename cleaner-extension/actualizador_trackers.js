// actualizador_trackers.js
// 📥 Auto actualización silenciosa de lista de trackers

const TRACKERS_LIST_URL = 'https://easylist.to/easylist/easyprivacy.txt';
const TRACKERS_CACHE_KEY = 'lista_trackers';
const LAST_UPDATE_KEY = 'trackers_last_update';
const MAX_DAYS = 3; // Días antes de volver a actualizar

// Función principal automática
export async function autoActualizarListaTrackers() {
  const now = Date.now();

  chrome.storage.local.get([LAST_UPDATE_KEY, TRACKERS_CACHE_KEY], async (data) => {
    const lastUpdate = data[LAST_UPDATE_KEY] || 0;
    const diasPasados = (now - lastUpdate) / (1000 * 60 * 60 * 24);

    if (diasPasados > MAX_DAYS || !data[TRACKERS_CACHE_KEY]) {
      console.log("🧹 Invisible Cleaner: Actualizando base de trackers...");
      const lista = await descargarYParsearTrackers();
      chrome.storage.local.set({
        [TRACKERS_CACHE_KEY]: Array.from(lista),
        [LAST_UPDATE_KEY]: now
      });
      console.log("✅ Base de trackers actualizada.");
    }
  });
}

// Descarga y parseo del archivo .txt de EasyPrivacy
async function descargarYParsearTrackers() {
  try {
    const res = await fetch(TRACKERS_LIST_URL);
    const text = await res.text();
    const dominios = new Set();

    text.split('\n').forEach(line => {
      line = line.trim();
      if (!line || line.startsWith('!') || line.startsWith('[')) return;
      let dominio = line.replace(/^\|\|/, '').replace(/^https?:\/\//, '').split('/')[0];
      if (dominio) dominios.add(dominio);
    });

    return dominios;
  } catch (error) {
    console.warn("❌ Error al descargar la lista de trackers:", error);
    return new Set();
  }
}

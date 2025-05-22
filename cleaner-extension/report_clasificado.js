
// report.js con clasificación mejorada
let categoriasClasificacion = {};

fetch(chrome.runtime.getURL("categorias_rastreo_ampliadas.json"))
  .then((r) => r.json())
  .then((json) => categoriasClasificacion = json)
  .catch(() => categoriasClasificacion = {});

function clasificarDominio(url, tipo) {
  try {
    const dominio = new URL(url).hostname.replace("www.", "");
    const base = categoriasClasificacion[tipo] || {};
    const item = base[dominio];
    if (item) {
      return {
        ...item,
        dominio,
        emoji: obtenerEmoji(item.riesgo),
      };
    } else {
      return {
        nombre: dominio,
        tipo: "no catalogado",
        riesgo: url ? "desconocido" : "nulo",
        comentario: url ? "Dominio no identificado en base de datos." : "Elemento sin origen.",
        dominio,
        emoji: obtenerEmoji(url ? "desconocido" : "nulo")
      };
    }
  } catch (e) {
    return {
      nombre: "desconocido",
      tipo: "error",
      riesgo: "nulo",
      comentario: "URL inválida o no parseable.",
      dominio: "(desconocido)",
      emoji: obtenerEmoji("nulo")
    };
  }
}

function obtenerEmoji(riesgo) {
  const mapa = {
    adorable: "🧸",
    basura: "🗑️",
    inservible: "😶‍🌫️",
    desconocido: "❓",
    nulo: "🪫",
    malintencionado: "😈"
  };
  return mapa[riesgo] || "🔍";
}

function generateDetailedReportData() {
  const trackers = [];
  document.querySelectorAll('script[src*="track"], script[src*="analytics"], script[src*="ads"], script[src*="facebook"], script[src*="google"], script[src*="gtm"]').forEach(script => {
    trackers.push(clasificarDominio(script.src, "trackers"));
  });

  const iframes = [];
  [...document.querySelectorAll('iframe')].filter(i =>
    i.width <= 1 || i.height <= 1 || i.style.display === 'none' || i.style.visibility === 'hidden'
  ).forEach(iframe => {
    iframes.push(clasificarDominio(iframe.src, "iframes"));
  });

  const evalScripts = [];
  [...document.querySelectorAll('script:not([src])')].filter(s =>
    s.innerText.includes("eval(") || s.innerText.includes("new Function")
  ).forEach(script => {
    const codeSnippet = script.innerText.substring(0, 200) + (script.innerText.length > 200 ? "..." : "");
    evalScripts.push({ type: "inline script", snippet: codeSnippet });
  });

  const invisibleChars = document.body.innerText.match(/[\u200B-\u200F\uFEFF\u2060]/g);
  const invisibleCharCount = invisibleChars ? invisibleChars.length : 0;

  const hasBeacon = typeof navigator.sendBeacon === "function";
  const hasFingerprinting = (navigator.deviceMemory || navigator.hardwareConcurrency) ? true : false;

  return {
    url: location.href,
    timestamp: new Date().toISOString(),
    trackers,
    hiddenIframes: iframes,
    evalScripts,
    invisibleCharacterCount: invisibleCharCount,
    usesSendBeacon: hasBeacon,
    usesFingerprinting: hasFingerprinting
  };
}

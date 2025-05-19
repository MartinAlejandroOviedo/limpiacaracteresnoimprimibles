
chrome.storage.sync.get("whitelist", ({ whitelist }) => {
  const skip = Array.isArray(whitelist) && whitelist.some(d => location.hostname.includes(d));
  if (skip) return;

  chrome.storage.sync.get("identityMode", ({ identityMode }) => {
    if (identityMode && identityMode !== "normal") {
      chrome.runtime.sendMessage({ action: "spoofRequest" });
    }
  });

  // Diagnóstico + tratamiento automático
  const sintomas = [];
  const storage = chrome.storage.local;

  function tieneTrackers() {
    return !!document.querySelector('script[src*="track"], script[src*="analytics"], script[src*="ads"]');
  }

  function tieneCaracteresInvisibles() {
    const invisibles = document.body.innerText.match(/[\u200B-\u200F\uFEFF\u2060]/g);
    return invisibles && invisibles.length > 10;
  }

  function tieneIframesOcultos() {
    return [...document.querySelectorAll('iframe')].some(i => i.width <= 1 || i.height <= 1 || i.style.display === 'none');
  }

  function usaBeacon() {
    return typeof navigator.sendBeacon === 'function';
  }

  function usaFingerprinting() {
    return !!(navigator.deviceMemory || navigator.hardwareConcurrency);
  }

  function tieneEvalObfuscado() {
    return [...document.querySelectorAll('script:not([src])')].some(s => s.innerText.includes("eval(") || s.innerText.includes("new Function"));
  }

  function aplicarTratamiento(grado) {
    if (grado === 0) return;

    if (grado >= 1) {
      document.querySelectorAll("*").forEach(node => {
        if (node.nodeType === Node.TEXT_NODE && node.nodeValue) {
          node.nodeValue = node.nodeValue.replace(/[\x00-\x1F\x7F\u00A0\u2000-\u200F\u2028\u2029\u202F\u205F\u2060\u3000\uFEFF]/g, '');
        }
      });
    }

    if (grado >= 2) {
      document.querySelectorAll('iframe, img, script').forEach(el => {
        if (el.width <= 1 || el.height <= 1 || el.style.display === 'none') el.remove();
      });
    }

    if (grado >= 3) {
      document.querySelectorAll('script').forEach(s => s.remove());
      try {
        navigator.sendBeacon = () => false;
      } catch (e) {}
    }

    if (grado >= 4) {
      document.body.innerHTML = "<div style='padding:20px; font-family:sans-serif; background:#900; color:white'><h1>🚫 Página bloqueada</h1><p>Esta página fue bloqueada por contener múltiples síntomas de comportamiento malicioso.</p></div>";
    }
  }

  if (tieneTrackers()) sintomas.push("Trackers detectados");
  if (tieneCaracteresInvisibles()) sintomas.push("Caracteres invisibles");
  if (tieneIframesOcultos()) sintomas.push("Iframes ocultos");
  if (usaBeacon()) sintomas.push("Uso de sendBeacon");
  if (usaFingerprinting()) sintomas.push("Fingerprinting activo");
  if (tieneEvalObfuscado()) sintomas.push("Uso de eval / función dinámica");

  const grado = sintomas.length >= 6 ? 4 :
                sintomas.length >= 5 ? 3 :
                sintomas.length >= 3 ? 2 :
                sintomas.length >= 1 ? 1 : 0;

  const estado = grado === 0 ? '🟢 Saludable' :
                 grado === 1 ? '🟡 Dudosa' :
                 grado === 2 ? '🟠 Sospechosa' :
                 grado === 3 ? '🔴 Contaminada' :
                               '🛑 Peligrosa';

  const diagnostico = {
    sintomas,
    grado,
    estado,
    url: location.href,
    timestamp: new Date().toISOString()
  };

  storage.set({ diagnostico });
  aplicarTratamiento(grado);
});

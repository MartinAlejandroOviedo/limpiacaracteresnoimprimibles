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

  function contarTrackers() {
    const trackers = document.querySelectorAll('script[src*="track"], script[src*="analytics"], script[src*="ads"], script[src*="facebook"], script[src*="google"], script[src*="gtm"]');
    return trackers.length;
  }

  function contarCaracteresInvisibles() {
    const invisibles = document.body.innerText.match(/[\u200B-\u200F\uFEFF\u2060]/g);
    return invisibles ? invisibles.length : 0;
  }

  function contarIframesOcultos() {
    const iframes = [...document.querySelectorAll('iframe')].filter(i => 
      i.width <= 1 || i.height <= 1 || i.style.display === 'none' || i.style.visibility === 'hidden'
    );
    return iframes.length;
  }

  function detectarBeacon() {
    return typeof navigator.sendBeacon === 'function' ? 1 : 0;
  }

  function detectarFingerprinting() {
    return (navigator.deviceMemory || navigator.hardwareConcurrency) ? 1 : 0;
  }

  function contarEvalObfuscado() {
    const scripts = [...document.querySelectorAll('script:not([src])')].filter(s => 
      s.innerText.includes("eval(") || s.innerText.includes("new Function")
    );
    return scripts.length;
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

  // Contar elementos maliciosos
  const numTrackers = contarTrackers();
  const numInvisibles = contarCaracteresInvisibles();
  const numIframes = contarIframesOcultos();
  const numEval = contarEvalObfuscado();
  const hasBeacon = detectarBeacon();
  const hasFingerprinting = detectarFingerprinting();

  // Agregar síntomas con cantidades
  if (numTrackers > 0) sintomas.push(`Trackers detectados (${numTrackers})`);
  if (numInvisibles > 10) sintomas.push(`Caracteres invisibles (${numInvisibles})`);
  if (numIframes > 0) sintomas.push(`Iframes ocultos (${numIframes})`);
  if (hasBeacon > 0) sintomas.push("Uso de sendBeacon");
  if (hasFingerprinting > 0) sintomas.push("Fingerprinting activo");
  if (numEval > 0) sintomas.push(`Uso de eval/función dinámica (${numEval})`);

  // Calcular grado basado en la suma ponderada
  const puntajeTotal = numTrackers * 0.5 + numInvisibles * 0.1 + numIframes * 0.8 + numEval * 1 + hasBeacon * 2 + hasFingerprinting * 3;
  
  const grado = puntajeTotal >= 15 ? 4 :
                puntajeTotal >= 10 ? 3 :
                puntajeTotal >= 5 ? 2 :
                puntajeTotal >= 1 ? 1 : 0;

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
    timestamp: new Date().toISOString(),
    detalles: {
      trackers: numTrackers,
      iframesOcultos: numIframes,
      caracteresInvisibles: numInvisibles,
      evalObfuscado: numEval,
      beacon: hasBeacon,
      fingerprinting: hasFingerprinting
    }
  };

  storage.set({ diagnostico });
  aplicarTratamiento(grado);
});
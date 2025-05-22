// analyzer.js

/**
 * Cuenta el número de scripts que parecen ser trackers basados en su URL.
 * @returns {number} El número de trackers encontrados.
 */
function contarTrackers() {
  const trackers = document.querySelectorAll('script[src*="track"], script[src*="analytics"], script[src*="ads"], script[src*="facebook"], script[src*="google"], script[src*="gtm"]');
  return trackers.length;
}

/**
 * Cuenta el número de caracteres invisibles en el texto del cuerpo de la página.
 * @returns {number} El número de caracteres invisibles encontrados.
 */
function contarCaracteresInvisibles() {
  const invisibles = document.body.innerText.match(/[\u200B-\u200F\uFEFF\u2060]/g);
  return invisibles ? invisibles.length : 0;
}

/**
 * Cuenta el número de iframes que parecen estar ocultos o son muy pequeños.
 * @returns {number} El número de iframes ocultos encontrados.
 */
function contarIframesOcultos() {
  const iframes = [...document.querySelectorAll('iframe')].filter(i =>
    i.width <= 1 || i.height <= 1 || i.style.display === 'none' || i.style.visibility === 'hidden'
  );
  return iframes.length;
}

/**
 * Detecta si la página utiliza la API navigator.sendBeacon.
 * @returns {number} 1 si usa sendBeacon, 0 si no.
 */
function detectarBeacon() {
  return typeof navigator.sendBeacon === 'function' ? 1 : 0;
}

/**
 * Detecta heurísticamente si la página podría estar intentando fingerprinting.
 * @returns {number} 1 si detecta posibles indicadores, 0 si no.
 */
function detectarFingerprinting() {
  return (navigator.deviceMemory || navigator.hardwareConcurrency) ? 1 : 0;
}

/**
 * Cuenta el número de scripts inline que contienen 'eval(' o 'new Function('.
 * @returns {number} El número de scripts encontrados.
 */
function contarEvalObfuscado() {
  const scripts = [...document.querySelectorAll('script:not([src])')].filter(s =>
    s.innerText.includes("eval(") || s.innerText.includes("new Function")
  );
  return scripts.length;
}

/**
 * Aplica un tratamiento a la página basado en el grado de contaminación.
 * @param {number} grado - El grado de contaminación (0-4).
 */
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

  // Se elimina el bloque if (grado >= 4) que bloqueaba la página.
  // Ahora, el grado 4 simplemente aplicará el tratamiento del grado 3.
}
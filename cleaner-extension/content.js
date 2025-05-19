// Expresión regular para caracteres invisibles y de control más comunes
// Incluye:
// \u0000-\u001F: Caracteres de control ASCII (NUL a US)
// \u007F: Carácter de control ASCII (DEL)
// \u0080-\u009F: Caracteres de control C1
// \u00AD: Soft Hyphen
// \u034F: Combining Grapheme Joiner
// \u061C: Arabic Letter Mark
// \u115F, \u1160: Hangul Jamo Fillers
// \u17B4, \u17B5: Khmer Vowel Inherent
// \u180E: Mongolian Vowel Separator
// \u200B-\u200F: Zero Width Space, Non-Joiner, Joiner, Space, Non-Printing Character
// \u2028: Line Separator
// \u2029: Paragraph Separator
// \u2060-\u206F: Invisible operators, etc.
// \u3164: Hangul Filler
// \uFEFF: Zero Width No-Break Space (BOM)
// \uFFA0-\uFFEF: Halfwidth and Fullwidth Forms (algunos pueden ser invisibles o problemáticos)
// \uFFF9-\uFFFB: Interlinear Annotation Characters
// \uFE00-\uFE0F: Variation Selectors
const regex = /[\u0000-\u001F\u007F-\u009F\u00AD\u034F\u061C\u115F\u1160\u17B4\u17B5\u180E\u200B-\u200F\u2028\u2029\u2060-\u206F\u3164\uFEFF\uFFA0-\uFFEF\uFFF9-\uFFFB\uFE00-\uFE0F]/g;

function traverse(node) {
  if (node.nodeType === Node.TEXT_NODE) {
    node.nodeValue = node.nodeValue.replace(regex, '');
  } else {
    for (let child of node.childNodes) {
      traverse(child);
    }
  }
}

// --- Funciones de Limpieza Avanzada (Anti-tracking) ---

// 1. Bloqueo de iframes y scripts invisibles/de tracking
function cleanIframesAndScripts() {
  document.querySelectorAll('iframe').forEach(iframe => {
    // Eliminar iframes muy pequeños (posibles trackers)
    if (iframe.width <= 1 || iframe.height <= 1) {
      iframe.remove();
      console.log('Invisible Cleaner: Removed tiny iframe.');
    }
  });

  document.querySelectorAll('script[src*="track"], script[src*="analytics"], script[src*="googletagmanager"]').forEach(s => {
    // Eliminar scripts con nombres sospechosos
    s.remove();
    console.log('Invisible Cleaner: Removed suspicious script:', s.src);
  });
}

// 2. Limpiar <meta> y link con tracking (simplificado)
function cleanMetaAndLinkTags() {
  document.querySelectorAll('meta[http-equiv], link[rel*="preconnect"], link[rel*="dns-prefetch"]').forEach(el => {
     el.remove();
     console.log('Invisible Cleaner: Removed suspicious meta/link tag:', el.tagName, el.getAttribute('rel') || el.getAttribute('http-equiv'));
  });
}

// 3. Evitar navigator.sendBeacon (sobrescribiendo)
function disableSendBeacon() {
  if (navigator.sendBeacon) {
    navigator.sendBeacon = () => {
      console.log('Invisible Cleaner: Blocked navigator.sendBeacon');
      return false; // Simula que no se envió
    };
    console.log('Invisible Cleaner: navigator.sendBeacon disabled.');
  }
}

// 4. Borrar atributos data-*
function cleanDataAttributes() {
  document.querySelectorAll('*').forEach(el => {
    // Convertir a array para evitar problemas al modificar la colección durante la iteración
    [...el.attributes].forEach(attr => {
      if (attr.name.startsWith('data-')) {
        el.removeAttribute(attr.name);
        // console.log('Invisible Cleaner: Removed data attribute:', attr.name, 'from', el.tagName); // Puede ser muy ruidoso
      }
    });
  });
  console.log('Invisible Cleaner: Cleaned data-* attributes.');
}

// 5. Evitar el clipboard hijacking
function preventClipboardHijacking() {
  const stopPropagation = (e) => {
    console.log('Invisible Cleaner: Prevented clipboard event propagation.');
    e.stopImmediatePropagation();
  };
  // Usar capture phase (true) para interceptar antes que otros listeners
  document.addEventListener('copy', stopPropagation, true);
  document.addEventListener('paste', stopPropagation, true);
  console.log('Invisible Cleaner: Clipboard hijacking prevention active.');
}

// 6. Desactivar APIs que espían (Fingerprinting)
function spoofFingerprintingAPIs() {
  // Spoof deviceMemory, hardwareConcurrency
  try {
    Object.defineProperty(navigator, 'deviceMemory', { value: 8, configurable: true });
    Object.defineProperty(navigator, 'hardwareConcurrency', { value: 4, configurable: true });
    console.log('Invisible Cleaner: Spoofed deviceMemory and hardwareConcurrency.');
  } catch (e) {
    console.warn('Invisible Cleaner: Could not spoof navigator properties:', e);
  }

  // Spoof getBattery
  if (navigator.getBattery) {
      navigator.getBattery = () => {
          console.log('Invisible Cleaner: Spoofed navigator.getBattery');
          return Promise.resolve({ charging: true, level: 1, chargingTime: 0, dischargingTime: Infinity });
      };
      console.log('Invisible Cleaner: navigator.getBattery spoofed.');
  }
}

// --- Cálculo del Puntaje de Basura Web ---
function calculateGarbageScore() {
  console.log('Invisible Cleaner: Calculating Garbage Score...');
  let score = 0; // Empezamos en 0
  const issues = []; // Para depuración o futuro reporte

  // Criterios para SUMAR puntos (basado en la ausencia de "basura")

  // Scripts de tracking/ads
  if (document.querySelectorAll('script[src*="track"], script[src*="analytics"], script[src*="ads"], script[src*="googletagmanager"]').length === 0) {
      score += 2; // Suma 2 puntos si NO hay scripts de tracking/ads
  } else {
      issues.push('Scripts de tracking/ads detectados');
  }

  // Iframes muy pequeños
  if (![...document.querySelectorAll('iframe')].some(i => i.width <= 1 || i.height <= 1)) {
      score += 1; // Suma 1 punto si NO hay iframes muy pequeños
  } else {
      issues.push('Iframes muy pequeños detectados');
  }

  // Caracteres invisibles
  const bodyText = document.body ? document.body.innerText : '';
  const invisibleCharRegex = /[\u0000-\u001F\u007F-\u009F\u00AD\u034F\u061C\u115F\u1160\u17B4\u17B5\u180E\u200B-\u200F\u2028\u2029\u2060-\u206F\u3164\uFEFF\uFFA0-\uFFEF\uFFF9-\uFFFB\uFE00-\uFE0F]/g;
  const matches = bodyText.match(invisibleCharRegex);
  const invisibleCount = matches ? matches.length : 0;

  if (invisibleCount < 10) {
      score += 2; // Suma 2 puntos si hay menos de 10 caracteres invisibles
  } else if (invisibleCount < 50) {
      score += 1; // Suma 1 punto si hay entre 10 y 50
      issues.push(`Más de 10 caracteres invisibles (${invisibleCount})`);
  } else {
      issues.push(`Más de 50 caracteres invisibles (${invisibleCount})`);
  }

  // Check sendBeacon (si fue spoofed, no es nativo)
  // Si navigator.sendBeacon no es la función nativa, asumimos que fue spoofed/desactivado
  if (typeof navigator.sendBeacon !== 'function' || navigator.sendBeacon.toString().indexOf('[native code]') === -1) {
       score += 1; // Suma 1 punto si sendBeacon no es nativo (probablemente spoofed)
  } else {
       issues.push('navigator.sendBeacon detectado (nativo)');
  }


  // Check fingerprinting APIs (si NO están presentes o fueron spoofed)
  // Si las propiedades o el canvas no están disponibles (o fueron spoofed), sumamos puntos
  if (!(navigator.deviceMemory || navigator.hardwareConcurrency || (document.createElement('canvas').getContext('2d') && document.createElement('canvas').getContext('2d').canvas))) {
      score += 2; // Suma 2 puntos si las APIs de Fingerprinting NO están detectadas (o fueron spoofed)
  } else {
      issues.push('APIs de Fingerprinting detectadas (deviceMemory, hardwareConcurrency, Canvas)');
  }

  // Scripts inline grandes
  const largeInlineScripts = [...document.querySelectorAll('script:not([src])')].filter(s => s.innerText.length > 1000);
  if (largeInlineScripts.length === 0) {
      score += 1; // Suma 1 punto si NO hay scripts inline grandes
  } else {
      issues.push(`Scripts inline grandes detectados (${largeInlineScripts.length})`);
  }

  // Dominios externos
  const externalDomains = new Set();
  document.querySelectorAll('script[src], link[href], img[src], iframe[src]').forEach(el => {
    const url = el.src || el.href;
    if (url && url.startsWith('http')) { // Solo URLs http/https
      try {
        const domain = new URL(url).hostname;
        if (domain && !domain.includes(location.hostname)) {
            externalDomains.add(domain);
        }
      } catch (e) {
          // Ignorar URLs inválidas
      }
    }
  });
  if (externalDomains.size <= 3) {
      score += 1; // Suma 1 punto si hay 3 o menos dominios externos
  } else {
      issues.push(`Demasiados dominios externos (${externalDomains.size})`);
  }


  score = Math.min(10, Math.round(score)); // Asegura que el puntaje no sea más de 10 y lo redondea
  console.log('Invisible Cleaner: Garbage Score Calculated:', score, 'Issues:', issues);
  return score;
}

// Variable para almacenar el puntaje una vez calculado
let currentGarbageScore = null;

// Función para ejecutar la limpieza y calcular el puntaje
function initializeContentScript() {
    console.log('Invisible Cleaner: Initializing content script...');
    currentGarbageScore = calculateGarbageScore();
    console.log('Invisible Cleaner: Score calculated during initialization:', currentGarbageScore);

    // Ejecuta la limpieza al cargar la página según las preferencias
    chrome.storage.sync.get(["autoClean", "advancedClean"], ({ autoClean, advancedClean }) => {
      // Ejecutar limpieza básica si autoClean está activado
      if (autoClean) {
        console.log('Invisible Cleaner: Running basic auto-clean.');
        traverse(document.body);

        // Registro de limpieza en chrome.storage (solo si se ejecutó la limpieza automática básica)
        chrome.storage.local.get(["cleanCount", "cleanPages"], (data) => {
          const count = data.cleanCount ? data.cleanCount + 1 : 1;
          const pages = data.cleanPages ? data.cleanPages : [];
          const url = window.location.href;

          // Agrega la URL solo si no está ya en la lista
          if (!pages.includes(url)) {
            pages.push(url);
          }

          // Limita la lista de páginas si se vuelve muy larga (opcional, para evitar llenar el storage)
          // if (pages.length > 100) { // Ejemplo: mantener solo las últimas 100 páginas
          //   pages.shift(); // Elimina la página más antigua
          // }

          chrome.storage.local.set({ cleanCount: count, cleanPages: pages });
        });
      }

      // Ejecutar limpieza avanzada si advancedClean está activado
      if (advancedClean) {
        console.log('Invisible Cleaner: Running advanced anti-tracking clean.');
        cleanIframesAndScripts();
        cleanMetaAndLinkTags();
        disableSendBeacon();
        cleanDataAttributes();
        preventClipboardHijacking();
        spoofFingerprintingAPIs();
      }

      if (!autoClean && !advancedClean) {
          console.log('Invisible Cleaner: Auto-clean and Advanced clean are disabled.');
      }
    });
}


// --- Ejecución de la lógica al cargar la página ---

// Verifica si el DOM ya está cargado
if (document.readyState === 'loading') {
    // Si aún está cargando, espera el evento DOMContentLoaded
    document.addEventListener('DOMContentLoaded', initializeContentScript);
    console.log('Invisible Cleaner: Waiting for DOMContentLoaded...');
} else {
    // Si ya está interactivo o completo, ejecuta la inicialización inmediatamente
    console.log('Invisible Cleaner: DOM already interactive or complete. Initializing immediately.');
    initializeContentScript();
}


// --- Manejo de mensajes para el Popup ---
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getGarbageScore") {
    console.log('Invisible Cleaner: Received getGarbageScore message from popup. Responding with score:', currentGarbageScore);
    // Siempre respondemos con el puntaje almacenado.
    // Si la inicialización aún no ha ocurrido, currentGarbageScore será null,
    // y el popup mostrará "Puntaje no disponible", lo cual es correcto.
    sendResponse({ score: currentGarbageScore });
    // No necesitamos retornar true aquí porque la respuesta es síncrona si el score ya está calculado.
    // Si la inicialización aún no ha ocurrido, currentGarbageScore es null, y la respuesta es inmediata.
  }
});
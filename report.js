// report.js

/**
 * Escanea la página actual y recopila información detallada sobre elementos potencialmente maliciosos.
 * @returns {object} Un objeto con los detalles del informe.
 */
function generateDetailedReportData() {
  const trackers = [];
  document.querySelectorAll('script[src*="track"], script[src*="analytics"], script[src*="ads"], script[src*="facebook"], script[src*="google"], script[src*="gtm"]').forEach(script => {
    trackers.push({ type: 'script', src: script.src });
  });

  const iframes = [];
  [...document.querySelectorAll('iframe')].filter(i =>
    i.width <= 1 || i.height <= 1 || i.style.display === 'none' || i.style.visibility === 'hidden'
  ).forEach(iframe => {
    iframes.push({ src: iframe.src, width: iframe.width, height: iframe.height, display: iframe.style.display, visibility: iframe.style.visibility });
  });

  const evalScripts = [];
  [...document.querySelectorAll('script:not([src])')].filter(s =>
    s.innerText.includes("eval(") || s.innerText.includes("new Function")
  ).forEach(script => {
    // Capturar un fragmento del código para el informe
    const codeSnippet = script.innerText.substring(0, 200) + (script.innerText.length > 200 ? '...' : '');
    evalScripts.push({ type: 'inline script', snippet: codeSnippet });
  });

  const invisibleChars = document.body.innerText.match(/[\u200B-\u200F\uFEFF\u2060]/g);
  const invisibleCharCount = invisibleChars ? invisibleChars.length : 0;

  const hasBeacon = typeof navigator.sendBeacon === 'function';
  const hasFingerprinting = (navigator.deviceMemory || navigator.hardwareConcurrency) ? true : false;


  return {
    url: location.href,
    timestamp: new Date().toISOString(),
    trackers: trackers,
    hiddenIframes: iframes,
    evalScripts: evalScripts,
    invisibleCharacterCount: invisibleCharCount,
    usesSendBeacon: hasBeacon,
    usesFingerprinting: hasFingerprinting
  };
}

/**
 * Genera el contenido HTML para la página del informe.
 * @param {object} reportData - Los datos del informe generados por generateDetailedReportData.
 * @returns {string} El HTML completo de la página del informe.
 */
function buildReportHtml(reportData) {
  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Informe Detallado - Invisible Cleaner</title>
      <meta charset="UTF-8">
      <style>
        body { font-family: sans-serif; line-height: 1.6; padding: 20px; }
        h1, h2 { color: #333; }
        .section { margin-bottom: 20px; padding: 15px; border: 1px solid #eee; border-radius: 5px; }
        .section h3 { margin-top: 0; color: #555; }
        ul { list-style: none; padding: 0; }
        li { margin-bottom: 10px; padding: 10px; border-bottom: 1px solid #eee; }
        li:last-child { border-bottom: none; }
        .detail { font-size: 0.9em; color: #666; margin-top: 5px; }
        pre { background-color: #f4f4f4; padding: 10px; border-radius: 4px; overflow-x: auto; }
      </style>
    </head>
    <body>
      <h1>Informe Detallado de Invisible Cleaner</h1>
      <p><strong>URL:</strong> ${reportData.url}</p>
      <p><strong>Fecha y Hora:</strong> ${new Date(reportData.timestamp).toLocaleString()}</p>

      <div class="section">
        <h2>Resumen Rápido</h2>
        <ul>
          <li>Trackers detectados: ${reportData.trackers.length}</li>
          <li>Iframes ocultos/pequeños: ${reportData.hiddenIframes.length}</li>
          <li>Scripts con eval/Function: ${reportData.evalScripts.length}</li>
          <li>Caracteres invisibles: ${reportData.invisibleCharacterCount}</li>
          <li>Usa sendBeacon: ${reportData.usesSendBeacon ? 'Sí' : 'No'}</li>
          <li>Usa Fingerprinting (heurística): ${reportData.usesFingerprinting ? 'Sí' : 'No'}</li>
        </ul>
      </div>
  `;

  if (reportData.trackers.length > 0) {
    html += `
      <div class="section">
        <h2>Detalles de Trackers (${reportData.trackers.length})</h2>
        <ul>
          ${reportData.trackers.map(t => `<li>Script SRC: <span class="detail">${t.src || 'N/A'}</span></li>`).join('')}
        </ul>
      </div>
    `;
  }

  if (reportData.hiddenIframes.length > 0) {
    html += `
      <div class="section">
        <h2>Detalles de Iframes Ocultos/Pequeños (${reportData.hiddenIframes.length})</h2>
        <ul>
          ${reportData.hiddenIframes.map(i => `<li>
              SRC: <span class="detail">${i.src || 'N/A'}</span><br>
              <span class="detail">Dimensiones: ${i.width}x${i.height}, Display: ${i.display || 'N/A'}, Visibility: ${i.visibility || 'N/A'}</span>
            </li>`).join('')}
        </ul>
      </div>
    `;
  }

  if (reportData.evalScripts.length > 0) {
    html += `
      <div class="section">
        <h2>Detalles de Scripts con eval/Function (${reportData.evalScripts.length})</h2>
        <ul>
          ${reportData.evalScripts.map(s => `<li>
              Tipo: ${s.type}<br>
              <span class="detail">Fragmento de código:</span>
              <pre>${s.snippet}</pre>
            </li>`).join('')}
        </ul>
      </div>
    `;
  }

   if (reportData.invisibleCharacterCount > 0) {
     html += `
       <div class="section">
         <h2>Detalles de Caracteres Invisibles</h2>
         <p>Se detectaron ${reportData.invisibleCharacterCount} caracteres invisibles en el texto del cuerpo de la página.</p>
       </div>
     `;
   }


  html += `
    </body>
    </html>
  `;

  return html;
}
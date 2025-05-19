chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: cleanInvisibleCharacters
  });
});

function cleanInvisibleCharacters() {
  // Expresión regular para caracteres invisibles comunes
  const regex = /[\u200B-\u200D\uFEFF\u2060]/g;

  function traverse(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      node.nodeValue = node.nodeValue.replace(regex, '');
    } else {
      for (let child of node.childNodes) {
        traverse(child);
      }
    }
  }

  traverse(document.body);
  alert("🧽 Limpieza completada. ¡No más fantasmas unicode!");
}
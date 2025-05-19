
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "spoofRequest" && sender.tab?.id) {
    chrome.scripting.executeScript({
      target: { tabId: sender.tab.id },
      files: ["spoof.js"]
    });
  }
});

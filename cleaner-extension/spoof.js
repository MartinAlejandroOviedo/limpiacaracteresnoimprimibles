
function spoofIdentity(mode) {
  const spoofMap = {
    croto: {
      platform: "Android",
      userAgent: "Mozilla/5.0 (Linux; Android 8.1; moto e5)",
      deviceMemory: 0.5,
      hardwareConcurrency: 1,
      screenWidth: 360,
      screenHeight: 640,
      timeZone: "Asia/Dhaka"
    },
    billonario: {
      platform: "MacIntel",
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 15_0_1)",
      deviceMemory: 32,
      hardwareConcurrency: 64,
      screenWidth: 2560,
      screenHeight: 1440,
      timeZone: "America/New_York"
    }
  };

  const config = spoofMap[mode];
  if (!config) return;

  Object.defineProperty(navigator, 'platform', { get: () => config.platform });
  Object.defineProperty(navigator, 'userAgent', { get: () => config.userAgent });
  Object.defineProperty(navigator, 'deviceMemory', { get: () => config.deviceMemory });
  Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => config.hardwareConcurrency });

  Object.defineProperty(window.screen, 'width', { get: () => config.screenWidth });
  Object.defineProperty(window.screen, 'height', { get: () => config.screenHeight });

  const original = Intl.DateTimeFormat.prototype.resolvedOptions;
  Intl.DateTimeFormat.prototype.resolvedOptions = function () {
    const options = original.call(this);
    options.timeZone = config.timeZone;
    return options;
  };
}

// Detectar y aplicar si fue seteado por content.js
chrome.storage.sync.get("identityMode", ({ identityMode }) => {
  if (identityMode && identityMode !== "normal") {
    spoofIdentity(identityMode);
  }
});

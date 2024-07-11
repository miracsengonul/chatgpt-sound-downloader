chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "saveVoiceSelection") {
    chrome.storage.local.set({
      selectedVoice: message.value
    }, () => {
      sendResponse({
        status: "success"
      });
    });
    return true;
  } else if (message.action === "getVoiceSelection") {
    chrome.storage.local.get(["selectedVoice"], (result) => {
      sendResponse({
        value: result.selectedVoice
      });
    });
    return true;
  }
});
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case "saveVoiceSelection":
      chrome.storage.local.set({
        selectedVoice: message.value
      }, () => {
        sendResponse({
          status: "success"
        });
      });
      break;
    case "getVoiceSelection":
      chrome.storage.local.get(["selectedVoice"], (result) => {
        sendResponse({
          value: result.selectedVoice
        });
      });
      break;
    default:
      sendResponse({
        status: "unknown action"
      });
      break;
  }
  return true;
});

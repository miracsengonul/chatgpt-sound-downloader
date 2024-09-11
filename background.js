chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ isFirstRun: true }, () => {
    console.log('Extension installed, isFirstRun set to true');
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case "saveVoiceSelection":
      chrome.storage.local.set({
        selectedVoice: message.value
      }, () => {
        console.log('Voice selection saved:', message.value);
        sendResponse({ status: "success" });
      });
      break;
    case "getVoiceSelection":
      chrome.storage.local.get(["selectedVoice"], (result) => {
        console.log('Retrieved voice selection:', result.selectedVoice);
        sendResponse({ value: result.selectedVoice || 'alloy' }); // Default to 'alloy' if not set
      });
      break;
    case "saveFileFormatSelection":
      chrome.storage.local.set({
        fileFormat: message.value
      }, () => {
        console.log('File format saved:', message.value);
        sendResponse({ status: "success" });
      });
      break;
    case "getFileFormatSelection":
      chrome.storage.local.get(["fileFormat"], (result) => {
        console.log('Retrieved file format:', result.fileFormat);
        sendResponse({ value: result.fileFormat || 'mp3' }); // Default to 'mp3' if not set
      });
      break;
    default:
      console.warn('Unknown action:', message.action);
      sendResponse({ status: "unknown action" });
      break;
  }
  return true; // Keep the message channel open for sendResponse
});

// Log when the background script is loaded
console.log('Background script loaded');
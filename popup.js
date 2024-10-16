document.addEventListener('DOMContentLoaded', function() {
  const tokenInput = document.getElementById('token-input');
  const voiceList = document.getElementById('voice-list');
  const fileFormatList = document.getElementById('file-format-list');

  chrome.storage.local.get(['isFirstRun'], function(result) {
    if (result.isFirstRun) {
      chrome.storage.local.set({
        chatGPTToken: tokenInput.value,
        fileFormat: fileFormatList.options[0].value,
        selectedVoice: voiceList.options[0].value,
        isFirstRun: false
      });
      tokenInput.value = tokenInput.value;
      fileFormatList.value = fileFormatList.options[0].value;
      voiceList.value = voiceList.options[0].value;
    }
  });

  chrome.storage.local.get(['chatGPTToken'], function(result) {
    if (result.chatGPTToken) {
      tokenInput.value = result.chatGPTToken;
    }
  });
  
  chrome.storage.local.get(['fileFormat'], function(result) {
    if (result.fileFormat) {
      fileFormatList.value = result.fileFormat;
    }
  });

  chrome.storage.local.get(['selectedVoice'], function(result) {
    if (result.selectedVoice) {
      voiceList.value = result.selectedVoice;
    }
  });

  tokenInput.addEventListener('input', function() {
    chrome.runtime.sendMessage({
      action: "saveChatGPTToken",
      value: this.value
    }, function(response) {
      console.log('Token saved:', response);
    });
  });

  voiceList.addEventListener('change', function() {
    chrome.runtime.sendMessage({
      action: "saveVoiceSelection",
      value: this.value
    }, function(response) {
      console.log('Selection saved:', response);
    });
  });

  fileFormatList.addEventListener('change', function() {
    chrome.runtime.sendMessage({
      action: "saveFileFormatSelection",
      value: this.value
    }, function(response) {
      console.log('File format saved:', response);
    });
  });
});

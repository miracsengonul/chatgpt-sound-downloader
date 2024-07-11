document.addEventListener('DOMContentLoaded', function() {
  const voiceList = document.getElementById('voice-list');

  chrome.storage.local.get(['selectedVoice'], function(result) {
    if (result.selectedVoice) {
      voiceList.value = result.selectedVoice;
    }
  });

  voiceList.addEventListener('change', function() {
    chrome.runtime.sendMessage({
      action: "saveVoiceSelection",
      value: this.value
    }, function(response) {
      console.log('Selection saved:', response);
    });
  });
});
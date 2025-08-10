(function () {
  const SELECTOR_VOICE_BTN = 'button[data-testid="voice-play-turn-action-button"]';
  const SELECTOR_TOOLBAR = 'div.flex.min-h-\\[46px\\].justify-start';
  const DOWNLOAD_CLASS = 'download-button';

  function getCookie(name) {
    const m = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1') + '=([^;]*)'));
    return m ? decodeURIComponent(m[1]) : null;
  }

  function buildDownloadIcon() {
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('width', '20');
    svg.setAttribute('height', '20');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', '#7D7D7D');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.classList.add('icon');
    const p1 = document.createElementNS(ns, 'path');
    p1.setAttribute('d', 'M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242');
    const p2 = document.createElementNS(ns, 'path');
    p2.setAttribute('d', 'M12 12v9');
    const p3 = document.createElementNS(ns, 'path');
    p3.setAttribute('d', 'm8 17 4 4 4-4');
    svg.appendChild(p1);
    svg.appendChild(p2);
    svg.appendChild(p3);
    return svg;
  }

  function buildDownloadButton() {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = `${DOWNLOAD_CLASS} text-token-text-secondary hover:bg-token-bg-secondary rounded-lg`;
    b.setAttribute('aria-label', 'Download');
    b.setAttribute('data-testid', 'download-turn-audio-button');
    const inner = document.createElement('span');
    inner.className = 'touch:w-10 flex h-8 w-8 items-center justify-center';
    inner.appendChild(buildDownloadIcon());
    b.appendChild(inner);
    b.addEventListener('click', getMessageIdFromClickedButton);
    return b;
  }

  function addDownloadButtons() {
    const toolbars = document.querySelectorAll(SELECTOR_TOOLBAR);
    toolbars.forEach((tb) => {
      const voiceBtn = tb.querySelector(SELECTOR_VOICE_BTN);
      if (!voiceBtn) return;
      if (tb.querySelector(`.${DOWNLOAD_CLASS}`)) return;
      const btn = buildDownloadButton();
      voiceBtn.parentNode.insertBefore(btn, voiceBtn.nextSibling);
    });
  }

  function getMessageIdFromClickedButton(event) {
    const button = event.currentTarget;
    const turn = button.closest('.group\\/turn-messages') || button.closest('[data-message-id]')?.parentElement;
    if (!turn) return;
    const elWithId = turn.querySelector('[data-message-id]');
    const messageId = elWithId ? elWithId.getAttribute('data-message-id') : null;
    const pathname = window.location.pathname;
    const match = pathname.match(/\/c\/([^/]+)/);
    const conversationId = match ? match[1] : null;
    if (messageId && conversationId) {
      sendDownloadRequest(messageId, conversationId);
    } else {
      console.error('Gerekli bilgiler alınamadı', { messageId, conversationId });
    }
  }

  const getAccessToken = () =>
    new Promise((resolve) => {
      chrome.runtime.sendMessage({ action: 'getChatGPTToken' }, (response) => {
        if (!response?.value) {
          alert('Please enter the ChatGPT token in the extension settings');
          return;
        }
        resolve(response.value);
      });
    });

  const getVoiceSelection = () =>
    new Promise((resolve) => {
      chrome.runtime.sendMessage({ action: 'getVoiceSelection' }, (response) => resolve(response?.value || 'breeze'));
    });

  const getFileFormatSelection = () =>
    new Promise((resolve) => {
      chrome.runtime.sendMessage({ action: 'getFileFormatSelection' }, (response) => resolve(response?.value || 'aac'));
    });

  async function sendDownloadRequest(messageId, conversationId) {
    const voice = await getVoiceSelection();
    const fileFormat = await getFileFormatSelection();
    const accessToken = await getAccessToken();
    const deviceId = getCookie('oai-did') || '';
    const accountId = getCookie('_account') || undefined;

    const url = `https://chatgpt.com/backend-api/synthesize?message_id=${encodeURIComponent(
      messageId
    )}&conversation_id=${encodeURIComponent(conversationId)}&voice=${encodeURIComponent(
      voice
    )}&format=${encodeURIComponent(fileFormat)}`;

    const headers = {
      accept: '*/*',
      'accept-language': (navigator.languages && navigator.languages.join(',')) || navigator.language || 'en-US',
      authorization: `Bearer ${accessToken}`,
      'cache-control': 'no-cache',
      ...(accountId ? { 'chatgpt-account-id': accountId } : {}),
      'oai-device-id': deviceId,
      'oai-language': navigator.language || 'en-US',
      referer: `${location.origin}/c/${conversationId}`,
      'user-agent': navigator.userAgent,
    };

    alert('Lütfen bekleyin...');
    try {
      const response = await fetch(url, { headers, credentials: 'include' });
      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(`HTTP ${response.status} ${response.statusText} - ${text.slice(0, 200)}`);
      }
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = downloadUrl;
      a.download = 'audio.' + fileFormat;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      a.remove();
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed. Check console for details.');
    }
  }

  function initializeExtension() {
    const observer = new MutationObserver(addDownloadButtons);
    observer.observe(document.body, { childList: true, subtree: true });
    addDownloadButtons();
  }

  window.addEventListener('load', initializeExtension);
})();

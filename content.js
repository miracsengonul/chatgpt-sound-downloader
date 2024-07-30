(function() {

  let voice = 'cove';
  let fileFormat = 'acc'

  chrome.runtime.sendMessage({
    action: "getVoiceSelection"
  }, function(response) {
    voice = response.value;
  });

  chrome.runtime.sendMessage({
    action: "getFileFormatSelection"
  }, function(response) {
    fileFormat = response.value;
  });

  function addDownloadButton() {
    const targetElements = document.querySelectorAll('path[d="M11 4.91a.5.5 0 0 0-.838-.369L6.676 7.737A1 1 0 0 1 6 8H4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2a1 1 0 0 1 .676.263l3.486 3.196A.5.5 0 0 0 11 19.09zM8.81 3.067C10.415 1.597 13 2.735 13 4.91v14.18c0 2.175-2.586 3.313-4.19 1.843L5.612 18H4a3 3 0 0 1-3-3V9a3 3 0 0 1 3-3h1.611zm11.507 3.29a1 1 0 0 1 1.355.401A10.96 10.96 0 0 1 23 12c0 1.85-.458 3.597-1.268 5.13a1 1 0 1 1-1.768-.934A8.96 8.96 0 0 0 21 12a8.96 8.96 0 0 0-1.085-4.287 1 1 0 0 1 .402-1.356M15.799 7.9a1 1 0 0 1 1.4.2 6.48 6.48 0 0 1 1.3 3.9c0 1.313-.39 2.537-1.06 3.56a1 1 0 0 1-1.673-1.096A4.47 4.47 0 0 0 16.5 12a4.47 4.47 0 0 0-.9-2.7 1 1 0 0 1 .2-1.4"]');
    targetElements.forEach((path) => {
      const targetSpan = path.closest('span[data-state="closed"]');
      if (targetSpan && !targetSpan.nextElementSibling?.classList.contains('download-button')) {
        const downloadButton = document.createElement('button');
        downloadButton.className = 'download-button rounded-lg text-token-text-secondary hover:bg-token-main-surface-secondary ml-1 mr-1';

        const svgNamespace = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNamespace, "svg");
        svg.setAttribute("width", "20");
        svg.setAttribute("height", "20");
        svg.setAttribute("viewBox", "0 0 24 24");
        svg.setAttribute("fill", "none");
        svg.setAttribute("stroke", "#7D7D7D");
        svg.setAttribute("stroke-width", "2");
        svg.setAttribute("stroke-linecap", "round");
        svg.setAttribute("stroke-linejoin", "round");
        svg.classList.add("icon-md-heavy", "lucide-cloud-download");

        const path1 = document.createElementNS(svgNamespace, "path");
        path1.setAttribute("d", "M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242");
        svg.appendChild(path1);

        const path2 = document.createElementNS(svgNamespace, "path");
        path2.setAttribute("d", "M12 12v9");
        svg.appendChild(path2);

        const path3 = document.createElementNS(svgNamespace, "path");
        path3.setAttribute("d", "m8 17 4 4 4-4");
        svg.appendChild(path3);

        downloadButton.appendChild(svg);

        downloadButton.addEventListener('click', (event) => getMessageIdFromClickedButton(event));

        targetSpan.parentNode.insertBefore(downloadButton, targetSpan.nextSibling);
      }
    });
  }

  function getMessageIdFromClickedButton(event) {
    const button = event.currentTarget;
    const conversationTurn = button.closest('.group\\/conversation-turn');
    if (!conversationTurn) return null;

    const elementWithMessageId = conversationTurn.querySelector('[data-message-id]');
    const messageId = elementWithMessageId ? elementWithMessageId.getAttribute('data-message-id') : null;

    const pathname = window.location.pathname;
    const match = pathname.match(/\/c\/([^\/]+)/);
    const conversationId = match ? match[1] : null;

    const scriptTag = document.getElementById('__NEXT_DATA__');

    const data = JSON.parse(scriptTag.textContent);

    const accessToken = data.props.pageProps.session.accessToken;

    sendDownloadRequest(messageId, conversationId, accessToken);
  }

  const sendDownloadRequest = async (messageId, conversationId, accessToken) => {
    const url = `https://chatgpt.com/backend-api/synthesize?message_id=${messageId}&conversation_id=${conversationId}&voice=${voice}&format=&{fileFormat}`;
    const headers = {
      'authorization': `Bearer ${accessToken}`,
      'oai-device-id': '',
      'referer': `https://chatgpt.com/c/${conversationId}`,
      'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
    };

    alert(`Please wait...`);

    try {
      const response = await fetch(url, {
        headers
      });
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = downloadUrl;
      a.download = 'audio.' + fileFormat;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  function initializeExtension() {
    addDownloadButton();
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes && mutation.addedNodes.length > 0) {
          addDownloadButton();
        }
      });
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeExtension);
  } else {
    initializeExtension();
  }
})();

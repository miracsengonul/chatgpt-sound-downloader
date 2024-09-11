(function() {
  function addDownloadButton() {
    const targetElements = document.querySelectorAll('path[d="M11 4.9099C11 4.47485 10.4828 4.24734 10.1621 4.54132L6.67572 7.7372C6.49129 7.90626 6.25019 8.00005 6 8.00005H4C3.44772 8.00005 3 8.44776 3 9.00005V15C3 15.5523 3.44772 16 4 16H6C6.25019 16 6.49129 16.0938 6.67572 16.2629L10.1621 19.4588C10.4828 19.7527 11 19.5252 11 19.0902V4.9099ZM8.81069 3.06701C10.4142 1.59714 13 2.73463 13 4.9099V19.0902C13 21.2655 10.4142 22.403 8.81069 20.9331L5.61102 18H4C2.34315 18 1 16.6569 1 15V9.00005C1 7.34319 2.34315 6.00005 4 6.00005H5.61102L8.81069 3.06701ZM20.3166 6.35665C20.8019 6.09313 21.409 6.27296 21.6725 6.75833C22.5191 8.3176 22.9996 10.1042 22.9996 12.0001C22.9996 13.8507 22.5418 15.5974 21.7323 17.1302C21.4744 17.6185 20.8695 17.8054 20.3811 17.5475C19.8927 17.2896 19.7059 16.6846 19.9638 16.1962C20.6249 14.9444 20.9996 13.5175 20.9996 12.0001C20.9996 10.4458 20.6064 8.98627 19.9149 7.71262C19.6514 7.22726 19.8312 6.62017 20.3166 6.35665ZM15.7994 7.90049C16.241 7.5688 16.8679 7.65789 17.1995 8.09947C18.0156 9.18593 18.4996 10.5379 18.4996 12.0001C18.4996 13.3127 18.1094 14.5372 17.4385 15.5604C17.1357 16.0222 16.5158 16.1511 16.0539 15.8483C15.5921 15.5455 15.4632 14.9255 15.766 14.4637C16.2298 13.7564 16.4996 12.9113 16.4996 12.0001C16.4996 10.9859 16.1653 10.0526 15.6004 9.30063C15.2687 8.85905 15.3578 8.23218 15.7994 7.90049Z"]');
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

    // AccessToken'ı almak için yeni yöntem
    let accessToken = null;
    try {
        const scripts = document.getElementsByTagName('script');
        for (let script of scripts) {
            if (script.textContent.includes('accessToken')) {
                const match = script.textContent.match(/"accessToken":"([^"]+)"/);
                if (match && match[1]) {
                    accessToken = match[1];
                    break;
                }
            }
        }
    } catch (error) {
        console.error('Error retrieving access token:', error);
    }

    // Metni çek
    const textElement = conversationTurn.querySelector('.markdown.prose');
    const messageText = textElement ? textElement.innerText : null;

    if (messageId && conversationId && accessToken && messageText) {
        sendDownloadRequest(messageId, conversationId, accessToken, messageText);
    } else {
        console.error('Failed to retrieve necessary information for download');
        console.log('messageId:', messageId);
        console.log('conversationId:', conversationId);
        console.log('accessToken:', accessToken);
        console.log('messageText:', messageText);
    }
  }

    const getVoiceSelection = () => {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ action: "getVoiceSelection" }, (response) => {
        resolve(response.value);
      });
    });
  };

  const getFileFormatSelection = () => {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ action: "getFileFormatSelection" }, (response) => {
        resolve(response.value);
      });
    });
  };

  const sendDownloadRequest = async (messageId, conversationId, accessToken) => {
    const voice = await getVoiceSelection();
    const fileFormat = await getFileFormatSelection();
    const url = `https://chatgpt.com/backend-api/synthesize?message_id=${messageId}&conversation_id=${conversationId}&voice=${voice}&format=${fileFormat}`;
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
    console.log("Initializing extension...");
    const targetNode = document.body;
    const config = { childList: true, subtree: true };

    const callback = function(mutationsList, observer) {
      for(let mutation of mutationsList) {
        if (mutation.type === 'childList') {
          console.log("DOM changed, adding download buttons...");
          addDownloadButton();
        }
      }
    };

    const observer = new MutationObserver(callback);
    observer.observe(targetNode, config);

    // İlk çalıştırma
    addDownloadButton();
  }

  // Ek olarak, sayfanın tam olarak yüklenmesini bekleyelim
  window.addEventListener('load', function() {
    console.log("Window fully loaded, reinitializing...");
      initializeExtension();
  });
})();

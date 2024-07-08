chrome.action.onClicked.addListener((tab) => {
  chrome.storage.sync.get(['popupEnabled'], (result) => {
    if (result.popupEnabled !== false) {
      chrome.action.openPopup();
    } else {
      chrome.tabs.sendMessage(tab.id, { action: 'extractImgHrefs' }, (response) => {
        if (response && response.imgHrefs) {
          const linksText = response.imgHrefs.join('\n');
          navigator.clipboard.writeText(linksText)
            .then(() => {
              chrome.tabs.sendMessage(tab.id, { action: 'showNotification', message: 'Links copied to clipboard!' });
            })
            .catch(err => {
              console.error('Failed to copy links: ', err);
              chrome.tabs.sendMessage(tab.id, { action: 'showNotification', message: 'Failed to copy links.' });
            });
        } else {
          chrome.tabs.sendMessage(tab.id, { action: 'showNotification', message: 'No links found or error occurred.' });
        }
      });
    }
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'extractImgHrefs') {
    console.log('Received message:', message);
    console.log('Sender:', sender);

    if (sender && sender.tab && sender.tab.id !== undefined) {
      console.log('Extracting image hrefs from tab id:', sender.tab.id);
      chrome.tabs.sendMessage(sender.tab.id, { action: 'extractImgHrefs' }, (response) => {
        console.log('Response from content script:', response);
        sendResponse(response);
      });
    } else {
      console.error('No tab id found in sender:', sender);
      sendResponse({ error: 'No tab id found in sender' });
    }
    return true;
  }
});
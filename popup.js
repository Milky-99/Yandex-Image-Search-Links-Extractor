document.addEventListener('DOMContentLoaded', () => {
  let extractedLinks = [];
  const notificationToggle = document.getElementById('notificationToggle');

  // Load saved notification preference
  chrome.storage.sync.get(['showNotification'], (result) => {
    notificationToggle.checked = result.showNotification !== false; // Default to true if not set
  });

  // Save notification preference when toggle changes
  notificationToggle.addEventListener('change', () => {
    chrome.storage.sync.set({showNotification: notificationToggle.checked});
  });

  function extractLinks() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        const activeTab = tabs[0];
        chrome.scripting.executeScript({
          target: { tabId: activeTab.id },
          files: ['content.js']
        }, () => {
          chrome.tabs.sendMessage(activeTab.id, { action: 'extractImgHrefs' }, (response) => {
            const resultsDiv = document.getElementById('results');
            if (response && response.imgHrefs) {
              extractedLinks = response.imgHrefs;
              resultsDiv.innerHTML = extractedLinks.map(href => `<p>${href}</p>`).join('');
            } else if (response && response.error) {
              resultsDiv.textContent = 'Error: ' + response.error;
            } else {
              resultsDiv.textContent = 'No images found or error occurred.';
            }
          });
        });
      } else {
        console.error('No active tab found');
      }
    });
  }
  document.getElementById('buyMeCoffee').addEventListener('click', () => {
		chrome.tabs.create({ url: 'https://buymeacoffee.com/milky99' });
	  });
  document.getElementById('copyAllLinks').addEventListener('click', () => {
    if (extractedLinks.length > 0) {
      const linksText = extractedLinks.join('\n');
      navigator.clipboard.writeText(linksText)
        .then(() => {
          chrome.storage.sync.get(['showNotification'], (result) => {
            if (result.showNotification !== false) {
              alert('All links copied to clipboard!');
            }
          });
        })
        .catch(err => {
          console.error('Failed to copy links: ', err);
          alert('Failed to copy links. Please try again.');
        });
    } else {
      alert('No links to copy. Please extract links first.');
    }
  });

  // Extract links when popup opens
  extractLinks();
});
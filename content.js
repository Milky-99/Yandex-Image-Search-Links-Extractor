chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'extractImgHrefs') {
    console.log('Content script received extractImgHrefs message');
    const imgHrefs = [];

    const imgLinks = document.querySelectorAll('a.Link.ContentImage-Cover');

    imgLinks.forEach(link => {
      const imgUrl = new URL(link.href).searchParams.get('img_url');
      if (imgUrl) {
        imgHrefs.push(decodeURIComponent(imgUrl));
      }
    });

    console.log('Extracted image hrefs:', imgHrefs);
    sendResponse({ imgHrefs });
  } else if (message.action === 'showNotification') {
    alert(message.message);
  }
});
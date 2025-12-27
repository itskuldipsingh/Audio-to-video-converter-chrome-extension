document.getElementById('btn').addEventListener('click', () => {
  chrome.tabs.create({ url: 'converter.html' });
});
const countTotal = (info) => {
  const positive = info.countPositive ?? 0;
  const neutral = info.countNeutral ?? 0;
  const negative = info.countNegative ?? 0;

  return positive + negative + neutral;
}

const setDOMInfo = info => {
  if (!info) return;
  document.getElementById('market').textContent = info.market;
  document.getElementById('count').textContent = countTotal(info).toString();
  document.getElementById('positive').textContent = info.countPositive ?? 0;
  document.getElementById('neutral').textContent = info.countNeutral ?? 0;
  document.getElementById('negative').textContent = info.countNegative ?? 0;
  document.getElementById('confidence').textContent = (info.confidence ? (info.confidence / countTotal(info)) : 0).toFixed(2);
};

document.getElementById('on_page').addEventListener('change', async (e) => {
  chrome.tabs.query({ active: true, currentWindow: true}, tabs => chrome.tabs.sendMessage(tabs[0].id, {
    from: 'popup',
    subject: 'toggle_visible', value: e.target.checked
  }));
})

chrome.tabs.query({active: true,currentWindow: true}, async (tabs) =>  {
  await chrome.runtime.sendMessage(chrome.runtime.id, {
    from: 'popup',
    subject: 'get_data',
    tabId: tabs[0].id
  }, setDOMInfo);
});


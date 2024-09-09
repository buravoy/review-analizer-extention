const dataSet = {}

const countTotal = (dataSet) => {
  const positive = dataSet?.countPositive ?? 0;
  const neutral = dataSet?.countNeutral ?? 0;
  const negative = dataSet?.countNegative ?? 0;

  return (positive + negative + neutral).toString();
}

const enablePopup = (tabId) => {
  chrome.action.setPopup({ tabId, popup: 'popup.html' }).then();
  chrome.action.setBadgeText({text: countTotal(dataSet[tabId])}).then();
}

const disablePopup = () => {
  chrome.action.setBadgeText({text: "OFF"}).then();
  chrome.action.setPopup({ popup: 'disable.html' }).then();
}

const prepareDataset = (tabId, msg) => {
  Object.assign(dataSet[tabId], msg?.info ?? {});
  chrome.action.setBadgeText({text: countTotal(dataSet[tabId])}).then();
}

chrome.tabs.onActivated.addListener((activeInfo) => {
  if (!dataSet[activeInfo.tabId]) return disablePopup();
  enablePopup(activeInfo.tabId);
});


chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.from === 'popup') {
    switch (msg.subject) {
      case 'get_data': return sendResponse(dataSet[msg.tabId]);
    }
    return ;
  }

  if (msg.from === 'content') {
    switch (msg.subject) {
      case 'init': return dataSet[sender.tab.id] = {};
      case 'enable': return enablePopup(sender.tab.id);
      case 'disable': return disablePopup();
      case 'dataset': return prepareDataset(sender.tab.id, msg)
    }
  }
});
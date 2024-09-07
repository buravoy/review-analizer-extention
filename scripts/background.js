const dataSet = {}

const enablePopup = (tabId) => {
  chrome.action.setPopup({ popup: 'popup.html' }).then();
  chrome.action.setBadgeText({text: (dataSet[tabId].count ?? 0).toString()}).then();
}

const disablePopup = () => {
  chrome.action.setBadgeText({text: "OFF"}).then();
  chrome.action.setPopup({ popup: 'disable.html' }).then();
}

const prepareDataset = (tabId, msg) => {
  Object.assign(dataSet[tabId], msg.info);
  chrome.action.setBadgeText({text: (dataSet[tabId].count ?? 0).toString()}).then();
}

chrome.tabs.onActivated.addListener((activeInfo) => {
  if (!dataSet[activeInfo.tabId]) return disablePopup();
  enablePopup(activeInfo.tabId);

});


chrome.runtime.onMessage.addListener((msg, sender) => {
  console.log(msg, sender)

  if (msg.from === 'content') {
    switch (msg.subject) {
      case 'init': return dataSet[sender.tab.id] = {};
      case 'enable': return enablePopup(sender.tab.id);
      case 'disable': return disablePopup();
      case 'dataset': return prepareDataset(sender.tab.id, msg)
    }
  }
});
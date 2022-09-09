/**
 * wait till the pages load and then send message to content.js with the corresponding payload
 */
chrome.tabs.onUpdated.addListener(function (tabId, info, tab) {

    if (tab.url && tab.url.length > 0 && tab.url.includes('zohopublic') && tab.status === 'complete') {
        let cnbcId = tab.openerTabId ?? false;

        if (!cnbcId) {
            return;
        }

        let payload = {
            cnbcTabId: cnbcId,
            to: 'CNBC',
            zohoTabId: tab.id
        };
        chrome.tabs.sendMessage(cnbcId, payload);
    }

    if (tab.url && tab.url.length > 0 && tab.url.includes('cnbc') && tab.status === 'complete') {

        let payload = {
            action: 'start',
            to: 'CNBC'
        };
        chrome.tabs.sendMessage(tab.id, payload);
    }

    return true;
})

/**
 *
 */
chrome.runtime.onMessage.addListener((message, sender) => {

    if (!message || message.length < 1 || !message.targetTabId) {
        return;
    }

    message.to = 'ZOHO';
    chrome.tabs.sendMessage(message.targetTabId, message);

    return true;
})
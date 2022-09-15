/**
 * listen to the messages form the background script to trigger necessary actions
 */
chrome.runtime.onMessage.addListener(messageReceived);

/**
 * Process the message received by the tab from background script
 * @param message
 * @param sender
 * @param sendResponse
 * @returns {boolean}
 */
function messageReceived (message, sender, sendResponse) {

    if (message.to === 'CNBC' && message.action === 'start') {

        /**
         * give 1.5 sec of time for the user to experience the initial state of the CNBC market gainer page
         */
        setTimeout(browserActions, 1500);

        return true;
    }

    if (message.to === 'CNBC') {
        let secondHighestSockData = getCnbcTabData()

        if (!secondHighestSockData) {
            return false;
        }

        secondHighestSockData.targetTabId = message.zohoTabId;
        chrome.runtime.sendMessage(secondHighestSockData);
    }

    if (message.to === 'ZOHO') {
        let stockData = message;

        document.getElementsByName('SingleLine')[0].value = stockData.name;
        document.getElementsByName('SingleLine1')[0].value = stockData.gain;
        document.getElementsByName('SingleLine2')[0].value = stockData.time;
    }

    return true;
}

/**
 * start the browser action sequence
 */
function browserActions () {

    let buttons = document.getElementsByTagName('button');

    if (!buttons || buttons.length < 1) {
        return;
    }

    tabActions(buttons);
}

/**
 * series of tab actions i.e, navigate to NASDAQ and then open a form tab
 * @param buttons
 */
function tabActions(buttons) {

    let clickButton = '';

    for (const eachButton of buttons) {
        if (eachButton.textContent.includes('NASDAQ')) {
            clickButton = eachButton;
            break;
        }
    }

    if (clickButton) {
        clickButton.click();
    }

    /**
     * Let the user have couple of seconds time to review the data on the Top gainer table
     */
    setTimeout(openNewTab, 2000);
}

/**
 * Open a new tab for Zoho form and pass data from CNBC page to Zoho form window
 */
function openNewTab () {
    const zohoFormLink = 'https://forms.zohopublic.in/developers/form/TestResponses/formperma/-gq-UT1RjqASnGgBsW-M8MmPm8e3YLhcyFam06v2piE';
    window.open(zohoFormLink, '_blank');
}

/**
 * Gather the second highest gained stock info from NASDAQ
 * @returns {boolean|{name: string, time: number, gain: string}}
 */
function getCnbcTabData () {
    const existingTables = document.getElementsByClassName('MarketTop-topTable');

    if (!existingTables || existingTables.length < 1) {
        return false;
    }

    let topGainers = existingTables[0];

    if (!topGainers || !topGainers.rows || topGainers.rows.length < 2) {
        return false;
    }

    let secondHighestGainer = topGainers.rows[1];

    let stockName = 'N/A';
    let percentGain = 'N/A';

    if (secondHighestGainer) {

        if (secondHighestGainer.cells.length < 2) {
            return false;
        }

        if (secondHighestGainer.cells[1] && secondHighestGainer.cells[1].innerText) {
            stockName = secondHighestGainer.cells[1].innerText;
        }

        if (secondHighestGainer.cells[3] && secondHighestGainer.cells[3].innerText) {
            percentGain = secondHighestGainer.cells[3].innerText.slice(0, -1); //slice off the % symbol in the end
        }
    }

    const timestamp = Date.now();

    return {name: stockName, gain: percentGain, time: timestamp};
}

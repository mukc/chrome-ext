/**
 * initiate the process
 */
startActions();

function startActions() {
    setTimeout(browserActions, 1250);
}

/**
 * Navigate to NASDAQ tab and fetch the second highest gained stock info
 */
function browserActions() {

    let buttons = document.getElementsByTagName('button');

    if (!buttons || buttons.length < 1) {
        console.log('No Buttons found on page');
        return;
    }

    tabClickAction(buttons);

    fetchSecondHighestGainedStock();
}

/**
 * navigate to NASDAQ tab in Market Movers section
 * @param buttons
 */
function tabClickAction(buttons) {

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
}

/**
 * wait until the page content is fully loaded and then
 * Fetch Top second gained stock of the day and call new tab open method
 */
function fetchSecondHighestGainedStock() {

    setTimeout(() => {

        const existingTables = document.getElementsByClassName('MarketTop-topTable');

        if (!existingTables || existingTables.length < 1) {
            return;
        }

        let topGainers = existingTables[0];

        if (!topGainers || !topGainers.rows || topGainers.rows.length < 2) {
            return;
        }

        let secondHighestGainer = topGainers.rows[1];

        let stockName = 'N/A';
        let percentGain = 'N/A';

        if (secondHighestGainer) {

            if (secondHighestGainer.cells.length < 2) {
                return;
            }

            if (secondHighestGainer.cells[1] && secondHighestGainer.cells[1].innerText) {
                stockName = secondHighestGainer.cells[1].innerText;
            }

            if (secondHighestGainer.cells[3] && secondHighestGainer.cells[3].innerText) {
                percentGain = secondHighestGainer.cells[3].innerText.slice(0, -1); //slice off the % symbol in the end
            }
        }

        const timestamp = Date.now(); //Includes Time zone

        openNewTab(stockName, percentGain, timestamp);
    }, 500)
}

/**
 * Open a new tab for Zoho form and pass data from CNBC page to Zoho form window
 * @param stockName
 * @param percentGain
 * @param timestamp
 */
function openNewTab(stockName, percentGain, timestamp) {

    const formData = {name: stockName, gain: percentGain, time: timestamp};
    const zohoFormLink = 'https://forms.zohopublic.in/developers/form/TestResponses/formperma/-gq-UT1RjqASnGgBsW-M8MmPm8e3YLhcyFam06v2piE';
    let formWindow = window.open(zohoFormLink, '_blank');

    /**
     * we need to wait until the Zoho form page is fully loaded to receive the message posted
     */
    setTimeout(function () {
        formWindow.postMessage(formData, 'https://forms.zohopublic.in')
    }, 2000);
}

/**
 * wait for the page to load and do corresponding actions
 * only considering Zoho form page as we need it to auto fill the form once it is loaded
 */
window.onload = function () {

    if (!window.location.href.includes('zohopublic')) {
        return;
    }

    window.addEventListener('message', function (event) {
        if (!window.location.href.includes('zohopublic')) {
            return;
        }

        /**
         * for security purpose,
         * make sure we are only looking for the messages originated from CNBC domain
         */
        if (event.origin !== 'https://www.cnbc.com') {
            return;
        }

        /**
         * auto fill the zoho form with stock data
         */
        document.getElementsByName('SingleLine')[0].value = event.data.name;
        document.getElementsByName('SingleLine1')[0].value = event.data.gain;
        document.getElementsByName('SingleLine2')[0].value = event.data.time;

    }, false)
}

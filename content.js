/**
 * initiate the process
 */
startActions()

function startActions () {
    setTimeout(browserActions, 1250)
}

/**
 * open the CNBC website and navigate to NASDAQ tab in Market Movers section
 */
function browserActions () {
    var buttons = document.getElementsByTagName('button')

    let clickButton = ''

    for (i = 0; i < buttons.length; i++) {
        if (buttons[i].textContent.includes('NASDAQ')) {
            clickButton = buttons[i]
        }
    }

    if (clickButton) {
        clickButton.click()
    }
    fetchSecondHighestGainedStock()
}

/**
 * wait until the page content is fully loaded and then
 * Fetch Top second gained stock of the day and call new tab open method
 */
function fetchSecondHighestGainedStock () {
    setTimeout(() => {
        const existingTables = document.getElementsByClassName('MarketTop-topTable')

        if (!existingTables) {
            return false
        }

        let topGainers = existingTables[0]
        if (!topGainers) {
            return false
        }

        let secondHighestGainer = topGainers.rows[1]

        const stockName = secondHighestGainer.cells[1].innerText
        const percentGain = secondHighestGainer.cells[3].innerText.slice(0, -1) //slice off the % symbol in the end
        const timestamp = Date.now() //Includes Time zone

        openNewTab(stockName, percentGain, timestamp)
    }, 500)
}

/**
 * Open a new tab for Zoho form
 * @param stockName
 * @param dailyGain
 * @param timestamp
 */
function openNewTab (stockName, percentGain, timestamp) {

    const formData = {name: stockName, gain: percentGain, time: timestamp}

    const formLink = 'https://forms.zohopublic.in/developers/form/TestResponses/formperma/-gq-UT1RjqASnGgBsW-M8MmPm8e3YLhcyFam06v2piE'
    let formWindow = window.open(formLink, '_blank')

    /**
     * we need to wait until the Zoho form page is fully loaded to receive the message posted
     */
    setTimeout(function () {
        formWindow.postMessage(formData, 'https://forms.zohopublic.in')
    }, 2000)
}

/**
 * wait for the page to load and do corresponding actions
 * only considering Zoho form page as we need it to auto fill the form once it is loaded
 */
window.onload = function () {
    if (window.location.href.includes('zohopublic')) {
        window.addEventListener('message', function (event) {
            if (window.location.href.includes('zohopublic')) {

                /**
                 * for security purpose,
                 * Make sure we are only looking for the messages originated from CNBC domain
                 */
                if (event.origin !== 'https://www.cnbc.com') {
                    return
                }

                /**
                 * auto fill the zoho form
                 */
                document.getElementsByName('SingleLine')[0].value = event.data.name
                document.getElementsByName('SingleLine1')[0].value = event.data.gain
                document.getElementsByName('SingleLine2')[0].value = event.data.time
            }
        }, false)
    }
}
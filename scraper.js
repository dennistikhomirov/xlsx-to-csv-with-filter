/* Scraper KissExpo product images
/ Must be logged in
/
 */
const webdriver = require('selenium-webdriver')
const chrome = require('selenium-webdriver/chrome')
const { By, Key, until } = webdriver
const chromedriver = require('chromedriver');
let driver
const category =By.className("col-sm-2 col-xs-6")

run()

async function run(){
    driver = await startChrome()
    await driver.get("http://kissexpo.by/intim-tovary-optom/")

    await waitUntilShowUp(category)
    const categories = await driver.findElements(category)
    console.log("categoriesNumbers: "+ categories.length)

    for (let i=0;i<categories.length;i++){
        await categories[0].click()
        console.log("categoriesNumbers: "+ categories.length)
    }

}



function delay (time) {
    return new Promise(resolve => setTimeout(resolve, time))
}

async function waitUntilShowUp (by, Twait) {
    if (Twait === undefined) Twait = 200
    do {
        await delay(100)
        if (await isElementDisplayed(by)) return await driver.findElement(by)
    } while (Twait-- > 0)
    return false
}
async function isElementDisplayed (by) {
    try {
        return await driver.findElement(by).isDisplayed()
    } catch (err) {
        return false
    }
}
async function startChrome () {
    chrome.setDefaultService(new chrome.ServiceBuilder(chromedriver.path).build());
    let options = new chrome.Options();
    options.addArguments('disable-popup-blocking');
    return await new webdriver.Builder().withCapabilities(options.toCapabilities()).build();
}



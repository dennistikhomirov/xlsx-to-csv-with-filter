/* Scraper KissExpo product images

 */

const jsdom = require("jsdom")//browser's mock since node doesn't contains any browser
const { JSDOM } = jsdom;

const fetch = require('node-fetch')
const fs = require('fs-extra')
const webdriver = require('selenium-webdriver')
const chrome = require('selenium-webdriver/chrome')
const { By, Key, until } = webdriver
const chromedriver = require('chromedriver');
let driver
const category = By.className("col-sm-2 col-xs-6")
const product = By.className("product-layout col-lg-2 col-md-2 col-sm-3 col-xs-6")

//test()
async function test() {
    let a = new Map()
    let out = { elements: [{ key: "", values: [] }] }
    out.elements[0].key = "0"
    console.log(out.elements[0].key)
}

scrapSexToys()

async function scrapSexToys() {
    let counterImages=0
    //const images = new Map()
    let linksProducts = []
    let a = []
    /*
        driver = await startChrome()
        linksProducts = await collectProductLinks("http://kissexpo.by/intim-tovary-optom/")
        console.log(linksProducts.length)
        linksProducts =linksProducts.concat( await collectProductLinks("http://kissexpo.by/eroticheskoje-beljo-optom/"))
        console.log(linksProducts.length)



        const fileProducts = './results/json/productsLinks.json'
        fs.ensureFileSync(fileProducts)
        fs.writeFileSync(fileProducts, JSON.stringify({ links: linksProducts }))
        //console.log("Products were found:  " + linksProducts.length)

        const obj = JSON.parse(fs.readFileSync("./results/json/productsLinks.json", "utf8"))
        console.log("File products:  " + obj.links.length)
        */

    // collect product's image's links
    let html, DOM, links
    const obj = JSON.parse(fs.readFileSync("./results/json/productsLinks.json", "utf8"))

    let out = { elements: [] }

    for ( let i = 0; obj.links.length; i++ ) {
        console.log(obj.links[i])
        html = await fetch(obj.links[i]).then(res => res.text())
        DOM = new JSDOM(html).window.document

        let element = { key: "", values: [] }
        element.key = (await DOM.getElementsByName('product_id'))[0].value
        console.log(element.key)
        links = (await DOM.getElementsByClassName('thumbnail'))
        console.log("links.length" + links.length)
        for ( let j = 0; j < links.length; j++ ) {
            await element.values.push(links[j].href)
            counterImages++
            console.log(element.values[j])
        }
        console.log("element" + element)
        await out.elements.push(element)
    }
    console.log(out.elements.length + "  products were scanned")
    console.log(counterImages + "  images were saved")
    const fileImagesLinks = './results/json/imagesLinks.json'
    fs.ensureFileSync(fileImagesLinks)
    fs.writeFileSync(fileImagesLinks, JSON.stringify(out))


}

async function collectProductLinks(linkMainCategory) {

    let linksSubCategories = []
    let linksProducts = []
    let products

    await driver.get(linkMainCategory)
    await waitUntilShowUp(category)
    const categories = await driver.findElements(category)
    delay(1000)
    for ( let i = 0; i < categories.length; i++ ) {
        linksSubCategories.push(await categories[i].findElement(By.tagName("a")).getAttribute("href"))
    }
    console.log("categoriesNumbers: " + linksSubCategories.length)


    for ( let linkSubCategory of linksSubCategories ) {
        console.log("SUB: " + linkSubCategory)
        await driver.get(linkSubCategory + "/?limit=1000")
        await waitUntilShowUp(product)
        products = await driver.findElements(product)
        for ( let i = 0; i < products.length; i++ ) {
            linksProducts.push(await products[i].findElement(By.tagName("a")).getAttribute("href"))
            //console.log(linksProducts[i])
        }
    }
    return linksProducts
}


function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time))
}

async function waitUntilShowUp(by, Twait) {
    if ( Twait === undefined ) Twait = 200
    do {
        await delay(100)
        if ( await isElementDisplayed(by) ) return await driver.findElement(by)
    } while ( Twait-- > 0 )
    return false
}

async function isElementDisplayed(by) {
    try {
        return await driver.findElement(by).isDisplayed()
    } catch ( err ) {
        return false
    }
}

async function startChrome() {
    chrome.setDefaultService(new chrome.ServiceBuilder(chromedriver.path).build());
    let options = new chrome.Options();
    options.addArguments('disable-popup-blocking');
    return await new webdriver.Builder().withCapabilities(options.toCapabilities()).build();
}



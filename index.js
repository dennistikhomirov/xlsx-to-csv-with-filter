const fs = require('fs-extra')
const xlsx = require('node-xlsx');

run();

async function run() {
    let counterProducts = 0

    const fileLog = './logs/log' + new Date().toUTCString() + '.log'
    fs.ensureFileSync(fileLog)
    fs.appendFileSync(fileLog, new Date().toUTCString() + "\n")

    const filter = JSON.parse(fs.readFileSync("filter.json", "utf8"))

    let sourceFile = filter.sourceFile
    if ( !sourceFile ) sourceFile = "./data/testParser.xlsx"
    const file = './results/results' + new Date().toUTCString() + '.csv'
    fs.ensureFileSync(file)
    fs.appendFileSync(file, filter.firstRow + "\n")

    let images = new Map()

    const linksImages = JSON.parse(fs.readFileSync(filter.imagesDest, "utf8"))
    for ( let i = 0; i < linksImages.elements.length; i++ ) {
        images.set(linksImages.elements[i].key, linksImages.elements[i].values)
    }
    console.log(images)

    const workSheets = xlsx.parse(sourceFile)
    let data = workSheets[0].data
    let isExclude
    let id
    let values=[]

    for ( let i = 1; i < data.length; i++ ) {
        isExclude = false

        //images
        id = data[i][filter.firstRow.indexOf("ID")].toString()
        console.log(id)
        values = images.get(id)
        console.log(values)
        for (let j=0;j<values.length;j++){
            data[i][filter.firstRow.indexOf("Images")] += (","+values[j])
        }

        //price
        const indexPrice = filter.firstRow.indexOf("Price")
        let indexPriceBase = filter.firstRow.indexOf(filter.price.base)
        if ( data[i][indexPriceBase] === undefined ) {
            indexPriceBase = filter.firstRow.indexOf("Price opt")
        }

        if ( filter.price.multiply !== "" ) {
            data[i][indexPrice] = (parseFloat(data[i][indexPriceBase]) * parseFloat(filter.price.multiply))
            if ( (data[i][indexPrice] % 1) < 0.3 ) data[i][indexPrice]--
            data[i][indexPrice] = Math.trunc(data[i][indexPrice]) + (Math.random() / 3.41) + 0.7
            data[i][indexPrice] = await convertToString(data[i][indexPrice])
        }

        if ( data[i][indexPrice] <= data[i][filter.firstRow.indexOf("Price opt")] ) {
            data[i][indexPrice] = await convertToString((parseFloat(data[i][indexPrice]) * 1.3) * (1 / filter.price.multiply))
        }
        if ( data[i][indexPrice] < 1 ) isExclude = true

        console.log("ID = " + data[i][0] + "  Price opt  =" + data[i][4] +
            "  Price rec  =" + data[i][7] + "  Price =" + data[i][indexPrice])

        // exclude
        let where
        for ( let k = 0; k < filter.exclude.length; k++ ) {
            where = filter.firstRow.indexOf(filter.exclude[k].column)
            if ( (where !== -1) && (data[i][where].toString() === filter.exclude[k].attr) ) {
                isExclude = true
            }
        }

        //replace
        for ( let j = 0; j < data[i].length; j++ ) {
            data[i][j] = await replace(data[i][j], j)
            if ( data[i][j] !== undefined ) data[i][j] = data[i][j].toString().trim()
            data[i][j] = "\"" + data[i][j] + "\""
        }

        if ( !isExclude ) {
            fs.appendFileSync(file, data[i] + "\n")
            counterProducts++
        } else {
            fs.appendFileSync(fileLog, i + " Failed to import: ID=" + data[i][filter.firstRow.indexOf("ID")] +
                " Name: " + data[i][filter.firstRow.indexOf("Name")] +
                " In stock =" + data[i][filter.firstRow.indexOf("In stock?")] +
                " Price opt =" + data[i][filter.firstRow.indexOf("Price opt")] +
                "\n")
        }
    }
    fs.appendFileSync(fileLog, "\n" + counterProducts + " products were IMPORTED\n")
    fs.appendFileSync(fileLog, (data.length - 1 - counterProducts) + " products were SKIPPED")
    fs.appendFileSync(fileLog, (data.length + counterProducts) + " ALL PRODUCTS")
}

async function remove(data) {
    const filter = JSON.parse(fs.readFileSync("filter.json", "utf8"));
    for ( let i = 0; i < filter.remove.length; i++ ) {
        do {
            data = data.replace(filter.remove[i], "")
        } while ( data.includes(filter.remove[i]) )
    }
    return data
}

async function replace(data, column) {
    const filter = JSON.parse(fs.readFileSync("filter.json", "utf8"))
    let where
    for ( let i = 0; i < filter.replace.length; i++ ) {
        where = filter.firstRow.indexOf(filter.replace[i].where)
        if ( (where !== -1) && (where !== column) ) continue
        do {
            data = data.replace(filter.replace[i].from, filter.replace[i].to)
        } while ( data.includes(filter.replace[i].from) )
    }
    return data
}

async function convertToString(data) {
    return data.toString().substring(0, data.toString().indexOf(".") + 2) + "0"
}


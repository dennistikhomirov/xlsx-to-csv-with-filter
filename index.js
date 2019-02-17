const fs = require('fs-extra')
const xlsx = require('node-xlsx');

run();

async function run() {
    const filter = JSON.parse(fs.readFileSync("filter.json", "utf8"))

    let sourceFile = filter.sourceFile
    if ( !sourceFile ) sourceFile = "./data/testParser.xlsx"
    const workSheets = xlsx.parse(sourceFile)

    const file = './results/results' + new Date().toUTCString() + '.csv'
    let data = workSheets[0].data
    fs.ensureFileSync(file)
    fs.appendFileSync(file, filter.firstRow + "\n")

    for ( let i = 1; i < data.length; i++ ) {

        for ( let j = 0; j < data[i].length; j++ ) {
            //data[i][j] = await remove(data[i][j])
            //console.log(data[i][j])

            data[i][j] = await replace(data[i][j], j)
            if (data[i][j] !== undefined)  data[i][j]= data[i][j].toString().trim()
            data[i][j] = "\"" + data[i][j] + "\""
        }
        fs.appendFileSync(file, data[i] + "\n")
    }

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

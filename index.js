const fs = require('fs-extra')
const xlsx = require('node-xlsx');

run();

async function run() {

    const workSheets = xlsx.parse(`./data/testParser.xlsx`);

    const filter = JSON.parse(fs.readFileSync("filter.json", "utf8"));
    const file = './results/results' + new Date().toUTCString() + '.csv'
    let data = workSheets[0].data
    console.log(data)
    fs.ensureFileSync(file)

    fs.appendFileSync(file, filter.firstRow + "\n")
    for ( let i = 1; i < data.length; i++ ) {
        for ( let j = 0; j < data[i].length; j++ ) {
            data[i][j] = await remove(data[i][j])
            data[i][j] = await change(data[i][j])
        }

        fs.appendFileSync(file, data[i] + "\n")
        console.log(data[i])
    }

}

async function remove(data) {
    const filter = JSON.parse(fs.readFileSync("filter.json", "utf8"));
    for ( let i = 0; i < filter.remove.length; i++ ) {
        do {
            data = data.replace(filter.remove[i], "")
        } while (data.includes(filter.remove[i]))
    }
    return data
}

async function change(data) {
    const filter = JSON.parse(fs.readFileSync("filter.json", "utf8"));
    for ( let i = 0; i < filter.replace.length; i++ ) {
        do {
            data = data.replace(filter.replace[i].from, filter.replace[i].to)
        } while (data.includes(filter.replace[i].from))
    }
    return data

}

const fs = require('fs')
const logFilePath = './log.json'
//const scriptFilePath = './content/after-effects-script.js'

function save(log) {
    const logString = JSON.stringify(log)
    return fs.writeFileSync(logFilePath, logString)
}

// function saveScript(content) {
//     const contentString = JSON.stringify(content)
//     const scriptString = `var content = ${contentString}`
//     return fs.writeFileSync(scriptFilePath, scriptString)
// }

function load() {
    const fileBuffer = fs.readFileSync(logFilePath, 'utf-8')
    const logJson = JSON.parse(fileBuffer)
    return logJson
}

module.exports = {
    save,
    //saveScript,
    load
}
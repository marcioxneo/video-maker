const readline = require('readline-sync')
const state = require('./state.js')

function robot() {
    const content = {
        maximumSentences: 7
    }

    content.lang = askAndReturnLanguage()
    content.searchTerm = askAndReturnSearchTerm()
    content.prefix = askAndReturnPrefix()
    state.save(content)

    function askAndReturnLanguage() {
        const language = ['pt', 'en']
        const selectedLangIndex = readline.keyInSelect(language, 'Chooice Language: ')
        const selectedLangText = language[selectedLangIndex]
        return selectedLangText
    }

    function askAndReturnSearchTerm() {
        if(content.lang == 'pt'){
            return readline.question('Digite um termo de pesquisa da Wikipedia: ')
        } else {
            return readline.question('Type a Wikipedia search term: ')
        }
    }
    
    function askAndReturnPrefix() {
        if(content.lang == 'pt'){
            const prefixes = ['Quem e', 'O que e', 'A historia de']
            const selectedPrefixIndex = readline.keyInSelect(prefixes,'Selecione uma opção:')
            const selectedPrefixText = prefixes[selectedPrefixIndex]
            return selectedPrefixText
        } else {
            const prefixes = ['Who is', 'What is', 'The history of']
            const selectedPrefixIndex = readline.keyInSelect(prefixes,'Choose one option:')
            const selectedPrefixText = prefixes[selectedPrefixIndex]
            return selectedPrefixText
        }
        
    }
}

module.exports = robot
const algorithmia = require('algorithmia')
const algorithmiaApiKey = require('../credentials/algorithmia.json').apiKey
const sentenceBoundaryDetection = require('sbd')

async function robot(content){
    //console.log(`Recebi com sucesso o content: ${content.searchTerm}`)
    await fetchContentFromWikipedia(content)
    sanitizedContent(content)
    breakContentIntroSentences(content)

    //console.log('Logando se a função "fetchContentFromWikipedia" retorna uma promise')
    //console.log(fetchContentFromWikipedia())

    async function fetchContentFromWikipedia(content){
        //return 'RESULTADO DA PROMISE'
        const algorithmiaAuthenticated = algorithmia(algorithmiaApiKey)
        const wikipediaAlgorithm = algorithmiaAuthenticated.algo('web/WikipediaParser/0.1.2')
        const wikipediaResponde = await wikipediaAlgorithm.pipe(content.searchTerm)
        //console.log('Fazendo log do objeto "wikipediaResponde"')
        //console.log(wikipediaResponde)
        const wikipediaContent = wikipediaResponde.get()
        //console.log(wikipediaContent)

        content.sourceContentOriginal = wikipediaContent.content
    }

    function sanitizedContent(content){
        //const withoutBlankLines = removeBlankLines(content.sourceContentOriginal)
        const withoutBlankLinesAndMarkdown = removeBlankLinesAndMarkdown(content.sourceContentOriginal)
        //const withoutMarkdown = removeMarkdown(withoutBlankLines)
        const withoutDatesInParentheses = removeDatesInParenthesis(withoutBlankLinesAndMarkdown)

        content.sourceContentSanitized = withoutDatesInParentheses 
        //console.log(withoutDatesInParentheses)

        function removeBlankLinesAndMarkdown(text){
            const allLines = text.split('\n')

            const withoutBlankLinesAndMarkdown = allLines.filter((line) => {
                if(line.trim().length === 0 || line.trim().startsWith('=')){
                    return false
                }

                return true
            })

            return withoutBlankLinesAndMarkdown.join(' ')
        }
    }
/* funções separadas
        function removeBlankLines(text){
            const allLines = text.split('\n')

            const withoutBlankLines = allLines.filter((line) => {
                if(line.trim().length === 0) {
                    return false
                }
                return true
            })

            return withoutBlankLines
            //console.log(allLines)
        }
    }

    function removeMarkdown(lines){
        const withoutMarkdown = lines.filter((line) => {
            if(line.trim().startsWith('=')) {
                return false
            }

            return true
        })

        return withoutMarkdown
    }*/

    function removeDatesInParenthesis(text){
        return text.replace(/\((?:\([^()]*\)|[^()])*\)/gm, '').replace(/  /g,' ')
    }

    function breakContentIntroSentences(content){
        content.sentences = []

        const sentences = sentenceBoundaryDetection.sentences(content.sourceContentSanitized)
        //console.log(sentences)
        sentences.forEach((sentence) => {
            content.sentences.push({
                text: sentence,
                keywords: [],
                images: []
            })
        })

    }
}

module.exports = robot
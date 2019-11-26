const gm = require('gm').subClass({imageMagick: true})
const hbjs = require('handbrake-js')
const fs = require('fs')
const state = require('./state.js')
const spawn = require('child_process').spawn
const path = require('path')
//const os = require('os')
const rootPath = path.resolve(__dirname, '..')

//const fromRoot = relPath => path.resolve(rootPath, relPath)


async function robot() {
    const content = state.load()

    //await convertAllImages(content)
    //await createAllSentenceImages(content)
    //await createYouTubeThumbnail()
    //await createAfterEfffectScript(content)
    await renderVideoWithAfterEffects()

    async function convertAllImages(content) {
        for (let sentenceIndex = 0; sentenceIndex < content.sentences.length; sentenceIndex++) {
            await convertImage(sentenceIndex)
        }
    }
    async function convertImage(sentenceIndex) {
            return new Promise((resolve, reject) => {
                const inputFile = `./content/${sentenceIndex}-original.png[0]`
                const outputFile = `./content/${sentenceIndex}-converted.png`
                const width = 1920
                const height = 1080

                gm()
                .in(inputFile)
                .out('(')
                    .out('-clone')
                    .out('0')
                    .out('-background', 'white')
                    .out('-blur', '0x9')
                    .out('-resize', `${width}x${height}^`)
                .out(')')
                .out('(')
                    .out('-clone')
                    .out('0')
                    .out('-background', 'white')
                    .out('-resize', `${width}x${height}`)
                .out(')')
                .out('-delete', '0')
                .out('-gravity', 'center')
                .out('-compose', 'over')
                .out('-composite')
                .out('-extent', `${width}x${height}`)
                .write(outputFile, (error) => {
                    if(error) {
                        return reject(error)
                    }

                    console.log(`> [video-robot] Image converted: ${inputFile}`)
                    resolve()
                })
            })
    }

    async function createAllSentenceImages(content) {
        for (let sentenceIndex = 0; sentenceIndex < content.sentences.length; sentenceIndex++){
            await createSentenceImage(sentenceIndex, content.sentences[sentenceIndex].text)
            //console.log(content.sentenceIndex[sentenceIndex].text)
        }
    }

    async function createSentenceImage(sentenceIndex, sentenceText) {
        return new Promise((resolve, reject) => {
            const outputFile = `./content/${sentenceIndex}-sentence.png`
            //const outputFile = fromRoot(`./content/${sentenceIndex}-sentence.png`)

            const templateSettings = {
                0: {
                    size: '1920x400',
                    gravity: 'center' 
                },
                1: {
                    size: '1920x1000',
                    gravity: 'center'
                },
                2: {
                    size: '800x1080',
                    gravity: 'west'
                },
                3: {
                    size: '1920x400',
                    gravity: 'center'
                },
                4: {
                    size: '1920x1080',
                    gravity: 'center'
                },
                5: {
                    size: '800x1080',
                    gravity: 'west'
                },
                6: {
                    size: '1920x400',
                    gravity: 'center'
                }
            }

            gm()
                .out('-size', templateSettings[sentenceIndex].size)
                .out('-gravity', templateSettings[sentenceIndex].gravity)
                .out('-background', 'transparent')
                .out('-fill', 'white')
                .out('-kerning', '-1')
                .out(`caption:${sentenceText}`)
                .write(outputFile, (error) => {
                    if (error) {
                        return reject(error)
                    }

                    console.log(`> [video-robot] Sentence created: ${outputFile}`)
                    resolve()
                })
        })
    }

    async function createYouTubeThumbnail() {
        return new Promise((resolve, reject) => {
            gm()
                .in('./content/0-converted.png')
                .write('./content/youtube-thumbnail.jpg', (error) => {
                    if(error) {
                        return reject(error)
                    }

                    console.log('> [video-robot] YouTube thumbnail created')
                    resolve()

                })
        })
    }

    async function createAfterEfffectScript(content) {
        await state.saveScript(content)
    }

    async function renderVideoWithAfterEffects() {
        return new Promise((resolve, reject) => {
            const aerenderFilePath = 'C:/Program Files/Adobe/Adobe After Effects CC 2019/Support Files/aerender.exe'
            const templateFilePath = `${rootPath}/templates/1/template.aep`
            const destinationFilePath = `${rootPath}/content/output.mov`
            const destinationFilePathConverted = `${rootPath}/content/output.mp4`

            console.log('>[video-robot] Starting After Effects')

            const aerender = spawn(aerenderFilePath, [
                '-comp', 'main',
                '-project', templateFilePath,
                '-output', destinationFilePath
            ])

            aerender.stdout.on('data', (data) => {
                process.stdout.write(data)
            })

            aerender.on('close', () => {
                console.log('>[video-robot] After Effects closed')
                hbjs
                    .spawn({
                        input: destinationFilePath,
                        output: destinationFilePathConverted    
                    })
                    .on('error', err => {
                        //invalid user input, no video found etc
                        console.error(`> [video-robot] Error found while trying to convert video: ${err}`)
                    })
                    .on('complete', progress => {
                        console.log('> [video-robot] Encoding finished successfully')
                        // remove big mov file
                        fs.unlinkSync(destinationFilePath, err => {
                            if(err) {
                                console.log(`> [video-robot] Error romoving .mov file: ${err}`)
                            }
                            console.log('> [video-robot] output .MOV removed')
                        })
                        resolve()
                    })
            })
        })
    }
}

module.exports = robot
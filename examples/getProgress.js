// Setup
const Bottleneck = require('bottleneck')
const Rubberneck = require('../index')()
const { generateList, sleep } = require('./helpers')
const limiter = new Bottleneck({ minTime: 20, maxConcurrent: 1 })
Rubberneck.addBottleneck('my limiter', limiter)
const statInterval = setInterval(() => console.log(Rubberneck.getProgress()), 500) // Log stats every 500ms


;(async function main (){
    // Run tasks
    const listSize = 200
    const taskDelay = 10
    const taskList = generateList(listSize, taskDelay)
    await Promise.all(taskList.map(delay => limiter.schedule(sleep, delay)))


    // Clean up
    clearInterval(statInterval)
    Rubberneck.stop()
    process.exit()

})().catch(console.error.bind(console))

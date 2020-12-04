// Setup
const Bottleneck = require('bottleneck')
const Rubberneck = require('../index')()
const { generateList, sleep } = require('./helpers')
const limiter = new Bottleneck({ minTime: 20, maxConcurrent: 2 })
const throttler = new Bottleneck({ minTime: 50, maxConcurrent: 3 })
Rubberneck.addBottleneck('my limiter', limiter)
Rubberneck.addBottleneck('my throttler', throttler)
const statInterval = setInterval(() => console.log(Rubberneck.getStats()), 500) // Log stats every 500ms


;(async function main (){
    // Run tasks
    const listSize = 200
    const taskDelay = 10
    const taskList = generateList(listSize, taskDelay)
    const results = await Promise.all(taskList.map(async task => {
        const result = await limiter.schedule(sleep, task)
        const final = await throttler.schedule(sleep, task)
        return final
    }))


    // Clean up
    clearInterval(statInterval)
    Rubberneck.stop()
    process.exit()

})().catch(console.error.bind(console))

// Setup
const Bottleneck = require('bottleneck')
const Rubberneck = require('../index')()
const cliProgress = require('cli-progress')
const { generateList, sleep } = require('./helpers')
const limiter = new Bottleneck({ minTime: 20, maxConcurrent: 2 })
const throttler = new Bottleneck({ minTime: 50, maxConcurrent: 3 })
Rubberneck.addBottleneck('my limiter', limiter)
Rubberneck.addBottleneck('my throttler', throttler)



;(async function main (){
    // Set up progress bar
    const progressBar = new cliProgress.SingleBar({
    format: 'progress [{bar}] {percentage}% | ETA {custEta} | {completed}/{added}'
    })
    progressBar.start(100, 0)
    const statInterval = setInterval(() => {
        const progress = Rubberneck.getProgress()
        progressBar.update(
            Math.round(progress.percent.proportion * 100),
            {
                custEta: progress.remaining.human,
                completed: progress.tasks.completed,
                added: progress.tasks.total,
            }
        )
    }, 50) // Update progress bar ever 50ms


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
    progressBar.stop()
    clearInterval(statInterval)
    Rubberneck.stop()
    process.exit()

})().catch(console.error.bind(console))

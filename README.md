# Rubberneck - a stat watcher for the rate limiting library Bottleneck

## Rubberneck.getStats()
```javascript

// Setup
const Bottleneck = require('bottleneck')
const Rubberneck = require('rubberneck')()
const limiter = new Bottleneck({ minTime: 20, maxConcurrent: 1 })
Rubberneck.addBottleneck('my limiter', limiter)
const statInterval = setInterval(() => console.log(Rubberneck.getStats()), 500) // Log stats every 500ms


// Run tasks
await Promise.all(taskList.map(task => limiter.schedule(asyncHandler, task))


// Clean up
clearInterval(statInterval)
Rubberneck.stop()
```
**Example Output**
```javascript
[ { name: 'myLimiter',
    registered: '2020-12-04T18:44:51.006Z',
    added: 625,
    completed: 394,
    fails: 39,
    retries: 0,
    avgAddedPerSecond: '7.5',
    avgCompletedPerSecond: '50.3',
    avgFailsPerSecond: '4.6',
    avgRetriesPerSecond: '0.0',
    remaining: 231,
    percentCompleted: '63.0%',
    msRemaining: 4589,
    eta: '5s' } ]
```


## Rubberneck.getProgress()
```javascript

// Setup
const Bottleneck = require('bottleneck')
const Rubberneck = require('rubberneck')()

const limiter = new Bottleneck({ minTime: 20, maxConcurrent: 1 })
Rubberneck.addBottleneck('my limiter', limiter)
const statInterval = setInterval(() => console.log(Rubberneck.getProgress()), 500) // Log stats every 500ms


// Run tasks
await Promise.all(taskList.map(task => limiter.schedule(asyncHandler, task))


// Clean up
clearInterval(statInterval)
Rubberneck.stop()
```
**Example Output**
```javascript
{ tasks: { completed: 533, remainig: 49, total: 582 },
  elapsed: { human: '11s', ms: 11279 },
  remaining: { human: '967ms', ms: 967 },
  total: { human: '12s', ms: 12246 }
```



## Multiple Bottlenecks
```javascript

// Setup
const Bottleneck = require('bottleneck')
const Rubberneck = require('rubberneck')()

const limiter = new Bottleneck({ minTime: 20, maxConcurrent: 1 })
const throttler = new Bottleneck({ minTime: 200, maxConcurrent: 2 })
Rubberneck.addBottleneck('my limiter', limiter)
Rubberneck.addBottleneck('my throttler', throttler)
const statInterval = setInterval(() => console.log(Rubberneck.getStats()), 500) // Log stats every 500ms


// Run tasks
const results = await Promise.all(taskList.map(async task => {
    const result = await limiter.schedule(asyncHandler, task)
    const final = await throttler.schedule(otherAsyncHandler, task)
    return final
}))


// Clean up
clearInterval(statInterval)
Rubberneck.stop()
```

**Example Output**
```javascript
[ { name: 'my limiter',
    registered: '2020-12-04T18:44:51.006Z',
    added: 625,
    completed: 593,
    fails: 61,
    retries: 0,
    avgAddedPerSecond: '0.1',
    avgCompletedPerSecond: '47.4',
    avgFailsPerSecond: '7.8',
    avgRetriesPerSecond: '0.0',
    remaining: 32,
    percentCompleted: '94.9%',
    msRemaining: 675,
    eta: '675ms' },
    { name: 'myThrottler',
    registered: '2020-12-04T18:44:51.006Z',
    added: 605,
    completed: 506,
    fails: 59,
    retries: 0,
    avgAddedPerSecond: '77.5',
    avgCompletedPerSecond: '38.2',
    avgFailsPerSecond: '11.3',
    avgRetriesPerSecond: '0.0',
    remaining: 99,
    percentCompleted: '83.6%',
    msRemaining: 2589,
    eta: '3s' } ]
```


## Progress bar
```javascript

// Setup
const Bottleneck = require('bottleneck')
const Rubberneck = require('rubberneck')()
const cliProgress = require('cliProgress')

const limiter = new Bottleneck({ minTime: 20, maxConcurrent: 1 })
const throttler = new Bottleneck({ minTime: 200, maxConcurrent: 2 })
Rubberneck.addBottleneck('my limiter', limiter)
Rubberneck.addBottleneck('my throttler', throttler)
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
const results = await Promise.all(taskList.map(async task => {
    const result = await limiter.schedule(asyncHandler, task)
    const final = await throttler.schedule(otherAsyncHandler, task)
    return final
}))


// Clean up
progressBar.stop()
clearInterval(statInterval)
Rubberneck.stop()
```

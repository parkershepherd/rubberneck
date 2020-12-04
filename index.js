const {
    formatDuration,
    formatPercent,
    formatNumber,
    stripNaN,
} = require('./helpers')

module.exports = function Bottleneck(options = {}) {
    let checkInterval = 100
    let avgWeight = 0.05
    let bottlenecks = []
    let intervals = {}

    configure(options)

    function configure(options) {
        if (options.checkInterval) checkInterval = options.checkInterval
        if (options.avgWeight) avgWeight = options.avgWeight
    }

    function getAvg(existingAvg, intervalChange, intervalDuration) {
        const latestPerSecond = 1000 * intervalChange / intervalDuration
        return existingAvg * (1 - avgWeight) + latestPerSecond * avgWeight
    }

    function addBottleneck(name, bottleneck) {
        if (intervals[name]) throw new Error(`"${name} already registered`)
        let lastCheck = new Date().getTime();
        let lastCheckAdded = 0;
        let lastCheckCompleted = 0;
        let lastCheckFails = 0;
        let lastCheckRetries = 0;
        let avgAddedPerSecond = 0;
        let avgCompletedPerSecond = 0;
        let avgFailsPerSecond = 0;
        let avgRetriesPerSecond = 0;

        const meta = {
            name,
            registered: new Date(),
            added: 0,
            completed: 0,
            fails: 0,
            retries: 0,
            get avgAddedPerSecond() {
                return formatNumber(avgAddedPerSecond)
            },
            get avgCompletedPerSecond() {
                return formatNumber(avgCompletedPerSecond)
            },
            get avgFailsPerSecond() {
                return formatNumber(avgFailsPerSecond)
            },
            get avgRetriesPerSecond() {
                return formatNumber(avgRetriesPerSecond)
            },
            get remaining() {
                return meta.added - meta.completed
            },
            get percentCompleted() {
                return formatPercent(meta.completed / meta.added)
            },
            get msRemaining() {
                return Math.round(1000 * meta.remaining / avgCompletedPerSecond)
            },
            get eta() {
                return formatDuration(meta.msRemaining)
            },
        }
        bottlenecks.push(meta)
        bottleneck.on('received', () => meta.added += 1)
        bottleneck.on('done', () => meta.completed += 1)
        bottleneck.on('failed', () => meta.fails += 1)
        bottleneck.on('retries', () => meta.retries += 1)
        const interval = setInterval(() => {
            const now = new Date().getTime()
            const elapsed = now - lastCheck
            const addedChange = meta.added - lastCheckAdded
            const completedChange = meta.completed - lastCheckCompleted
            const failsChange = meta.fails - lastCheckFails
            const retriesChange = meta.retries - lastCheckRetries

            avgAddedPerSecond = getAvg(avgAddedPerSecond, addedChange, elapsed)
            avgCompletedPerSecond = getAvg(avgCompletedPerSecond, completedChange, elapsed)
            avgFailsPerSecond = getAvg(avgFailsPerSecond, failsChange, elapsed)
            avgRetriesPerSecond = getAvg(avgRetriesPerSecond, retriesChange, elapsed)
            lastCheckAdded = meta.added
            lastCheckCompleted = meta.completed
            lastCheckFails = meta.fails
            lastCheckRetries = meta.retries
            lastCheck = now
        }, checkInterval)
        intervals[name] = interval
    }

    function getStats() {
        return JSON.parse(JSON.stringify(bottlenecks))
    }

    function getProgress() {
        if (!bottlenecks.length) throw new Error(`No registered bottlenecks!`)
        const elapsed = new Date().getTime() - bottlenecks[0].registered.getTime()
        const remaining = bottlenecks.reduce((max, bottleneck) => Math.max(max, bottleneck.msRemaining), 0)
        const total = elapsed + remaining
        const completedTasks = bottlenecks.reduce((count, bottleneck) => count + bottleneck.completed, 0)
        const addedTasks = bottlenecks.reduce((count, bottleneck) => count + bottleneck.added, 0)
        return {
            tasks: { completed: completedTasks, remainig: addedTasks - completedTasks, total: addedTasks },
            elapsed: { human: formatDuration(elapsed), ms: stripNaN(elapsed) },
            remaining: { human: formatDuration(remaining), ms: stripNaN(remaining) },
            total: { human: formatDuration(total), ms: stripNaN(total) },
            percent: { human: formatPercent(elapsed / total), proportion: stripNaN(elapsed / total) },
        }
    }

    function stop() {
        for (let interval in intervals) {
            clearInterval(interval)
        }
    }

    return {
        configure,
        addBottleneck,
        getStats,
        getProgress,
        stop,
    }
}

module.exports = {
    formatDuration,
    formatPercent,
    formatNumber,
    stripNaN,
}

function formatDuration(ms) {
    if (isNaN(ms)) return ''
    if (ms < 1000) return `${Number(ms).toFixed(0)}ms`
    if (ms < 60 * 1000) return `${Number(ms / 1000).toFixed(0)}s`
    if (ms < 60 * 60 * 1000) return `${Number(ms / 60 / 1000).toFixed(0)}m`
    if (ms < 24 * 60 * 60 * 1000) return `${Number(ms / 60 / 60 / 1000).toFixed(0)}h`
    return `${Number(ms / 24 / 60 / 60 / 1000).toFixed(0)}d`
}

function formatPercent(proportion) {
    if (isNaN(proportion)) return ''
    return `${Number(100 * proportion).toFixed(1)}%`
}

function formatNumber(num) {
    if (isNaN(num)) return ''
    return Number(num).toFixed(1)
}

function stripNaN(num) {
    if (isNaN(num)) return 0
    return num
}

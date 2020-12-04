module.exports = {
    generateList,
    sleep
}

function generateList(num, obj={}) {
    const arr = []
    for (let i=0; i<num; i++) {
        arr.push(obj)
    }
    return arr
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

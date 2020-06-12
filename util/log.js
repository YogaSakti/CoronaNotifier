const moment = require('moment-timezone')

const log = (...message) => {
    console.log(`[${moment().tz('Asia/Jakarta').format('HH:mm:ss')}]`, ...message)
}

const logx = (...message) => {
    console.log(`[${moment().tz('Asia/Jakarta').format('HH:mm:ss')}] [EXEC]`, ...message)
}

const logy = (...message) => {
    console.log(`[${moment().tz('Asia/Jakarta').format('HH:mm:ss')}] [REVC]`, ...message)
}

const logz = (...message) => {
    console.log(`[${moment().tz('Asia/Jakarta').format('HH:mm:ss')}] [ADMIN]`, ...message)
}

const color = (text, color) => {
    switch (color) {
        case 'red':
            return '\x1b[31m' + text + '\x1b[0m'
        case 'blue':
            return '\x1b[35m' + text + '\x1b[0m'
        case 'yellow':
            return '\x1b[33m' + text + '\x1b[0m'
        default:
            return '\x1b[32m' + text + '\x1b[0m' // default is green
    }
}

module.exports = {
    c: {
        log,
        logx,
        logy,
        logz
    },
    color
}
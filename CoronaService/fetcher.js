/* eslint-disable no-async-promise-executor */
const fetch = require('node-fetch')
const moment = require('moment-timezone')
const { createWriteStream } = require('fs')
const { endpoints } = require('./data')
moment.locale('id')

async function GetImage (url, path) {
    const res = await fetch(url)
    const fileStream = createWriteStream(path)
    await new Promise((resolve, reject) => {
        res.body.pipe(fileStream)
        res.body.on('error', (err) => {
            reject(err)
        })
        fileStream.on('finish', function () {
            resolve()
        })
    })
};

async function getGlobal () {
    return new Promise(async (resolve, reject) => {
        await fetch(endpoints.Global)
            .then(response => response.json())
            .then(json => {
                const data = JSON.stringify({
                    confirmed: json.confirmed.value,
                    recovered: json.recovered.value,
                    deaths: json.deaths.value,
                    lastUpdate: moment(json.lastUpdate).format('LLLL')
                })
                resolve(data)
            })
            .catch((err) => {
                reject(err)
            })
    })
};

async function getCountry (id) {
    return new Promise(async (resolve, reject) => {
        await fetch(`${endpoints.Global}countries/${id}`)
            .then(response => response.json())
            .then(json => {
                const data = JSON.stringify({
                    confirmed: json.confirmed.value,
                    recovered: json.recovered.value,
                    deaths: json.deaths.value,
                    lastUpdate: moment(json.lastUpdate).format('LLLL')
                })
                resolve(data)
            })
            .catch((err) => {
                reject(err)
            })
    })
};

async function getHarian () {
    return new Promise(async (resolve, reject) => {
        await fetch(endpoints.statistikharian)
            .then(response => response.json())
            .then(json => {
                let result = json.features
                result = result.map(x => x.attributes)
                resolve(result)
            })
            .catch((err) => {
                reject(err)
            })
    })
};

async function getJabar () {
    return new Promise(async (resolve, reject) => {
        await fetch(endpoints.dataProvJabar)
            .then(response => response.json())
            .then(json => {
                const dateYerterday = moment().subtract(1, 'days').format('L').replace(/\//g, '-')
                const dateNow = moment().format('L').replace(/\//g, '-')
                const getbyDateNow = json.filter(x => x.tanggal === dateNow)
                const getbyDateYesterday = json.filter(x => x.tanggal === dateYerterday)
                const result = getbyDateNow.total_odp == null || getbyDateNow.total_pdp == null ? getbyDateYesterday : getbyDateNow
                console.log(result)
                resolve(result)
            })
            .catch((err) => {
                reject(err)
            })
    })
};

async function getBekasi () {
    return new Promise(async (resolve, reject) => {
        await fetch(endpoints.databekasi)
            .then(response => response.json())
            .then(json => {
                const result = json.Data[0]
                console.log(result)
                resolve(result)
            })
            .catch((err) => {
                reject(err)
            })
    })
};

async function getBandung () {
    return new Promise(async (resolve, reject) => {
        const options = {
            headers: {
              authority: 'covid19.bandung.go.id',
              authorization: 'RkplDPdGFxTSjARZkZUYi3FgRdakJy',
              'content-type': 'application/json',
              'sec-fetch-site': 'same-origin',
              'sec-fetch-mode': 'cors',
              referer: 'https://covid19.bandung.go.id/'
            }
          }
        await fetch(endpoints.dataBandung, options)
            .then(response => response.json())
            .then(json => {
                const result = json.data
                console.log(result)
                resolve(result)
            })
            .catch((err) => {
                reject(err)
            })
    })
};

// Promise.all([].map(u => fetch(u, {
//     headers: {
//     'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:75.0) Gecko/20100101 Firefox/75.0',
//     Accept: 'application/json',
//     'accept-language': 'en-US,en;q=0.5',
//     'cache-control': 'no-cache'
//   }
// }))).then(responses =>
//     Promise.all(responses.map(response => response.json()))
// ).then(json => {
//         const data = {
//         }
//         console.log(data)
// })

module.exports.GetImage = GetImage
module.exports.getBandung = getBandung
module.exports.getBekasi = getBekasi
module.exports.getJabar = getJabar

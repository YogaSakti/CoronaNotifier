/* eslint-disable no-async-promise-executor */
const fetch = require('node-fetch')
const moment = require('moment-timezone')
const cheerio = require('cheerio')
const {
    createWriteStream
} = require('fs')
const {
    endpoints
} = require('./data')
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
                const data = {
                    confirmed: json.confirmed.value.toLocaleString(),
                    recovered: json.recovered.value.toLocaleString(),
                    deaths: json.deaths.value.toLocaleString(),
                    lastUpdate: moment(json.lastUpdate).format('LLLL')
                }
                // console.log(data)
                resolve(data)
            })
            .catch((err) => {
                reject(err)
            })
    })
}

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
        await fetch(endpoints.statistikharianAll)
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
                const result = getbyDateNow.total_odp !== null && getbyDateNow.total_pdp !== null ? getbyDateNow : getbyDateYesterday
                // console.log(result[0])
                resolve(result[0])
            })
            .catch((err) => {
                reject(err)
            })
    })
};

async function getJateng () {
    return new Promise(async (resolve, reject) => {
        await fetch(endpoints.dataProvJateng)
            .then(response => response.text())
            .then(text => {
                const $ = cheerio.load(text)
                const dataInfo = $('p.text-detail')
                const dataPositifRed = $('h3.font-counter.fc-red')
                const dataPositifGreen = $('h3.font-counter.fc-green')
                const dataOdp = $('h3.font-counter.fc-ungu')
                const dataPdp = $('h3.font-counter.fc-orange')
                const result = {
                    sumber: dataInfo[1].children[0].next.data.trim(),
                    odp: parseFloat(dataOdp[0].children[0].data),
                    pdp: parseFloat(dataPdp[0].children[0].data),
                    positif_dirawat: parseInt(dataPositifRed[1].children[0].data),
                    positif_sembuh: parseInt(dataPositifGreen[0].children[0].data),
                    posituf_meninggal: parseInt(dataPositifRed[2].children[0].data),
                    total_positif: parseInt(dataPositifRed[0].children[0].data),
                    last_update: dataInfo[2].children[0].next.data.split('|')[0].trim()
                }
                // console.log(result)
                resolve(result)
            })
            .catch((err) => {
                reject(err)
            })
    })
};

async function getBekasiOld () {
    return new Promise(async (resolve, reject) => {
        await fetch(endpoints.dataBekasi)
            .then(response => response.json())
            .then(json => {
                const result = json.Data[0]
                // console.log(result)
                resolve(result)
            })
            .catch((err) => {
                reject(err)
            })
    })
};

async function getBekasi () {
    return new Promise(async (resolve, reject) => {
        await fetch(endpoints.dataBekasiNew)
        .then(res => res.text())
        .then(text => {
            const $ = cheerio.load(text)
            const dataInfo = $('div.col-md-12')
            const rawData = $('div.box-content')
            const dataTotal = []
            const dataDetail = []
            rawData.find('h1').each((i, element) => { dataTotal.push(parseInt($(element).text())) })
            rawData.find('div.align-right').each((i, element) => { dataDetail.push(parseInt($(element).text())) })
            const result = {
                odp: dataTotal[0],
                odp_dirawat: dataDetail[0],
                odp_selesai: dataDetail[1],
                pdp: dataTotal[1],
                pdp_dirawat: dataDetail[2],
                pdp_sembuh: dataDetail[3],
                total_positif: dataDetail[4],
                last_update: dataInfo.children('h2').find('strong[style="color:#fff"]').text().split(':')[1].trim()
            }
            // console.log(result)
            resolve(result)
        })
            .catch((err) => {
                reject(err)
            })
    })
};

async function getBogor () {
    return new Promise(async (resolve, reject) => {
        await fetch(endpoints.dataBogor)
        .then(res => res.text())
        .then(text => {
            const $ = cheerio.load(text)
            const dataInfo = $('div.panel-heading.head.bluedark')
            const rawData = $('div.inner')
            const data = []
            rawData.find('h3').each((index, element) => {
                const value = $(element).text()
                data.push(value)
            })
            const result = {
                sumber: dataInfo[1].children[1].children[3].children[0].data.split('|')[1].replace('Sumber: ', '').trim(),
                odp: data[0],
                odp_selesai: data[1],
                odp_dirawat: data[2],
                pdp: data[3],
                pdp_sembuh: data[4],
                pdp_dirawat: data[5],
                pdp_meninggal: data[6],
                total_positif: data[7],
                positif_sembuh: data[8],
                positif_dirawat: data[9],
                posituf_meninggal: data[10],
                last_update: `${dataInfo[1].children[1].children[1].children[0].data.trim()} | ${dataInfo[1].children[1].children[3].children[0].data.split('|')[0].trim()}`
            }
            // console.log(result)
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
                // console.log(result)
                resolve(result)
            })
            .catch((err) => {
                reject(err)
            })
    })
};

async function getBandungKec () {
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
        await fetch(endpoints.dataBandungKec, options)
            .then(response => response.json())
            .then(json => {
                let result = json.data
                const resArr = []
                result = result.list.map(x => {
                    resArr.push({
                        wilayah: x.wilayah,
                        odp: x.odp,
                        odp_selesai: x.odp_selesai,
                        pdp: x.pdp,
                        pdp_selesai: x.pdp_selesai,
                        sembuh: x.sembuh,
                        positif: x.positif,
                        positif_proaktif: x.positif_proaktif,
                        meninggal: x.meninggal
                    })
                })
                // console.log(resArr)
                resolve(result)
            })
            .catch((err) => {
                reject(err)
            })
    })
};

async function getWismaAtlit () {
    return new Promise(async (resolve, reject) => {
        await fetch(endpoints.dataWismaAtlit)
            .then(response => response.json())
            .then(json => {
                const result = json.data
                // console.log(result)
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

module.exports = {
    GetImage,
    getGlobal,
    getWismaAtlit,
    getBandung,
    getBandungKec,
    getBekasiOld,
    getBekasi,
    getJabar,
    getJateng,
    getBogor
}

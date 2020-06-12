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

async function fetchJson (url, options) {
    return new Promise(async (resolve, reject) => {
        await fetch(url, options)
            .then(response => response.json())
            .then(json => {
                // console.log(json)
                resolve(json)
            })
            .catch((err) => {
                reject(err)
            })
    })
};

async function fetchText (url, options) {
    return new Promise(async (resolve, reject) => {
        await fetch(url, options)
            .then(response => response.text())
            .then(text => {
                // console.log(text)
                resolve(text)
            })
            .catch((err) => {
                reject(err)
            })
    })
};

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
        await fetchJson(endpoints.Global)
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

async function getProv () {
    return new Promise(async (resolve, reject) => {
        await fetch(endpoints.dataProvinsi)
            .then(response => response.json())
            .then(json => {
                const data = json.list_data
                const except = ['doc_count', 'jenis_kelamin', 'kelompok_umur', 'lokasi']
                const listProv = data.map(x =>
                    Object.keys(x)
                    .filter(k => !except.includes(k))
                    .reduce((acc, key) => ((acc[key] = x[key]), acc), {})
                )
                const result = {
                    last_date: json.last_date,
                    data: listProv
                }
                console.log(result)
                resolve(result)
            })
    })
}

async function getJabar () {
    return new Promise(async (resolve, reject) => {
        await fetch(endpoints.dataProvjabar)
            .then(response => response.json())
            .then(json => {
                const result = json.data.content
                resolve(result)
            })
            .catch((err) => {
                reject(err)
            })
    })
};

async function getJateng () {
    return new Promise(async (resolve, reject) => {
        await fetchText(endpoints.dataProvJateng)
            .then(text => {
                const $ = cheerio.load(text)
                const dataInfo = $('p.text-detail')
                const dataODP = $('div.font-counter-2.fc-ungu')
                const dataPDP = $('div.font-counter-2.fc-orange')
                const result = {
                    odp: $('h3.font-counter.fc-ungu').text().trim(),
                    odp_diPantau: dataODP[0].children[0].data.trim(),
                    odp_selesaiPantau: dataODP[1].children[0].data.trim(),
                    pdp: $('h3.font-counter.fc-orange').text().trim(),
                    pdp_diRawat: dataPDP[0].children[0].data.trim(),
                    pdp_selesaiRawat: dataPDP[1].children[0].data.trim(),
                    pdp_meninggal: dataPDP[2].children[0].data.trim(),
                    total_positif: $('h3.font-counter.fc-red').text().trim(),
                    positif_dirawat: $('div.font-counter-2.fc-red').text().trim().split(' ')[0],
                    positif_sembuh: $('div.font-counter-2.fc-green').text().trim().split(' ')[0],
                    positif_meninggal: $('div.font-counter-2.text-black').text().trim().split(' ')[0],
                    last_update: dataInfo[1].children[1].data.split('|')[0].trim() + ' | Pukul: ' + dataInfo[1].children[1].data.split('|')[1].split('*')[0].trim()
                }
                // console.log(result)
                resolve(result)
            })
            .catch((err) => {
                reject(err)
            })
    })
};

async function getJatim () {
    return new Promise(async (resolve, reject) => {
        await fetchText(endpoints.dataProvJatim)
            .then(text => {
                const $ = cheerio.load(text)
                const getScript = $('script')[10].children[0].data
                const DataKabupaten = JSON.parse(getScript.match(/\[(.{100,}?)\]/)[0])
                const daftarKab = []
                const data = {
                    odr: 0,
                    odp: 0,
                    odp_belumdipantau: 0,
                    odp_pantau: 0,
                    odp_isolasidirumah: 0,
                    odp_isolasidigedung: 0,
                    odp_isolasidirs: 0,
                    odp_selesai: 0,
                    odp_meninggal: 0,
                    pdp: 0,
                    pdp_dirawat: 0,
                    pdp_isolasidirumah: 0,
                    pdp_isolasidigedung: 0,
                    pdp_isolasidirs: 0,
                    pdp_sehat: 0,
                    pdp_meninggal: 0,
                    confirm: 0,
                    sembuh: 0,
                    confirm_dirawat: 0,
                    confirm_isolasidirumah: 0,
                    confirm_isolasidigedung: 0,
                    confirm_isolasidirs: 0,
                    meninggal: 0,
                    updated_at: ''
                }

                DataKabupaten.forEach(kab => {
                    if (daftarKab.indexOf(kab.kabko) == -1) {
                        daftarKab.push(kab.kabko)
                        for (key in data) {
                            if (key !== 'lastUpdate') {
                                data[key] += parseInt(kab[key])
                            }
                        }
                        data.updated_at = kab.updated_at
                    }
                })
                // console.log(data)
                resolve(data)
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
    getProv,
    getBandung,
    getJabar,
    getJateng,
    getJatim
}

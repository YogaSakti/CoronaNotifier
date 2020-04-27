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
        await fetch(endpoints.statistikHarianAll)
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

async function getProv () {
    return new Promise(async (resolve, reject) => {
        const response = await fetch(endpoints.dataKemkes)
        const resCookie = await response.headers.get('set-cookie').split(' ')
        const Cookie = `${resCookie[0]}${resCookie[7].replace(';', '')}`
        const $ = cheerio.load(await response.text())
        const csrfToken = $("meta[name='csrf-token']").attr('content')
        const getData = await fetch(`${endpoints.dataKemkes}/emerging/data_provinces`, {
            method: 'POST',
            headers: {
                Cookie,
                'X-CSRF-TOKEN': csrfToken,
                'Content-Type': 'application/x-www-form-urlencoded',
                Accept: 'application/json, text/javascript, */*; q=0.01'
            },
            body: 'emerging=COVID-19'
        })
        const data = await getData.json()

        const arrProv = []
        let odp = 0
        let pdp = 0
        if (data.features.length > 34) {
            for (var i = 34; i < data.features.length; i++) {
                const x = data.features
                delete x[i].properties.latitude
                delete x[i].properties.longitude
                arrProv.push(x[i].properties)
                parseInt(x[i].properties.total_odp) ? odp += x[i].properties.total_odp : ''
                parseInt(x[i].properties.total_pdp) ? pdp += x[i].properties.total_pdp : ''
            }
        } else {
            data.features.map((x) => {
                arrProv.push(x.properties)
                delete x.properties.latitude
                delete x.properties.longitude
                parseInt(x.properties.total_odp) ? odp += x.properties.total_odp : ''
                parseInt(x.properties.total_pdp) ? pdp += x.properties.total_pdp : ''
            })
        }
        const topCase = [...arrProv.sort((a, b) => b.total_case - a.total_case).slice(0, 5)].map((x) => { return { provinsi: x.provinsi, total_case: x.total_case } })
        const topRecover = [...arrProv.sort((a, b) => b.total_recover - a.total_recover).slice(0, 5)].map((x) => { return { provinsi: x.provinsi, total_recover: x.total_recover } })
        const topDied = [...arrProv.sort((a, b) => b.total_died - a.total_died).slice(0, 5)].map((x) => { return { provinsi: x.provinsi, total_died: x.total_died } })
        const result = {
            result: arrProv.sort((a, b) => a.id - b.id),
            top: {
                topCase,
                topRecover,
                topDied
            },
            total: {
                prov: arrProv.length,
                odp: odp,
                pdp: pdp
            }
        }
        console.log(result)
        resolve(result)
    })
}

getProv()

async function getJabar () {
    return new Promise(async (resolve, reject) => {
        await fetch(endpoints.dataProvjabarV2)
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
                const dataPositifRed = $('div.font-counter.fc-red')
                const dataPositifGreen = $('div.font-counter.fc-green')
                const dataOdp = $('h3.font-counter.fc-ungu')
                const dataPdp = $('h3.font-counter.fc-orange')
                const result = {
                    sumber: dataInfo[0].children[1].data.trim(),
                    odp: parseFloat(dataOdp[0].children[0].data),
                    pdp: parseFloat(dataPdp[0].children[0].data),
                    positif_dirawat: parseInt(dataPositifRed[1].children[0].data),
                    positif_sembuh: parseInt(dataPositifGreen[0].children[0].data),
                    positif_meninggal: parseInt(dataPositifRed[2].children[0].data),
                    total_positif: parseInt(dataPositifRed[0].children[0].data),
                    last_update: dataInfo[1].children[1].data.split('|')[0].trim() + '| Pukul: ' + dataInfo[1].children[1].data.split('|')[1].split('*')[0].trim()
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
                const getScript = $('script')[9].children[0].data
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

async function getjakarta () {
    return new Promise(async (resolve, reject) => {
        await fetch(endpoints.dataProvDKIJakarta)
            .then(response => response.json())
            .then(json => {
                const result = json.features.map(x => x.attributes)
                resolve(result[0])
            })
            .catch((err) => {
                reject(err)
            })
    })
};

async function getBekasi () {
    return new Promise(async (resolve, reject) => {
        await fetch(endpoints.dataBekasi)
            .then(res => res.text())
            .then(text => {
                const $ = cheerio.load(text)
                const dataTotal = []
                const dataDetail = []
                $('div.box-content').find('h1').each((i, e) => {
                    dataTotal.push(parseInt($(e).text().replace(' Orang', '').trim().split(',').join('')))
                })
                $('div.box-content').find('div.align-right').each((i, e) => {
                    dataDetail.push(parseInt($(e).text().replace(' Orang', '').trim().split(',').join('')))
                })
                const result = {
                    odp: dataTotal[0],
                    odp_dirawat: dataDetail[0],
                    odp_selesai: dataDetail[1],
                    pdp: dataTotal[1],
                    pdp_dirawat: dataDetail[2],
                    pdp_sembuh: dataDetail[3],
                    total_positif: dataDetail[4],
                    positif_sembuh: dataDetail[5],
                    last_update: $('div.col-md-12').children('h2').find('strong[style="color:#fff"]').text().split(':')[1].trim()
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
    getBekasi,
    getJabar,
    getJateng,
    getJatim,
    getjakarta
}

require('dotenv').config()
const { forever } = require('async')
const { readFile, writeFile } = require('fs')
const { GetImage } = require('./fetcher')
const { endpoints } = require('./data')
const moment = require('moment-timezone')
const fetch = require('node-fetch')
const mqtt = require('mqtt')
const client = mqtt.connect(process.env.MQTT_URL)
moment.locale('id')

console.log(`[ ${moment().tz('Asia/Jakarta').format('HH:mm:ss')} ] Start checking data on API...`)

client.on('connect', () => {
    client.subscribe(process.env.MQTT_TOPIC, function (err) {
        if (!err) {
            console.log(`[ ${moment().tz('Asia/Jakarta').format('HH:mm:ss')} ] Mqtt topic [${process.env.MQTT_TOPIC}] subscribed!`)
        }
    })
})

forever(
    async function () {
            GetImage(endpoints.ogGlobal, './CoronaService/corona.png')
            await fetch(endpoints.indoHarian)
                .then(response => response.json())
                .then(json => {
                    let result = json.data
                    const resmin = result[result.length - 2]
                    result = result[result.length - 1]
                    console.log(result)
                    if (result.jumlahKasusKumulatif == null && result.jumlahpasiendalamperawatan == null && result.jumlahPasienMeninggal == null && result.jumlahPasienSembuh == null) {
                        console.log(`[ ${moment().tz('Asia/Jakarta').format('HH:mm:ss')} ] No Update on Data.json`)
                    } else {
                        readFile('./CoronaService/data.json', 'utf-8', function (err, data) {
                            if (err) throw err
                            const localData = JSON.parse(data)
                            const OnlineData = {
                                Country: 'Indonesia',
                                TotalCases: result.jumlahKasusKumulatif,
                                NewCases: `+${result.jumlahKasusBaruperHari}`,
                                ActiveCases: result.jumlahpasiendalamperawatan,
                                TotalDeaths: result.jumlahPasienMeninggal,
                                NewDeaths: result.jumlahPasienMeninggal - resmin.jumlahPasienMeninggal < 0 ? '+0' : `+${result.jumlahPasienMeninggal - resmin.jumlahPasienMeninggal}`,
                                TotalRecovered: result.jumlahPasienSembuh,
                                NewRecovered: result.jumlahPasienSembuh - resmin.jumlahPasienSembuh < 0 ? '+0' : `+${result.jumlahPasienSembuh - resmin.jumlahPasienSembuh}`,
                                PresentaseRecovered: `${(result.jumlahPasienSembuh / result.jumlahKasusKumulatif * 100).toFixed(2)}%`,
                                PresentaseDeath: `${(result.jumlahPasienMeninggal / result.jumlahKasusKumulatif * 100).toFixed(2)}%`,
                                lastUpdate: `${moment().tz('Asia/Jakarta').format('LLLL').replace('pukul', '|')} WIB`
                            }
                            if (OnlineData.TotalCases !== localData.TotalCases || OnlineData.TotalDeaths !== localData.TotalDeaths || OnlineData.TotalRecovered !== localData.TotalRecovered || OnlineData.ActiveCases !== localData.ActiveCases) {
                                writeFile('./CoronaService/data.json', JSON.stringify(OnlineData), 'utf-8', function (err) {
                                    if (err) throw err
                                    console.log(`[ ${moment().tz('Asia/Jakarta').format('HH:mm:ss')} ] New Update on Data.json`)
                                    client.publish(process.env.MQTT_TOPIC, 'New Update!')
                                })
                            } else {
                                console.log(`[ ${moment().tz('Asia/Jakarta').format('HH:mm:ss')} ] No Update on Data.json`)
                            }
                        })
                    }
                })
                .then(x => new Promise(resolve => setTimeout(() => resolve(x), 600000))) // Delay for 10 minutes.
                .catch((err) => {
                    console.log(`[ ${moment().tz('Asia/Jakarta').format('HH:mm:ss')} ] Error: ${err}`)
                })
        },
        function (err) {
            console.log(`[ ${moment().tz('Asia/Jakarta').format('HH:mm:ss')} ] Error: ${err}`)
        })

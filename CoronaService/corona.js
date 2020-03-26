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
            // GetImage(endpoints.ogGlobal, './CoronaService/corona.png')
            await fetch(endpoints.statistikharian)
                .then(response => response.json())
                .then(json => {
                    let result = json.features
                    const resmin = result[1].attributes
                    result = result[0].attributes
                    if (result.Jumlah_Kasus_Kumulatif == null && result.Jumlah_pasien_dalam_perawatan == null && result.Jumlah_Pasien_Meninggal == null && result.Jumlah_Pasien_Sembuh == null) {
                        console.log(`[ ${moment().tz('Asia/Jakarta').format('HH:mm:ss')} ] No Update on Data.json`)
                    } else {
                        readFile('./CoronaService/data.json', 'utf-8', function (err, data) {
                            if (err) throw err
                            const localData = JSON.parse(data)
                            const OnlineData = {
                                Country: 'Indonesia',
                                Day: result.Hari_ke,
                                TotalCases: result.Jumlah_Kasus_Kumulatif,
                                NewCases: `+${result.Jumlah_Kasus_Baru_per_Hari}`,
                                ActiveCases: result.Jumlah_pasien_dalam_perawatan,
                                NewActiveCases: `+${result.Jumlah_Kasus_Dirawat_per_Hari}`,
                                TotalDeaths: result.Jumlah_Pasien_Meninggal,
                                NewDeaths: result.Jumlah_Pasien_Meninggal - resmin.Jumlah_Pasien_Meninggal < 0 ? '+0' : `+${result.Jumlah_Pasien_Meninggal - resmin.Jumlah_Pasien_Meninggal}`,
                                TotalRecovered: result.Jumlah_Pasien_Sembuh,
                                NewRecovered: result.Jumlah_Pasien_Sembuh - resmin.Jumlah_Pasien_Sembuh < 0 ? '+0' : `+${result.Jumlah_Pasien_Sembuh - resmin.Jumlah_Pasien_Sembuh}`,
                                PresentaseRecovered: `${(result.Jumlah_Pasien_Sembuh / result.Jumlah_Kasus_Kumulatif * 100).toFixed(2)}%`,
                                PresentaseDeath: `${(result.Jumlah_Pasien_Meninggal / result.Jumlah_Kasus_Kumulatif * 100).toFixed(2)}%`,
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

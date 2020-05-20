require('dotenv').config()
const {
    forever
} = require('async')
const {
    readFile,
    writeFile
} = require('fs')
const {
    endpoints
} = require('../util/data')
const {
    getProv
} = require('../util/fetcher')
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
            await fetch(endpoints.statistikHarian, {
                    cache: 'reload'
                })
                .then(response => response.json())
                .then(json => {
                    let result = json.features
                    const firstDay = result[0].attributes
                    result = result[result.length - 1].attributes
                    if (result.Jumlah_Kasus_Kumulatif == null && result.Jumlah_pasien_dalam_perawatan == null && result.Jumlah_Pasien_Meninggal == null && result.Jumlah_Pasien_Sembuh == null) {
                        console.log(`[ ${moment().tz('Asia/Jakarta').format('HH:mm:ss')} ] No Update on Data.json`)
                    } else {
                        readFile('./CoronaService/data.json', 'utf-8', function (err, data) {
                            if (err) throw err
                            const localData = JSON.parse(data)
                            const OnlineData = {
                                Country: 'Indonesia',
                                Day: result.Hari_ke,
                                ProvinsiTerdampak: firstDay.Jumlah_Provinsi_Terdampak,
                                KabKotTerdampak: firstDay.Jumlah_KabKot_Terdampak,
                                TotalODP: result.ODP,
                                TotalPDP: result.PDP,
                                TotalCases: result.Jumlah_Kasus_Kumulatif,
                                NewCases: `+${result.Jumlah_Kasus_Baru_per_Hari}`,
                                ActiveCases: result.Jumlah_pasien_dalam_perawatan,
                                NewActiveCases: `+${result.Jumlah_Kasus_Dirawat_per_Hari}`,
                                TotalDeaths: result.Jumlah_Pasien_Meninggal,
                                NewDeaths: `+${result.Jumlah_Kasus_Meninggal_per_Hari}`,
                                TotalRecovered: result.Jumlah_Pasien_Sembuh,
                                NewRecovered:  `+${result.Jumlah_Kasus_Sembuh_per_Hari}`,
                                PresentaseRecovered: `${(result.Jumlah_Pasien_Sembuh / result.Jumlah_Kasus_Kumulatif * 100).toFixed(2)}%`,
                                PresentaseDeath: `${(result.Jumlah_Pasien_Meninggal / result.Jumlah_Kasus_Kumulatif * 100).toFixed(2)}%`,
                                lastUpdate: `${moment().tz('Asia/Jakarta').format('LLLL').replace('pukul', '|')} WIB`

                            }
                            console.log(OnlineData)
                            if (OnlineData.TotalCases !== localData.TotalCases || OnlineData.TotalDeaths !== localData.TotalDeaths || OnlineData.TotalRecovered !== localData.TotalRecovered || OnlineData.ActiveCases !== localData.ActiveCases) {
                                writeFile('./CoronaService/data.json', JSON.stringify(OnlineData), 'utf-8', function (err) {
                                    if (err) throw err
                                    console.log(`[ ${moment().tz('Asia/Jakarta').format('HH:mm:ss')} ] New Update on Data.json`)
                                    client.publish(process.env.MQTT_TOPIC, 'New Update!')
                                })
                            } else {
                                // readFile('./CoronaService/data.json', 'utf-8', function (err, data) {
                                //     if (err) throw err
                                //     const localData = JSON.parse(data)
                                //     localData.ProvinsiTerdampak = dataProv.total.prov
                                //     localData.TotalODP = dataProv.total.odp
                                //     localData.TotalPDP = dataProv.total.pdp
                                //     writeFile('./CoronaService/data.json', JSON.stringify(localData), 'utf-8', function (err) {
                                //         if (err) throw err
                                //     })
                                // })
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
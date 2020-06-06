require('dotenv').config()
const { forever } = require('async')
const { readFile, writeFile } = require('fs')
const { endpoints } = require('../util/data')
const moment = require('moment-timezone')
const fetch = require('node-fetch')
const mqtt = require('mqtt')
const client = mqtt.connect(process.env.MQTT_URL)
moment.locale('id')

client.on('connect', () => {
    client.subscribe(process.env.MQTT_TOPIC, function (err) {
        if (!err) {
            console.log(`[ ${moment().tz('Asia/Jakarta').format('HH:mm:ss')} ] Mqtt topic [${process.env.MQTT_TOPIC}] subscribed!`)
        }
    })
})

console.log(`[ ${moment().tz('Asia/Jakarta').format('HH:mm:ss')} ] Start checking data on API...`)
forever(
    async function () {
            await fetch(endpoints.dataUpdate, { cache: 'reload' })
                .then(response => response.json())
                .then(json => {
                    const now = moment().tz('Asia/Jakarta').format('YYYY-MM-DD')
                    const update = json.update.penambahan
                    const total = json.update.total
                    const lain = json.data
                    const harian = [...json.update.harian]
                    if (update.tanggal == now) {
                        readFile('./CoronaService/data.json', 'utf-8', function (err, data) {
                            if (err) throw err
                            const localData = JSON.parse(data)
                            const cloudData = {
                                Country: 'Indonesia',
                                Day: harian.length,
                                //
                                TotalODP: lain.jumlah_odp,
                                TotalPDP: lain.jumlah_pdp,
                                TotalSpesimen: lain.total_spesimen,
                                TotalSpesimenNegatif: lain.total_spesimen_negatif,
                                //
                                TotalCases: total.jumlah_positif,
                                NewCases: `+${update.jumlah_positif}`,
                                //
                                ActiveCases: total.jumlah_dirawat,
                                NewActiveCases: `+${update.jumlah_dirawat}`,
                                //
                                TotalRecovered: total.jumlah_sembuh,
                                NewRecovered: `+${update.jumlah_sembuh}`,
                                PresentaseRecovered: `${(total.jumlah_sembuh / total.jumlah_positif * 100).toFixed(2)}%`,
                                //
                                TotalDeaths: total.jumlah_meninggal,
                                NewDeaths: `+${update.jumlah_meninggal}`,
                                PresentaseDeath: `${(total.jumlah_meninggal / total.jumlah_positif * 100).toFixed(2)}%`,
                                //
                                lastUpdate: `${moment(update.created).format('LLLL')} WIB`
                            }
                            // console.log(cloudData)
                            if (cloudData.TotalCases !== localData.TotalCases || cloudData.TotalDeaths !== localData.TotalDeaths || cloudData.TotalRecovered !== localData.TotalRecovered || cloudData.ActiveCases !== localData.ActiveCases) {
                                writeFile('./CoronaService/data.json', JSON.stringify(cloudData), 'utf-8', function (err) {
                                    if (err) throw err
                                    console.log(`[ ${moment().tz('Asia/Jakarta').format('HH:mm:ss')} ] New Update on ${cloudData.lastUpdate}`)
                                    // client.publish(process.env.MQTT_TOPIC, 'New Update!')
                                })
                            }
                        })
                    } else {
                        console.log(`[ ${moment().tz('Asia/Jakarta').format('HH:mm:ss')} ] No Update on ${moment().format('LL')}`)
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

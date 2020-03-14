const async = require('async');
const fs = require('fs');
const moment = require('moment')
const {
    Tabletojson: tabletojson
} = require('tabletojson');

const mqtt = require('mqtt')
const client = mqtt.connect('mqtt://test.mosquitto.org')

client.on('connect', () => {
    client.subscribe('corona', function (err) {
        if (!err) {
            console.log(`[ ${moment().format('HH:mm:ss')} ] Mqtt subscribed!`)
        }
    })
})

async.forever(
    function (next) {
        tabletojson.convertUrl('https://www.worldometers.info/coronavirus/', {
                useFirstRowForHeadings: true
            },
            function (tablesAsJson) {
                var jsonData = JSON.parse(JSON.stringify(tablesAsJson).split('"Country,Other":').join('"Country":'));
                jsonData = JSON.parse(JSON.stringify(jsonData).split('"Serious,Critical":').join('"Critical":'));
                var search = jsonData[0].filter(x => x.Country === "Indonesia");
                const result = search[0]
                fs.readFile('./CoronaService/data.json', 'utf-8', function (err, data) {
                    if (err) throw err
                    const localData = JSON.parse(data)
                    if (result.TotalCases !== localData.TotalCases || result.TotalDeaths !== localData.TotalDeaths || result.TotalRecovered !== localData.TotalRecovered) {
                        fs.writeFile('./CoronaService/data.json', JSON.stringify(result), 'utf-8', function (err) {
                            if (err) throw err
                            console.log(`[ ${moment().format('HH:mm:ss')} ] New Update on Data.json`)
                            client.publish('corona', 'New Update!')
                        })
                    } else {
                        console.log(`[ ${moment().format('HH:mm:ss')} ] No Update on Data.json`)
                    }
                })
                setTimeout(function () {
                    next();
                }, 300000)
                // Delay for 5 minutes.
            }
        );

    },
    function (err) {
        console.log(`[ ${moment().format('HH:mm:ss')} ] Error: ${err}`)
    });
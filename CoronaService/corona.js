const request = require('request');
const async = require('async');
const fs = require('fs');
const scraper = require('table-scraper');
const moment = require('moment')

const mqtt = require('mqtt')
const client = mqtt.connect('mqtt://test.mosquitto.org')

client.on('connect', function () {
    client.subscribe('corona', function (err) {
        if (!err) {
            console.log(`[ ${moment().format('HH:mm:ss')} ] Mqtt subscribed!`)
        }
    })
})

async.forever(
    function (next) {
        // const options = {
        //     'method': 'GET',
        //     'url': 'https://services1.arcgis.com/0MSEUqKaxRlEPj5g/arcgis/rest/services/ncov_cases/FeatureServer/2/query?f=json&where=Confirmed+%3E+0&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=*&orderByFields=Confirmed+desc&resultOffset=0&resultRecordCount=200&cacheHint=true',
        //     'headers': {}
        // };
        // request(options, function (error, response) {
        //     if (error) throw new Error(error);
        //     const parseBody = JSON.parse(response.body)
        //     const filterBody = parseBody.features.filter(feature => feature.attributes.Country_Region === 'Indonesia');
        //     const result = filterBody[0].attributes
        //     //read, check, udpdate data from local json file.
        //     fs.readFile('./CoronaService/data.json', 'utf-8', function (err, data) {
        //         if (err) throw err
        //         const localData = JSON.parse(data)
        //         if (result.Last_Update !== localData.Last_Update) {
        //             fs.writeFile('./CoronaService/data.json', JSON.stringify(result), 'utf-8', function (err) {
        //                 if (err) throw err
        //                 console.log('New Update on Data.json')
        //                 client.publish('corona', 'New Update!')
        //             })
        //         } else {
        //             console.log('No Update on Data.json')
        //         }
        //     })
        //      setTimeout(function () {
        //     next();
        // }, 600000)
        // // Delay for 10 minutes.
        // });

        scraper
            .get('https://www.worldometers.info/coronavirus/')
            .then(function (tableData) {
                jsonData = JSON.parse(JSON.stringify(tableData).split('"Country,Other":').join('"Country":'));
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
            });

    },
    function (err) {
        console.error(err);
    });
    
const request = require('request');
const async = require('async');
const fs = require('fs');

async.forever(
    function (next) {
        const options = {
            'method': 'GET',
            'url': 'https://services1.arcgis.com/0MSEUqKaxRlEPj5g/arcgis/rest/services/ncov_cases/FeatureServer/2/query?f=json&where=Confirmed+%3E+0&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=*&orderByFields=Confirmed+desc&resultOffset=0&resultRecordCount=200&cacheHint=true',
            'headers': {}
        };
        request(options, function (error, response) {
            if (error) throw new Error(error);
            const parseBody = JSON.parse(response.body)
            const filterBody = parseBody.features.filter(feature => feature.attributes.Country_Region === 'Indonesia');
            const result = filterBody[0].attributes

            fs.readFile('./CoronaService/data.json', 'utf-8', function (err, data) {
                if (err) throw err
                const localData = JSON.parse(data)
                if (result.Last_Update !== localData.Last_Update) {
                    fs.writeFile('./CoronaService/data.json', JSON.stringify(result), 'utf-8', function (err) {
                        if (err) throw err
                        console.log('New Update on Data.json')
                    })
                }else{
                    console.log('No Update on Data.json')
                }
            })
            setTimeout(function () {
                next();
            }, 600000)
            // Delay for 10 seconds
        });

    },
    function (err) {
        console.error(err);
    }
);
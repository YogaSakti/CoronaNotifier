var scraper = require('table-scraper');
const fs = require('fs');
scraper
    .get('https://www.worldometers.info/coronavirus/')
    .then(function (tableData) {
        jsonData = JSON.parse(JSON.stringify(tableData).split('"Country,Other":').join('"Country":'));
        jsonData = JSON.parse(JSON.stringify(jsonData).split('"Serious,Critical":').join('"Critical":'));
        var search = jsonData[0].filter(x => x.Country === "Indonesia");
        // console.log(result[0])
        const result = search[0]
        fs.readFile('./CoronaService/data.json', 'utf-8', function (err, data) {
            if (err) throw err
            const localData = JSON.parse(data)
            if (result.TotalCases !== localData.TotalCases || result.TotalDeaths !== localData.TotalDeaths || result.TotalRecovered !== localData.TotalRecovered) {
                fs.writeFile('./CoronaService/data.json', JSON.stringify(result), 'utf-8', function (err) {
                    if (err) throw err
                    console.log('New Update on Data.json')
                    // client.publish('corona', 'New Update!')
                })
            } else {
                console.log('No Update on Data.json')
            }
        })
    });
    
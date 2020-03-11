var scraper = require('table-scraper');
scraper
    .get('https://www.worldometers.info/coronavirus/')
    .then(function (tableData) {
        jsonData = JSON.parse(JSON.stringify(tableData).split('"Country,Other":').join('"Country":'));
        jsonData = JSON.parse(JSON.stringify(jsonData).split('"Serious,Critical":').join('"Critical":'));
        var search = jsonData[0].filter(x => x.Country === "Indonesia");
        // console.log(jsonData[0])
        console.log(search)
    });
    
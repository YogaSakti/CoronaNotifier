const fetch = require('node-fetch');
const moment = require('moment')
moment.locale('id');

async function getGlobal() {
    return new Promise(async (resolve, reject) => {
        await fetch('https://covid19.mathdro.id/api')
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
                reject(err);
            })
    });
};

async function getCountry(id) {
    return new Promise(async (resolve, reject) => {
        await fetch(`https://covid19.mathdro.id/api/countries/${id}`)
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
                reject(err);
            })
    });
};

async function getAll() {
    return new Promise(async (resolve, reject) => {
        var CoronaData = []
        await fetch(`https://covid19.mathdro.id/api/countries/id`)
            .then(response => response.json())
            .then(json => {
                const data = JSON.stringify({
                    confirmed: json.confirmed.value,
                    recovered: json.recovered.value,
                    deaths: json.deaths.value,
                    lastUpdate: moment(json.lastUpdate).format('LLLL')
                })
                var GetData = JSON.parse(data)
                CoronaData.push(GetData)
            })
            .catch((err) => {
                reject(err);
            })

        await fetch('https://covid19.mathdro.id/api')
            .then(response => response.json())
            .then(json => {
                const data = JSON.stringify({
                    confirmed: json.confirmed.value,
                    recovered: json.recovered.value,
                    deaths: json.deaths.value,
                    lastUpdate: moment(json.lastUpdate).format('LLLL')
                })
                var GetData = JSON.parse(data)
                CoronaData.push(GetData)
            })
            .catch((err) => {
                reject(err);
            })

        resolve(CoronaData)

    });
};

module.exports.getAll = getAll;
// module.exports.getGlobal = getGlobal;
// module.exports.getCountry = getCountry;
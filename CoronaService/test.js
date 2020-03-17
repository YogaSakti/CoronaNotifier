const fetch = require('node-fetch');
const fs = require('fs');

async function downloadFile(url, path) {
    const res = await fetch(url);
    const fileStream = fs.createWriteStream(path);
    await new Promise((resolve, reject) => {
        res.body.pipe(fileStream);
        res.body.on("error", (err) => {
            reject(err);
        });
        fileStream.on("finish", function () {
            resolve();
        });
    });
};

downloadFile('https://covid19.mathdro.id/api/og','./CoronaService/corona.png')

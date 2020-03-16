const fs = require('fs');
const json = require('./CoronaService/user.json');

function checkUser(nomor) {
    return new Promise((resolve, reject) => {
        fs.readFile('./CoronaService/user.json', 'utf-8', function (err, data) {
            if (err) reject(err)
            const userData = JSON.parse(data)
            var search = userData.filter(x => x.user === nomor);
            if (search.some((val) => {
                        return Object.keys(val).includes('user');
                })) {
                resolve(true)
            } {
                resolve(false)
            }

        })
    });
}

function addUser(user) {
    return new Promise((resolve, reject) => {
        json.push({
            user
        })
        checkUser(user).then(result => {
            if(result){
                resolve(false)
            }else{
                fs.writeFile('./CoronaService/user.json', JSON.stringify(json), (err) => {
                    if (err) reject(err)
                    resolve(true)
                })
            }
        })

    });
}

function removeUser(user) {
    return new Promise((resolve, reject) => {

    });
}

module.exports.addUser = addUser;

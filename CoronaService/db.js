/* eslint-disable prefer-promise-reject-errors */
const MongoClient = require('mongodb').MongoClient
const moment = require('moment-timezone')
// MongoDB Initialize
const DB_OPTIONS = {
    poolSize: 50,
    keepAlive: 15000,
    socketTimeoutMS: 15000,
    connectTimeoutMS: 15000,
    useNewUrlParser: true,
    useUnifiedTopology: true
}
const DB_URL = 'mongodb+srv://'
const DB_NAME = ''
const DB_COLLECTION = ''

const DB = () => new Promise((resolve, reject) => {
        MongoClient.connect(DB_URL, DB_OPTIONS, function (err, client) {
            if (err) throw err
            console.log(`[ ${moment().tz('Asia/Jakarta').format('HH:mm:ss')} ] Connected successfully to Database.`)
            resolve(client.db(DB_NAME)) // .collection(DB_COLLECTION)
        })
    })

// Fungsi input data registrasi
const insertDataUsers = (db, author) => new Promise((resolve, reject) => {
    const allRecords = db.collection(DB_COLLECTION).insertOne({
        phone_number: author
    })
    if (!allRecords) {
        reject('Error Mongo', allRecords)
    } else {
        resolve(allRecords)
    }
})

// Fungsi hapus data registrasi
const deleteDataUsers = (db, author) => new Promise((resolve, reject) => {
    const allRecords = db.collection(DB_COLLECTION).findOneAndDelete({
        phone_number: author
    })
    if (!allRecords) {
        reject('Error Mongo', allRecords)
    } else {
        resolve(allRecords)
    }
})

// Fungsi membaca data registrasi
const getDataUsers = (db, author) => new Promise((resolve, reject) => {
    const allRecords = db.collection(DB_COLLECTION).find({
        phone_number: author
    }).toArray()
    if (!allRecords) {
        reject('Error Mongo', allRecords)
    } else {
        resolve(allRecords)
    }
})

// Fungsi membaca semua data registrasi
const getAllDataUsers = (db) => new Promise((resolve, reject) => {
    const allRecords = db.collection(DB_COLLECTION).find({}).toArray()
    if (!allRecords) {
        reject('Error Mongo', allRecords)
    } else {
        resolve(allRecords)
    }
})

// Json to DB
// const User = require('./../user/user.json')
// async function insertToDB () {
//     return new Promise(async (resolve, reject) => {
//         // const dbClient = await MongoClient.connect(DB_CONN, DB_OPTIONS)
//         // const db = dbClient.db('bot')
//         // console.log('Database ready!')
//         for (var i = 0; i < User.length; i++) {
//             const dbDataUsers = await getDataUsers(db, User[i].user)
//             if (dbDataUsers.length < 1) {
//                 //   insertDataUsers(db, User[i].user)
//                 console.log(`Nomor ${User[i].user} ditambahkan ke database`)
//             } else {
//                 console.log('Nomor sudah ada di database')
//             }
//         }
//     })
// };

module.exports = {
    insertDataUsers,
    deleteDataUsers,
    getDataUsers,
    getAllDataUsers,
    DB
}

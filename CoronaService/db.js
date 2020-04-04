/* eslint-disable prefer-promise-reject-errors */
// MongoDB Initialize
const DB_OPTIONS = { poolSize: 50, keepAlive: 15000, socketTimeoutMS: 15000, connectTimeoutMS: 15000, useNewUrlParser: true, useUnifiedTopology: true }
const DB_CONN = 'mongodb+srv://...' // Connection String MongoDB
const DB_COLL = '...'

// Fungsi input data registrasi
const insertDataUsers = (db, author) => new Promise((resolve, reject) => {
    const allRecords = db.collection(DB_COLL).insertOne({ phone_number: author })
    if (!allRecords) {
        reject('Error Mongo', allRecords)
    } else {
        resolve(allRecords)
    }
})

// Fungsi hapus data registrasi
const deleteDataUsers = (db, author) => new Promise((resolve, reject) => {
    const allRecords = db.collection(DB_COLL).findOneAndDelete({ phone_number: author })
    if (!allRecords) {
        reject('Error Mongo', allRecords)
    } else {
        resolve(allRecords)
    }
})

// Fungsi membaca data registrasi
const getDataUsers = (db, author) => new Promise((resolve, reject) => {
    const allRecords = db.collection(DB_COLL).find({ phone_number: author }).toArray()
    if (!allRecords) {
        reject('Error Mongo', allRecords)
    } else {
        resolve(allRecords)
    }
})

// Fungsi membaca semua data registrasi
const getAllDataUsers = (db) => new Promise((resolve, reject) => {
    const allRecords = db.collection(DB_COLL).find({}).toArray()
    if (!allRecords) {
        reject('Error Mongo', allRecords)
    } else {
        resolve(allRecords)
    }
})

// const User = require('./../user/user.json')
// async function insertToDB () {
//   return new Promise(async (resolve, reject) => {
//     const dbClient = await MongoClient.connect(DB_CONN, DB_OPTIONS)
//     const db = dbClient.db('bot')
//     console.log('Database ready!')
//       for (var i = 0; i < User.length; i++) {
//         const dbDataUsers = await getDataUsers(db, User[i].user)
//         if (dbDataUsers.length < 1) {
//           insertDataUsers(db, User[i].user)
//           console.log(`Nomor ${User[i].user} ditambahkan ke database`)
//         } else {
//           console.log('Nomor sudah ada di database')
//         }
//       }
//   })
// };

module.exports = {
    insertDataUsers,
    deleteDataUsers,
    getDataUsers,
    getAllDataUsers,
    DB_OPTIONS,
    DB_CONN
}

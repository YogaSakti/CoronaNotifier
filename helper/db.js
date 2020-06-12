const low = require('lowdb')
const path = require('path')
const FileSync = require('lowdb/adapters/FileSync')
const db = low(new FileSync(path.join(__dirname, '/db.json')))

db.defaults({
    admins: [],
    members: []
}).write()

// Admin
const insertAdmin = (number) => new Promise((resolve, reject) => {
    const insertRecords = db
        .get('admins')
        .push({ phone: number })
        .write()
    if (!insertRecords) {
        reject('[DB] Error!', insertRecords)
    } else {
        console.log('[DB] Insert Admin: ', number)
        resolve(insertRecords)
    }
})

// Fungsi hapus data
const deleteAdmin = (number) => new Promise((resolve, reject) => {
    const deleteRecords = db
        .get('admins')
        .remove({ phone: number })
        .write()
    if (!deleteRecords) {
        reject('[DB] Error!', deleteRecords)
    } else {
        console.log('[DB] Delete Admin: ', number)
        resolve(deleteRecords)
    }
})

// Fungsi mencari data
const findAdmin = (number) => new Promise((resolve, reject) => {
    const findRecords = db
        .get('admins')
        .some({ phone: number })
        .value()
    if (!findRecords) {
        resolve(findRecords)
    } else {
        // console.log('[DB] Find Admin: ', number)
        resolve(findRecords)
    }
})

// Fungsi membaca semua data registrasi
const getAllAdmin = () => new Promise((resolve, reject) => {
    const allRecords = db
        .get('admins')
        .toArray()
        .value()
    if (!allRecords) {
        reject('[DB] Error!', allRecords)
    } else {
        // console.log('[DB] Get All Admin')
        resolve(allRecords)
    }
})

// Member

// Fungsi input data
const insertMember = (number) => new Promise((resolve, reject) => {
    const insertRecords = db
        .get('members')
        .push({ phone: number })
        .write()
    if (!insertRecords) {
        reject('[DB] Error!', insertRecords)
    } else {
        console.log('[DB] Insert Member: ', number)
        resolve(insertRecords)
    }
})

// Fungsi hapus data
const deleteMember = (number) => new Promise((resolve, reject) => {
    const deleteRecords = db
        .get('members')
        .remove({ phone: number })
        .write()
    if (!deleteRecords) {
        reject('[DB] Error!', deleteRecords)
    } else {
        console.log('[DB] Delete Member: ', number)
        resolve(deleteRecords)
    }
})

// Fungsi mencari data
const findMember = (number) => new Promise((resolve, reject) => {
    const findRecords = db
        .get('members')
        .some({ phone: number })
        .value()
    if (!findRecords) {
        resolve(findRecords)
        // reject('[DB] Error!', findRecords)
    } else {
        // console.log('[DB] Find Member: ', number)
        resolve(findRecords)
    }
})

// Fungsi membaca semua data registrasi
const getAllMember = () => new Promise((resolve, reject) => {
    const allRecords = db
        .get('members')
        .toArray()
        .value()
    if (!allRecords) {
        reject('[DB] Error!', allRecords)
    } else {
        // console.log('[DB] Get All Member')
        resolve(allRecords)
    }
})

module.exports = {
    insertAdmin,
    deleteAdmin,
    findAdmin,
    getAllAdmin,
    insertMember,
    deleteMember,
    findMember,
    getAllMember
}

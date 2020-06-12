/* eslint-disable no-async-promise-executor */
const fs = require('fs')
const path = require('path')

const { getGlobal, getBandung, getJatim, getJabar, getJateng, getWismaAtlit } = require('../util/fetcher')
const moment = require('moment-timezone')
moment.locale('id')

async function chatMenu (contact) {
    return new Promise(async (resolve, reject) => {
        try {
            const nama = contact.pushname !== undefined ? `Hai, ${contact.pushname} 😃` : 'Hai 😃'
            const message = `${nama}
kenalin aku 🤖 robot yang akan memberitahumu informasi mengenai COVID-19 di Indonesia. 

*DAFTAR PERINTAH*
!help  =>  Menampilkan menu
!ping  => pong

*COVID-19* 
!covid  =>  Menu COVID-19
!corona =>  Data COVID-19 Nasional
!lokasi =>  Cek status lokasimu

*NOTIFIKASI* 
!aktif  =>  Mengaktifkan notifikasi
!mati   =>  Mematikan notifikasi

*LAIN-LAIN*

Made with ♥️ in Bandung`
            resolve(message)
        } catch (error) {
            reject(error)
        }
    })
};

async function chatSubMenu () {
    const message = `
*Menu COVID-19*

!nasional  =>  Data Nasional
!global  =>  Data Global

*Provinsi*
!jabar   => Data Provinsi Jawa Barat
!jateng  => Data Provinsi Jawa Tengah
!jatim   => Data Provinsi Jawa Timur

*Kota*
!bandung  =>  Data Kota Bandung
!bekasi  =>  Data Kota Bekasi

*Rumah Sakit*
!wisma-atlit => Data RS Darurat Wisma Atlit

_>seluruh data yang ada adalah data terbaru._
_>kirim *!menu* untuk melihat menu utama._`
    return message
};

async function chatNasional () {
    return new Promise(async (resolve, reject) => {
        try {
            const filePath = path.join(__dirname, '../CoronaService/data.json')
            fs.readFile(filePath, 'utf-8', function (err, data) {
                if (err) return console.log(err)
                const localData = JSON.parse(data)
                const message = `
*DATA COVID-19*
Negara: ${localData.Country}
Hari Ke: ${localData.Day}
Provinsi Terdampak: 34

Total ODP: ${localData.TotalODP.toLocaleString()}
Total PDP: ${localData.TotalPDP.toLocaleString()}

Total Kasus: ${localData.TotalCases}
*Kasus Baru: ${localData.NewCases}*

Pasien Dirawat: ${localData.ActiveCases}
*Dirawat Baru: ${localData.NewActiveCases}*

Pasien Sembuh: ${localData.TotalRecovered}
*Sembuh Baru: ${localData.NewRecovered}*
Presentase Sembuh: ${localData.PresentaseRecovered}

Pasien Meninggal: ${localData.TotalDeaths}
*Meninggal Baru: ${localData.NewDeaths}*
Presentase Meninggal: ${localData.PresentaseDeath}

Pembaruan Terakhir: 
${localData.lastUpdate}

_>kirim *!covid* untuk melihat menu data lain._
_>kirim *!menu* untuk melihat menu utama._`
                resolve(message)
            })
        } catch (error) {
            reject(error)
        }
    })
};

async function chatBandung () {
    const parsedData = await getBandung()
    const message = `
*DATA COVID-19*
Kota: Bandung

*ODP*
Proses Pemantauan: ${parsedData.odp}
Selesai Pemantauan: ${parsedData.odp_selesai}
Total ODP: ${parsedData.odp + parsedData.odp_selesai}

*PDP*
Masih Dirawat: ${parsedData.pdp}
Pulang dan Sehat: ${parsedData.pdp_selesai}
Total PDP: ${parsedData.pdp + parsedData.pdp_selesai}

*Positif COVID-19*
Dirawat: ${parsedData.positif}
Sembuh: ${parsedData.sembuh}
Meninggal: ${parsedData.meninggal}
Total Positif:${parsedData.positif + parsedData.sembuh + parsedData.meninggal}

Dicek Pada: 
${moment().tz('Asia/Jakarta').format('LLLL').replace('pukul', '|')} WIB
`
    return message
};

async function chatJatim () {
    const parsedData = await getJatim()
    const message = `
*DATA COVID-19*
Provinsi: Jawa Timur

*ODP*
Proses Pemantauan: ${parsedData.odp_pantau.toLocaleString()}
Selesai Pemantauan: ${parsedData.odp_selesai.toLocaleString()}
Total ODP: ${parsedData.odp.toLocaleString()}

*PDP*
Masih Dirawat: ${parsedData.pdp_dirawat.toLocaleString()}
Pulang dan Sehat: ${parsedData.pdp_sehat.toLocaleString()}
Meninggal: ${parsedData.pdp_meninggal.toLocaleString()}
Total PDP: ${parsedData.pdp.toLocaleString()}

*Positif COVID-19*
Dirawat: ${parsedData.confirm_dirawat.toLocaleString()}
Sembuh: ${parsedData.sembuh.toLocaleString()}
Meninggal: ${parsedData.meninggal.toLocaleString()}
Total Positif: ${parsedData.confirm.toLocaleString()}

Terakhir Diperbarui Pada:
${parsedData.updated_at} WIB
Sumber: JATIM TANGGAP COVID-19`
    return message
};

async function chatJabar () {
    const parsedData = await getJabar()
    const message = `
*DATA COVID-19*
Provinsi: Jawa Barat

*RDT (Rapid Diagnostic Test)*
Reaktif: ${parsedData.rdt.positif.toLocaleString()}
Non Reaktif: ${parsedData.rdt.negatif.toLocaleString()}
Invalid: ${parsedData.rdt.invalid.toLocaleString()}
Total RDT: ${parsedData.rdt.total.toLocaleString()}

*ODP*
Proses Pemantauan: ${parsedData.odp_proses.toLocaleString()}
Selesai Pemantauan: ${parsedData.odp_selesai.toLocaleString()}
Total ODP: ${parsedData.odp_total.toLocaleString()}

*PDP*
Proses Pengawasan: ${parsedData.pdp_proses.toLocaleString()}
Selesai Pengawasan: ${parsedData.pdp_selesai.toLocaleString()}
Total PDP: ${parsedData.pdp_total.toLocaleString()}

*Positif COVID-19*
Dirawat: ${parsedData.positif - parsedData.meninggal - parsedData.sembuh}
Sembuh: ${parsedData.sembuh}
Meninggal: ${parsedData.meninggal}
Total Positif:${parsedData.positif.toLocaleString()}

Terakhir Diperbarui Pada: 
${moment().format('L').replace(/\//g, '-')}
Sumber: Pusat Informasi & Koordinasi COVID-19 Provinsi Jawa Barat`
    return message
};

async function chatJateng () {
    const parsedData = await getJateng()
    const message = `
*DATA COVID-19*
Provinsi: Jawa Tengah

*ODP*
ODP Dipantau: ${parsedData.odp_diPantau}
ODP Selesai Dipantau: ${parsedData.odp_selesaiPantau}
Total ODP: ${parsedData.odp}

*PDP*
PDP Dirawat: ${parsedData.pdp_diRawat}
PDP Sembuh: ${parsedData.pdp_selesaiRawat}
PDP Meninggal: ${parsedData.pdp_meninggal}
Total PDP: ${parsedData.pdp}

*Positif COVID-19*
Dirawat: ${parsedData.positif_dirawat}
Sembuh: ${parsedData.positif_sembuh}
Meninggal: ${parsedData.positif_meninggal}
Total Positif: ${parsedData.total_positif}

Terakhir Diperbarui Pada: 
${parsedData.last_update}
Sumber:  Dinas Kesehatan Provinsi Jawa Tengah`
    return message
};

async function chatGlobal () {
    const globalData = await getGlobal()
    const message = `
*DATA COVID-19 GLOBAL*

Total Kasus: ${globalData.confirmed}
Total Sembuh: ${globalData.recovered}
Total Meninggal: ${globalData.deaths}

Pembaruan Terakhir: 
${globalData.lastUpdate}`
    return message
};

async function chatWismaAtlit () {
    const wismaData = await getWismaAtlit()
    const message = `
*DATA RS Darurat Wisma Atlit*

*IGD*
Total ODP: ${wismaData.igd_odp}
Total PDP: ${wismaData.igd_pdp}
Total Positif: ${wismaData.igd_positif}
Total: ${wismaData.igd}

*Rawat Inap*
Total ODP: ${wismaData.ranap_odp}
Total PDP: ${wismaData.ranap_pdp}
Total Positif: ${wismaData.ranap_positif}
Total: ${wismaData.ranap}

*Telah Pulang*
Pulang Sembuh: ${wismaData.pulang_sembuh}
Pulang Meninggal: ${wismaData.pulang_meninggal}


Sumber: 
_covid-monitoring.kemkes.go.id_
Dicek pada: 
${moment().tz('Asia/Jakarta').format('LLLL').replace('pukul', '|')} WIB`
    return message
}

module.exports = {
    Menu: chatMenu,
    SubMenu: chatSubMenu,
    Nasional: chatNasional,
    Global: chatGlobal,
    WismaAtlit: chatWismaAtlit,
    Bandung: chatBandung,
    Jatim: chatJatim,
    Jabar: chatJabar,
    Jateng: chatJateng
}

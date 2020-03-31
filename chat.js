/* eslint-disable no-async-promise-executor */
const {
    readFile,
    writeFile
} = require('fs')

const {
    getGlobal,
    getBandung,
    getBandungKec,
    getBekasi,
    getJabar,
    getWismaAtlit
} = require('./CoronaService/fetcher')
const moment = require('moment-timezone')

async function chatNasional () {
    return new Promise(async (resolve, reject) => {
        readFile('./CoronaService/data.json', 'utf-8', function (err, data) {
            if (err) throw err
            const localData = JSON.parse(data)
            const message = `
*DATA COVID-19*
Negara: ${localData.Country}
Hari Ke: ${localData.Day}

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
${localData.lastUpdate}`
            resolve(message)
        })
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

async function chatBekasi () {
    const parsedData = await getBekasi()
    const message = `
*DATA COVID-19*
Kota: Bekasi

*ODP*
Proses Pemantauan: ${parsedData.proses_pemantauan}
Selesai Pemantauan: ${parsedData.selesai_pemantauan}
Total ODP: ${parsedData.proses_pemantauan + parsedData.selesai_pemantauan}

*PDP*
Masih Dirawat: ${parsedData.masih_dirawat}
Pulang dan Sehat: ${parsedData.pulang_sehat}
Total PDP: ${parsedData.masih_dirawat + parsedData.pulang_sehat}

*Positif COVID-19*
Dirawat: ${parsedData.dirawat}
Sembuh: ${parsedData.sembuh}
Meninggal: ${parsedData.meninggal}
Total Positif:${parsedData.dirawat + parsedData.sembuh + parsedData.meninggal}

Terakhir Diperbarui Pada: 
${parsedData.tanggal} WIB
`
    return message
};

async function chatJabar () {
    const parsedData = await getJabar()
    const message = `
*DATA COVID-19*
Provinsi: Jawa Barat

*ODP*
Proses Pemantauan: ${parsedData.proses_pemantauan}
Selesai Pemantauan: ${parsedData.selesai_pemantauan}
Total ODP: ${parsedData.total_odp}

*PDP*
Proses Pengawasan: ${parsedData.proses_pengawasan}
Selesai Pengawasan: ${parsedData.selesai_pengawasan}
Total PDP: ${parsedData.total_pdp}

*Positif COVID-19*
Dirawat: ${parsedData.total_positif_saat_ini - parsedData.total_meninggal - parsedData.total_sembuh}
Sembuh: ${parsedData.total_sembuh}
Meninggal: ${parsedData.total_meninggal}
Total Positif:${parsedData.total_positif_saat_ini}

Terakhir Diperbarui Pada: 
Tanggal: ${parsedData.tanggal}
`
    return message
};

async function chatGlobal () {
    const globalData = JSON.parse(await getGlobal())
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
};

async function chatPetaProv () {
    const message = `
Daftar Peta Sebaran COVID-19 per Provinsi

Peta Nasional
- _https://www.covid19.go.id/situasi-virus-corona/_

Aceh
- _https://covid19.acehprov.go.id/_

Banten
- _https://infocorona.bantenprov.go.id/_

DKI Jakarta
- _https://corona.jakarta.go.id/_

Jawa Barat
- _https://pikobar.jabarprov.go.id/_

Jawa Tengah
- _https://corona.jatengprov.go.id/_

Jawa Timur
- _http://infocovid19.jatimprov.go.id/_

Kalimantan Barat
- _https://dinkes.kalbarprov.go.id/covid-19/_

Lampung:
- _https://geoportal.lampungprov.go.id/corona/_

NTB
- _https://corona.ntbprov.go.id_

Riau
- _https://corona.riau.go.id/_

Sumatera Barat
- _https://corona.sumbarprov.go.id/_

Sulawesi Selatan
- _https://covid19.sulselprov.go.id/_

Yogyakarta
- _http://corona.jogjaprov.go.id/_

Jika ada peta provinsi lain tolong beritahukan 🙂
`
    return message
};

async function chatDataNasional () {
    const message = `
Daftar Data Sebaran COVID-19 

Data Nasional
- _https://www.covid19.go.id_
- _https://covid-monitoring.kemkes.go.id_

Data RS Darurat Wisma Atlit
- _https://u071.zicare.id/house/status_
`
    return message
};

async function chatSumberData () {
    const message = `
Sumber: 
1. _https://www.covid19.go.id/_
2. _https://indonesia-covid-19.mathdro.id/api/_
3. _https://kawalcovid19.id/_`

    return message
};

async function chatDonasi () {
    const message = `
*SGB X GRAISENA LAWAN COVID-19*
            
Sebagai respon terhadap penyebaran COVID-19 di Indonesia,
SGB Lawan Corona bersama Yayasan Gerakan Indonesia Sadar Bencana (GRAISENA) di lapangan
telah menggalang pengumpulan dana publik untuk mencegah penyebaran virus dan melindungi masyarakat.
           
Semua hasil donasi yang sudah teman-teman berikan akan kita teruskan kepada Yayasan GRAISENA
sebagai relawan dilapangan, SGB Lawan Corona hanyalah penengah dalam gerakan ini.
            
*Ayo teman-teman mari bantu relawan, medis dan pahlawan lainnya yang sedang berjuang untuk berantas Virus Corona ini!*
Mari keluarkan #CebanPertama mu

_Total donasi dan Tanggal penutupan donasi dapat di periksa pada web https://sgbcovid19.com/_`
    return message
};

async function chatBroadcast () {
    const message = 'some text'
    return message
};

// async function chat() {
//
//     })
// };

module.exports = {
    Nasional: chatNasional,
    Global: chatGlobal,
    WismaAtlit: chatWismaAtlit,
    Bandung: chatBandung,
    Bekasi: chatBekasi,
    Jabar: chatJabar,
    PetaProv: chatPetaProv,
    DataNasional: chatDataNasional,
    SumberData: chatSumberData,
    Donasi: chatDonasi,
    Broadcast: chatBroadcast
}

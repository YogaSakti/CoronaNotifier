/* eslint-disable no-async-promise-executor */
const {
    readFile,
    writeFile
} = require('fs')

const {
    getGlobal,
    getBandung,
    getBogor,
    getBekasi,
    getJabar,
    getJateng,
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
${localData.lastUpdate}

_*kirim *!covid* untuk melihat menu data lain._`
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
Proses Pemantauan: ${parsedData.odp_dirawat}
Selesai Pemantauan: ${parsedData.odp_selesai}
Total ODP: ${parsedData.odp}

*PDP*
Masih Dirawat: ${parsedData.pdp_dirawat}
Pulang dan Sehat: ${parsedData.pdp_sembuh}
Total PDP: ${parsedData.pdp}

*Positif COVID-19*
Total Positif: ${parsedData.total_positif}

Terakhir Diperbarui Pada: 
${parsedData.last_update}`
    return message
};

async function chatBogor () {
    const parsedData = await getBogor()
    const message = `
*DATA COVID-19*
Kota: Bogor

*ODP*
Proses Pemantauan: ${parsedData.odp_dirawat}
Selesai Pemantauan: ${parsedData.odp_selesai}
Total ODP: ${parsedData.odp}

*PDP*
Masih Dirawat: ${parsedData.pdp_dirawat}
Pulang dan Sehat: ${parsedData.pdp_sembuh}
Meninggal: ${parsedData.pdp_meninggal}
Total PDP: ${parsedData.pdp}

*Positif COVID-19*
Dirawat: ${parsedData.positif_dirawat}
Sembuh: ${parsedData.positif_sembuh}
Meninggal: ${parsedData.posituf_meninggal}
Total Positif: ${parsedData.total_positif}

Terakhir Diperbarui Pada:
${parsedData.last_update} WIB
Sumber: ${parsedData.sumber}`
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
${parsedData.tanggal}`
    return message
};

async function chatJateng () {
    const parsedData = await getJateng()
    const message = `
*DATA COVID-19*
Provinsi: Jawa Tengah

*ODP*
Total ODP: ${parsedData.odp}

*PDP*
Total PDP: ${parsedData.pdp}

*Positif COVID-19*
Dirawat: ${parsedData.positif_dirawat}
Sembuh: ${parsedData.positif_sembuh}
Meninggal: ${parsedData.posituf_meninggal}
Total Positif: ${parsedData.total_positif}

Terakhir Diperbarui Pada: 
${parsedData.last_update}
Sumber: ${parsedData.sumber}`
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
};

async function chatPetaProv () {
    const message = `
Daftar Peta Sebaran COVID-19

Peta Nasional
- _https://www.covid19.go.id/situasi-virus-corona_

*PULAU JAWA*
1. Banten
- _https://infocorona.bantenprov.go.id/covid-19/topic/5_
2. DI Yogyakarta
- _http://corona.jogjaprov.go.id_
Kab. Bantul
- _https://corona.bantulkab.go.id_
3. DKI Jakarta
- _https://corona.jakarta.go.id_
4. Jawa Barat
- _https://pikobar.jabarprov.go.id_
Kota Bandung
- _https://covid19.bandung.go.id_
Kab. Bandung Barat
- _https://pik.bandungbaratkab.go.id_
Kota Bekasi
- _http://corona.bekasikota.go.id_
Kota Bogor
- _http://covid19.kotabogor.go.id_
Kota Depok
- _https://ccc-19.depok.go.id_
Kota Tangerang
- _https://covid19.tangerangkota.go.id_
5. Jawa Tengah
- _http://corona.jatengprov.go.id_
Kab. Demak
- _http://corona.demakkab.go.id_
Kab. Kudus
- _https://corona.kuduskab.go.id_
Kab. Jepara
- _http://corona.jepara.go.id_
Kab. Magelang
- _http://infocorona.magelangkab.go.id_
Kota Semarang
- _http://siagacorona.semarangkota.go.id_
Kab. Wonosobo
- _https://corona.wonosobokab.go.id_
6. Jawa Timur
- _http://checkupcovid19.jatimprov.go.id_
Kab. Kediri
- _http://covid19.kedirikab.go.id_
Kota Malang
- _https://malangkota.go.id/tag/virus-corona_
Kota Probolinggo
- _https://portal.probolinggokota.go.id/index.php/tanggap-corona_
Kab. Probolinggo
- _https://siagacovid19.probolinggokab.go.id_
Kab. Tuban
- _https://tubankab.go.id/page/informasi-tentang-virus-corona-covid-19_

*PULAU SUMATERA*
1. Aceh
- _https://dinkes.acehprov.go.id_
2. Kepulauan Riau
- _http://corona.kepriprov.go.id_
Kota Batam
- _https://lawancorona.batam.go.id_
3. Kepulauan Bangka Belitung:
Kab. Bel. Timur
- _http://corona.belitungtimurkab.go.id_
3. Lampung
- _http://geoportal.lampungprov.go.id/corona_
4. Riau
- _https://corona.riau.go.id_
5. Sumatera Utara
Kota Binjai
- _http://binjaimelawancovid19.binjaikota.go.id_
Kab. Deli Serdang
- _http://covid19.deliserdangkab.go.id_
Kab. Langkat
- _https://coronainfo.langkatkab.go.id_
Kab. Tebing Tinggi
- _https://covid19.tebingtinggikota.go.id_
6. Sumatera Barat
- _http://corona.sumbarprov.go.id_

*BALI & KEP. NUSA TENGGARA*
1. Bali
- _https://www.diskes.baliprov.go.id_
2. NTB
- _https://corona.ntbprov.go.id_

*PULAU KALIMANTAN*
1. Kalimantan Barat
Kab. Ketapang
- _https://covid19.ketapangkab.go.id_

*PULAU SULAWESI*
1. Gorontalo
Kota Gorontalo
- _http://corona.gorontalokota.go.id_
2. Sulawesi Selatan
- _https://covid19.sulselprov.go.id_
Kab. MuBa
- _https://covid19.mubakab.go.id_
3. Sulawesi Utara: 
Kota Manado 
- _https://covid19.manadokota.go.id_
Kab. Bolaang
- _http://covid19.bolmongkab.go.id_
    

Jika ada peta lain tolong beritahukan 🙂
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
1. _https://www.covid19.go.id_
2. _https://indonesia-covid-19.mathdro.id/api_
3. _https://kawalcovid19.id_`

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

_Total donasi dan Tanggal penutupan donasi dapat di periksa pada web https://sgbcovid19.com_`
    return message
};

async function chatBroadcast () {
    const message = 'some text'
    return message
};

async function chatInkubasi () {
    const message = `
*Masa periode inkubasi untuk COVID-19?*
- Periode inkubasi dari COVID-19 diperkirakan sepanjang 14 hari setelah paparan pertama
- Pada beberapa kasus dipastikan hanya 5 hari setelah paparan pertama                                                                               
- Pada infeksi dengan kluster sebuah keluarga, timbulnya demam dan sindrom pernapasan terjadi sekitar 3-6 hari setelah paparan pertama
    
*Berapa lama waktu untuk test COVID-19?*
- 1-5 Hari (Tergantung kondisi Lab)`
    return message
};

async function chatGejala () {
    const message = `
Virus *COVID-19* mempengaruhi orang yang berbeda dengan cara yang berbeda. 
*COVID-19* adalah penyakit pernapasan dan sebagian besar orang yang terinfeksi akan mengalami gejala ringan hingga sedang dan sembuh tanpa memerlukan perawatan khusus. 
Orang yang memiliki kondisi medis yang mendasarinya dan mereka yang _berusia di atas 60 tahun memiliki risiko lebih tinggi_ terkena penyakit parah dan kematian.

Gejala umum meliputi:
- demam
- batuk kering
- letih lesu
    
Gejala lain termasuk:
- sesak napas
- sakit dan nyeri
- sakit tenggorokan
- dan sangat sedikit orang akan melaporkan diare, mual atau pilek.
    
Orang dengan *gejala ringan* yang dinyatakan sehat harus mengisolasi diri dan menghubungi penyedia medis mereka atau saluran informasi COVID-19 untuk nasihat tentang pengujian dan rujukan.
Orang dengan *demam, batuk atau kesulitan bernapas* harus menghubungi dokter mereka dan mencari perhatian medis.

Gejala dikategorikan sebagai ringan, parah, atau kritis dan artikel penelitian menggambarkan ini sebagai berikut:
- Kasus kritis: 
Kasus kritis termasuk pasien yang menderita gagal pernapasan, syok septik, dan / atau disfungsi atau kegagalan banyak organ.

- Kasus parah: 
Ini termasuk pasien yang menderita sesak napas, frekuensi pernapasan ≥ 30 / menit, saturasi oksigen darah ≤93%, rasio PaO2 / FiO2 <300,37 dan / atau infiltrat paru> 50% dalam 24-48 jam.

- Kasus ringan: 
Sebagian besar (81%) dari kasus penyakit coronavirus ini adalah kasus ringan. Kasus ringan mencakup semua pasien tanpa pneumonia atau kasus pneumonia ringan.
`
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
    Bogor: chatBogor,
    Jabar: chatJabar,
    Jateng: chatJateng,
    PetaProv: chatPetaProv,
    DataNasional: chatDataNasional,
    SumberData: chatSumberData,
    Donasi: chatDonasi,
    Broadcast: chatBroadcast,
    Inkubasi: chatInkubasi,
    Gejala: chatGejala
}

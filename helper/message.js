/* eslint-disable no-async-promise-executor */
const {
    readFile
} = require('fs')

const path = require('path')

const {
    getGlobal,
    getBandung,
    getBekasi,
    getJatim,
    getJabar,
    getJateng,
    getjakarta,
    getWismaAtlit,
    getProv
} = require('../util/fetcher')
const moment = require('moment-timezone')
moment.locale('id')

async function chatMenu (contact) {
    return new Promise(async (resolve, reject) => {
        try {
            const nama = contact.pushname !== undefined ? `Hai, ${contact.pushname} 😃` : 'Hai 😃'
            const message = `${nama}
kenalin aku Honk! 🤖 robot yang akan memberitahumu informasi mengenai COVID-19 di Indonesia. 

*DAFTAR PERINTAH*
!menu / !help  =>  Menampilkan menu
!ping  =>  pong

*COVID-19* 
!covid  =>  Menu COVID-19
!corona =>  Data COVID-19 Nasional
!lokasi =>  Cek status lokasimu

*NOTIFIKASI* 
!aktif  =>  Mengaktifkan notifikasi
!mati  =>  Mematikan notifikasi

*LAIN-LAIN*
!gejala  =>  Info Gejala COVID-19
!inkubasi  =>  Info Masa Inkubasi COVID-19
!data => Daftar Website COVID-19 Indonesia
!peta => Daftar Website Sebaran COVID-19
!sumber => Sumber data Bot Honk


Made with ♥️ by Yoga Sakti`
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
!jakarta => Data Provinsi DKI Jakarta

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
            const dataProv = await getProv()
            const filePath = path.join(__dirname, '../CoronaService/data.json')
            readFile(filePath, 'utf-8', function (err, data) {
                if (err) return console.log(err)
                const localData = JSON.parse(data)
                const message = `
*DATA COVID-19*
Negara: ${localData.Country}
Hari Ke: ${localData.Day}
Provinsi Terdampak: ${localData.ProvinsiTerdampak}

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
Sembuh: ${parsedData.positif_sembuh}

Terakhir Diperbarui Pada: 
${parsedData.last_update}`
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
Total ODP: ${parsedData.odp}

*PDP*
Total PDP: ${parsedData.pdp}

*Positif COVID-19*
Dirawat: ${parsedData.positif_dirawat}
Sembuh: ${parsedData.positif_sembuh}
Meninggal: ${parsedData.positif_meninggal}
Total Positif: ${parsedData.total_positif}

Terakhir Diperbarui Pada: 
${parsedData.last_update}
Sumber: ${parsedData.sumber}`
    return message
};

async function chatJakarta () {
    const parsedData = await getjakarta()
    const message = `
*DATA COVID-19*
Provinsi: DKI Jakarta

*ODP*
Proses Pemantauan: ${parsedData.Proses_Pemantauan}
Selesai Pemantauan: ${parsedData.Selesai_Pemantauan}
Total ODP: ${parsedData.Total_ODP}

*PDP*
Masih Dirawat: ${parsedData.Masih_Dirawat}
Pulang dan Sehat: ${parsedData.Pulang_dan_Sehat}
Total PDP: ${parsedData.Total_PDP}

*Positif COVID-19*
Dirawat: ${parsedData.Dirawat}
Sembuh: ${parsedData.Sembuh}
Meninggal: ${parsedData.Total_Meninggal}
Isolasi Mandiri: ${parsedData.Self_Isolation}
Total Positif: ${parsedData.Total_Positif}

Terakhir Diperbarui Pada: 
${moment(parsedData.Date_update).format('dddd, D MMMM YYYY').toString()}
Sumber: Jakarta Tanggap COVID19`
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
*Daftar Website Sebaran COVID-19*

Maaf dikarenakan daftar website sebaran terlalu banyak 🤖 honk tidak dapat menampilkannya dichat ini, untuk itu kamu bisa melihat daftarnya melalui link di bawah ini 🙂.

_https://kawalcovid19.id/pemerintah-daerah_
`
    return message
};

async function chatDataNasional () {
    const message = `
Daftar Website Penting Perihal COVID-19 

Situs Resmi Pemerintah untuk COVID-19
- _https://www.covid19.go.id_

Peta Kasus COVID-19 di Indonesia
- _https://kcov.id/petapositif_

Peta Rumah Sakit Rujukan di Indonesia
- _https://kawalcovid19.maps.arcgis.com/apps/opsdashboard/index.html#/8caa437261f2440093ce28e33e3ba6dd_

WHO Covid-19
- _https://www.who.int/emergencies/diseases/novel-coronavirus-2019_

UNICEF Indonesia
- _https://www.unicef.org/indonesia/id/coronavirus_

Data RS Darurat Wisma Atlit
- _https://u071.zicare.id/house/status_

`
    return message
};

async function chatSumberData () {
    const message = `Sumber: 
1. _https://www.covid19.go.id_
2. _https://indonesia-covid-19.mathdro.id/api_`

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
    Menu: chatMenu,
    SubMenu: chatSubMenu,
    Nasional: chatNasional,
    Global: chatGlobal,
    WismaAtlit: chatWismaAtlit,
    Bandung: chatBandung,
    Bekasi: chatBekasi,
    Jatim: chatJatim,
    Jabar: chatJabar,
    Jateng: chatJateng,
    Jakarta: chatJakarta,
    PetaProv: chatPetaProv,
    DataNasional: chatDataNasional,
    SumberData: chatSumberData,
    Broadcast: chatBroadcast,
    Inkubasi: chatInkubasi,
    Gejala: chatGejala
}

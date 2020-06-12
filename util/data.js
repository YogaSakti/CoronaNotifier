module.exports.endpoints = {
    Global: 'https://covid19.mathdro.id/api/',
    indoHarian: 'https://indonesia-covid-19.mathdro.id/api/harian',
    statistikHarian: 'https://services5.arcgis.com/VS6HdKS0VfIhv8Ct/ArcGIS/rest/services/Statistik_Perkembangan_COVID19_Indonesia/FeatureServer/0/query?where=Jumlah_Kasus_Kumulatif+IS+NOT+NULL+AND+Jumlah_Pasien_Sembuh+IS+NOT+NULL+AND+Jumlah_Pasien_Meninggal+IS+NOT+NULL&outFields=*&orderByFields=Tanggal+desc&resultRecordCount=2&f=json',
    statistikHarianAll: 'https://services5.arcgis.com/VS6HdKS0VfIhv8Ct/ArcGIS/rest/services/Statistik_Perkembangan_COVID19_Indonesia/FeatureServer/0/query?where=Jumlah_Kasus_Kumulatif+IS+NOT+NULL+AND+Jumlah_Pasien_Sembuh+IS+NOT+NULL+AND+Jumlah_Pasien_Meninggal+IS+NOT+NULL&outFields=*&orderByFields=Tanggal+asc&resultRecordCount=100&f=json',
    dataUpdate: 'https://data.covid19.go.id/public/api/update.json',
    dataProvinsi: 'https://data.covid19.go.id/public/api/prov.json',
    dataKemkes: 'https://covid19.disiplin.id',
    dataProvjabar: 'https://covid19-public.digitalservice.id/api/v1/rekapitulasi/jabar', // /harian?level=kab /kumulatif?level=prov
    dataProvjabarKasus: 'https://covid19-public.digitalservice.id/api/v1/sebaran/jabar',
    dataProvJateng: 'https://corona.jatengprov.go.id/data',
    dataProvJatim: 'http://covid19dev.jatimprov.go.id/xweb/draxi',
    dataBandung: 'https://covid19.bandung.go.id/api/covid19bdg/v1/covidsummary/get',
    dataWismaAtlit: 'https://indonesia-covid-19.mathdro.id/api/wisma-atlet'
  }

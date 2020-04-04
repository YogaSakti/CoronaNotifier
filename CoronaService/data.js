module.exports.endpoints = {
    Global: 'https://covid19.mathdro.id/api/',
    ogGlobal: 'https://covid19.mathdro.id/api/og?width=1024&height=1024',
    indoHarian: 'https://indonesia-covid-19.mathdro.id/api/harian',
    statistikharian: 'https://services5.arcgis.com/VS6HdKS0VfIhv8Ct/ArcGIS/rest/services/Statistik_Perkembangan_COVID19_Indonesia/FeatureServer/0/query?where=Jumlah_Kasus_Kumulatif+IS+NOT+NULL+AND+Jumlah_Pasien_Sembuh+IS+NOT+NULL+AND+Jumlah_Pasien_Meninggal+IS+NOT+NULL&outFields=*&orderByFields=Tanggal+desc&resultRecordCount=2&f=json',
    statistikharianAll: 'https://services5.arcgis.com/VS6HdKS0VfIhv8Ct/ArcGIS/rest/services/Statistik_Perkembangan_COVID19_Indonesia/FeatureServer/0/query?where=Jumlah_Kasus_Kumulatif+IS+NOT+NULL+AND+Jumlah_Pasien_Sembuh+IS+NOT+NULL+AND+Jumlah_Pasien_Meninggal+IS+NOT+NULL&outFields=*&orderByFields=Tanggal+asc&resultRecordCount=100&f=json',
    dataProvJabar: 'https://coredata.jabarprov.go.id/analytics/covid19/aggregation.json',
    dataProvJateng: 'https://corona.jatengprov.go.id/',
    dataBandung: 'https://covid19.bandung.go.id/api/covid19bdg/v1/covidsummary/get',
    dataBandungKec: 'https://covid19.bandung.go.id/api/covid19bdg/v1/covid/list',
    dataBekasi: 'http://corona.bekasikota.go.id/public/api/case/get',
    dataBekasiNew: 'http://corona.bekasikota.go.id/#odppdp',
    dataBogor: 'http://www.covid19.kotabogor.go.id/',
    dataWismaAtlit: 'https://indonesia-covid-19.mathdro.id/api/wisma-atlet'
  }

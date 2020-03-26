module.exports.endpoints = {
    Global: 'https://covid19.mathdro.id/api/',
    ogGlobal: 'https://covid19.mathdro.id/api/og?width=1024&height=1024',
    indoHarian: 'https://indonesia-covid-19.mathdro.id/api/harian',
    statistikharian: 'https://services5.arcgis.com/VS6HdKS0VfIhv8Ct/ArcGIS/rest/services/Statistik_Perkembangan_COVID19_Indonesia/FeatureServer/0/query?where=Jumlah_Kasus_Kumulatif+IS+NOT+NULL+AND+Jumlah_Pasien_Sembuh+IS+NOT+NULL+AND+Jumlah_Pasien_Meninggal+IS+NOT+NULL&outFields=*&orderByFields=Tanggal+desc&resultRecordCount=2&f=json',
    dataProvJabar: 'https://covid19-public.digitalservice.id/analytics/aggregation/',
    dataBandung: 'https://covid19.bandung.go.id/api/covid19bdg/v1/covidsummary/get',
    databekasi: 'http://corona.bekasikota.go.id/public/api/case/get'
  }

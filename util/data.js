module.exports.endpoints = {
    Global: 'https://covid19.mathdro.id/api/',
    ogGlobal: 'https://covid19.mathdro.id/api/og?width=1024&height=1024',
    indoHarian: 'https://indonesia-covid-19.mathdro.id/api/harian',
    statistikHarian: 'https://services5.arcgis.com/VS6HdKS0VfIhv8Ct/ArcGIS/rest/services/Statistik_Perkembangan_COVID19_Indonesia/FeatureServer/0/query?where=Jumlah_Kasus_Kumulatif+IS+NOT+NULL+AND+Jumlah_Pasien_Sembuh+IS+NOT+NULL+AND+Jumlah_Pasien_Meninggal+IS+NOT+NULL&outFields=*&orderByFields=Tanggal+asc&f=json',
    statistikHarianAll: 'https://services5.arcgis.com/VS6HdKS0VfIhv8Ct/ArcGIS/rest/services/Statistik_Perkembangan_COVID19_Indonesia/FeatureServer/0/query?where=Jumlah_Kasus_Kumulatif+IS+NOT+NULL+AND+Jumlah_Pasien_Sembuh+IS+NOT+NULL+AND+Jumlah_Pasien_Meninggal+IS+NOT+NULL&outFields=*&orderByFields=Tanggal+asc&resultRecordCount=100&f=json',
    dataKemkes: 'https://covid19.disiplin.id',
    dataProvJabar: 'https://coredata.jabarprov.go.id/analytics/covid19/aggregation.json',
    dataProvjabarV2: 'https://covid19-public.digitalservice.id/api/v1/rekapitulasi/jabar', // /harian?level=kab /kumulatif?level=prov
    dataProvjabarKasus: 'https://covid19-public.digitalservice.id/api/v1/sebaran/jabar',
    dataProvJateng: 'https://corona.jatengprov.go.id/data',
    dataProvJatim: 'http://covid19dev.jatimprov.go.id/xweb/draxi',
    dataProvDKIJakarta: 'https://services6.arcgis.com/LpNjFysmsfdTpDD0/ArcGIS/rest/services/Tabel_Histori_COVID19/FeatureServer/0/query?where=Positif_Harian IS NOT NULL AND Meninggal IS NOT NULL AND PDP_Harian IS NOT NULL AND ODP_Harian IS NOT NULL&outFields=*&orderByFields=Date_update+desc&resultRecordCount=1&f=json',
    dataBandung: 'https://covid19.bandung.go.id/api/covid19bdg/v1/covidsummary/get',
    dataBandungKec: 'https://covid19.bandung.go.id/api/covid19bdg/v1/covid/list',
    dataBekasi: 'https://corona.bekasikota.go.id/',
    dataWismaAtlit: 'https://indonesia-covid-19.mathdro.id/api/wisma-atlet'
  }

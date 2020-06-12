# Corona Notifier
![GitHub last commit](https://img.shields.io/github/last-commit/YogaSakti/CoronaNotifier)
[![whatsapp-web.js version](https://img.shields.io/github/package-json/dependency-version/YogaSakti/CoronaNotifier/whatsapp-web.js)](https://www.npmjs.com/package/whatsapp-web.js)
![Twitter](https://img.shields.io/twitter/follow/teman_bahagia?style=social)

Corona Notifier is a Whatsapp automatic notification robot using MQTT, nodeJS & lowDB. The Corona Service will collect latest data about the COVID-19 indonesian case from [indonesia-covid-19-api](https://indonesia-covid-19.mathdro.id/api) by [mathdroid](https://github.com/mathdroid/indonesia-covid-19-api) 

## Getting Started

This project require MQTT broker, nodeJS & lowDB.

### Install
Clone this project

```bash
> git clone https://github.com/YogaSakti/CoronaNotifier.git
> cd CoronaNotifier

```

Install the dependencies:

```bash
> npm i
```

create .env before run the program
```
cp .env.example .env
```

Edit .env file:

```
MQTT_URL=mqtt://
MQTT_TOPIC=
```

### Usage
1. run the Whatsapp bot

```bash
> npm run start
```

after running it you need to scan the qr

2. run the corona service 

```bash
> npm run corona
```

## Bot Whatsapp Command 
(WARNING: This is only available with Bahasa Language)

This bot is for covid-19 information purpose by automatically answer for available data, by using the available command :
1. !help 
The introduction and list of available command, example output
```
COVID-19 
!corona  =>  ........
!aktif  =>  .......
!mati  =>  ......
```
2. !covid19
Using this command will response sub list of available command
3. !corona 
Using this command will return information about current indonesia corona case and global case, example output
```
         COVID-19 Update!!
Negara: xx

Total Kasus: xx
Kasus Baru: xx
Total Pasien: xx

Sembuh: xx
Sembuh Baru: xx
Presentase Sembuh: xx.xx%

Meninggal: xx
Meninggal Baru: xx
Presentase Meninggal: xx.xx%

Dicek pada: xxx, xx xxxx 2020 | xx.xx WIB
```
4. !aktif 
Using this command will enable notifications when there is a data update.
5. !mati 
Using this command will disable notifications when there is a data update.



## Contributing

Contributions, issues and feature requests are welcome!<br />Feel free to check [issues page](https://github.com/YogaSakti/CoronaNotifier/issues) OR [pulls page](https://github.com/YogaSakti/CoronaNotifier/pulls). 

## Show your support

Give a ⭐️ if this project helped you!

## License

Copyright © 2020 [Yoga Sakti](https://github.com/YogaSakti).<br />
This project is [MIT](https://github.com/YogaSakti/CoronaNotifier/blob/master/LICENSE) licensed.

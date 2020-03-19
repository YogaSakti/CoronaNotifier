# Corona Notifier 
![GitHub last commit](https://img.shields.io/github/last-commit/k1m0ch1/covid-19-api)
[![npm version](https://img.shields.io/npm/v/sulla-hotfix.svg?color=green)](https://www.npmjs.com/package/sulla-hotfix)
![node](https://img.shields.io/node/v/sulla-hotfix)
![Twitter](https://img.shields.io/twitter/follow/teman_bahagia?style=social)

Corona Notifier is a Whatsapp automatic notification robot using MQTT & nodeJS. The Corona Service will collect latest data about the COVID-19 indonesian case from the [worldometers](https://www.worldometers.info/coronavirus/) 


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
2. !ping 
The bot will response "pong"
3. !corona 
This will return information about current indonesia corona case and global case, example output
```
         COVID-19 Update!!
Negara: xx
Total Kasus: xx

Kasus aktif: xx
Kasus Baru: xx

Meninggal: xx
Meninggal Baru: xx

Sembuh: xx
Sembuh Baru: xx

Dicek pada: xxx, xx xxxx 2020 | xx.xx WIB
```
4. !aktif 
This will enable notifications when there is a data update.
5. !mati 
This will disable notifications when there is a data update.
6. !peta 
This will return the corona virus distribution map information.


## The Diagram
![Diagram](Diagram.png)

## Requirement
NodeJS >== 10.1.1

## Installation & running program
You can clone this repo and run it, but you will need run WA bot and Coronaservice in a different window :

```bash
> git clone https://github.com/YogaSakti/CoronaNotifier.git
> cd CoronaNotifier
> npm i
> npm start
```
in other windows:
```
> node CoronaService\corona.js
```

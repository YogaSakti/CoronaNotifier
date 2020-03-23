require('dotenv').config()
const {
    readFile,
    writeFile,
    existsSync,
    readFileSync,
    unlink
} = require('fs')
const {
    Client,
    Location,
    MessageMedia
} = require('whatsapp-web.js')
const moment = require('moment-timezone')
const qrcode = require('qrcode-terminal')
const mqtt = require('mqtt')
const listen = mqtt.connect('mqtt://test.mosquitto.org')
const User = require('./user/user.js')

const SESSION_FILE_PATH = './session.json'
let sessionCfg
if (existsSync(SESSION_FILE_PATH)) {
    sessionCfg = require(SESSION_FILE_PATH)
}

const client = new Client({
    puppeteer: {
        args: [
            '--headless',
            '--log-level=3', // fatal only
            '--start-maximized',
            '--no-default-browser-check',
            '--disable-infobars',
            '--disable-web-security',
            '--disable-site-isolation-trials',
            '--no-experiments',
            '--ignore-gpu-blacklist',
            '--ignore-certificate-errors',
            '--ignore-certificate-errors-spki-list',
            '--disable-gpu',
            '--disable-extensions',
            '--disable-default-apps',
            '--enable-features=NetworkService',
            '--disable-setuid-sandbox',
            '--no-sandbox',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote'
        ]
    },
    session: sessionCfg
})
// You can use an existing session and avoid scanning a QR code by adding a "session" object to the client options.

client.initialize()

// ======================= Begin initialize WAbot

client.on('qr', (qr) => {
    // NOTE: This event will not be fired if a session is specified.
    qrcode.generate(qr, {
        small: true
    })
    console.log(`[ ${moment().tz('Asia/Jakarta').format('HH:mm:ss')} ] Please Scan QR with app!`)
})

client.on('authenticated', (session) => {
    console.log(`[ ${moment().tz('Asia/Jakarta').format('HH:mm:ss')} ] Authenticated Success!`)
    // console.log(session);
    sessionCfg = session
    writeFile(SESSION_FILE_PATH, JSON.stringify(session), function (err) {
        if (err) {
            console.error(err)
        }
    })
})

client.on('auth_failure', msg => {
    // Fired if session restore was unsuccessfull
    console.log(`[ ${moment().tz('Asia/Jakarta').format('HH:mm:ss')} ] AUTHENTICATION FAILURE \n ${msg}`)
    unlink('./session.json', function (err) {
        if (err) return console.log(err)
        console.log(`[ ${moment().tz('Asia/Jakarta').format('HH:mm:ss')} ] Session Deleted, Please Restart!`)
        process.exit(1)
    })
})

client.on('ready', () => {
    console.log(`[ ${moment().tz('Asia/Jakarta').format('HH:mm:ss')} ] Whatsapp bot ready!`)
})

// ======================= Begin initialize mqtt broker

listen.on('connect', () => {
    listen.subscribe(process.env.MQTT_TOPIC, function (err) {
        if (!err) {
            console.log(`[ ${moment().tz('Asia/Jakarta').format('HH:mm:ss')} ] Mqtt topic [${process.env.MQTT_TOPIC}] subscribed!`)
        }
    })
})

listen.on('message', (topic, message) => {
    console.log(`[ ${moment().tz('Asia/Jakarta').format('HH:mm:ss')} ] Message: ${message.toString()}`)
})
// ======================= WaBot Listen on Event

client.on('message_create', (msg) => {
    // Fired on all message creations, including your own
    if (msg.fromMe) {
        // do stuff here
    }
})

client.on('message_revoke_everyone', async (before) => {
    // Fired whenever a message is deleted by anyone (including you)
    // console.log(after); // message after it was deleted.
    if (before) {
        console.log(`[ ${moment().tz('Asia/Jakarta').format('HH:mm:ss')} ] Revoked: ${before.body}`) // message before it was deleted.
    }
})

client.on('message_revoke_me', async (msg) => {
    // Fired whenever a message is only deleted in your own view.
    // console.log(msg.body); // message before it was deleted.
})

client.on('message_ack', (msg, ack) => {
    /*
          == ACK VALUES ==
          ACK_ERROR: -1
          ACK_PENDING: 0
          ACK_SERVER: 1
          ACK_DEVICE: 2
          ACK_READ: 3
          ACK_PLAYED: 4
      */

    if (ack == 3) {
        // The message was read
    }
})

client.on('group_join', (notification) => {
    // User has joined or been added to the group.
    console.log('join', notification)
    notification.reply('User joined.')
})

client.on('group_leave', (notification) => {
    // User has left or been kicked from the group.
    console.log('leave', notification)
    notification.reply('User left.')
})

client.on('group_update', (notification) => {
    // Group picture, subject or description has been updated.
    console.log('update', notification)
})

client.on('disconnected', (reason) => {
    console.log('Client was logged out', reason)
})

// ======================= WaBot Listen on message

client.on('message', async msg => {
    msg.body = msg.body.toLowerCase()
    msg.from.includes('@c.us') ? console.log(`[ ${moment().tz('Asia/Jakarta').format('HH:mm:ss')} ] Message:`, msg.from.replace('@c.us', ''), `| ${msg.type}`, msg.body ? `| ${msg.body}` : '') : ''
    msg.from.includes('@g.us') ? console.log(`[ ${moment().tz('Asia/Jakarta').format('HH:mm:ss')} ] Message:`, msg.from.replace('@g.us', ''), `| ${msg.type}`, msg.body ? `| ${msg.body}` : '') : ''

    if (msg.type == 'ciphertext' || msg.body == 'menu' || msg.body == 'info' || msg.body == 'corona' || msg.body == 'help') {
        const chat = await msg.getChat()
        if (!chat.isGroup) {
            msg.reply('kirim !menu atau !help untuk melihat menu honk!.')
        }
        // Send a new message as a reply to the current one
    } else if (msg.body == 'halo' || msg.body == 'hai' || msg.body == 'hallo') {
        // Send a new message as a reply to the current one
        const chat = await msg.getChat()
        if (!chat.isGroup) {
            msg.reply('hi 😃')
        }
    } else if (msg.body == '!msg') {
        // Send a new message as a reply to the current one
        var kontak = await await msg.getContact()
        console.log(kontak)
        console.log(msg)
    } else if (msg.body == '!ping' || msg.body == 'ping' || msg.body == 'p') {
        // Send a new message to the same chat
        client.sendMessage(msg.from, 'pong')
    } else if (msg.body == '!honk' || msg.body == 'honk!' || msg.body == 'honk') {
        // Send a new message to the same chat
        client.sendMessage(msg.from, 'Honk Honk!!')
    } else if (msg.body.startsWith('!sendto ')) {
        // Direct send a new message to specific id
        let number = msg.body.split(' ')[1]
        const messageIndex = msg.body.indexOf(number) + number.length
        const message = msg.body.slice(messageIndex, msg.body.length)
        if (number.includes('@g.us')) {
            const group = await client.getChatById(number)
            group.sendMessage(message)
        } else if (!number.includes('@c.us') && !number.includes('@g.us')) {
            number = number.includes('@c.us') ? number : `${number}@c.us`
            const chat = await msg.getChat()
            chat.sendSeen()
            client.sendMessage(number, message)
        }
    } else if (msg.body == '!chats') {
        const chats = await client.getChats()
        const group = chats.filter(x => x.isGroup == true)
        const personalChat = chats.filter(x => x.isGroup == false)
        readFile('./user/user.json', 'utf-8', function (err, data) {
            if (err) throw err
            const userData = JSON.parse(data)
            client.sendMessage(msg.from, `The bot has...
Chats open: ${chats.length} 
Groups chats: ${group.length}
Personal chats: ${personalChat.length}
Notification User: ${userData.length}`)
        })
    } else if (msg.body == '!info' || msg.body == '!help' || msg.body == '!menu') {
        const contact = await await msg.getContact()
        const nama = contact.pushname !== undefined ? `Hai, ${contact.pushname} 😃` : 'Hai 😃'
        client.sendMessage(msg.from, `
${nama}
kenalin aku Honk! 🤖 robot yang akan memberitahumu informasi mengenai COVID-19 di indonesia.

*PERINTAH*
!info/!help  =>  Menu
!ping  =>  Tes bot

*COVID-19* 
!corona  =>  Informasi COVID-19 Indonesia
!aktif  =>  Mengaktifkan notifikasi
!mati  =>  Mematikan notifikasi

!data => Data Pengawasan COVID-19
!peta => Peta Sebaran COVID-19 per prov.
!sumber => Sumber data Honk!


Made with ♥️ by Yoga Sakti`)
    } else if (msg.body == '!sumber') {
        client.sendMessage(msg.from, `
Sumber: 
1. _https://www.covid19.go.id/_
2. _https://indonesia-covid-19.mathdro.id/api/_
3. _https://kawalcovid19.id/_`)
    } else if (msg.body == '!peta') {
        client.sendMessage(msg.from, `
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
`)
    } else if (msg.body == '!data') {
        client.sendMessage(msg.from, `
Daftar Data Sebaran COVID-19 

Data Nasional
- _https://www.covid19.go.id/_
`)
    } else if (msg.body == '!localdata') {
        const localData = client.localData
        console.log(localData)
        client.sendMessage(msg.from, `
            *Connection localData*
            User name: ${localData.pushname}
            My number: ${localData.me.user}
            Device: ${localData.phone.device_manufacturer} | ${localData.phone.device_model}
            Platform: ${localData.platform} ${localData.phone.os_version} 
            WhatsApp version: ${localData.phone.wa_version}
        `)
    } else if (msg.body == '!medialocaldata' && msg.hasMedia) {
        const attachmentData = await msg.downloadMedia()
        // console.log(attachmentData)
        msg.reply(`
            *Media localData*
            MimeType: ${attachmentData.mimetype}
            Filename: ${attachmentData.filename}
            Data (length): ${attachmentData.data.length}
        `)
    } else if (msg.body == '!quotelocaldata' && msg.hasQuotedMsg) {
        const quotedMsg = await msg.getQuotedMessage()

        quotedMsg.reply(`
            ID: ${quotedMsg.id._serialized}
            Type: ${quotedMsg.type}
            Author: ${quotedMsg.author || quotedMsg.from}
            Timestamp: ${quotedMsg.timestamp}
            Has Media? ${quotedMsg.hasMedia}
        `)
    } else if (msg.body == '!resendmedia' && msg.hasQuotedMsg) {
        const quotedMsg = await msg.getQuotedMessage()
        if (quotedMsg.hasMedia) {
            const attachmentData = await quotedMsg.downloadMedia()
            client.sendMessage(msg.from, attachmentData, {
                caption: 'Here\'s your requested media.'
            })
        }
    } else if (msg.body == '!location') {
        msg.reply(new Location(37.422, -122.084, 'Googleplex\nGoogle Headquarters'))
    } else if (msg.body.startsWith('!status ')) {
        const newStatus = msg.body.split(' ')[1]
        await client.setStatus(newStatus)
        msg.reply(`Status was updated to *${newStatus}*`)
    } else if (msg.body == '!mention') {
        const contact = await msg.getContact()
        const chat = await msg.getChat()
        chat.sendMessage(`Hi @${contact.number}!`, {
            mentions: [contact]
        })
    } else if (msg.body == '!delete' && msg.hasQuotedMsg) {
        const quotedMsg = await msg.getQuotedMessage()
        if (quotedMsg.fromMe) {
            quotedMsg.delete(true)
        } else {
            msg.reply('I can only delete my own messages')
        }
    } else if (msg.body === '!archive') {
        const chat = await msg.getChat()
        chat.archive()
    } else if (msg.body === '!typing') {
        const chat = await msg.getChat()
        // simulates typing in the chat
        chat.sendStateTyping()
    } else if (msg.body === '!recording') {
        const chat = await msg.getChat()
        // simulates recording audio in the chat
        chat.sendStateRecording()
    } else if (msg.body === '!clearstate') {
        const chat = await msg.getChat()
        // stops typing or recording in the chat
        chat.clearState()
    } else if (msg.body === '!mati') {
        const chat = await msg.getChat()
        if (chat.isGroup) {
            msg.reply('Maaf, perintah ini tidak bisa digunakan di dalam grup! silahkan kirim !aktif di personal chat untuk mengaktifkan notifikasi.')
        } else {
            User.checkUser(msg.from).then(result => {
                if (result) {
                    User.removeUser(msg.from)
                        .then(result => {
                            if (result) {
                                client.sendMessage(msg.from,
                                    'Berhasil menonaktifkan, anda tidak akan mendapat notifikasi lagi.'
                                )
                            } else {
                                client.sendMessage(msg.from,
                                    'Gagal menonaktifkan, nomor tidak terdaftar.'
                                )
                            }
                        })
                } else {
                    client.sendMessage(msg.from,
                        'Gagal menonaktifkan, nomor tidak terdaftar.'
                    )
                }
            })
        }
    } else if (msg.body === '!aktif' || msg.body === '!daftar') {
        const chat = await msg.getChat()
        if (chat.isGroup) {
            msg.reply('Maaf, perintah ini tidak bisa digunakan di dalam grup! silahkan kirim !aktif di personal chat untuk mengaktifkan notifikasi.')
        } else {
            User.addUser(msg.from)
                .then(result => {
                    if (!result) {
                        client.sendMessage(msg.from,
                            'Notifikasi sudah aktif.'
                        )
                    } else {
                        client.sendMessage(msg.from,
                            'Berhasil mengaktifkan notifikasi, anda akan mendapat notifikasi ketika ada permbaruan data.'
                        )
                    }
                })
        }
    } else if (msg.body === '!corona' || msg.body === '!covid') {
        readFile('./CoronaService/data.json', 'utf-8', function (err, data) {
            if (err) throw err
            const localData = JSON.parse(data)
            const newCases = localData.NewCases === '' ? 0 : localData.NewCases
            const newDeaths = localData.NewDeaths === '' ? 0 : localData.NewDeaths
            const NewRecovered = localData.NewRecovered === '' ? 0 : localData.NewRecovered
            client.sendMessage(msg.from, `
*COVID-19 Update!!*
Negara: ${localData.Country}

Total Kasus: ${localData.TotalCases}
*Kasus Baru: ${newCases}*
Total Pasien: ${localData.ActiveCases}

Pasien Sembuh: ${localData.TotalRecovered}
*Sembuh Baru: ${NewRecovered}*
Presentase Sembuh: ${localData.PresentaseRecovered}

Pasien Meninggal: ${localData.TotalDeaths}
*Meninggal Baru: ${newDeaths}*
Presentase Meninggal: ${localData.PresentaseDeath}

Pembaruan Terakhir: 
${localData.lastUpdate}
            `)
            const imageAsBase64 = readFileSync('./CoronaService/corona.png', 'base64')
            const CoronaImage = new MessageMedia('image/png', imageAsBase64)
            client.sendMessage(msg.from, CoronaImage)

            // ============================================= Groups
        })
    } else if (msg.body.startsWith('!subject ')) {
        // Change the group subject
        const chat = await msg.getChat()
        if (chat.isGroup) {
            const newSubject = msg.body.slice(9)
            chat.setSubject(newSubject)
        } else {
            msg.reply('This command can only be used in a group!')
        }
    } else if (msg.body.startsWith('!echo ')) {
        // Replies with the same message
        msg.reply(msg.body.slice(6))
    } else if (msg.body.startsWith('!desc ')) {
        // Change the group description
        const chat = await msg.getChat()
        if (chat.isGroup) {
            const newDescription = msg.body.slice(6)
            chat.setDescription(newDescription)
        } else {
            msg.reply('This command can only be used in a group!')
        }
    } else if (msg.body == '!leave') {
        // Leave the group
        const chat = await msg.getChat()
        if (chat.isGroup) {
            chat.leave()
        } else {
            msg.reply('This command can only be used in a group!')
        }
    } else if (msg.body.startsWith('!join ')) {
        const inviteCode = msg.body.split(' ')[1]
        try {
            await client.acceptInvite(inviteCode)
            msg.reply('Joined the group!')
        } catch (e) {
            msg.reply('That invite code seems to be invalid.')
        }
    } else if (msg.body == '!grouplocaldata') {
        const chat = await msg.getChat()
        if (chat.isGroup) {
            msg.reply(`
                *Group Details*
                Name: ${chat.name}
                Description: ${chat.description}
                Created At: ${chat.createdAt.toString()}
                Created By: ${chat.owner.user}
                Participant count: ${chat.participants.length}
            `)
        } else {
            msg.reply('This command can only be used in a group!')
        }
    } else if (msg.body == '!broadcast' && msg.from == '6282324937376@c.us') {
        readFile('./user/user.json', 'utf-8', function (err, data) {
            if (err) throw err
            const userData = JSON.parse(data)
            for (var i = 0; i < userData.length; i++) {
                const number = userData[i].user
                setTimeout(function () {
                    console.log(`[ ${moment().tz('Asia/Jakarta').format('HH:mm:ss')} ] Send Broadcast to ${number}`)
                    // client.sendMessage(number, `Maaf jika terjadi kesalahan data/double pengiriman, sedang ada perbaikan sistem.`);
                    // Delay 2 Sec
                }, i * 2000)
            }
        })
    }
})

listen.on('message', (topic, message) => {
    console.log(`[ ${moment().tz('Asia/Jakarta').format('HH:mm:ss')} ] MQTT: ${message.toString()}`)
    readFile('./user/user.json', 'utf-8', function (err, data) {
        if (err) throw err
        const userData = JSON.parse(data)
        for (var i = 0; i < userData.length; i++) {
            const number = userData[i].user
            // number = number.includes('@c.us') ? number : `${number}@c.us`;
            setTimeout(function () {
                console.log(`[ ${moment().tz('Asia/Jakarta').format('HH:mm:ss')} ] Send Corona Update to ${number}`)
                if (message.toString() == 'New Update!') {
                    readFile('./CoronaService/data.json', 'utf-8', function (err, data) {
                        if (err) throw err
                        const localData = JSON.parse(data)
                        const newCases = localData.NewCases === '' ? 0 : localData.NewCases
                        const newDeaths = localData.NewDeaths === '' ? 0 : localData.NewDeaths
                        const NewRecovered = localData.NewRecovered === '' ? 0 : localData.NewRecovered
                        client.sendMessage(number, `
*COVID-19 Update!!*
Negara: ${localData.Country}

Total Kasus: ${localData.TotalCases}
*Kasus Baru: ${newCases}*
Total Pasien: ${localData.ActiveCases}

Pasien Sembuh: ${localData.TotalRecovered}
*Sembuh Baru: ${NewRecovered}*
Presentase Sembuh: ${localData.PresentaseRecovered}

Pasien Meninggal: ${localData.TotalDeaths}
*Meninggal Baru: ${newDeaths}*
Presentase Meninggal: ${localData.PresentaseDeath}
                    
Di Perbarui Pada: 
${localData.lastUpdate}
Sumber: 
_https://www.covid19.go.id_
                    `)
                    })
                }
                // Delay 2 Sec
            }, i * 1500)
        }
    })
})

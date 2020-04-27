require('dotenv').config()
const os = require('os')
const {
    readFile,
    writeFile,
    existsSync,
    readFileSync
} = require('fs')
const {
    Client,
    MessageMedia
} = require('whatsapp-web.js')
let {
    insertDataUsers,
    deleteDataUsers,
    getDataUsers,
    getAllDataUsers,
    DB
} = require('./helper/db')
const { getAll } = require('./util/location')

const moment = require('moment-timezone')
const qrcode = require('qrcode-terminal')
const mqtt = require('mqtt')
const listen = mqtt.connect(process.env.MQTT_URL)
const resChat = require('./helper/message')

const SESSION_FILE_PATH = './session.json'
let sessionCfg
if (existsSync(SESSION_FILE_PATH)) {
    sessionCfg = require(SESSION_FILE_PATH)
}

const config = {
    online: true,
    admin: `${process.env.ADMIN_NUMBER}@c.us`,
    bot: `${process.envBOT_NUMBER}@c.us`
}

const path = os.platform() == 'win32' ? 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe' : '/usr/bin/google-chrome-stable'
const client = new Client({
    puppeteer: {
        executablePath: path,
        args: [
            '--log-level=3', // fatal only
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

client.initialize({
    qrTimeoutMs: 0,
    authTimeoutMs: 0,
    restartOnAuthFail: true
})

// ======================= Begin initialize WAbot

client.on('qr', (qr) => {
    // NOTE: This event will not be fired if a session is specified.
    qrcode.generate(qr, {
        small: true
    })
    console.log(`[ ${moment().tz('Asia/Jakarta').format('HH:mm:ss')} ] Please Scan QR with app!`)
})

client.on('authenticated', (session) => {
    console.log(`[ ${moment().tz('Asia/Jakarta').format('HH:mm:ss')} ] Authenticated Success.`)
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
})

client.on('ready', async () => {
    DB = await DB()
    console.log(`[ ${moment().tz('Asia/Jakarta').format('HH:mm:ss')} ] Whatsapp bot ready.`)
})

// ======================= Begin initialize mqtt broker

listen.on('connect', () => {
    listen.subscribe(process.env.MQTT_TOPIC, function (err) {
        if (!err) {
            console.log(`[ ${moment().tz('Asia/Jakarta').format('HH:mm:ss')} ] Mqtt topic [${process.env.MQTT_TOPIC}] subscribed!`)
        }
    })
})

// ======================= WaBot Listen on Event

client.on('message_revoke_everyone', async (after, before) => {
    // Fired whenever a message is deleted by anyone (including you)
    if (before) {
        console.log(`[ ${moment().tz('Asia/Jakarta').format('HH:mm:ss')} ] Revoked: ${before.body}`) // message before it was deleted.
    }
})

client.on('group_join', async (notification) => {
    // notification.reply('User joined.')
    //     const contact = await notification.getContact()
    //     if (notification.chatId == `${client.info.me.user}@c.us`) {
    //         client.sendMessage(notification.id.remote, await resChat.Menu(contact))
    //     }
})

client.on('group_leave', (notification) => {
    // User has left or been kicked from the group.
    if (notification.chatId == `${client.info.me.user}@c.us`) {
        notification.reply('User has left or been kicked from the group.')
    }
})

client.on('change_battery', (status) => {
    // battery changed and plugged status.
    try {
        if (status.battery <= 25 && !status.plugged) {
            client.sendMessage(config.admin, 'Please charge your phone!')
        }
    } catch (err) {
        console.error(err)
    }
})

client.on('disconnected', (reason) => {
    console.log('Client was logged out', reason)
})

// ======================= WaBot Listen on message

client.on('message', async msg => {
    if (msg.from.includes('@c.us') && msg.type == 'chat') console.log(`[ ${moment().tz('Asia/Jakarta').format('HH:mm:ss')} ] Message:`, msg.from.replace('@c.us', ''), `| ${msg.type} | `, msg.body)
    if (msg.from.includes('@g.us') && msg.type == 'chat') console.log(`[ ${moment().tz('Asia/Jakarta').format('HH:mm:ss')} ] Message:`, msg.from.replace('@g.us', ''), `| ${msg.type} | `, msg.body)

    const keyword = ['menu', 'info', 'corona', 'help', 'covid', 'aktif', '!info', 'halo', 'hai', 'hallo', '!ping', 'p', '!honk', 'honk!', 'honk', '!help', '!menu', '!covid', '!covid19', '!covid-19', '!inkubasi', '!gejala', '!peta', '!data', '!sumber', '!global', '!corona', '!nasional', '!jabar', '!jateng', '!jatim', '!jakarta', '!bandung', '!bekasi', '!wisma-atlit', '!aktif', '!mati', '!lokasi']

    const text = msg.body.toLowerCase()

    if (config.online && keyword.includes(text)) {
        // General Chat
        if (['menu', 'info', 'corona', 'help', 'covid', 'aktif', '!info'].includes(text)) {
            const chat = await msg.getChat()
            if (!chat.isGroup) msg.sendMessage(msg.from, 'kirim !menu atau !help untuk melihat menu honk!.')
        } else if (['halo', 'hai', 'hallo'].includes(text)) {
            const chat = await msg.getChat()
            if (!chat.isGroup) msg.sendMessage(msg.from, 'hi 😃')
        } else if (['!ping', 'p'].includes(text)) {
            client.sendMessage(msg.from, 'pong')
        } else if (['!honk', 'honk!', 'honk'].includes(text)) {
            client.sendMessage(msg.from, 'Honk Honk!!')
        }

        // Command Menu & informasi
        if (['!help', '!menu'].includes(text)) {
            const contact = await msg.getContact()
            client.sendMessage(msg.from, await resChat.Menu(contact))
        } else if (['!covid', '!covid19', '!covid-19'].includes(text)) {
            client.sendMessage(msg.from, await resChat.SubMenu())
        } else if (text == '!inkubasi') {
            client.sendMessage(msg.from, await resChat.Inkubasi())
        } else if (text == '!gejala') {
            client.sendMessage(msg.from, await resChat.Gejala())
        } else if (text == '!peta') {
            client.sendMessage(msg.from, await resChat.PetaProv())
        } else if (text == '!data') {
            client.sendMessage(msg.from, await resChat.DataNasional())
        } else if (text == '!sumber') {
            client.sendMessage(msg.from, await resChat.SumberData())
        }

        // Command Get Data
        if (text == '!global') {
            console.log(`[ ${moment().tz('Asia/Jakarta').format('HH:mm:ss')} ] Request Data Global).`)
            client.sendMessage(msg.from, await resChat.Global())
        } else if (['!corona', '!nasional'].includes(text)) {
            console.log(`[ ${moment().tz('Asia/Jakarta').format('HH:mm:ss')} ] Request Nasional).`)
            client.sendMessage(msg.from, await resChat.Nasional())
        } else if (text == '!jabar') {
            console.log(`[ ${moment().tz('Asia/Jakarta').format('HH:mm:ss')} ] Request Data Jabar).`)
            client.sendMessage(msg.from, await resChat.Jabar())
        } else if (text == '!jateng') {
            console.log(`[ ${moment().tz('Asia/Jakarta').format('HH:mm:ss')} ] Request Data jateng).`)
            client.sendMessage(msg.from, await resChat.Jateng())
        } else if (text == '!jatim') {
            console.log(`[ ${moment().tz('Asia/Jakarta').format('HH:mm:ss')} ] Request Data Jatim).`)
            client.sendMessage(msg.from, await resChat.Jatim())
        } else if (text == '!jakarta') {
            console.log(`[ ${moment().tz('Asia/Jakarta').format('HH:mm:ss')} ] Request Data Jakarta).`)
            client.sendMessage(msg.from, await resChat.Jakarta())
        } else if (text == '!bandung') {
            console.log(`[ ${moment().tz('Asia/Jakarta').format('HH:mm:ss')} ] Request Data Bandung).`)
            client.sendMessage(msg.from, await resChat.Bandung())
        } else if (text == '!bekasi') {
            console.log(`[ ${moment().tz('Asia/Jakarta').format('HH:mm:ss')} ] Request Data Bekasi).`)
            client.sendMessage(msg.from, await resChat.Bekasi())
        } else if (text == '!wisma-atlit') {
            console.log(`[ ${moment().tz('Asia/Jakarta').format('HH:mm:ss')} ] Request Data Wisma Atlit).`)
            client.sendMessage(msg.from, await resChat.WismaAtlit())
        } else if (text == '!lokasi' && msg.hasQuotedMsg) {
            const quotedMsg = await msg.getQuotedMessage()
            console.log(`[ ${moment().tz('Asia/Jakarta').format('HH:mm:ss')} ] Request Status Zona (${quotedMsg.location.latitude},${quotedMsg.location.longitude}).`)
            const zoneStatus = await getAll(quotedMsg.location.latitude, quotedMsg.location.longitude)
            if (zoneStatus.kode == 200) {
                let data = ''
                for (let i = 0; i < zoneStatus.data.length; i++) {
                    const x = zoneStatus.data[i]
                    let zone = ''
                    if (x.zone == 'green') zone = 'Hijau* (Aman) \n'
                    if (x.zone == 'red') zone = 'Merah* (Bahaya) \n'
                    if (x.zone == 'yellow') zone = 'Kuning* (Waspada) \n'
                    data += `${i + 1}. Kel. *${x.region}* Berstatus *Zona ${zone}`
                }
                const text = `*CEK LOKASI*\nHasil pemeriksaan dari lokasi yang anda kirim adalah *${zoneStatus.status}* ${zoneStatus.optional}\n\nInformasi lokasi terdampak disekitar anda:\n${data}`
                client.sendMessage(msg.from, text)
            } else {
                client.sendMessage(msg.from, 'Maaf, Terjadi error ketika memeriksa lokasi yang anda kirim.')
            }
        } else if (text == '!lokasi') {
            const text = '*CEK LOKASI COVID-19*\nBerikut cara untuk cek lokasimu: \n1. Kirimkan lokasimu\n2. Balas dengan kata !lokasi, lokasi yang kamu kirim tadi (klik & tahan chat lokasimu lalu pilih balas)\n3. Kamu akan mendapat informasi mengenai lokasi yang kamu kirim\n\n Jika kurang jelas silahkan lihat gambar dibawah ini.'
            await client.sendMessage(msg.from, text)
            const tutor = new MessageMedia('image/jpg', readFileSync('./image/lokasi.jpg', 'base64'))
            await client.sendMessage(msg.from, tutor)
        }

        // Command Notification
        if (text == '!aktif') {
            const chat = await msg.getChat()
            // Cek & Input data ke MongoDB
            const dbDataUsers = await getDataUsers(DB, chat.isGroup ? msg.from = msg.author : msg.from = msg.from)
            if (msg.body && dbDataUsers.length < 1) {
                dbDataUsers.push(chat.isGroup ? msg.from = msg.author : msg.from = msg.from)
                await insertDataUsers(DB, chat.isGroup ? msg.from = msg.author : msg.from = msg.from)
                await client.sendMessage(msg.from, `Selamat, nomor hp anda "${msg.from.split('@c.us')[0]}" berhasil diregistrasi kedalam daftar notifikasi, anda akan mendapat notifikasi ketika ada pembaruan data.`)
            } else {
                await client.sendMessage(msg.from, 'Maaf, nomor hp anda telah diregistrasi. Untuk membatalkan kirim *!mati*')
            }
        } else if (text == '!mati') {
            const chat = await msg.getChat()
            const dbDataUsers = await getDataUsers(DB, chat.isGroup ? msg.from = msg.author : msg.from = msg.from)
            if (msg.body && dbDataUsers.length < 1) {
                await client.sendMessage(msg.from, 'Maaf, Nomor anda belum diregistrasi. Registrasi nomor anda dengan kirim *!aktif*')
            } else {
                await deleteDataUsers(DB, chat.isGroup ? msg.from = msg.author : msg.from = msg.from)
                await client.sendMessage(msg.from, 'Nomor anda telah dihapus dari daftar notifikasi')
            }
        }
    } else if (msg.from == config.admin || config.bot) {
        // Command Admin
        if (text == '!online') {
            if (config.online) {
                client.sendMessage(msg.from, 'Bot is Online.')
            } else {
                config.online = true
                client.sendMessage(msg.from, 'Bot is now Online.')
            }
        } else if (text == '!offline') {
            if (!config.online) {
                client.sendMessage(msg.from, 'Bot is Offline')
            } else {
                config.online = false
                client.sendMessage(msg.from, 'Bot is now Offline')
            }
        } else if (text == '!status') {
            if (config.online) {
                client.sendMessage(msg.from, 'Bot is Online')
            } else {
                client.sendMessage(msg.from, 'Bot is Offline')
            }
        } else if (text == '!chats') {
            const chats = await client.getChats()
            const group = chats.filter(x => x.isGroup == true)
            const personalChat = chats.filter(x => x.isGroup == false)
            const getListUsers = await getAllDataUsers(DB)
            client.sendMessage(msg.from, `The bot has...\nChats open: ${chats.length}\nGroups chats: ${group.length}\nPersonal chats: ${personalChat.length}\nNotification User: ${getListUsers.length}`)
        } else if (text == '!broadcast') {
            const getListUsers = await getAllDataUsers(DB)
            getListUsers.map((item, index) => {
                const number = item.phone_number
                setTimeout(async function () {
                    console.log(`[ ${moment().tz('Asia/Jakarta').format('HH:mm:ss')} ] Send Broadcast to ${number} (${index})`)
                    client.sendMessage(number, await resChat.Broadcast())
                }, index * 500)
            })
        } else if (text == '!dbcheck') {
            const getListUsers = await getAllDataUsers(DB)
            const UnRegist = []
            const getUnRegist = await Promise.all(getListUsers.map(async (item, index) => {
                const cekUser = await client.isRegisteredUser(item.phone_number)
                return {
                    number: item.phone_number,
                    status: cekUser
                }
            }))
            getUnRegist.map(x => {
                if (x.status == false) UnRegist.push(x.number)
            })
            if (UnRegist.length !== 0) {
                await client.sendMessage(msg.from, `unRegister number in DB:\n${UnRegist.toString().replace(/,/g, '\n')}`)
                await client.sendMessage(msg.from, 'Delete unRegister number from DB...')
                await Promise.all(UnRegist.map(async (number) => {
                    await deleteDataUsers(DB, number)
                }))
            } else {
                client.sendMessage(msg.from, 'There is no unRegister number in DB')
            }
        } else if (text == '!archive') {
            const chats = await client.getChats()
            const personal = chats.filter(x => x.isGroup == false)
            // archieving personal chat
            msg.reply(`Request diterima bot akan meng-archieve ${personal.length} personal chat.`)
            chats.map((x) => {
                if (x.isGroup == false) x.archive()
            })
        } else if (text == '!delete') {
            const chats = await client.getChats()
            const personal = chats.filter(x => x.isGroup == false)
            // Delete personal chat
            msg.reply(`Request diterima bot akan menghapus ${personal.length} personal chat.`)
            chats.map((x) => {
                if (x.isGroup == false) x.delete()
            })
        } else if (msg.body.startsWith('!leave ')) {
            const chats = await client.getChats()
            const search = chats.filter(x => x.isGroup == true)
            const except = search.filter(x => x.id._serialized !== msg.body.split(' ')[1])
            // Leave from all group
            msg.reply(`Request diterima bot akan keluar dari ${except.length} grup.`)
            for (var i = 0; i < except.length; i++) {
                console.log(`Keluar dari Grup: ${except[i].name}`)
                except[i].leave()
            }
        } else if (msg.body.startsWith('!join ')) {
            const inviteCode = msg.body.split(' ')[1]
            try {
                await client.acceptInvite(inviteCode)
                msg.reply('Joined the group!')
            } catch (e) {
                msg.reply('That invite code seems to be invalid.')
            }
        } else if (msg.body.startsWith('!sendto ')) {
            let number = msg.body.split(' ')[1]
            const messageIndex = msg.body.indexOf(number) + number.length
            const message = msg.body.slice(messageIndex, msg.body.length)
            if (number.includes('@g.us')) {
                const group = await client.getChatById(number)
                group.sendMessage(message)
            } else if (!number.includes('@c.us') && !number.includes('@g.us')) {
                number = number.includes('@c.us') ? number : `${number}@c.us`
                client.sendMessage(number, message)
            }
        }
    } else if (!config.online && keyword.includes(text)) {
        client.sendMessage(msg.from, 'Maaf, Bot sedang Offline.')
    }

    if (!keyword.includes(text) && (msg.from !== config.admin || msg.from !== config.bot)) {
        const chat = await msg.getChat()
        if (!chat.isGroup) chat.archive()
    }
})

listen.on('message', async (topic, message) => {
    console.log(`[ ${moment().tz('Asia/Jakarta').format('HH:mm:ss')} ] MQTT: ${message.toString()}`)
    const getListUsers = await getAllDataUsers(DB)
    if (message.toString() == 'New Update!') {
        readFile('./CoronaService/data.json', 'utf-8', function (err, data) {
            if (err) throw err
            const localData = JSON.parse(data)
            getListUsers.map((item, index) => {
                const number = item.phone_number
                setTimeout(function () {
                    console.log(`[ ${moment().tz('Asia/Jakarta').format('HH:mm:ss')} ] Send Corona Update to ${number} (${index})`)
                    client.sendMessage(number, `
*COVID-19 Update!!*
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
                    
Di Perbarui Pada: 
${localData.lastUpdate}
Sumber: 
_https://www.covid19.go.id_
                    `)
                    // Delay 2 Sec
                }, index * 1100)
            })
        })
    }
})

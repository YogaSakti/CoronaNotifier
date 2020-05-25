const { Client, MessageMedia } = require('whatsapp-web.js')
const { getAll } = require('./util/location')
require('dotenv').config()
const fs = require('fs')
const moment = require('moment-timezone')
const qrcode = require('qrcode-terminal')
const mqtt = require('mqtt')
const db = require('./helper/db')
const resChat = require('./helper/message')
const listen = mqtt.connect(process.env.MQTT_URL)

let DB
let sessionCfg

const SESSION_FILE_PATH = './session.json'
if (fs.existsSync(SESSION_FILE_PATH)) sessionCfg = require(SESSION_FILE_PATH)

const config = {
    online: true,
    admin: `${process.env.ADMIN_NUMBER}@c.us`,
    bot: `${process.envBOT_NUMBER}@c.us`
}

const client = new Client({
    qrTimeoutMs: 0,
    authTimeoutMs: 0,
    restartOnAuthFail: true,
    takeoverOnConflict: true,
    takeoverTimeoutMs: 0,
    puppeteer: {
        headless: true,
        // userDataDir: './temp',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--ignore-certificate-errors',
            '--log-level=3', // fatal only
            '--no-default-browser-check',
            '--disable-infobars',
            '--disable-web-security',
            '--disable-site-isolation-trials',
            '--no-experiments',
            '--ignore-gpu-blacklist',
            '--ignore-certificate-errors-spki-list',
            '--disable-gpu',
            '--disable-extensions',
            '--disable-default-apps',
            '--enable-features=NetworkService',
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
    qrcode.generate(qr, { small: true })
    console.log(`[ ${moment().tz('Asia/Jakarta').format('HH:mm:ss')} ] Please Scan QR with app!`)
})

client.on('authenticated', (session) => {
    console.log(`[ ${moment().tz('Asia/Jakarta').format('HH:mm:ss')} ] Authenticated Success.`)
    sessionCfg = session
    fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), function (err) {
        if (err) console.error(err)
    })
})

client.on('auth_failure', msg => console.log(`[ ${moment().tz('Asia/Jakarta').format('HH:mm:ss')} ] AUTHENTICATION FAILURE \n ${msg}`))

client.on('ready', async () => {
    DB = await db.connect()
    console.log(`[ ${moment().tz('Asia/Jakarta').format('HH:mm:ss')} ] Whatsapp bot ready.`)
})

// ======================= WaBot Listen on Event

client.on('message_revoke_everyone', async (after, before) => {
    if (before) console.log(`[ ${moment().tz('Asia/Jakarta').format('HH:mm:ss')} ] Revoked: ${before.body}`)
})

client.on('change_battery', (status) => {
    if (status.battery <= 25 && !status.plugged) client.sendMessage(config.admin, 'Please charge your phone!')
})

client.on('disconnected', (reason) => console.log('Client was logged out', reason))

// ======================= WaBot Listen on message

client.on('message', async msg => {
    const { from, body, type, hasQuotedMsg, author } = msg
    if (from.includes('@c.us') && type == 'chat') console.log(`[ ${moment().tz('Asia/Jakarta').format('HH:mm:ss')} ] Message:`, from.replace('@c.us', ''), `| ${type} | `, body.substr(0, 50))
    if (from.includes('@g.us') && type == 'chat') console.log(`[ ${moment().tz('Asia/Jakarta').format('HH:mm:ss')} ] Message:`, from.replace('@g.us', ''), `| ${type} | `, body.substr(0, 50))

    const keywords = ['menu', 'info', 'corona', 'help', 'covid', 'aktif', '!info', 'halo', 'hai', 'hallo', '!ping', 'p', '!honk', 'honk!', 'honk', '!help', '!menu', '!covid', '!covid19', '!covid-19', '!inkubasi', '!gejala', '!peta', '!data', '!sumber', '!global', '!corona', '!nasional', '!jabar', '!jateng', '!jatim', '!jakarta', '!bandung', '!bekasi', '!wisma-atlit', '!aktif', '!mati', '!lokasi']
    const keys = keywords.map(x => x + '\\b').join('|')
    const cmd = type === 'chat' ? body.match(new RegExp(keys, 'gi')) : type === 'image' && caption ? caption.match(new RegExp(keys, 'gi')) : ''
    const text = body.toLowerCase()

    if (config.online == false && keyword.includes(text) && from !== config.admin) {
        msg.reply(from, 'Maaf, Bot sedang Offline.')
    }

    if (config.online && keyword.includes(text)) {
        // General Chat
        if (['menu', 'info', 'corona', 'help', 'covid', 'aktif', '!info'].includes(text)) {
            const chat = await msg.getChat()
            if (!chat.isGroup) client.sendMessage(from, 'kirim !menu atau !help untuk melihat menu honk!.')
        } else if (['halo', 'hai', 'hallo'].includes(text)) {
            const chat = await msg.getChat()
            if (!chat.isGroup) client.sendMessage(from, 'hi 😃')
        } else if (['!ping', 'p'].includes(text)) {
            client.sendMessage(from, 'pong')
        } else if (['!honk', 'honk!', 'honk'].includes(text)) {
            client.sendMessage(from, 'Honk Honk!!')
        }

        // Command Menu & informasi
        if (['!help', '!menu'].includes(text)) {
            const contact = await msg.getContact()
            client.sendMessage(from, await resChat.Menu(contact))
        } else if (['!covid', '!covid19', '!covid-19'].includes(text)) {
            client.sendMessage(from, await resChat.SubMenu())
        } else if (text == '!inkubasi') {
            client.sendMessage(from, await resChat.Inkubasi())
        } else if (text == '!gejala') {
            client.sendMessage(from, await resChat.Gejala())
        } else if (text == '!peta') {
            client.sendMessage(from, await resChat.PetaProv())
        } else if (text == '!data') {
            client.sendMessage(from, await resChat.DataNasional())
        } else if (text == '!sumber') {
            client.sendMessage(from, await resChat.SumberData())
        }

        // Command Get Data
        if (text == '!global') {
            console.log(`[ ${moment().tz('Asia/Jakarta').format('HH:mm:ss')} ] Request Data Global).`)
            client.sendMessage(from, await resChat.Global())
        } else if (['!corona', '!nasional'].includes(text)) {
            console.log(`[ ${moment().tz('Asia/Jakarta').format('HH:mm:ss')} ] Request Nasional).`)
            client.sendMessage(from, await resChat.Nasional())
        } else if (text == '!jabar') {
            console.log(`[ ${moment().tz('Asia/Jakarta').format('HH:mm:ss')} ] Request Data Jabar.`)
            client.sendMessage(from, await resChat.Jabar())
        } else if (text == '!jateng') {
            console.log(`[ ${moment().tz('Asia/Jakarta').format('HH:mm:ss')} ] Request Data jateng.`)
            client.sendMessage(from, await resChat.Jateng())
        } else if (text == '!jatim') {
            console.log(`[ ${moment().tz('Asia/Jakarta').format('HH:mm:ss')} ] Request Data Jatim.`)
            client.sendMessage(from, await resChat.Jatim())
        } else if (text == '!jakarta') {
            console.log(`[ ${moment().tz('Asia/Jakarta').format('HH:mm:ss')} ] Request Data Jakarta.`)
            client.sendMessage(from, await resChat.Jakarta())
        } else if (text == '!bandung') {
            console.log(`[ ${moment().tz('Asia/Jakarta').format('HH:mm:ss')} ] Request Data Bandung.`)
            client.sendMessage(from, await resChat.Bandung())
        } else if (text == '!bekasi') {
            console.log(`[ ${moment().tz('Asia/Jakarta').format('HH:mm:ss')} ] Request Data Bekasi.`)
            client.sendMessage(from, await resChat.Bekasi())
        } else if (text == '!wisma-atlit') {
            console.log(`[ ${moment().tz('Asia/Jakarta').format('HH:mm:ss')} ] Request Data Wisma Atlit.`)
            client.sendMessage(from, await resChat.WismaAtlit())
        } else if (text == '!lokasi') {
            if (hasQuotedMsg) {
                const quotedMsg = await msg.getQuotedMessage()
                if (quotedMsg.location !== undefined) {
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
                        client.sendMessage(from, text)
                    } else {
                        client.sendMessage(from, 'Maaf, Terjadi error ketika memeriksa lokasi yang anda kirim.')
                    }
                }
            } else {
                const text = '*CEK LOKASI COVID-19*\nBerikut cara untuk cek lokasimu: \n1. Kirimkan lokasimu\n2. Balas dengan kata !lokasi, lokasi yang kamu kirim tadi (klik & tahan chat lokasimu lalu pilih balas)\n3. Kamu akan mendapat informasi mengenai lokasi yang kamu kirim\n\n Jika kurang jelas silahkan lihat gambar dibawah ini.'
                await client.sendMessage(from, text)
                const tutor = new MessageMedia('image/jpg', fs.readFileSync('./image/lokasi.jpg', 'base64'))
                await client.sendMessage(from, tutor)
            }
        }

        // Command Notification
        if (text == '!aktif') {
            const chat = await msg.getChat()
            const sender = chat.isGroup ? author : from
            // Cek & Input data ke MongoDB
            const dbDataUsers = await db.getDataUsers(DB, sender)
            if (body && dbDataUsers.length < 1) {
                dbDataUsers.push(sender)
                await db.insertDataUsers(DB, sender)
                await client.sendMessage(sender, `Selamat, nomor hp anda "${author.split('@c.us')[0]}" berhasil diregistrasi kedalam daftar notifikasi, anda akan mendapat notifikasi ketika ada pembaruan data.`)
            } else {
                await client.sendMessage(sender, 'Maaf, nomor hp anda telah diregistrasi. Untuk membatalkan kirim *!mati*')
            }
        } else if (text == '!mati') {
            const chat = await msg.getChat()
            const sender = chat.isGroup ? author : from
            const dbDataUsers = await db.getDataUsers(DB, sender)
            if (body && dbDataUsers.length < 1) {
                await client.sendMessage(sender, 'Maaf, Nomor anda belum diregistrasi. Registrasi nomor anda dengan kirim *!aktif*')
            } else {
                await db.deleteDataUsers(DB, sender)
                await client.sendMessage(sender, 'Nomor anda telah dihapus dari daftar notifikasi')
            }
        }
    }

    if (from == config.admin || config.bot) {
        // Command Admin
        if (body.startsWith('!state-')) {
            const state = body.split('-')[1]
            if (state == 'online') {
                if (config.online) {
                    client.sendMessage(from, 'Bot is Online.')
                } else {
                    config.online = true
                    client.sendMessage(from, 'Bot is now Online.')
                }
            } else if (state == 'offline') {
                if (!config.online) {
                    client.sendMessage(from, 'Bot is Offline')
                } else {
                    config.online = false
                    client.sendMessage(from, 'Bot is now Offline')
                }
            } else if (state == 'status') {
                config.online ? client.sendMessage(from, 'Bot is Online') : client.sendMessage(from, 'Bot is Offline')
            }
        } else if (text == '!chats') {
            const chats = await client.getChats()
            const group = chats.filter(x => x.isGroup == true)
            const personalChat = chats.filter(x => x.isGroup == false)
            const archivedChat = chats.filter(x => x.archived == true)
            const getListUsers = await db.getAllDataUsers(DB)
            client.sendMessage(from, `The bot has...\nChats Open: ${chats.length}\nGroups Chats: ${group.length}\nPersonal Chats: ${personalChat.length}\nArchived Chats: ${archivedChat.length}\nUnArchived Chats: ${personalChat.length - archivedChat.length}\nNotification User: ${getListUsers.length}`)
        } else if (text == '!broadcast') {
            const getListUsers = await db.getAllDataUsers(DB)
            getListUsers.map((item, index) => {
                const number = item.phone_number
                setTimeout(async function () {
                    console.log(`[ ${moment().tz('Asia/Jakarta').format('HH:mm:ss')} ] Send Broadcast to ${number} (${index})`)
                    client.sendMessage(number, await resChat.Broadcast())
                }, index * 500)
            })
        } else if (text == '!dbcheck') {
            const getListUsers = await db.getAllDataUsers(DB)
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
                await client.sendMessage(from, `unRegister number in DB:\n${UnRegist.toString().replace(/,/g, '\n')}`)
                await client.sendMessage(from, 'Delete unRegister number from DB...')
                await Promise.all(UnRegist.map(async (number) => {
                    await db.deleteDataUsers(DB, number)
                }))
            } else {
                client.sendMessage(from, 'There is no unRegister number in DB')
            }
        } else if (text == '!archive') {
            await client.getChats()
                .then(x => {
                    const personal = x.filter(y => y.isGroup == false)
                    const archivedChat = personal.filter(y => y.archived == false)
                    msg.reply(`Request diterima bot akan meng-archieve ${archivedChat.length} personal chat.`)
                    x.map((z) => {
                        if (z.isGroup == false && z.archived == false) z.archive()
                    })
                })
        } else if (text == '!delete') {
            const chats = await client.getChats()
            const personal = chats.filter(x => x.isGroup == false)
            // Delete personal chat
            msg.reply(`Request diterima bot akan menghapus ${personal.length} personal chat.`)
            chats.map((x) => {
                if (x.isGroup == false) x.delete()
            })
        } else if (body.startsWith('!leave ')) {
            const chats = await client.getChats()
            const search = chats.filter(x => x.isGroup == true)
            const except = search.filter(x => x.id._serialized !== body.split(' ')[1])
            // Leave from all group
            msg.reply(`Request diterima bot akan keluar dari ${except.length} grup.`)
            for (var i = 0; i < except.length; i++) {
                console.log(`Keluar dari Grup: ${except[i].name}`)
                except[i].leave()
            }
        } else if (body.startsWith('!join ')) {
            const inviteCode = body.split(' ')[1]
            try {
                await client.acceptInvite(inviteCode)
                msg.reply('Joined the group!')
            } catch (e) {
                msg.reply('That invite code seems to be invalid.')
            }
        } else if (body.startsWith('!sendto ')) {
            let number = body.split(' ')[1]
            const messageIndex = body.indexOf(number) + number.length
            const message = body.slice(messageIndex, body.length)
            if (number.includes('@g.us')) {
                const group = await client.getChatById(number)
                group.sendMessage(message)
            } else if (!number.includes('@c.us') && !number.includes('@g.us')) {
                number = number.includes('@c.us') ? number : `${number}@c.us`
                client.sendMessage(number, message)
            }
        }
    }

    if (keyword.includes(text) && (from !== config.admin || config.bot)) {
        setTimeout(async function () {
            const chat = await msg.getChat()
            if (!chat.isGroup) chat.archive()
            }, 500)
    }
})

// ======================= mqtt

listen.on('connect', () => {
    listen.subscribe(process.env.MQTT_TOPIC, function (err) {
        if (!err) console.log(`[ ${moment().tz('Asia/Jakarta').format('HH:mm:ss')} ] Mqtt topic [${process.env.MQTT_TOPIC}] subscribed!`)
    })
})

listen.on('message', async (topic, message) => {
    console.log(`[ ${moment().tz('Asia/Jakarta').format('HH:mm:ss')} ] MQTT: ${message.toString()}`)
    if (message.toString() == 'New Update!') {
        const getListUsers = await db.getAllDataUsers(DB)
        fs.readFile('./CoronaService/data.json', 'utf-8', function (err, data) {
            if (err) throw err
            const localData = JSON.parse(data)
            const textUpdate = `
*COVID-19 Update!!*
Negara: ${localData.Country}
Hari Ke: ${localData.Day}
Provinsi Terdampak: ${localData.ProvinsiTerdampak}
Kabupaten/Kota Terdampak: ${localData.KabKotTerdampak}

Total ODP: ${localData.TotalODP}
Total PDP: ${localData.TotalPDP}

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
                    `
            getListUsers.map((item, index) => {
                const number = item.phone_number
                setTimeout(async function () {
                    console.log(`[ ${moment().tz('Asia/Jakarta').format('HH:mm:ss')} ] Send Corona Update to ${number} (${index})`)
                    try {
                        await client.sendMessage(number, textUpdate)
                    } catch (error) {
                        console.log(error.message)
                    }
                }, index * 1100) // Delay 1,1 Sec
            })
        })
    }
})

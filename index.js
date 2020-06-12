require('dotenv').config()
const { Client, MessageMedia } = require('whatsapp-web.js')
const fs = require('fs')
const qrcode = require('qrcode-terminal')
const mqtt = require('mqtt')
const db = require('./helper/db')
const resChat = require('./helper/message')
const getAll = require('./util/location')
const { c, color } = require('./util/log')
const listen = mqtt.connect(process.env.MQTT_URL)

let sessionCfg
const SESSION_FILE_PATH = './session.json'
if (fs.existsSync(SESSION_FILE_PATH)) sessionCfg = require(SESSION_FILE_PATH)

const client = new Client({
    qrTimeoutMs: 0,
    authTimeoutMs: 0,
    restartOnAuthFail: true,
    takeoverOnConflict: true,
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--ignore-certificate-errors',
            '--disable-web-security',
            '--disable-site-isolation-trials',
            '--log-level=3',
            '--ignore-certificate-errors-spki-list',
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

// ==========#yogs#========= Begin initialize client
client.initialize()

// ==========#yogs#========= Event handler
client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true })
    c.log('Please Scan QR with app!')
})

client.on('authenticated', (session) => {
    c.log('Authenticated Success.')
    sessionCfg = session
    fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), function (err) { if (err) console.error(err) })
})

client.on('auth_failure', (msg) => c.log(`AUTHENTICATION FAILURE \n ${msg}`))
client.on('disconnected', (reason) => c.log('Client was logged out', reason))
client.on('ready', () => c.log('Whatsapp bot ready.'))
client.on('message_revoke_everyone', (after, before) => { if (before) c.log(`Revoked: ${before.body}`) })
client.on('change_battery', (status) => { if (status.battery <= 25 && !status.plugged) c.log('Please charge your phone!') })

// ==========#yogs#========= Event handler: message

// [Sample] Avoid Spam Message
const usedCommandRecently = new Set()
const usedCommand = (from) => {
    usedCommandRecently.add(from)
    setTimeout(() => {
        usedCommandRecently.delete(from)
    }, 5000) // 5 sec delay
}

const config = {
    online: true,
    archive: false
}

client.on('message', async msg => {
    const { hasMedia, hasQuotedMsg, isForwarded, body, type, from, author, mentionedIds, location } = msg
    const caption = type == 'image' ? body : undefined
    const isChat = type == 'chat'
    const isGroupMsg = from.includes('@g.us')
    const admin = isGroupMsg ? `${from.split('-')[0]}@c.us` : from
    const isAdmin = await db.findAdmin(admin)
    const getAdmin = await db.getAllAdmin()
    const keyword = ['halo', 'hai', 'hi', 'hallo', '!ping', '!honk', 'honk', '!help', '!covid', '!covid19', '!global', '!corona', '!nasional', '!jabar', '!jateng', '!jatim', '!jakarta', '!bandung', '!bekasi', '!wisma-atlit', '!aktif', '!mati', '!lokasi']
    const keys = keyword.map(x => x + '\\b').join('|')
    let cmd = isChat ? body.toLowerCase().match(new RegExp(keys, 'gi')) : type === 'image' && caption ? caption.toLowerCase().match(new RegExp(keys, 'gi')) : ''

    // [Sample] Avoid Spam Message
    const useCommandRecently = usedCommandRecently.has(from)

    // [Sample] Avoid Spam Message
    if ((cmd && !useCommandRecently && config.online) || (cmd && isAdmin)) {
        // [Sample] Avoid Spam Message
        usedCommand(from)

        cmd = cmd[0]
        if (!isGroupMsg && isChat) c.logx(color(cmd, 'yellow'), 'from', color(from.replace('@c.us', ''), 'yellow'))
        if (isGroupMsg && isChat) c.logx(color(cmd, 'yellow'), 'from', color(from.replace('@g.us', ''), 'yellow'))

        // General Chat
        if (['halo', 'hai', 'hi', 'hallo'].includes(cmd)) {
            if (!isGroupMsg) msg.reply('hi 😃')
        } else if (cmd == '!ping') {
            client.sendMessage(from, 'pong')
        } else if (['!honk', 'honk'].includes(cmd)) {
            client.sendMessage(from, 'Honk Honk!!')
        }

        // Command Menu & informasi
        if (cmd == '!help') {
            const contact = await msg.getContact()
            client.sendMessage(from, await resChat.Menu(contact))
        } else if (['!covid', '!covid19'].includes(cmd)) {
            client.sendMessage(from, await resChat.SubMenu())
        }

        // Command Get Data
        if (cmd == '!global') {
            c.log('Request Data Global.')
            client.sendMessage(from, await resChat.Global())
        } else if (['!corona', '!nasional'].includes(cmd)) {
            c.log('Request Nasional.')
            client.sendMessage(from, await resChat.Nasional())
        } else if (cmd == '!jabar') {
            c.log('Request Data Jabar.')
            client.sendMessage(from, await resChat.Jabar())
        } else if (cmd == '!jateng') {
            c.log('Request Data jateng.')
            client.sendMessage(from, await resChat.Jateng())
        } else if (cmd == '!jatim') {
            c.log('Request Data Jatim.')
            client.sendMessage(from, await resChat.Jatim())
        } else if (cmd == '!bandung') {
            c.log(' Request Data Bandung.')
            client.sendMessage(from, await resChat.Bandung())
        } else if (cmd == '!wisma-atlit') {
            c.log(' Request Data Wisma Atlit.')
            client.sendMessage(from, await resChat.WismaAtlit())
        } else if (cmd == '!lokasi') {
            if (hasQuotedMsg) {
                const quotedMsg = await msg.getQuotedMessage()
                if (quotedMsg.location !== undefined) {
                    c.log(` Request Status Zona (${quotedMsg.location.latitude},${quotedMsg.location.longitude}).`)
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
        if (cmd == '!aktif') {
            const sender = isGroupMsg ? author : from
            // Cek & Input data di DB
            const cekMember = await db.findMember(sender)
            if (!cekMember) {
                await db.insertMember(sender)
                client.sendMessage(sender, `Selamat, nomor hp anda "${sender.split('@c.us')[0]}" berhasil diregistrasi kedalam daftar notifikasi, anda akan mendapat notifikasi ketika ada pembaruan data.`)
            } else {
                client.sendMessage(sender, 'Maaf, nomor hp anda telah diregistrasi. Untuk membatalkan kirim *!mati*')
            }
        } else if (cmd == '!mati') {
            const sender = isGroupMsg ? author : from
            // Cek & Delete data di DB
            const cekMember = await db.findMember(sender)
            if (cekMember) {
                await db.deleteMember(sender)
                client.sendMessage(sender, 'Nomor anda telah dihapus dari daftar notifikasi')
            } else {
                client.sendMessage(sender, 'Maaf, Nomor anda belum diregistrasi. Registrasi nomor anda dengan kirim *!aktif*')
            }
        }
    } else if (body.startsWith('$')) {
        // This is the condition if you haven't entered admin number to DB
        if (getAdmin.length == 0) {
            if (body.startsWith('$addMin')) {
                db.insertAdmin(from)
                client.sendMessage(from, 'Alright, your highness!')
            } else {
                client.sendMessage(from, 'Please Add admin number!')
                client.sendMessage(from, 'Send: $addMin')
            }
        }

        if (isAdmin) {
            if (!isGroupMsg && isChat) c.logz(color(body, 'blue'), 'from', color(from.replace('@c.us', ''), 'blue'))
            if (isGroupMsg && isChat) c.logz(color(body, 'blue'), 'from', color(from.replace('@g.us', ''), 'blue'))
            // Command Admin
            if (body.startsWith('$state')) {
                const status = `\nBot Status:\n- 🤖 Online: ${config.online}\n- 🗄️ Auto Archive: ${config.archive}\n`
                 switch (body.split('-')[1]) {
                    case 'status':
                        client.sendMessage(from, status)
                        break
                    case 'online':
                        if (config.online) {
                            config.online = false
                            client.sendMessage(from, '🤖 Bot is now Offline.')
                        } else {
                            config.online = true
                            client.sendMessage(from, '🤖 Bot is now Online.')
                        }
                        break
                    case 'archive':
                        if (config.archive) {
                            config.archive = false
                            client.sendMessage(from, '🗄️ Auto archive deactivated')
                        } else {
                            config.online = false
                            client.sendMessage(from, '🗄️ Auto archive activated')
                        }
                        break
                    default:
                        client.sendMessage(from, '🤖 Config Command:\n$state-status: melihat config bot\n$state-online: merubah bot menjadi online/offline\n$state-archive: mengaktifkan/mematikan auto archive')
                        break
                }
            } else if (body.startsWith('$chats')) {
                const chats = await client.getChats()
                const group = chats.filter(x => x.isGroup == true)
                const personalChat = chats.filter(x => x.isGroup == false)
                const archivedChat = chats.filter(x => x.archived == true)
                const getListUsers = await db.getAllMember()
                client.sendMessage(from, `The bot has...\nChats Open: ${chats.length}\nGroups Chats: ${group.length}\nPersonal Chats: ${personalChat.length}\nArchived Chats: ${archivedChat.length}\nUnArchived Chats: ${personalChat.length - archivedChat.length}\nNotification User: ${getListUsers.length}`)
            } else if (body.startsWith('$broadcast')) {
                const messages = body.substr(body.indexOf(' ') + 1)
                const getListUsers = await db.getAllMember()
                if (getListUsers.length == 0) {
                    client.sendMessage(from, 'No member!')
                } else {
                    getListUsers.map((item, index) => {
                        const number = item.phone
                        setTimeout(async function () {
                            c.log(` (${index}) Send Broadcast to ${number} > ${messages}`)
                            await client.sendMessage(number, messages)
                        }, index * 500)
                    })
                }
            } else if (body.startsWith('$dbcheck')) {
                const UnRegist = []
                const getListUsers = await db.getAllMember()
                if (getListUsers.length !== 0) {
                    getListUsers.map((item, index) => {
                        const number = item.phone
                        const status = client.isRegisteredUser(item.phone)
                        if (status == false) UnRegist.push(number)
                    })

                    if (UnRegist.length !== 0) {
                        client.sendMessage(from, `unRegister number in DB:\n${UnRegist.toString().replace(/,/g, '\n')}`)
                        client.sendMessage(from, 'Delete unRegister number from DB...')
                        UnRegist.map(async (number) => {
                            await db.deleteMember(number)
                        })
                    } else {
                        client.sendMessage(from, 'There is no unRegister number in DB')
                    }
                } else {
                    client.sendMessage(from, 'No member!')
                }
            } else if (body.startsWith('$archive')) {
                const chats = await client.getChats()
                const personal = chats.filter(x => x.isGroup == false)
                const unArchivedChat = personal.filter(y => y.archived == false)
                msg.reply(`Request diterima bot akan meng-archieve ${unArchivedChat.length} personal chat.`)
                unArchivedChat.map((z, c) => {
                    setTimeout(() => {
                        z.archive()
                    }, c * 100)
                })
            } else if (body.startsWith('$delete')) {
                const chats = await client.getChats()
                const personal = chats.filter(x => x.isGroup == false)
                // Delete personal chat
                msg.reply(`Request diterima bot akan menghapus ${personal.length} personal chat.`)
                chats.map((x) => {
                    if (x.isGroup == false) x.delete()
                })
            } else if (body.startsWith('$leave')) {
                const chats = await client.getChats()
                let filter
                if (body.split(' ')[1] === 'all') {
                    // Leave from all group
                    filter = chats.filter(x => x.isGroup == true)
                } else {
                    console.log('Command !leave tidak lengkap!')
                }
                // const filter = search.filter(x => x.id._serialized !== '')
                msg.reply(`Request diterima bot akan keluar dari ${filter.length} grup.`)
                for (var i = 0; i < filter.length; i++) {
                    console.log(`Keluar dari Grup: ${filter[i].name}`)
                    filter[i].leave()
                }
            } else if (body.startsWith('$join')) {
                const inviteCode = body.split(' ')[1]
                try {
                    await client.acceptInvite(inviteCode)
                    msg.reply('Joined the group!')
                } catch (e) {
                    msg.reply('That invite code seems to be invalid.')
                }
            } else if (body.startsWith('$sendto')) {
                let number = body.split(' ')[1]
                const messageIndex = body.indexOf(number) + number.length
                const message = body.slice(messageIndex, body.length)
                number = number.includes('@c.us') ? number : `${number}@c.us`
                const status = client.isRegisteredUser(number)
                if (status) {
                    client.sendMessage(number, message)
                } else {
                    client.sendMessage(from, 'sorry this number is not registered on whatsapp')
                }
            }
        } else {
            !isGroupMsg && isChat ? c.logz(color(body, 'red'), 'from', color(from.replace('@c.us', ''), 'red')) : c.logz(color(body, 'red'), 'from', color(from.replace('@g.us', ''), 'red'))
            if (!isGroupMsg && isChat && getAdmin.length != 0) msg.reply('Wait, who are you???')
        }
    } else if (cmd && config.online == false && !isAdmin) {
        client.sendMessage(from, 'Maaf, Bot sedang Offline.')
    } else {
        if (!isGroupMsg && isChat) c.logy(color(body.substr(0, 15)), 'from', color(from.replace('@c.us', '')))
        if (isGroupMsg && isChat) c.logy(color(body.substr(0, 15)), 'from', color(from.replace('@g.us', '')))
    }

    if (config.archive && !isAdmin) {
        setTimeout(async function () {
            const chat = await msg.getChat()
            chat.archive()
        }, 500)
    }
})

// ==========#yogs#========= mqtt connect & subs

listen.on('connect', () => {
    listen.subscribe(process.env.MQTT_TOPIC, function (err) {
        if (!err) c.log(`Mqtt topic [${process.env.MQTT_TOPIC}] subscribed!`)
    })
})

// ==========#yogs#========= this will run if there is a new mqtt message

listen.on('message', async (topic, message) => {
    c.log(` MQTT: ${message.toString()}`)
    if (message.toString() == 'New Update!') {
        const getListUsers = await db.getAllMember(DB)
        if (getListUsers.length != 0) {
            fs.readFile('./CoronaService/data.json', 'utf-8', function (err, data) {
                if (err) throw err
                const localData = JSON.parse(data)
                const textUpdate = `
*COVID-19 Update!!*
Negara: ${localData.Country}
Hari Ke: ${localData.Day}
Provinsi Terdampak: 34
    
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
                    const number = item.phone
                    setTimeout(() => {
                        c.log(` [${index}] Send Corona Update to ${number}`)
                        try {
                            client.sendMessage(number, textUpdate)
                        } catch (error) {
                            console.log(error.message)
                        }
                    }, index * 1100) // Delay 1,1 Sec
                })
            })
        } else {
            const getAdmin = await db.getAllAdmin()
            client.sendMessage(getAdmin[0], 'No member!')
        }
    }
})

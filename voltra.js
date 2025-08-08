const {
    downloadContentFromMessage,
    BufferJSON,
    WA_DEFAULT_EPHEMERAL,
    generateWAMessageFromContent,
    proto,
    generateWAMessageContent,
    generateWAMessage,
    prepareWAMessageMedia,
    areJidsSameUser,
    getContentType
} = require('@whiskeysockets/baileys')

const os = require('os')
const fs = require('fs')
const fsx = require('fs-extra')
const path = require('path')
const util = require('util')
const { color } = require('./lib/color') // Pastikan path ini benar
const chalk = require('chalk')
const moment = require('moment-timezone')
const cron = require('node-cron') // Pastikan modul node-cron sudah terinstal
const speed = require('performance-now')
const ms = require('ms') // Langsung require 'ms'
const axios = require('axios')
const fetch = require('node-fetch')
const cheerio = require('cheerio')
const crypto = require('crypto');
const { randomBytes } = require('crypto')
const FormData = require('form-data');

const {
    exec,
    spawn,
    execSync
} = require("child_process")

const {
    performance
} = require('perf_hooks')

// Menjadi ini (Pastikan fungsi-fungsi ini ada di lib/myfunc.js atau di sini)
const {
    smsg,
    getGroupAdmins, // Pastikan ini ada di lib/myfunc.js
    formatp,
    formatDate,
    getTime,
    isUrl, // Pastikan ini ada di lib/myfunc.js
    sleep, // Pastikan ini ada di lib/myfunc.js
    clockString, // Pastikan ini ada di lib/myfunc.js
    msToDate, // Pastikan ini ada di lib/myfunc.js
    sort,
    toNumber,
    enumGetKey,
    runtime, // Pastikan ini ada di lib/myfunc.js
    fetchJson,
    getBuffer, // Pastikan ini ada di lib/myfunc.js
    json,
    format,
    logic,
    generateProfilePicture,
    parseMention,
    getRandom,
    pickRandom,
    fetchBuffer,
    buffergif,
    totalcase
} = require('./lib/myfunc') // Sesuaikan path jika berbeda

const { voltra_antispam } = require('./lib/antispam') // Pastikan path ini benar

// FUNCTION STORE (Import semua fungsi dari store.js)
 const {
        addResponList, delResponList, isAlreadyResponList, isAlreadyResponListGroup, sendResponList, updateResponList, getDataResponList,
        setResponListStatus, renameList,
        isSetProses, changeSetProses, addSetProses, removeSetProses, getTextSetProses,
        isSetDone, changeSetDone, addSetDone, removeSetDone, getTextSetDone,
        isSetOpen, changeSetOpen, addSetOpen, removeSetOpen, getTextSetOpen,
        isSetClose, changeSetClose, addSetClose, removeSetClose, getTextSetClose,
        isSetListHeader, changeSetListHeader, addSetListHeader, removeSetListHeader, getTextSetListHeader,
        isSetListSymbol, changeSetListSymbol, addSetListSymbol, removeSetListSymbol, getTextSetListSymbol,
        isSetListFooter, changeSetListFooter, addSetListFooter, removeSetListFooter, getTextSetListFooter,
        // Tambahkan fungsi sewa di sini
         loadSewaData,saveSewaData,addSewa, deleteSewa, getSewaList, getSewaData, isSewaActive,
    } = require('./lib/store'); // Pastikan path ini benar

// DATABASE STORE (Pemuatan database baru)
// const db_respon_list = JSON.parse(fs.readFileSync('./database/list.json')) // Keep if list.json is used for non-order lists
// const saldoMem = './database/users.json'; // Path ke file users.json - REMOVED

// Pemuatan database baru
const set_proses = JSON.parse(fs.readFileSync('./database/set_proses.json'))
const set_done = JSON.parse(fs.readFileSync('./database/set_done.json'))
const set_open = JSON.parse(fs.readFileSync('./database/set_open.json'))
const set_close = JSON.parse(fs.readFileSync('./database/set_close.json'))
const setlist_header = JSON.parse(fs.readFileSync('./database/setlist_header.json'))
const setlist_symbol = JSON.parse(fs.readFileSync('./database/setlist_symbol.json'))
const setlist_footer = JSON.parse(fs.readFileSync('./database/setlist_footer.json'))
if (!fs.existsSync('./database/pay.json')) {
    fs.writeFileSync('./database/pay.json', '[]'); // Initialize as an empty JSON array
}

// Global variables (Jika tidak ada settings.js, definisikan di sini)
global.owner = ["6285804546789"]; // Ganti dengan nomor owner Anda (tanpa @s.whatsapp.net)
global.namabot = "Preamteam BOT"; // Nama bot Anda
global.namaowner = "OsingWeb Sumber Digital"; // Nama owner Anda
global.footer_text = "Bot Auto Order"; // Teks footer
global.pp_bot = "https://telegra.ph/file/20230920230920.jpg"; // URL gambar profil bot

// =================================================//
// Pastikan file database-all.json ada
if (!fs.existsSync('./database/database-all.json')) {
    fs.writeFileSync('./database/database-all.json', JSON.stringify({
        sticker: {},
        database: {},
        game: {},
        others: {},
        users: {},
        chats: {},
        settings: {}
    }, null, 2));
}

global.db = global.db || {}; // Ensure global.db is initialized
global.db.data = JSON.parse(fs.readFileSync('./database/database-all.json'))
if (global.db.data) global.db.data = {
    sticker: {},
    database: {},
    game: {},
    others: {},
    users: {},
    chats: {},
    settings: {},
    ...(global.db.data || {})
}

let vote = global.db.data.others.vote = []
let kuismath = global.db.data.game.math = []

// WAKTU
const time = moment.tz('Asia/Jakarta').format('HH:mm:ss')
const date = moment.tz('Asia/Jakarta').format('DD/MM/YYYY')
const time2 = moment().tz('Asia/Jakarta').format('HH:mm:ss')
if (time2 < "23:59:00") {
    var ucapanWaktu = `Good Night 🌌`
}
if (time2 < "19:00:00") {
    var ucapanWaktu = `Good Evening 🌃`
}
if (time2 < "18:00:00") {
    var ucapanWaktu = `Good Evening 🌃`
}
if (time2 < "15:00:00") {
    var ucapanWaktu = `Good Afternoon 🌅`
}
if (time2 < "11:00:00") {
    var ucapanWaktu = `Good Morning 🌄`
}
if (time2 < "05:00:00") {
    var ucapanWaktu = `Good Morning 🌄`
}
// FUNCTION

const reSize = async (buffer, ukur1, ukur2) => {
    return new Promise(async (resolve, reject) => {
        let jimp = require('jimp')
        var baper = await jimp.read(buffer);
        var ab = await baper.resize(ukur1, ukur2).getBufferAsync(jimp.MIME_JPEG)
        resolve(ab)
    })
}

// Fungsi untuk mengganti placeholder newline dengan karakter newline
function replaceNewlines(text) {
    if (typeof text !== 'string') return text; // Pastikan input adalah string
    return text
        .replace(/@2newline/g, '\n\n') // Ganti @2newline dengan dua baris baru
        .replace(/@newline/g, '\n'); // Ganti @newline dengan satu baris baru
}

// Fungsi untuk memformat pesan status grup (open/close)
function formatStatusMessage(groupId, senderName, groupName, caption) {
    const now = moment().tz('Asia/Jakarta');
    const tanggal = now.format('DD/MM/YYYY');
    const day = now.format('dddd');
    const tgl = now.format('dddd, DD MMMM YYYY');
    const wib = now.format('HH:mm:ss');
    const wit = now.tz('Asia/Makassar').format('HH:mm:ss');
    const wita = now.tz('Asia/Jayapura').format('HH:mm:ss');
    const jam = wib; // Alias untuk WIB

return caption
        .replace(/@user/g, senderName)
        .replace(/@tanggal/g, tanggal)
        .replace(/@day/g, day)
        .replace(/@tgl/g, tgl)
        .replace(/@wib/g, wib)
        .replace(/@wit/g, wit)
        .replace(/@wita/g, wita)
        .replace(/@jam/g, jam)
        .replace(/@group/g, groupName);
}
    // FUNCTION STORE (Import semua fungsi dari store.js)
   
    


// MODULE
module.exports = voltra = async (voltra, m, msg, chatUpdate, sewa, store) => {
    try {
        const {
            type,
            quotedMsg,
            mentioned,
            // now, // REMOVE THIS LINE
            fromMe
        } = m
        var body = (
            (m.mtype === 'conversation') ? m.message.conversation :
                (m.mtype == 'imageMessage') ? m.message.imageMessage.caption :
                    (m.mtype == 'videoMessage') ? m.message.videoMessage.caption :
                        (m.mtype == 'extendedTextMessage') ? m.message.extendedTextMessage.text :
                            (m.mtype == 'buttonsResponseMessage') ? m.message.buttonsResponseMessage.selectedButtonId :
                                (m.mtype == 'listResponseMessage') ? m.message.listResponseMessage.singleSelectReply.selectedRowId :
                                    (m.mtype == 'templateButtonReplyMessage') ? m.message.templateButtonReplyMessage.selectedId :
                                        (m.mtype === 'messageContextInfo') ? (m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply.selectedRowId || m.text) :
                                            ''
        ) || ''
        var budy = (typeof m.text == 'string' ? m.text : '')
        var prefix = ['', '#', '.', '/'] ? /^[°•π÷×¶∆£¢€¥®™+✓_=|~!?@#$%^&.©^]/gi.test(body) ? body.match(/^[°•π÷×¶∆£¢€¥®™+✓_=|~!?@#$%^&.©^]/gi)[0] : "" : xprefix
        const isCmd = body.startsWith(prefix)
        const command = body.replace(prefix, '').trim().split(/ +/).shift().toLowerCase()
        const args = body.trim().split(/ +/).slice(1)
        const full_args = body.replace(command, '').slice(1).trim()
        const pushname = m.pushName || "No Name"
        const botNumber = await voltra.decodeJid(voltra.user.id)
        const apikeypaydisini = global.apikey
        const sender = m.sender
        const text = q = args.join(" ")
        const from = m.key.remoteJid
        const quoted = m.quoted ? m.quoted : m
        const mime = (quoted.msg || quoted).mimetype || ''
        const qmsg = (quoted.msg || quoted)
        const sticker = []

        // Prefix 2
        const pric = /^#.¦|\\^/.test(body) ? body.match(/^#.¦|\\^/gi) : xprefix
        const dhanielsbody = body.startsWith(pric)
        const isCommand = dhanielsbody ? body.replace(pric, '').trim().split(/ +/).shift().toLowerCase() : ""

        // Media
        const isMedia = /image|video|sticker|audio/.test(mime)
        const isImage = (type == 'imageMessage')
        const isVideo = (type == 'videoMessage')
        const isAudio = (type == 'audioMessage')
        const isDocument = (type == 'documentMessage')
        const isLocation = (type == 'locationMessage')
        const isContact = (type == 'contactMessage')
        const isSticker = (type == 'stickerMessage')
        const isText = (type == 'textMessage')
        const isQuotedText = type === 'extendexTextMessage' && content.includes('textMessage')
        const isQuotedImage = type === 'extendedTextMessage' && content.includes('imageMessage')
        const isQuotedLocation = type === 'extendedTextMessage' && content.includes('locationMessage')
        const isQuotedVideo = type === 'extendedTextMessage' && content.includes('videoMessage')
        const isQuotedSticker = type === 'extendedTextMessage' && content.includes('stickerMessage')
        const isQuotedAudio = type === 'extendedTextMessage' && content.includes('audioMessage')
        const isQuotedContact = type === 'extendedTextMessage' && content.includes('contactMessage')
        const isQuotedDocument = type === 'extendedTextMessage' && content.includes('documentMessage')

        // GROUP
const isGroup = m.key.remoteJid.endsWith('@g.us');
let groupMetadata = null; // Inisialisasi dengan null
let groupName = ''; // Inisialisasi dengan string kosong
let participants = []; // Inisialisasi dengan array kosong
let groupAdmins = []; // Inisialisasi dengan array kosong
let isGroupAdmins = false;
let isBotAdmins = false;
let isAdmins = false;
let groupOwner = '';
let isGroupOwner = false;
if (m.isGroup) {
    try {
        groupMetadata = await voltra.groupMetadata(m.chat);
        groupName = groupMetadata.subject;
        participants = groupMetadata.participants; // TIDAK PERLU AWAIT DI SINI, groupMetadata.participants sudah array
        groupAdmins = getGroupAdmins(participants); // Panggil fungsi getGroupAdmins
        isGroupAdmins = groupAdmins.includes(m.sender);
        isBotAdmins = groupAdmins.includes(botNumber);
        isAdmins = groupAdmins.includes(m.sender);
        groupOwner = groupMetadata.owner;
        isGroupOwner = (groupOwner ? groupOwner : groupAdmins).includes(m.sender);
   } catch (e) {
        console.error(`Failed to get group metadata for ${m.chat}:`, e);
        // Jika gagal mendapatkan metadata, set nilai default agar tidak error
        groupMetadata = {}; // Objek kosong agar properti tidak undefined
        groupName = 'Tidak Diketahui';
        participants = [];
        groupAdmins = [];
        isGroupAdmins = false;
        isBotAdmins = false;
        isAdmins = false;
        groupOwner = '';
        isGroupOwner = false;
    }
}
        
        
        // Anti Media
        const isfiles = m.mtype

        const reply = (text) => {
            voltra.sendMessage(m.chat, { text }).then(() => console.log).catch(err => console.log('error reply', err))
        }

        // Fungsi baru untuk menambahkan reaksi
const addReaction = async (chatId, messageKey, emoji) => {
    try {
        await voltra.sendMessage(chatId, { react: { text: emoji, key: messageKey } });
    } catch (error) {
        console.error("Failed to add reaction:", error);
    }
};
        
        const mentions = (teks, memberr, id) => {
            (id == null || id == undefined || id == false) ? voltra.sendMessage(from, teks.trim(), extendedText, {
                contextInfo: {
                    "mentionedJid": memberr
                }
            }) : voltra.sendMessage(from, teks.trim(), extendedText, {
                quoted: m,
                contextInfo: {
                    "mentionedJid": memberr
                }
            })
        }
        const isCreator = global.owner.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender)

        async function sendvoltraMessage(chatId, message, options = {}) {
            let generate = await generateWAMessage(chatId, message, options)
            let type2 = getContentType(generate.message)
            if ('contextInfo' in options) generate.message[type2].contextInfo = options?.contextInfo
            if ('contextInfo' in message) generate.message[type2].contextInfo = message?.contextInfo
            return await voltra.relayMessage(chatId, generate.message, { messageId: generate.key.id })
        }
// Fungsi baru untuk menambahkan reaksi

        const pickRandom = (arr) => {
            return arr[Math.floor(Math.random() * arr.length)]
        }

        // Cek Sewa untuk setiap pesan (Ditempatkan di sini agar setiap pesan masuk dicek)
        if (m.isGroup && !isCreator) { // Hanya berlaku untuk grup dan bukan owner
            const sewaData = getSewaData(m.chat);
            if (!sewaData || !isSewaActive(m.chat)) {
                // Jika sewa tidak aktif atau tidak ditemukan, bot akan keluar
                await voltra.sendMessage(m.chat, { text: `Masa sewa bot di grup ini telah habis. Bot akan keluar dari grup. Silakan hubungi owner untuk perpanjangan.` });
                await voltra.groupLeave(m.chat);
                return; // Hentikan pemrosesan pesan lebih lanjut
            }
        }


        try {
            let isNumber = x => typeof x === 'number' && !isNaN(x)
            let user = global.db.data.users[sender]
            if (typeof user !== 'object') global.db.data.users[sender] = {}
            if (user) {
                if (!isNumber(user.afkTime)) user.afkTime = -1
                if (!('badword' in user)) user.badword = 0
                if (!('title' in user)) user.title = ''
                if (!('serialNumber' in user)) user.serialNumber = randomBytes(16).toString('hex')
                if (!('afkReason' in user)) user.afkReason = ''
                if (!('nick' in user)) user.nick = voltra.getName(sender)
                if (!isNumber(user.slrTime)) user.slrTime = -1;
                if (!('slrReason' in user)) user.slrReason = '';
            } else global.db.data.users[sender] = {
                serialNumber: randomBytes(16).toString('hex'),
                afkTime: -1,
                badword: 0,
                afkReason: '',
                nick: voltra.getName(sender),
                slrTime: -1,
                slrReason: '',
            }

            let chats = global.db.data.chats[from]
            if (typeof chats !== 'object') global.db.data.chats[from] = {}
            if (chats) {
                if (!('badword' in chats)) chats.badword = false
                if (!('antiforeignnum' in chats)) chats.antiforeignnum = false
                if (!('antibot' in chats)) chats.antibot = false
                if (!('antiviewonce' in chats)) chats.antiviewonce = false
                if (!('antispam' in chats)) chats.antispam = false
                if (!('antimedia' in chats)) chats.media = false
                if (!('antivirtex' in chats)) chats.antivirtex = false
                if (!('antiimage' in chats)) chats.antiimage = false
                if (!('antivideo' in chats)) chats.antivideo = false
                if (!('antiaudio' in chats)) chats.antiaudio = false
                if (!('antipoll' in chats)) chats.antipoll = false
                if (!('antisticker' in chats)) chats.antisticker = false
                if (!('anticontact' in chats)) chats.anticontact = false
                if (!('antilocation' in chats)) chats.antilocation = false
                if (!('antidocument' in chats)) chats.antidocument = false
                if (!('antilink' in chats)) chats.antilink = false
                if (!('antilinkgc' in chats)) chats.antilinkgc = false
                  if (!('antiwame' in chats)) chats.antiwame = false 
                if (!('antipromotion' in chats)) chats.antipromotion = false
            } else global.db.data.chats[from] = {
                badword: false,
                antiforeignnum: false,
                antibot: false,
                antiviewonce: false,
                antispam: false,
                antivirtex: false,
                antimedia: false,
                antiimage: false,
                antivideo: false,
                antiaudio: false,
                antipoll: false,
                antisticker: false,
                antilocation: false,
                antidocument: false,
                anticontact: false,
                antilink: true,
                antipromotion: false,
                antilinkgc: false,
                antiwame: true 
            }

            let setting = global.db.data.settings[botNumber]
            if (typeof setting !== 'object') global.db.data.settings[botNumber] = {}
            if (setting) {
                if (!('totalhit' in setting)) setting.totalhit = 0
                if (!('totalError' in setting)) setting.totalError = 0
                if (!('online' in setting)) setting.online = false
                if (!('autosticker' in setting)) setting.autosticker = false
                if (!('autodownload' in setting)) setting.autodownload = false
                if (!('autobio' in setting)) setting.autobio = false
                if (!('autoread' in setting)) setting.autoread = true
                if (!('autorecordtype' in setting)) setting.autorecordtype = false
                if (!('autorecord' in setting)) setting.autorecord = false
                if (!('autotype' in setting)) setting.autotype = false
                if (!('autoblocknum' in setting)) setting.autoblocknum = false
                if (!('onlyindia' in setting)) setting.onlyindia = false
                if (!('onlyindo' in setting)) setting.onlyindo = false
                if (!('onlygrub' in setting)) setting.onlygrub = false
                if (!('onlypc' in setting)) setting.onlypc = false
                if (!('watermark' in setting)) setting.watermark = { packname, author }
                if (!('about' in setting)) setting.about = { bot: { nick: voltra.getName(botNumber), alias: botname }, owner: { nick: voltra.getName(global.owner + '@s.whatsapp.net'), alias: global.owner } }
            } else global.db.data.settings[botNumber] = {
                totalhit: 0,
                totalError: 0,
                online: false,
                autosticker: false,
                autodownload: false,
                autobio: false,
                autoread: true,
                autoblocknum: false,
                onlyindia: false,
                onlyindo: false,
                onlygrub: false,
                onlypc: false,
                autorecordtype: false,
                autorecord: false,
                autotype: false,
                watermark: {
                    packname: global.packname,
                    author: global.author
                },
                about: {
                    bot: {
                        nick: voltra.getName(botNumber),
                        alias: botname
                    },
                    owner: {
                        nick: voltra.getName(global.owner + '@s.whatsapp.net'),
                        alias: global.owner
                    }
                }
            }

        } catch (err) {
            console.log(err)
        }

        //Provider Catbox - Hosting image tanpa apikey, pengganti TelegraPh
        function Catbox(Path) {
            return new Promise(async (resolve, reject) => {
                if (!fs.existsSync(Path)) return reject(new Error("File not Found"));
                try {
                    const form = new FormData();
                    form.append("reqtype", "fileupload");
                    form.append("fileToUpload", fs.createReadStream(Path));

                    const data = await axios({
                        url: "https://catbox.moe/user/api.php",
                        method: "POST",
                        headers: {
                            ...form.getHeaders()
                        },
                        data: form
                    });

                    if (data.data) {
                        return resolve(data.data);
                    } else {
                        return reject(new Error("Unexpected API response structure"));
                    }
                } catch (err) {
                    return reject(new Error(String(err)));
                }
            });
        }

        // Grup Only
        if (!m.isGroup && !isCreator && global.db.data.settings[botNumber].onlygrub) {
            if (isCommand) {
                return reply(`Hello buddy! Because We Want to Reduce Spam, Please Use Bot in the Group Chat !\n\nIf you have issue please chat owner wa.me/${global.owner}`)
            }
        }

        // Private Only
        if (!isCreator && global.db.data.settings[botNumber].onlypc && m.isGroup) {
            if (isCommand) {
                return reply("Hello buddy! if you want to use this bot, please chat the bot in private chat")
            }
        }

        if (!voltra.public) {
            if (isCreator && !m.key.fromMe) return
        }
        if (global.db.data.settings[botNumber].online) {
            if (isCommand) {
                voltra.sendPresenceUpdate('unavailable', from)
            }
        }
        if (global.db.data.settings[botNumber].autoread) {
            voltra.readMessages([m.key])
        }

        // Auto Set Bio
        if (global.db.data.settings[botNumber].autobio) {
            voltra.updateProfileStatus(`${global.namabot} Sudah Online Selama : ${runtime(process.uptime())}`).catch(_ => _)
        }

        if (!m.sender.startsWith('91') && global.db.data.settings[botNumber].onlyindia === true) {
            return voltra.updateBlockStatus(m.sender, 'block')
        }
        if (!m.sender.startsWith('62') && global.db.data.settings[botNumber].onlyindo === true) {
            return voltra.updateBlockStatus(m.sender, 'block')
        }

        if (isCommand) {
            console.log(chalk.white(chalk.bgBlack('[ PESAN ] => ')), chalk.white(chalk.bgBlack(budy || m.mtype)) + '\n' + chalk.magenta('=> Dari'), chalk.green(pushname), chalk.yellow(m.sender.split("@")[0]) + '\n' + chalk.blueBright('=> Di'), chalk.green(m.isGroup ? pushname : 'Private Chat'), chalk.magenta(`\nJam :`) + time2)
            global.db.data.settings[botNumber].totalhit += 1
        }

        //afk
        let mentionUser = [...new Set([...(m.mentionedJid || []), ...(m.quoted ? [m.quoted.sender] : [])])]
        for (let jid of mentionUser) {
            let user = global.db.data.users[jid]
            if (!user) continue
            let afkTime = user.afkTime
            if (!afkTime || afkTime < 0) continue
            let reason = user.afkReason || ''
            // Caption saat ditag
            reply(`⚠️ Jangan Tag *@${jid.split("@")[0]}*!\nDia *Sedang AFK* Dengan Alasan ${reason ? reason : 'Tidak ada alasan'}\n\n> Sudah AFK Sejak : ${clockString(new Date - afkTime)}`)
        }
        if (global.db.data.users[m.sender].afkTime > -1) {
            let user = global.db.data.users[m.sender]
            // Caption saat kembali
            reply(`✅ King *@${m.sender.split("@")[0]}* Telah Kembali online! 🎉\n\n*Alasan :* ${user.afkReason ? user.afkReason : 'Tidak ada alasan'}\n*Durasi :* ${clockString(new Date - user.afkTime)}`)
            user.afkTime = -1
            user.afkReason = ''
        }

        // SLR (Slow Response) - NEW FEATURE
        for (let jid of mentionUser) {
            let user = global.db.data.users[jid];
            if (!user) continue;
            let slrTime = user.slrTime;
            if (!slrTime || slrTime < 0) continue;
            let reason = user.slrReason || '';
            // Caption saat ditag
            reply(`⚠️ Dia *@${jid.split("@")[0]}* Sedang Slow Response\n*Alasan:* ${reason ? reason : 'Tidak ada alasan'}\n\n> Sudah Slow Response Sejak : ${clockString(new Date - slrTime)}`);
        }
        // END SLR

        //download status #ctto
        try {
            const textLower = m.text.toLowerCase();
            if (textLower === 'download' || textLower === 'statusdown' || textLower === 'take' || textLower === 'send') {
                const quotedMessage = m.msg.contextInfo.quotedMessage;
                if (quotedMessage) {
                    if (quotedMessage.imageMessage) {
                        let imageCaption = quotedMessage.imageMessage.caption;
                        let imageUrl = await voltra.downloadAndSaveMediaMessage(quotedMessage.imageMessage);
                        voltra.sendMessage(m.chat, { image: { url: imageUrl }, caption: imageCaption });
                        reply('*Downloading status...*');
                    }
                    if (quotedMessage.videoMessage) {
                        let videoCaption = quotedMessage.videoMessage.caption;
                        let videoUrl = await voltra.downloadAndSaveMediaMessage(quotedMessage.videoMessage);
                        voltra.sendMessage(m.chat, { video: { url: videoUrl }, caption: videoCaption });
                        reply('*Downloading status...*');
                    }
                }
            }
        } catch (error) {
            console.error("Error in 'send message' handling:", error);
        }

        // Respon Addlist (dengan penambahan isClose) - KEEP THIS IF list.json IS FOR GENERAL RESPONSES
        // If list.json is ONLY for auto-order products, then remove this block and db_respon_list declaration.
        // Assuming list.json can be for general responses, I'll keep this.
         const db_respon_list = JSON.parse(fs.readFileSync('./database/list.json')) // Re-declare if removed globally
if (isAlreadyResponList(from, body.toLowerCase(), db_respon_list)) {
    var get_data_respon = getDataResponList(from, body.toLowerCase(), db_respon_list);
    if (get_data_respon.isClose) {
        const productName = get_data_respon.key; // Ambil nama list dari key
        return reply(`❌ *Produk Sedang Kosong* ❌\n\nMaaf ya, produk *${productName}* saat ini belum tersedia.\n\n🔄 *Status*  : Kosong sementara\n⏳ *Info*     : Silakan cek kembali di lain waktu\n💡 *Tips*     : Lihat juga produk lain yang masih ready!\n\n\nKetik \`list\` untuk cek daftar produk yang tersedia sekarang.`);
    }
             if (get_data_respon.isImage === false) {
                voltra.sendMessage(from, { text: sendResponList(from, body.toLowerCase(), db_respon_list) }, {
                    quoted: m
              })
          } else {
             voltra.sendMessage(from, { image: await getBuffer(get_data_respon.image_url), caption: get_data_respon.response }, {
                   quoted: m
              })
            }
        }
    // ... (kode yang sudah ada sebelum logika antiwame) ...

// --- Logika Anti-WhatsApp (Antiwame) ---
if (m.isGroup && global.db.data.chats[from].antiwame) {
    const whatsappLinkRegex = /(?:https?:\/\/)?(?:www\.)?(?:api\.)?whatsapp\.com\/(?:send\/?\?phone=|channel\/|chat\/|invite\/)?([0-9]{1,15}|[a-zA-Z0-9_-]+)|(?:https?:\/\/)?wa\.me\/([0-9]{1,15})/gi;

    // Periksa apakah body pesan mengandung link WhatsApp
    if (whatsappLinkRegex.test(body)) {
        // Dapatkan siapa yang mengirim pesan
        const senderJid = m.sender;
        const senderName = m.pushName || senderJid.split('@')[0];

        // Periksa apakah pengirim adalah admin grup atau owner bot
        if (isAdmins || isCreator) {
            console.log(`[ANTI-WAME] Admin/Owner ${senderName} (${senderJid}) mengirim link WhatsApp di ${groupName}. Tidak dihapus.`);
            // Anda bisa menambahkan pesan peringatan opsional untuk admin/owner jika diperlukan
            // reply(`⚠️ Admin/Owner terdeteksi mengirim link WhatsApp. Fitur anti-WhatsApp aktif, namun pesan Anda tidak dihapus.`);
        } else if (isBotAdmins) {
            // Jika bot adalah admin, hapus pesan dan kick pengirim
            try {
                await voltra.sendMessage(from, { delete: m.key }); // Hapus pesan
                await voltra.groupParticipantsUpdate(from, [senderJid], 'remove'); // Kick pengirim
                reply(`⚠️ Terdeteksi link WhatsApp! @${senderJid.split('@')[0]} telah dikeluarkan dari grup.`);
                return; // Hentikan pemrosesan lebih lanjut setelah tindakan
            } catch (error) {
                console.error(`[ANTI-WAME ERROR] Gagal menghapus pesan atau mengeluarkan ${senderName}:`, error);
                reply(`⚠️ Terdeteksi link WhatsApp! Gagal menghapus pesan atau mengeluarkan @${senderJid.split('@')[0]}. Pastikan bot memiliki izin yang cukup.`);
                return; // Hentikan pemrosesan lebih lanjut
            }
        } else {
            // Jika bot bukan admin, hanya beri peringatan
            reply(`⚠️ Terdeteksi link WhatsApp! Fitur anti-WhatsApp aktif, tetapi bot bukan admin sehingga tidak bisa menghapus pesan atau mengeluarkan anggota. Mohon jadikan bot admin untuk fitur ini berfungsi penuh.`);
            return; // Hentikan pemrosesan lebih lanjut
        }
    }
}
// --- Akhir Logika Anti-WhatsApp (Antiwame) ---

// --- Logika Antilink Umum ---
// Ini akan mendeteksi link HTTP/HTTPS secara umum
if (m.isGroup && global.db.data.chats[from].antilink) {
    const generalLinkRegex = /(https?:\/\/[^\s]+)/gi; // Regex untuk mendeteksi link http/https

    if (generalLinkRegex.test(body)) {
        const senderJid = m.sender;
        const senderName = m.pushName || senderJid.split('@')[0];

        if (isAdmins || isCreator) {
            console.log(`[ANTILINK] Admin/Owner ${senderName} (${senderJid}) mengirim link umum di ${groupName}. Tidak dihapus.`);
        } else if (isBotAdmins) {
            try {
                await voltra.sendMessage(from, { delete: m.key }); // Hapus pesan
                // Anda bisa memilih untuk kick atau hanya menghapus pesan
                // await voltra.groupParticipantsUpdate(from, [senderJid], 'remove'); // Kick pengirim
                reply(`*⚠️ Terdeteksi link! Pesan* @${senderJid.split('@')[0]} telah dihapus.`);
                return; // Hentikan pemrosesan lebih lanjut
            } catch (error) {
                console.error(`[ANTILINK ERROR] Gagal menghapus pesan ${senderName}:`, error);
                reply(`⚠️ Terdeteksi link! Gagal menghapus pesan @${senderJid.split('@')[0]}. Pastikan bot memiliki izin yang cukup.`);
                return;
            }
        } else {
            reply(`⚠️ Terdeteksi link! Fitur antilink aktif, tetapi bot bukan admin sehingga tidak bisa menghapus pesan.`);
            return;
        }
    }
}
// --- Akhir Logika Antilink Umum ---
        
        // Respon Cmd with media
        if (isMedia && m.msg.fileSha256 && (m.msg.fileSha256.toString('base64') in global.db.data.sticker)) {
            let hash = global.db.data.sticker[m.msg.fileSha256.toString('base64')]
            let { text, mentionedJid } = hash
            let messages = await generateWAMessage(m.chat, { text: text, mentions: mentionedJid }, {
                userJid: voltra.user.id,
                quoted: m.quoted && m.quoted.fakeObj
            })
            messages.key.fromMe = areJidsSameUser(m.sender, voltra.user.id)
            messages.key.id = m.key.id
            messages.pushName = m.pushName
            if (m.isGroup) messages.participant = m.sender
            let msg = {
                ...chatUpdate,
                messages: [proto.WebMessageInfo.fromObject(messages)],
                type: 'append'
            }
            voltra.ev.emit('messages.upsert', msg)
        }

        // HITUNG ULANG WAKTU SECARA DINAMIS DI SINI (untuk setiap pesan)
        const now = moment().tz('Asia/Jakarta'); // Hitung ulang now untuk setiap pesan
        const tanggal = now.format('DD/MM/YYYY');
        const day = now.format('dddd');
        const tgl = now.format('dddd, DD MMMM YYYY');
        const wib = now.format('HH:mm:ss');
        const wit = now.tz('Asia/Makassar').format('HH:mm:ss');
        const wita = now.tz('Asia/Jayapura').format('HH:mm:ss');
        const jam = wib; // Alias untuk WIB
        switch (isCommand) {
            //=================================================//
            // UPDATE STATUS //
            //=================================================//
            case 'statustext':
            case 'upswtext':
            case 'upswteks': {
                if (!isCreator) return m.reply("Fitur Khusus Owner.")
                if (!q) return m.reply('Text yang mau di upload ke story mana?')
                await voltra.sendMessage('status@broadcast', { text: q }, { backgroundColor: '#FF000000', font: 3, statusJidList: Object.keys(global.db.data.users) })
                m.reply(`✅ Berhasil membuat status text`)
            }
                break
            case 'statusvideo':
            case 'upswvideo': {
                if (!isCreator) return m.reply("Fitur Khusus Owner.")
                if (/video/.test(mime)) {
                    var videosw = await voltra.downloadAndSaveMediaMessage(quoted)
                    await voltra.sendMessage('status@broadcast', {
                        video: {
                            url: videosw
                        },
                        caption: q ? q : ''
                    }, { statusJidList: Object.keys(global.db.data.users) })
                    await m.reply(`✅ Berhasil membuat status vidio`)
                } else {
                    m.reply('Mana vidio yang mau diupload ke story?')
                }
            }
                break
            case 'statusimg':
            case 'statusimage':
            case 'upswimg': {
                if (!isCreator) return m.reply("Fitur Khusus Owner.")
                if (/image/.test(mime)) {
                    var imagesw = await voltra.downloadAndSaveMediaMessage(quoted)
                    await voltra.sendMessage('status@broadcast', {
                        image: {
                            url: imagesw
                        },
                        caption: q ? q : ''
                    }, { statusJidList: Object.keys(global.db.data.users) })
                    await m.reply(`✅ Berhasil membuat status foto`)
                } else {
                    m.reply('Mana foto yang mau diupload ke story?')
                }
            }
                break
            case 'statusaudio':
            case 'upswaudio': {
                if (!isCreator) return m.reply("Fitur Khusus Owner.")
                if (/audio/.test(mime)) {
                    var audiosw = await voltra.downloadAndSaveMediaMessage(quoted)
                    await voltra.sendMessage('status@broadcast', {
                        audio: {
                            url: audiosw
                        },
                        mimetype: 'audio/mp4',
                        ptt: true
                    }, {
                        backgroundColor: '#FF000000',
                        statusJidList: Object.keys(global.db.data.users)
                    })
                    await m.reply(`✅ Berhasil membuat status audio`)
                } else {
                    m.reply('Mana audio yang mau diupload ke story?')
                }
            }
                break
            case 'setimgmenu':
            case 'sim': {
                if (!isCreator) return m.reply("Fitur Khusus Owner.")
                let foto = await voltra.downloadAndSaveMediaMessage(quoted)
                await fsx.copy(foto, './image/foto.jpg')
                fs.unlinkSync(foto)
                m.reply(`✅ Berhasil mengubah banner, ketik *menu* untuk melihat hasilnya\nJika foto belum berubah silahkan restart panel atau tunggu beberapa saat`)
            }
                break
            //=================================================//
            case 'join':
                try {
                    if (!isCreator) return m.reply("Fitur Khusus Owner.")
                    if (!text) return reply('Enter Group Link!')
                    if (!isUrl(args[0]) && !args[0].includes('whatsapp.com')) return reply('Link Invalid!')
                    let result = args[0].split('https://chat.whatsapp.com/')[1]
                    voltra.groupAcceptInvite(result)
                    await reply(`Done`)
                } catch {
                    reply('Failed to join the Group')
                }
                break

            case 'myip':
            case 'getip':
                if (!isCreator) return m.reply("Fitur Khusus Owner.")
                var http = require('http')
                http.get({
                    'host': 'api.ipify.org',
                    'port': 80,
                    'path': '/'
                }, function (resp) {
                    resp.on('data', function (ip) {
                        reply("IP Address is : " + ip);
                    })
                })
                break

            case 'request':
            case 'reportbug': {
                if (!text) return m.reply(`Cara penggunaan salah.\n- Contoh : ${prefix + command} Hai owner ada bug di fitur menu`);

                const reportText = `─────〔  *REQUEST / REPORT BUG* 〕─────\n\n` +
                    `*User* : @${m.sender.split("@")[0]}\n` +
                    `*Pesan* : ${text}`;

                const userResponse = `Hallo ${pushname}.\n\nPesan kamu : ${text}\n\nSudah diteruskan ke owner.\nTerimakasih atas laporannya dan silahkan tunggu respon dari owner :)`;

                for (let i of global.owner) { // Pastikan owner ada di global.owner
                    voltra.sendMessage(i + "@s.whatsapp.net", {
                        text: reportText,
                        mentions: [m.sender],
                    }, {
                        quoted: m,
                    });
                }

                voltra.sendMessage(m.chat, {
                    text: userResponse,
                    mentions: [m.sender],
                }, {
                    quoted: m,
                });
            }
                break;

            case 'autoread':
                if (!isCreator) return m.reply("Fitur Khusus Owner.")
                if (args.length < 1) return reply(`Example ${prefix + command} on/off`)
                if (q === 'on') {
                    global.db.data.settings[botNumber].autoread = true
                    reply(`Successfully changed autoread to ${q}`)
                } else if (q === 'off') {
                    global.db.data.settings[botNumber].autoread = false
                    reply(`Successfully changed autoread to ${q}`)
                }
                break

            case 'self': {
                if (!isCreator) return m.reply("Fitur Khusus Owner.")
                voltra.public = false
                reply('*Successful in Changing To Self Usage*')
            }
                break

            case 'mode':
                if (!isCreator) return m.reply("Fitur Khusus Owner.")
                if (args.length < 1) return reply(`Example ${prefix + command} public/self`)
                if (q == 'public') {
                    voltra.public = true
                    reply(mess.done)
                } else if (q == 'self') {
                    voltra.public = false
                    reply(mess.done)
                }
                break

            case 'setpp':
            case 'setppbot':
                if (!isCreator) return m.reply("Fitur Khusus Owner.")
                if (!quoted) return reply(`Send/Reply Image With Caption ${prefix + command}`)
                if (!/image/.test(mime)) return reply(`Send/Reply Image With Caption ${prefix + command}`)
                if (/webp/.test(mime)) return reply(`Send/Reply Image With Caption ${prefix + command}`)
                var medis = await voltra.downloadAndSaveMediaMessage(quoted, 'ppbot')
                if (args[0] == 'full') {
                    var {
                        img
                    } = await generateProfilePicture(medis)
                    await voltra.query({
                        tag: 'iq',
                        attrs: {
                            to: botNumber,
                            type: 'set',
                            xmlns: 'w:profile:picture'
                        },
                        content: [{
                            tag: 'picture',
                            attrs: {
                                type: 'image'
                            },
                            content: img
                        }]
                    })
                    fs.unlinkSync(medis)
                    reply(mess.done)
                } else {
                    var memeg = await voltra.updateProfilePicture(botNumber, {
                        url: medis
                    })
                    fs.unlinkSync(medis)
                    reply(mess.done)
                }
                break

            case 'block': case 'ban': {
                if (!isCreator) return m.reply("Fitur Khusus Owner.")
                let users = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
                await voltra.updateBlockStatus(users, 'block')
                await reply(`Done`)
            }
                break

            case 'unblock': case 'unban': {
                if (!isCreator) return m.reply("Fitur Khusus Owner.")
                let users = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
                await voltra.updateBlockStatus(users, 'unblock')
                await reply(`Done`)
            }
                break
            case 'bcgc':
            case 'bcgroup': {
                if (!isCreator) return m.reply("Fitur Khusus Owner.")
                if (!text) return reply(`Text mana?\n\nExample : ${prefix + command} Besok Libur `)
                let getGroups = await voltra.groupFetchAllParticipating()
                let groups = Object.entries(getGroups).slice(0).map(entry => entry[1])
                let anu = groups.map(v => v.id)
                reply(`Sending Broadcast To ${anu.length} Group Chat, End Time ${anu.length * 1.5} seconds`)
                for (let i of anu) {
                    await sleep(1500)
                    let a = `${global.namaowner}'s Broadcast\n\n` + '```' + `Message: ${text}\n\n` + '```'
                    voltra.sendMessage(i, {
                        text: a,
                        contextInfo: {
                            externalAdReply: {
                                showAdAttribution: true,
                                title: global.namabot,
                                body: `Sent in ${i.length} Group`,
                                thumbnail: fs.readFileSync('./image/foto.jpg'),
                                sourceUrl: global.linkgc, // Pastikan linkgc didefinisikan
                                mediaType: 1,
                                renderLargerThumbnail: true
                            }
                        }
                    })
                }
                reply(`Successful in sending Broadcast To ${anu.length} Group`)
            }
                break

    case 'antiwame': {
        if (!m.isGroup) return m.reply("Fitur Khusus Group.")
        if (!isBotAdmins) return m.reply("Bot Harus Menjadi Admin.")
        if (!isAdmins && !isCreator) return m.reply("Fitur Ini Khusus Admin.")
        if (args.length < 1) return reply('on/off?')
        if (args[0] === 'on') {
            global.db.data.chats[from].antiwame = true
            reply(`Fitur anti-WhatsApp (antiwame) berhasil diaktifkan.`)
        } else if (args[0] === 'off') {
            global.db.data.chats[from].antiwame = false
            reply(`Fitur anti-WhatsApp (antiwame) berhasil dinonaktifkan.`)
        } else {
            reply(`Penggunaan: ${prefix + command} on/off`)
        }
    }
        break

            case 'antilink': {
                if (!m.isGroup) return m.reply("Fitur Khusus Group.")
                if (!isBotAdmins) return m.reply("Bot Harus Menjadi Admin.")
                if (!isAdmins && !isCreator) return m.reply("Fitur Ini Khusus Admin.")
                if (args.length < 1) return reply('on/off?')
                if (args[0] === 'on') {
                    global.db.data.chats[from].antilink = true
                    reply(`${command} is enabled`)
                } else if (args[0] === 'off') {
                    global.db.data.chats[from].antilink = false
                    reply(`${command} is disabled`)
                }
            }
                break

            case 'antilinkgc': {
                if (!m.isGroup) return m.reply("Fitur Khusus Group.")
                if (!isBotAdmins) return m.reply("Bot Harus Menjadi Admin.")
                if (!isAdmins && !isCreator) return m.reply("Fitur Ini Khusus Admin.")
                if (args.length < 1) return reply('on/off?')
                if (args[0] === 'on') {
                    global.db.data.chats[from].antilinkgc = true
                    reply(`${command} is enabled`)
                } else if (q === 'off') { // Changed from args[0] to q for consistency
                    global.db.data.chats[from].antilinkgc = false
                    reply(`${command} is disabled`)
                }
            }
                break

            case 'invite': {
                if (!m.isGroup) return m.reply("Fitur Khusus Group.")
                if (!isBotAdmins) return m.reply("Bot Harus Menjadi Admin.")
                if (!text) return reply(`Masukan nomor user yang mau di invite\n\nContoh : ${command} 6285xxx`)
                if (text.includes('+')) return reply(`Masukan Nomer yang bener tanpa tanda +`)
                if (isNaN(text)) return reply(`Masukan Nomer yang bener dengan format 62 bukan 0`)
                let group = m.chat
                let link = 'https://chat.whatsapp.com/' + await voltra.groupInviteCode(group)
                await voltra.sendMessage(text + '@s.whatsapp.net', { text: `─────〔 *GROUP INVITATION* 〕─────\n\nHallo user, kamu di invite untuk gabung ke grup ini\n\nLink Grup : ${link}`, mentions: [m.sender] })
                reply(`✅ Link invite berhasil dikirim ke user`)
            }
                break

            case 'closetime':
                if (!m.isGroup) return m.reply("Fitur Khusus Group.")
                if (!isAdmins && !isCreator) return m.reply("Fitur Ini Khusus Admin.")
                if (!isBotAdmins) return m.reply("Bot Harus Menjadi Admin.")
                if (args[1] == 'second') {
                    var timer = args[0] * `1000`
                } else if (args[1] == 'minute') {
                    var timer = args[0] * `60000`
                } else if (args[1] == 'hour') {
                    var timer = args[0] * `3600000`
                } else if (args[1] == 'day') {
                    var timer = args[0] * `86400000`
                } else {
                    return reply('*Format salah!* \n*Contoh:* closetime 2 hours\n\n*Pilihan:*\nsecond , minute hour')
                }
                reply(`Close-time ${q} starting from now`)
                setTimeout(() => {
                    var nomor = m.participant
                    const close = `*🔒 Close-Time* Hanya admin yang bisa mengirim pesan saat grup ditutup.`
                    voltra.groupSettingUpdate(m.chat, 'announcement')
                    reply(close)
                }, timer)
                break

            case 'opentime':
                if (!m.isGroup) return m.reply("Fitur Khusus Group.")
                if (!isAdmins && !isCreator) return reply(mess.admin)
                if (!isBotAdmins) return m.reply("Bot Harus Menjadi Admin.")
                if (args[1] == 'second') {
                    var timer = args[0] * `1000`
                } else if (args[1] == 'minute') {
                    var timer = args[0] * `60000`
                } else if (args[1] == 'hour') {
                    var timer = args[0] * `3600000`
                } else if (args[1] == 'day') {
                    var timer = args[0] * `86400000`
                } else {
                    return reply('*Format salah!*\n*Contoh:* opentime 2 hours\n\n*Pilihan:*\nsecond , minute hour')
                }
                reply(`Open-time ${q} starting from now`)
                setTimeout(() => {
                    var nomor = m.participant
                    const open = `*📅 Open-Time* Grup sudah dibuka kembali\nSemua anggota bisa mengirim pesan lagi`
                    voltra.groupSettingUpdate(m.chat, 'not_announcement')
                    reply(open)
                }, timer)
                break

                        case 'kick':
                await addReaction(m.chat, m.key, '⏳'); // REACTION: Proses
                if (!isAdmins && !isGroupOwner && !isCreator) {
                    m.reply("Fitur Ini Khusus Admin.");
                    await addReaction(m.chat, m.key, '❌'); // REACTION: Gagal
                    return;
                }
                if (!m.isGroup) {
                    m.reply("Fitur Khusus Group.");
                    await addReaction(m.chat, m.key, '❌'); // REACTION: Gagal
                    return;
                }
                if (!isBotAdmins) {
                    m.reply("Bot Harus Menjadi Admin.");
                    await addReaction(m.chat, m.key, '❌'); // REACTION: Gagal
                    return;
                }
                let blockwww = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
                try {
                    await voltra.groupParticipantsUpdate(m.chat, [blockwww], 'remove');
                    reply(mess.done);
                    await addReaction(m.chat, m.key, '✅'); // REACTION: Berhasil
                } catch (error) {
                    reply("Gagal mengeluarkan anggota. Pastikan bot memiliki izin yang cukup.");
                    await addReaction(m.chat, m.key, '❌'); // REACTION: Gagal
                }
                break

            case 'add':
                if (!m.isGroup) return m.reply("Fitur Khusus Group.")
                if (!isCreator) return m.reply("Fitur Khusus Owner.")
                if (!isBotAdmins) return m.reply("Bot Harus Menjadi Admin.")
                let blockwwww = m.quoted ? m.quoted.sender : text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
                await voltra.groupParticipantsUpdate(m.chat, [blockwwww], 'add')
                reply(mess.done)
                break

            case 'setdescgc':
            case 'setdeskgc': {
                if (!m.isGroup) return
                if (!isAdmins) return m.reply('Fitur Khusus Admin!')
                if (!isBotAdmins) return m.reply("Jadikan Bot Sebagai Admin Terlebih Dahulu")
                if (!text) return m.reply(`Cara penggunaan salah.\n- Contoh ${prefix + command} Deskripsi grup baru`)
                await voltra.groupUpdateDescription(m.chat, text).then((res) => m.reply(`✅ Deskripsi grup *${groupName}* berhasil diubah\n\n Deskripsi Baru :\n${text}`)).catch((err) => m.reply("Terjadi kesalahan"))
            }
                break

            case 'promote': {
                if (!m.isGroup) return m.reply('Fitur Khusus Group!')
                if (!isAdmins) return m.reply('Fitur Khusus admin!')
                if (!isBotAdmins) return m.reply("Jadikan bot sebagai admin")
                let users = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
                await voltra.groupParticipantsUpdate(m.chat, [users], 'promote').then((res) => m.reply(`✅ Sukses mempromosikan ${users} menjadi admin`)).catch((err) => m.reply('❌ Gagal mempromosikan user, silahkan coba lagi dan cek konsole'))
            }
                break

            case 'demote': {
                if (!m.isGroup) return m.reply('Fitur Khusus Group!')
                if (!isAdmins) return m.reply('Fitur Khusus admin!')
                if (!isBotAdmins) return m.reply("Jadikan bot sebagai admin")
                let users = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
                await voltra.groupParticipantsUpdate(m.chat, [users], 'demote').then((res) => m.reply(`✅ Sukses melengserkan ${users} awokawok jadi member`)).catch((err) => m.reply('❌ Gagal melengserkan user, silahkan coba lagi dan cek konsole'))
            }
                break

            case 'setnamegc':
            case 'setnamagc':
                if (!m.isGroup) return m.reply("Fitur Khusus Group.")
                if (!isAdmins && !isGroupOwner && !isCreator) return m.reply("Fitur Ini Khusus Admin.")
                if (!isBotAdmins) return m.reply("Bot Harus Menjadi Admin.")
                if (!text) return m.reply('Text ?')
                await voltra.groupUpdateSubject(m.chat, text)
                reply(mess.done)
                break


            case 'backup': {
                if (!isCreator) return m.reply("Fitur Khusus Owner.")()
                let jir = m.mentionedJid[0] || m.sender || parseMention(args[0]) || (args[0].replace(/[@.+-]/g, '').replace(' ', '') + '@s.whatsapp.net') || '';
                await m.reply('Mengumpulkan semua file ke folder...');
                const { execSync } = require("child_process");
                const ls = (await execSync("ls")).toString().split("\n").filter((pe) =>
                    pe != "node_modules" &&
                    pe != "session" &&
                    pe != ""
                );
                await m.reply('Script Akan Dikirim Lewat Pc!')
                const exec = await execSync(`zip -r Backup.zip ${ls.join(" ")}`);
                await voltra.sendMessage(jir, {
                    document: await fs.readFileSync("./Backup.zip"),
                    mimetype: "application/zip",
                    fileName: "Backup.zip",
                },
                    { quoted: m });
                await execSync("rm -rf Backup.zip");
            }
                break


            case 'setppgroup':
            case 'setppgrup':
            case 'setppgc': {
                if (!m.isGroup) return m.reply('Fitur Khusus Group!')
                if (!isAdmins) return m.reply('Fitur Khusus admin!')
                if (!isBotAdmins) return m.reply("Jadikan bot sebagai admin")
                if (!quoted) return m.reply(`Kirim/Reply Image Dengan Caption ${prefix + command}`)
                if (!/image/.test(mime)) return m.reply(`Kirim/Reply Image With Caption ${prefix + command}`)
                if (/webp/.test(mime)) return m.reply(`Send/Reply Image With Caption ${prefix + command}`)
                let media = await voltra.downloadAndSaveMediaMessage(quoted)
                await voltra.updateProfilePicture(m.chat, { url: media }).catch((err) => fs.unlinkSync(media))
                m.reply("Berhasil mengganti pp group")
            }
                break

            case 'deleteppgroup': case 'delppgc': case 'deleteppgc': case 'delppgroup': {
                if (!m.isGroup) return m.reply("Fitur Khusus Group.")
                if (!isAdmins && !isCreator) return m.reply("Fitur Ini Khusus Admin.")
                if (!isBotAdmins) return m.reply("Bot Harus Menjadi Admin.")
                await voltra.removeProfilePicture(from)
            }
                break

            case 'promoteall': {
                if (!m.isGroup) return m.reply("Fitur Khusus Group.")
                if (!isAdmins && !isGroupOwner && !isCreator) return m.reply("Fitur Ini Khusus Admin.")
                if (!isBotAdmins) return m.reply("Bot Harus Menjadi Admin.")
                const voltpromoteall = (args[0] === 'numBut')
                    ? text.replace(`${args[0]} `, '').split('|')
                    : (Number(args[0]))
                        ? groupMetadata.participants
                            .filter(item => item.id.startsWith(args[0].replace('+', '')) && item.id !== botNumber && item.id !== `${global.owner}@s.whatsapp.net`)
                            .map(item => item.id)
                        : groupMetadata.participants
                            .filter(item => item.id !== botNumber && item.id !== `${global.owner}@s.whatsapp.net`)
                            .map(item => item.id);
                for (let promote of voltpromoteall) {
                    await voltra.groupParticipantsUpdate(m.chat, [(args[0] === "numBut") ? `${promote}@s.whatsapp.net` : promote], "promote");
                    await sleep(100);
                }
                reply(`Success`);
            }
                break

            case 'demoteall': {
                if (!m.isGroup) return m.reply("Fitur Khusus Group.")
                if (!isAdmins && !isGroupOwner && !isCreator) return m.reply("Fitur Ini Khusus Admin.")
                if (!isBotAdmins) return m.reply("Bot Harus Menjadi Admin.")
                const voltdemoteall = (args[0] === 'numBut')
                    ? text.replace(`${args[0]} `, '').split('|')
                    : (Number(args[0]))
                        ? groupMetadata.participants
                            .filter(item => item.id.startsWith(args[0].replace('+', '')) && item.id !== botNumber && item.id !== `${global.owner}@s.whatsapp.net`)
                            .map(item => item.id)
                        : groupMetadata.participants
                            .filter(item => item.id !== botNumber && item.id !== `${global.owner}@s.whatsapp.net`)
                            .map(item => item.id);
                for (let demote of voltdemoteall) {
                    await voltra.groupParticipantsUpdate(m.chat, [(args[0] === "numBut") ? `${demote}@s.whatsapp.net` : demote], "demote");
                    await sleep(100);
                }
                reply(`Success`);
            }
                break

            case 'h':
            case 'hidetag': {
                if (!m.isGroup) return reply("Fitur Khusus Grup")
                if (!(isAdmins || isCreator)) return reply("Maaf Fitur Khusus Admin")

                let tek = m.quoted ? m.quoted.text : (text ? text : "")
                let media = null

                if (m.message.imageMessage) {
                    try {
                        const stream = await downloadContentFromMessage(m.message.imageMessage, 'image')
                        let buffer = Buffer.from([])
                        for await (const chunk of stream) {
                            buffer = Buffer.concat([buffer, chunk])
                        }
                        media = buffer
                    } catch (error) {
                        console.error("Error downloading image:", error)
                        return reply("Gagal mengunduh gambar.")
                    }
                }
                if (media) {
                    voltra.sendMessage(m.chat, {
                        image: media,
                        caption: tek,
                        mentions: participants.map(a => a.id)
                    }, { quoted: m })
                } else {
                    voltra.sendMessage(m.chat, {
                        text: tek,
                        mentions: participants.map(a => a.id)
                    }, { quoted: m })
                }
            }
                break

// setopen / setclose (sudah ada, tapi saya tambahkan validasi lebih baik)
case 'setopen': {
    if (!m.isGroup) return m.reply('Fitur Khusus Group!');
    if (!isAdmins && !isCreator) return m.reply('Fitur Khusus Admin & Owner!');
    if (!text) return m.reply(`Format salah! Contoh:\n${prefix + command} Grup @group sudah dibuka! Silakan ngobrol! @newline\n\nVariabel:\n@user, @tanggal, @day, @tgl, @wib, @wit, @wita, @jam, @group, @newline, @2newline`);

    const processedText = replaceNewlines(text);
    const targetId = m.chat;

    if (isSetOpen(targetId, set_open)) {
        changeSetOpen(processedText, targetId, set_open);
        m.reply(`✅ Berhasil mengubah teks open grup! Coba buka grup dengan command *open* untuk tes.`);
    } else {
        addSetOpen(processedText, targetId, set_open);
        m.reply(`✅ Berhasil mengatur teks open grup! Coba buka grup dengan command *open* untuk tes.`);
    }
    break;
}

case 'setclose': {
    if (!m.isGroup) return m.reply('Fitur Khusus Group!');
    if (!isAdmins && !isCreator) return m.reply('Fitur Khusus Admin & Owner!');
    if (!text) return m.reply(`Format salah! Contoh:\n${prefix + command} Grup @group ditutup sementara. Hanya admin yang bisa bicara! @newline\n\nVariabel:\n@user, @tanggal, @day, @tgl, @wib, @wit, @wita, @jam, @group, @newline, @2newline`);

    const processedText = replaceNewlines(text);
    const targetId = m.chat;

    if (isSetClose(targetId, set_close)) {
        changeSetClose(processedText, targetId, set_close);
        m.reply(`✅ Berhasil mengubah teks close grup! Coba tutup grup dengan command *close* untuk tes.`);
    } else {
        addSetClose(processedText, targetId, set_close);
        m.reply(`✅ Berhasil mengatur teks close grup! Coba tutup grup dengan command *close* untuk tes.`);
    }
    break;
}

// Tambahkan command untuk delete (baru)
case 'delsetopen': {
    if (!m.isGroup) return m.reply('Fitur Khusus Group!');
    if (!isAdmins && !isCreator) return m.reply('Fitur Khusus Admin & Owner!');
    const targetId = m.chat;

    if (!isSetOpen(targetId, set_open)) return m.reply(`Belum ada teks open yang diatur di sini.`);

    removeSetOpen(targetId, set_open);
    m.reply(`✅ Berhasil menghapus teks open. Kembali ke default.`);
    break;
}

case 'delsetclose': {
    if (!m.isGroup) return m.reply('Fitur Khusus Group!');
    if (!isAdmins && !isCreator) return m.reply('Fitur Khusus Admin & Owner!');
    const targetId = m.chat;

    if (!isSetClose(targetId, set_close)) return m.reply(`Belum ada teks close yang diatur di sini.`);

    removeSetClose(targetId, set_close);
    m.reply(`✅ Berhasil menghapus teks close. Kembali ke default.`);
    break;
}

// Integrasi ke command open (buka grup) - Ubah case ini
case 'open':
case 'op':
case 'buka':
    if (!m.isGroup) return m.reply('🛑 Fitur Khusus Group!');
    if (!isAdmins && !isGroupOwner && !isCreator) return m.reply('⛔ Hanya admin yang bisa membuka grup!');
    if (!isBotAdmins) return m.reply('🤖 Bot bukan admin di grup ini!');

    await voltra.groupSettingUpdate(m.chat, 'not_announcement').then(async (res) => {
        // Ambil teks custom dari database
        const customOpenText = getTextSetOpen(m.chat, set_open);
        let message = customOpenText ? replaceNewlines(customOpenText) : `*🔓 Grup @group telah dibuka, Seluruh anggota dapat mengirim pesan!*`;

        // Format dengan variabel menggunakan fungsi formatStatusMessage
        message = formatStatusMessage(m.chat, pushname, groupName, message);

        // Kirim pesan custom dengan mention
        await voltra.sendTextWithMentions(m.chat, finalMessage, m); // Menggunakan finalMessage
    });
    break;

// Integrasi ke command close (tutup grup) - Ubah case ini
case 'close':
case 'cl':
case 'tutup':
    if (!m.isGroup) return m.reply('🛑 Fitur Khusus Group!');
    if (!isAdmins && !isGroupOwner && !isCreator) return m.reply('⛔ Hanya admin yang bisa menutup grup!');
    if (!isBotAdmins) return m.reply('🤖 Bot bukan admin di grup ini!');

    await voltra.groupSettingUpdate(m.chat, 'announcement').then(async (res) => {
        // Ambil teks custom dari database
        const customCloseText = getTextSetClose(m.chat, set_close);
        let message = customCloseText ? replaceNewlines(customCloseText) : `🔐 Grup *@group* telah ditutup, hanya admin yang dapat mengirim pesan!`;

        // Format dengan variabel menggunakan fungsi formatStatusMessage
        message = formatStatusMessage(m.chat, pushname, groupName, message);

        // Kirim pesan custom dengan mention
        await voltra.sendTextWithMentions(m.chat, finalMessage, m); // Menggunakan finalMessage
    });
    break;

            case 'linkgroup':
            case 'linkgrup':
            case 'linkgc':
            case 'gclink':
            case 'grouplink':
            case 'gruplink':
                if (!m.isGroup) return m.reply("Fitur Khusus Group.")
                if (!isAdmins && !isGroupOwner && !isCreator) return m.reply("Fitur Ini Khusus Admin.")
                if (!isBotAdmins) return m.reply("Bot Harus Menjadi Admin.")
                let response = await voltra.groupInviteCode(m.chat)
                voltra.sendText(m.chat, `─────〔  *LINK GROUP* 〕─────\n\n- Nama Group : ${groupMetadata.subject}\n- ID Group : ${groupMetadata.id}\n- Link Group : https://chat.whatsapp.com/${response}`, m, {
                    detectLink: true
                })
                break

            case 'revoke':
            case 'resetlink':
                if (!m.isGroup) return m.reply("Fitur Khusus Group.")
                if (!isAdmins && !isGroupOwner && !isCreator) return m.reply("Fitur Ini Khusus Admin.")
                if (!isBotAdmins) return m.reply("Bot Harus Menjadi Admin.")
                await voltra.groupRevokeInvite(m.chat)
                    .then(res => {
                        m.reply(`Link grup berhasil direset.`)
                    })
                break


         case 'runtime':
		 case 'ping': {
    m.reply(`*🏓 Pong!*
Halo King *${pushname}*, Bot sudah online!

> sudah online selama ${runtime(process.uptime())}🎉🤖`);
} break;



            case 'sewabot':
            case 'owner': {
                if (!global.owner || global.owner.length === 0) return m.reply('Kontak owner belum diset di setting.js!');

                let ownerContacts = global.owner.map(nomer => ({
                    displayName: global.namaowner,
                    vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:Owner Bot\nTEL;type=CELL;waid=${nomer}:${nomer}\nEND:VCARD`
                }));

                voltra.sendMessage(from, {
                    contacts: {
                        displayName: global.namaowner,
                        contacts: ownerContacts
                    }
                });

                setTimeout(() => {
                    let responseMessage = "Itu kontak owner saya, jika mau order apapun silahkan hubungi dia ya.\n\n*Admin juga menyediakan Pembuatan dan Sewa Bot*\n- Bot Store\n- Bot Topup Otomatis\n- Bot Auto Order\n\nHarga murah dan kualitas terjamin, cocok untuk kamu yang mau mulai berbisnis.";
                    voltra.sendText(from, responseMessage);
                }, 1000);
            }
                break;

            case 'afk': {
                let user = global.db.data.users[m.sender]
                user.afkTime = + new Date
                user.afkReason = text
                // Caption saat awal afk
                reply(`*🚫@${m.sender.split("@")[0]}* sedang AFK / tidak ada di tempat! \n*📝 Alasan:* ${text ? text : 'Tidak ada alasan spesifik.'}\n\n> Harap bersabar, Kak. Nanti akan diinfokan jika dia kembali. Terima kasih! 🙏`)
            }
                break
            //=================================================//
            // FITUR AUTO ORDER - REMOVED ENTIRELY
            //=================================================//

            case 'help': {
                // Removed all auto-order related stats
                let ownernya = global.owner[0] + '@s.whatsapp.net'
                let timestampe = speed()
                let latensie = speed() - timestampe
                let a = global.db.data.users[sender]
                let me = m.sender
                let xmenu_oh = `╭─[ *BOT ${global.namabot.toUpperCase()}*  ]──
│
│ *👑 Owner:*
│ 💬 wa.me/${global.owner[0]}
│
│ 📦 Produk Lebih Lengkap:
│ 🔗 Telegram Bot: t.me/premtimebot
│ _(Stok WA & Telegram 100% sinkron)_
╰──────────◇

╭──[ *MENU UTAMA* ]──
│
│⊸ Menu             [ Melihat Menu & Fitur Bot Secara Lengkap ]
│
╰──────────◇

╭──[ *📝 PANDUAN PENGGUNAAN* ]──
│
│⊸ *Untuk melihat semua fitur, ketik:* Menu
│
╰──────────◇`
                voltra.sendMessage(m.chat, {
                    text: xmenu_oh,
                    contextInfo: {
                        externalAdReply: {
                            showAdAttribution: false,
                            title: global.namabot,
                            body: global.namaowner,
                            thumbnail: fs.readFileSync('./image/foto.jpg'),
                            sourceUrl: global.linkgc, // Pastikan linkgc didefinisikan
                            mediaType: 1,
                            renderLargerThumbnail: false
                        }
                    }
                }, {
                    quoted: m
                })
            }
                break



            case 'menu': {
                let ownernya = global.owner[0] + '@s.whatsapp.net'
                let timestampe = speed()
                let latensie = speed() - timestampe
                let a = global.db.data.users[sender]
                let me = m.sender
                let xmenu_oh = `┌─〔 *${global.namabot.toUpperCase()}* 〕─┐
│ 👑 Owner : wa.me/${global.owner[0]}
└─────◇

📌 *LIST COMMAND BOT*

╭─〔 *OWNER MENU* 〕
╎» addsewa
╎» delsewa
╎» listsewa
╎» sendnotifsewa
╎» backup
╰────────────────

╭─〔 *GROUP MENU* 〕
│ • list 
│ • listopen / listclose
│ • addlist
│ • updatelist
│ • deletelist
│ • hidetag / h
│ • open / op
│ • close / cl
│ • opentime
│ • closetime
│ • proses / p
│ • done / d
│ • opentime
│ • closetime
│ • kick
│ • linkgc
│ • setppgc
│ • setnamegc
│ • setdescgc
│ • payment
│ • setpay
│ • delpay
│ • Antiklink
│ • Antiwame
│ • AFK
│ • slr
╰────────────────

╭─〔 *WORDING CONFIG* 〕
│ • tutorsetlist
│ • setlist / setlist2 / setlist3
│ • resetsetlist
│ • setproses / changeproses / delsetproses
│ • setdone / changedone / delsetdone
╰────────────────

╭─〔 *MENU STALK* ]
│ • cekff
│ • mlreg / cekml
│ • cekmcgg
│ • ceklnd
│ • cekcod
│ • cekag
│ • cekgi
│ • cekhsr
│ • cekhi
│ • cekpb
│ • • ceksm
│ • ceksus
│ • cekvalo
│ • cekpgr
│ • cekzzz
│ • cekaov
│ • cekpubg
│ • cekhok
╰────────────────
`
                voltra.sendMessage(m.chat, {
                    text: xmenu_oh,
                    contextInfo: {
                        externalAdReply: {
                            showAdAttribution: true,
                            title: global.namabot,
                            body: global.namaowner,
                            thumbnail: fs.readFileSync('./image/foto.jpg'),
                            sourceUrl: global.linkgc, // Pastikan linkgc didefinisikan
                            mediaType: 1,
                            renderLargerThumbnail: true
                        }
                    }
                }, {
                    quoted: m
                })
            }
                break
        
            // =================================================//
            // FITUR MANAJEMEN SEWA BOT
            // =================================================//
case 'addsewa': {
    if (!isCreator) return m.reply("Fitur Khusus Owner.");
    if (!text) return m.reply(`Format salah! Contoh: ${prefix + command} linkgrup 30d`);

    const parts = text.split(" ");
    if (parts.length < 2) return m.reply(`Format salah! Contoh: ${prefix + command} linkgrup 30d`);

    let groupLink = parts[0];
    const durationStr = parts[1];

    if (!isUrl(groupLink) || !groupLink.includes('whatsapp.com')) return m.reply('Link Grup tidak valid!');

    const durationMatch = durationStr.match(/^(\d+)([dhms])$/);
    if (!durationMatch) return m.reply('Format durasi tidak valid! Contoh: 30d (hari), 7h (jam), 60m (menit), 30s (detik)');

    const durationValue = parseInt(durationMatch[1]);
    const durationUnit = durationMatch[2];
    let durationInDays;

    switch (durationUnit) {
        case 'd':
            durationInDays = durationValue;
            break;
        case 'h':
            durationInDays = durationValue / 24;
            break;
        case 'm':
            durationInDays = durationValue / (24 * 60);
            break;
        case 's':
            durationInDays = durationValue / (24 * 60 * 60);
            break;
        default:
            return m.reply('Unit durasi tidak valid! Gunakan d, h, m, atau s.');
    }

    let targetGroupId;
    let targetGroupName;
    const inviteCode = groupLink.split('https://chat.whatsapp.com/')[1];

    try {
        // Coba bergabung ke grup.
        // Jika bot sudah di grup, ini akan menghasilkan error 'already-exists'.
        const joinResult = await voltra.groupAcceptInvite(inviteCode);
        targetGroupId = joinResult; // groupAcceptInvite seringkali hanya mengembalikan JID grup

        // Setelah berhasil bergabung, ambil metadata lengkap untuk mendapatkan nama grup
        const groupMetadataAfterJoin = await voltra.groupMetadata(targetGroupId);
        targetGroupName = groupMetadataAfterJoin.subject;

        m.reply(`Bot berhasil bergabung ke grup *${targetGroupName || 'Nama Tidak Diketahui'}*.`);

    } catch (e) {
        // Tangani error jika bot sudah di grup atau ada masalah lain
        if (e.message.includes("already-exists")) { // <-- TANGANI ERROR INI SECARA SPESIFIK
            // Jika error 'already-exists', asumsikan bot sudah di grup.
            // Coba dapatkan metadata grup dari semua grup yang diikuti bot.
            const allParticipatingGroups = await voltra.groupFetchAllParticipating();
            const targetGroup = Object.values(allParticipatingGroups).find(group => group.inviteCode === inviteCode);

            if (targetGroup) {
                targetGroupId = targetGroup.id;
                targetGroupName = targetGroup.subject;
                m.reply(`Bot sudah menjadi anggota grup *${targetGroupName || 'Nama Tidak Diketahui'}*. Melanjutkan proses penambahan sewa.`);
            } else {
                // Ini seharusnya tidak terjadi jika 'already-exists' benar, tapi sebagai fallback
                console.error("Error getting group info after already-exists, group not found in participating list:", e);
                return m.reply('Gagal mendapatkan informasi grup. Link mungkin kadaluarsa atau bot tidak dapat mengaksesnya.');
            }
        } else if (e.message.includes("not-found")) {
            m.reply('Link grup tidak valid atau sudah kadaluarsa.');
        } else if (e.message.includes("not-authorized")) {
            m.reply('Bot tidak diizinkan untuk bergabung ke grup ini (mungkin grup privat atau bot diblokir).');
        } else {
            // Tangani error lain yang mungkin terjadi saat mencoba bergabung
            console.error("Error accepting invite or getting group info:", e);
            m.reply('Gagal menambahkan sewa. Pastikan link grup valid dan bot bisa bergabung. Error: ' + e.message);
        }
    }

    // Lanjutkan proses penambahan sewa setelah mendapatkan targetGroupId dan targetGroupName
    if (targetGroupId && targetGroupName) {
        if (addSewa(targetGroupId, groupLink, durationInDays, targetGroupName)) {
            const sewaData = getSewaData(targetGroupId);
            const endDateFormatted = moment(sewaData.endDate).tz('Asia/Jakarta').format('DD MMMM YYYY HH:mm:ss');
            m.reply(`✅ Berhasil menambahkan sewa untuk grup *${targetGroupName}*.\nID Grup: ${targetGroupId}\nMasa Sewa: ${durationValue}${durationUnit} (hingga ${endDateFormatted})`);
        } else {
            m.reply('Gagal menambahkan sewa. Mungkin grup sudah terdaftar.');
        }
    } else {
        m.reply('Gagal mendapatkan ID atau nama grup. Proses penambahan sewa dibatalkan.');
    }
}
break;



            case 'delsewa': {
                if (!isCreator) return m.reply("Fitur Khusus Owner.");
                if (!text) return m.reply(`Format salah! Contoh: ${prefix + command} id_grup_yang_mau_dihapus`);

                const groupIdToDelete = text.trim();
                if (deleteSewa(groupIdToDelete)) {
                    m.reply(`✅ Berhasil menghapus masa sewa untuk grup ID: *${groupIdToDelete}*`);
                } else {
                    m.reply(`Gagal menghapus masa sewa. Grup ID: *${groupIdToDelete}* mungkin tidak ditemukan.`);
                }
            }
            break;

            case 'listsewa': {
                if (!isCreator) return m.reply("Fitur Khusus Owner.");
                const sewaList = getSewaList();

                if (sewaList.length === 0) {
                    return m.reply('Belum ada grup yang menyewa bot.');
                }

                let responseText = `*DAFTAR GRUP PENYEWA BOT*\n\n`;
                sewaList.forEach((s, index) => {
                    const startDate = moment(s.startDate).tz('Asia/Jakarta');
                    const endDate = moment(s.endDate).tz('Asia/Jakarta');
                    const remainingDays = endDate.diff(moment().tz('Asia/Jakarta'), 'days');
                    const status = remainingDays > 0 ? `Aktif (${remainingDays} hari tersisa)` : `Habis (${endDate.format('DD/MM/YYYY')})`;

                    responseText += `*${index + 1}. Grup:* ${s.groupName || 'Tidak Diketahui'}\n`;
                    responseText += `   - ID Grup: ${s.id}\n`;
                    responseText += `   - Link: ${s.link}\n`;
                    responseText += `   - Mulai Sewa: ${startDate.format('DD/MM/YYYY HH:mm')}\n`;
                    responseText += `   - Berakhir: ${endDate.format('DD/MM/YYYY HH:mm')}\n`;
                    responseText += `   - Status: ${status}\n\n`;
                });
                m.reply(responseText);
            }
            break;

          case 'sendnotifsewa': {
    if (!isCreator) return m.reply("Fitur Khusus Owner.");
    if (!text) return m.reply(`Format salah! Contoh: ${prefix + command} linkgrup`);

    const groupLink = text.trim();
    if (!isUrl(groupLink) || !groupLink.includes('whatsapp.com')) return m.reply('Link Grup tidak valid!');

    try {
        // 1. Muat semua data sewa
        const allSewaData = getSewaList(); // Asumsi getSewaList mengembalikan array semua data sewa

        // 2. Cari data sewa yang cocok berdasarkan link grup
        const sewaData = allSewaData.find(s => s.link === groupLink);

        if (!sewaData) {
            return m.reply(`Grup dengan link tersebut tidak ditemukan dalam daftar sewa.`);
        }

        // Dapatkan groupId dan groupName dari data sewa yang ditemukan
        const groupId = sewaData.id;
        const groupName = sewaData.groupName;

        // Pastikan bot masih di grup sebelum mengirim notifikasi
        const allParticipatingGroups = await voltra.groupFetchAllParticipating();
        const isBotInGroup = allParticipatingGroups.hasOwnProperty(groupId);

        if (!isBotInGroup) {
            // Jika bot tidak di grup, coba bergabung lagi (opsional, bisa juga langsung error)
            try {
                const inviteCode = groupLink.split('https://chat.whatsapp.com/')[1];
                await voltra.groupAcceptInvite(inviteCode);
                m.reply(`Bot bergabung kembali ke grup *${groupName}* untuk mengirim notifikasi.`);
            } catch (e) {
                console.error("Error rejoining group for notification:", e);
                return m.reply(`Bot tidak dapat bergabung kembali ke grup *${groupName}* untuk mengirim notifikasi. Mungkin link kadaluarsa atau bot diblokir.`);
            }
        }

        const endDate = moment(sewaData.endDate).tz('Asia/Jakarta');
        const remainingDays = endDate.diff(moment().tz('Asia/Jakarta'), 'days');

        let notifMessage = `⚠️*PEMBERITAHUAN MASA SEWA BOT*⚠️\n\n`;
        notifMessage += `👋🏼Halo member grup *${groupName}*,\n`;
        notifMessage += `Masa sewa bot di grup ini akan segera berakhir.🥲\n\n`;
        notifMessage += `⏳*Sisa Masa Sewa:* ${remainingDays} hari\n`;
        notifMessage += `📅 *Berakhir Pada:* ${endDate.format('DD MMMM YYYY HH:mm:ss')}\n\n`;
        notifMessage += `Mohon segera lakukan perpanjangan sewa dengan menghubungi owner bot:\n`;
        notifMessage += `wa.me/${global.owner[0]}\n\n`;
        notifMessage += `*PENTING:* Jika masa sewa habis, bot akan otomatis keluar dari grup ini.`;

        await voltra.sendMessage(groupId, { text: notifMessage, mentions: [groupId] }); // Mention grup itu sendiri
        m.reply(`✅ Notifikasi sewa berhasil dikirim ke grup *${groupName}*.`);

    } catch (e) {
        console.error("Error sending sewa notification:", e);
        m.reply('Gagal mengirim notifikasi. Pastikan link grup valid dan bot bisa bergabung/mengirim pesan.');
    }
}
break;

            // =================================================//
            // AKHIR FITUR MANAJEMEN SEWA BOT
            // =================================================//

            case 'addlist': {
                if (!m.isGroup) return m.reply('Fitur Khusus Group!')
                if (!isAdmins) return m.reply('Fitur Khusus Admin!')
                var args1 = q.split("|")[0].toLowerCase()
                var args2 = q.split("|")[1]
                if (!q.includes("|")) return m.reply(`Gunakan dengan cara ${prefix + command} *key|response*\n\n_Contoh_\n\n${prefix + command} tes|apa`)
                // Assuming db_respon_list is still used for general responses, not just products
                const db_respon_list = JSON.parse(fs.readFileSync('./database/list.json'))
                if (isAlreadyResponList(m.chat, args1, db_respon_list)) return m.reply(`List respon dengan key : *${args1}* sudah ada di group ini.`)
                if (/image/.test(mime)) {
                    let media = await voltra.downloadAndSaveMediaMessage(quoted)
                    let mem = await Catbox(media)
                    addResponList(m.chat, args1, args2, true, mem, db_respon_list)
                    m.reply(`Sukses set list message dengan key : *${args1}*`)
                    if (fs.existsSync(media)) fs.unlinkSync(media)
                } else {
                    addResponList(m.chat, args1, args2, false, '-', db_respon_list)
                    m.reply(`Sukses set list message dengan key : *${args1}*`)
                }
            }
                break

            case 'dellist':
                if (!m.isGroup) return m.reply('Fitur Khusus Group!')
                if (!isAdmins) return m.reply('Fitur Khusus admin!')
                const db_respon_list_del = JSON.parse(fs.readFileSync('./database/list.json'))
                if (db_respon_list_del.length === 0) return m.reply(`Belum ada list message di database`)
                if (!text) return m.reply(`Gunakan dengan cara ${prefix + command} *key*\n\n_Contoh_\n\n${prefix + command} hello`)
                if (!isAlreadyResponList(m.chat, q.toLowerCase(), db_respon_list_del)) return m.reply(`List respon dengan key *${q}* tidak ada di database!`)
                delResponList(m.chat, q.toLowerCase(), db_respon_list_del)
                m.reply(`Sukses delete list message dengan key *${q}*`)
                break

            case 'updatelist': case 'update': {
                if (!m.isGroup) return m.reply('Fitur Khusus Group!')
                if (!isAdmins) return m.reply('Fitur Khusus admin!')
                var args1 = q.split("|")[0].toLowerCase()
                var args2 = q.split("|")[1]
                if (!q.includes("|")) return m.reply(`Gunakan dengan cara ${prefix + command} *key|response*\n\n_Contoh_\n\n${prefix + command} tes|apa`)
                const db_respon_list_update = JSON.parse(fs.readFileSync('./database/list.json'))
                if (!isAlreadyResponListGroup(m.chat, db_respon_list_update)) return m.reply(`Maaf, untuk key *${args1}* belum terdaftar di group ini`)
                if (/image/.test(mime)) {
                    let media = await voltra.downloadAndSaveMediaMessage(quoted)
                    let mem = await Catbox(media)
                    updateResponList(m.chat, args1, args2, true, mem, db_respon_list_update)
                    m.reply(`Sukses update respon list dengan key *${args1}*`)
                    if (fs.existsSync(media)) fs.unlinkSync(media)

                } else {
                    updateResponList(m.chat, args1, args2, false, '-', db_respon_list_update)
                    m.reply(`Sukses update respon list dengan key *${args1}*`)
                }
            }
                break
                
                     // Perintah List Produk (Close)
            case 'listclose':
                {
                    if (!(m.isGroup ? isAdmins : isCreator)) return await reply('Fitur Khusus Admin & Owner!');
                    if (!text) return await reply(`Gunakan dengan cara ${prefix + command} *key*\n\n_Contoh_\n\n${prefix + command} produk_A`);

                    const keyToSet = q.toLowerCase();
                    const db_respon_list_close = JSON.parse(fs.readFileSync('./database/list.json'))
                    if (!isAlreadyResponList((m.isGroup ? m.chat : botNumber), keyToSet, db_respon_list_close)) {
                        return await reply(`List respon dengan kode *${keyToSet}* tidak ditemukan.`);
                    }
                    if (setResponListStatus((m.isGroup ? m.chat : botNumber), keyToSet, true, db_respon_list_close)) {
                        await reply(`Produk *${keyToSet.toUpperCase()}* berhasil disetel menjadi *KOSONG*.`);
                    } else {
                        await reply(`Gagal menyetel status produk *${keyToSet.toUpperCase()}*.`);
                    }
                }
                break;

                // Perintah List Produk (Open)
            case 'listopen':
                {
                    if (!(m.isGroup ? isAdmins : isCreator)) return await reply('Fitur Khusus Admin & Owner!');
                    if (!text) return await reply(`Gunakan dengan cara ${prefix + command} *key*\n\n_Contoh_\n\n${prefix + command} produk_A`);

                    const keyToSet = q.toLowerCase();
                    const db_respon_list_open = JSON.parse(fs.readFileSync('./database/list.json'))
                    if (!isAlreadyResponList((m.isGroup ? m.chat : botNumber), keyToSet, db_respon_list_open)) {
                        return await reply(`List respon dengan kode *${keyToSet}* tidak ditemukan.`);
                    }
                    if (setResponListStatus((m.isGroup ? m.chat : botNumber), keyToSet, false, db_respon_list_open)) {
                        await reply(`Produk *${keyToSet.toUpperCase()}* berhasil disetel menjadi *TERSEDIA*.`);
                    } else {
                        await reply(`Gagal menyetel status produk *${keyToSet.toUpperCase()}*.`);
                    }
                }
                break;

            case 'list': {
                const db_respon_list_list = JSON.parse(fs.readFileSync('./database/list.json'))
                if (db_respon_list_list.length === 0) return m.reply(`Belum ada list message di database`)
                if (!isAlreadyResponListGroup(m.chat, db_respon_list_list)) return m.reply(`Belum ada list message yang terdaftar di group ini`)

                // Ambil teks header, symbol, dan footer dari database atau gunakan default
                let headerText = replaceNewlines(getTextSetListHeader(m.chat, setlist_header) || `*Halo Kak* @user👋\n
── 📆 𝖉𝖆𝖙𝖊   : @day, @tanggal
── ⏰ 𝖙𝖎𝖒𝖊  : @wib
\nBerikut beberapa list yang tersedia saat ini silahkan dipilih kak
\n*╭─────✧ [ LIST MENU ]*\n*│*`);
                let symbolText = replaceNewlines(getTextSetListSymbol(m.chat, setlist_symbol) || `⊸`);
                let footerText = replaceNewlines(getTextSetListFooter(m.chat, setlist_footer) || `*│*\n*╰───────✧* \n\nUntuk melihat detail produk dan harga silahkan ketik nama produk yang ada pada list di atas.\n`);

                // Ganti placeholder di header
                headerText = headerText
                    .replace(/@user/g, m.sender.split("@")[0])
                    .replace(/@tanggal/g, tanggal)
                    .replace(/@day/g, day)
                    .replace(/@tgl/g, tgl)
                    .replace(/@wib/g, wib)
                    .replace(/@wit/g, wit)
                    .replace(/@wita/g, wita)
                    .replace(/@jam/g, jam)
                    .replace(/@group/g, groupName)
                    .replace(/@totallist/g, db_respon_list_list.filter(item => item.id === m.chat).length);

                let teks = headerText + '\n';

                let groupResponList = db_respon_list_list.filter(item => item.id === m.chat);
                groupResponList.sort((a, b) => {
                    const nameA = a.key.toLowerCase();
                    const nameB = b.key.toLowerCase();
                    if (nameA < nameB) {
                        return -1;
                    }
                    if (nameA > nameB) {
                        return 1;
                    }
                    return 0;
                });

                for (let i of groupResponList) {
                    teks += `│ ${symbolText} *${i.key.toUpperCase()}* ${i.isClose ? "*「KOSONG」*" : ""}\n`;
                }

                // Ganti placeholder di footer
                footerText = footerText
                    .replace(/@user/g, m.sender.split("@")[0])
                    .replace(/@tanggal/g, tanggal)
                    .replace(/@day/g, day)
                    .replace(/@tgl/g, tgl)
                    .replace(/@wib/g, wib)
                    .replace(/@wit/g, wit)
                    .replace(/@wita/g, wita)
                    .replace(/@jam/g, jam)
                    .replace(/@group/g, groupName)
                    .replace(/@totallist/g, db_respon_list_list.filter(item => item.id === m.chat).length);

                teks += footerText;

                voltra.sendMessage(m.chat, { text: teks, mentions: [m.sender] }, { quoted: m })
            }
                break

            //=================================================//
            // FITUR STORE (Payment) //
            //=================================================//
          
            case 'pay':
            case 'qris':
            case 'bayar':
            case 'payment': { // Tambahkan 'payment' sebagai command utama jika belum ada
        await addReaction(m.chat, m.key, '⏳'); // REACTION: Proses
     
                // Jika di private chat, hanya owner yang bisa
                if (!m.isGroup && !isCreator) {
                    m.reply('Fitur ini hanya bisa digunakan oleh Owner di private chat.');
                    await addReaction(m.chat, m.key, '❌'); // REACTION: Gagal
                    return;
                }

                try {
                    let setpayDb;
                    try {
                        const rawData = fs.readFileSync('./database/pay.json', 'utf-8');
                        setpayDb = JSON.parse(rawData);
                        if (!Array.isArray(setpayDb)) {
                            console.warn("pay.json is not an array, reinitializing.");
                            setpayDb = [];
                        }
                    } catch (readErr) {
                        console.error("Error reading or parsing pay.json, initializing as empty array:", readErr);
                        setpayDb = [];
                    }

                    // Tentukan ID target: m.chat untuk grup, botNumber untuk private chat
                    const targetId = m.isGroup ? m.chat : botNumber;
                    let currentPayment = setpayDb.find(p => p.id === targetId);

                    if (currentPayment && (currentPayment.pay || currentPayment.caption)) {
                        if (currentPayment.pay) {
                            await voltra.sendMessage(m.chat, {
                                image: { url: currentPayment.pay },
                                caption: currentPayment.caption
                            }, { quoted: m });
                        } else {
                            await voltra.sendMessage(m.chat, { text: currentPayment.caption }, { quoted: m });
                        }
                        await addReaction(m.chat, m.key, '✅'); // REACTION: Berhasil
                    } else {
                        // Fallback ke QRIS default jika tidak ada pengaturan spesifik
                        let qrisPath = './image/qris.jpg';
                        if (fs.existsSync(qrisPath)) {
                            await voltra.sendMessage(m.chat, {
                                image: fs.readFileSync(qrisPath),
                                caption: "Anda Belum Mengatur Metode Pembayaran, Silahkan atur dengan ketik : setpay"
                            }, { quoted: m });
                            await addReaction(m.chat, m.key, '✅'); // REACTION: Berhasil
                        } else {
                            m.reply('Belum ada metode pembayaran yang diatur untuk chat ini. Silakan hubungi admin!');
                            await addReaction(m.chat, m.key, '❌'); // REACTION: Gagal
                        }
                    }
                } catch (err) {
                    m.reply('Terjadi kesalahan saat mengambil data pembayaran.');
                    console.log('Error di pay:', err);
                    await addReaction(m.chat, m.key, '❌'); // REACTION: Gagal
                }
                break;
            }

            case 'setpay':
            case 'setpayment': {
                // Batasi akses hanya untuk admin atau owner di grup
                if (m.isGroup && !isAdmins && !isCreator) {
                    return m.reply('Fitur ini hanya bisa digunakan oleh Admin atau Owner grup.');
                }
                // Jika di private chat, hanya owner yang bisa
                if (!m.isGroup && !isCreator) {
                    return m.reply('Fitur ini hanya bisa digunakan oleh Owner di private chat.');
                }

                if (!text && !m.quoted) return m.reply(`Reply gambar dengan caption ${prefix + command} *caption*\nAtau kirim teks saja: ${prefix + command} *teks pembayaran*\n\n_Contoh_\n\n${prefix + command} ini kak paymentnya`);

                let mediaUrl = null;
                let captionText = text;

                if (m.quoted && /image/.test(mime)) {
                    try {
                        let media = await voltra.downloadAndSaveMediaMessage(quoted);
                        mediaUrl = await Catbox(media); // Upload ke Catbox
                        if (fs.existsSync(media)) fs.unlinkSync(media); // Hapus file lokal setelah diupload
                        captionText = text || quoted.message.imageMessage.caption || ''; // Ambil caption dari quoted jika tidak ada teks
                    } catch (e) {
                        console.error("Error uploading image for setpay:", e);
                        return m.reply("Gagal mengunggah gambar. Coba lagi nanti.");
                    }
                }

                let setpayDb;
                try {
                    const rawData = fs.readFileSync('./database/pay.json', 'utf-8');
                    setpayDb = JSON.parse(rawData);
                    if (!Array.isArray(setpayDb)) {
                        console.warn("pay.json is not an array, reinitializing.");
                        setpayDb = [];
                    }
                } catch (readErr) {
                    console.error("Error reading or parsing pay.json, initializing as empty array:", readErr);
                    setpayDb = [];
                }

                // Tentukan ID target: m.chat untuk grup, botNumber untuk private chat
                const targetId = m.isGroup ? m.chat : botNumber;
                const existingIndex = setpayDb.findIndex(item => item.id === targetId);

                if (existingIndex !== -1) {
                    // Update existing entry
                    setpayDb[existingIndex].pay = mediaUrl;
                    setpayDb[existingIndex].caption = captionText;
                } else {
                    // Add new entry
                    setpayDb.push({ id: targetId, pay: mediaUrl, caption: captionText });
                }

                fs.writeFileSync('./database/pay.json', JSON.stringify(setpayDb, null, 2));

                let responseMessage = `*Sukses Mengatur Metode Pembayaran!* 🎉\n\n`;
                if (mediaUrl) responseMessage += `- Gambar QRIS/Pembayaran sudah diatur.\n`;
                responseMessage += `- Pesan: "${captionText}"`;

                m.reply(responseMessage);
                break;
            }

            case 'delpay':
            case 'delsetpay': {
                // Batasi akses hanya untuk admin atau owner di grup
                if (m.isGroup && !isAdmins && !isCreator) {
                    return m.reply('Fitur ini hanya bisa digunakan oleh Admin atau Owner grup.');
                }
                // Jika di private chat, hanya owner yang bisa
                if (!m.isGroup && !isCreator) {
                    return m.reply('Fitur ini hanya bisa digunakan oleh Owner di private chat.');
                }

                const filePath = './database/pay.json';
                let setpayDb;
                try {
                    const rawData = fs.readFileSync(filePath, 'utf-8');
                    setpayDb = JSON.parse(rawData);
                    if (!Array.isArray(setpayDb)) {
                        console.warn("pay.json is not an array, reinitializing.");
                        setpayDb = [];
                    }
                } catch (readErr) {
                    console.error("Error reading or parsing pay.json, initializing as empty array:", readErr);
                    setpayDb = [];
                }

                // Tentukan ID target: m.chat untuk grup, botNumber untuk private chat
                const targetId = m.isGroup ? m.chat : botNumber;
                const initialLength = setpayDb.length;

                setpayDb = setpayDb.filter(item => item.id !== targetId);

                if (setpayDb.length < initialLength) {
                    fs.writeFileSync(filePath, JSON.stringify(setpayDb, null, 2));
                    m.reply(`*Sukses Menghapus Metode Pembayaran!* 🗑️\n\nData pembayaran telah dihapus untuk chat ini.`);
                } else {
                    m.reply(`Tidak ada metode pembayaran yang diatur untuk chat ini.`);
                }
                break;
            }

            //=================================================//
            // DONE & PROSES = STRING GABISA DI EDIT PAKE FITUR //
            //=================================================//
           // Di dalam case 'p' atau 'proses':
// Pastikan fungsi replaceNewlines Anda seperti ini:
function replaceNewlines(text) {
    // Jika input bukan string (misal: null, undefined, number), kembalikan string kosong
    // atau string default yang bisa di-replace.
    if (typeof text !== 'string' || text === null || text === undefined) {
        return ''; // Mengembalikan string kosong agar .replace() tidak error
    }
    return text
        .replace(/@2newline/g, '\n\n')
        .replace(/@newline/g, '\n');
}

// --- Bagian command 'p' / 'proses' ---
case 'p':
case 'proses': {
    if (!(m.isGroup ? isAdmins : isCreator)) return m.reply('Fitur Khusus admin!');
    if (!m.quoted) return m.reply('Reply pesanan yang akan diproses');

    let tekPesanan = m.quoted.text || m.quoted.caption || '';
    let tekPesanAdmin = text || '';

    let prosesDefault = `「 *TRANSAKSI DI PROSES* 」\n\n\`\`\`📆 TANGGAL : @tanggal\n⌚ JAM     : @jam\n✨ STATUS  : Pending⏳\`\`\`\n\n*📝 Pesanan:*\n@pesanan\n\n*📝 Note :*\n@pesan\n\nPesanan @user lagi di proses, mohon bersabar ya 👨🏼‍💻`;
    const getTextP = getTextSetProses((m.isGroup ? m.chat : botNumber), set_proses);

    let baseMessageContent; // Variabel untuk menyimpan konten dasar pesan
    if (getTextP !== undefined && getTextP !== null) { // Pastikan getTextP bukan undefined atau null
        baseMessageContent = replaceNewlines(getTextP);
    } else {
        baseMessageContent = prosesDefault;
    }

    // Pastikan baseMessageContent adalah string sebelum melakukan replace
    if (typeof baseMessageContent !== 'string') {
        console.error("Error: baseMessageContent is not a string after replaceNewlines or default.");
        baseMessageContent = ''; // Fallback ke string kosong jika masih ada masalah
    }

    let finalMessage = baseMessageContent
        .replace('@pesanan', tekPesanan)
        .replace('@pesan', tekPesanAdmin)
        .replace('@user', '@' + m.quoted.sender.split("@")[0])
        .replace('@jam', jam)
        .replace('@tanggal', tanggal);

    voltra.sendTextWithMentions(m.chat, finalMessage, m);
    break;
}

// --- Bagian command 'd' / 'done' ---
case 'd':
case 'done': {
    if (!(m.isGroup ? isAdmins : isCreator)) return m.reply('Fitur Khusus admin!');
    if (!m.quoted) return m.reply('Reply pesanan yang telah diproses');

    let tekPesanan = m.quoted.text || m.quoted.caption || '';
    let tekPesanAdmin = text || '';

    let suksesDefault = `「 *TRANSAKSI BERHASIL* 」\n\n\`\`\`📆 TANGGAL : @tanggal\n⌚ JAM     : @jam\n✨ STATUS  : Berhasil\`\`\`\n\n*📝 Pesanan:*\n@pesanan\n\n*📝 Note :*\n@pesan\n\nTerimakasih @user, Next Order ya🙏`;
    const getTextD = getTextSetDone((m.isGroup ? m.chat : botNumber), set_done);

    let baseMessageContent; // Variabel untuk menyimpan konten dasar pesan
    if (getTextD !== undefined && getTextD !== null) { // Pastikan getTextD bukan undefined atau null
        baseMessageContent = replaceNewlines(getTextD);
    } else {
        baseMessageContent = suksesDefault;
    }

    // Pastikan baseMessageContent adalah string sebelum melakukan replace
    if (typeof baseMessageContent !== 'string') {
        console.error("Error: baseMessageContent is not a string after replaceNewlines or default.");
        baseMessageContent = ''; // Fallback ke string kosong jika masih ada masalah
    }

    let finalMessage = baseMessageContent
        .replace('@pesanan', tekPesanan)
        .replace('@pesan', tekPesanAdmin)
        .replace('@user', '@' + m.quoted.sender.split("@")[0])
        .replace('@jam', jam)
        .replace('@tanggal', tanggal);

    voltra.sendTextWithMentions(m.chat, finalMessage, m);
    break;
}

            //=================================================//
            // TAMBAH & KURANGI SALDO - REMOVED ENTIRELY
            //=================================================//
            // case 'addsaldo': { /* ... */ } break;
            // case 'minsaldo': { /* ... */ } break;
            // case 'topusers': { /* ... */ } break;
            // case 'resettopusers': { /* ... */ } break;
            //=================================================//
            // FITUR ABSEN - REMOVED ENTIRELY
            //=================================================//
            // case 'absen': { /* ... */ } break;
            // case 'resetabsen': { /* ... */ } break;
            // case 'rekaptransaksi': { /* ... */ } break;
            // case 'cekallstok': { /* ... */ } break;


            //=================================================//
            // FITUR BARU DARI OSINGKU.JS
            //=================================================//

            // setproses / changeproses / delsetproses
            case 'setproses':
            case 'changeproses':
            case 'setp':
            case 'changep': {
                if (!(m.isGroup ? isAdmins : isCreator)) return m.reply('Fitur Khusus Admin & Owner!');
                if (!text) return m.reply(`Format salah! Contoh:\n${prefix + command} Pesanan @user sedang diproses. Mohon tunggu ya! @newline\n\nVariabel:\n@user, @pesanan, @pesan, @jam, @tanggal, @newline, @2newline`);

                const processedText = replaceNewlines(text);
                const targetId = m.isGroup ? m.chat : botNumber;

                if (isSetProses(targetId, set_proses)) {
                    changeSetProses(processedText, targetId, set_proses);
                    m.reply(`✅ Berhasil mengubah teks proses!`);
                } else {
                    addSetProses(processedText, targetId, set_proses);
                    m.reply(`✅ Berhasil mengatur teks proses!`);
                }
                break;
            }

            case 'delsetproses':
            case 'delsetp': {
                if (!(m.isGroup ? isAdmins : isCreator)) return m.reply('Fitur Khusus Admin & Owner!');
                const targetId = m.isGroup ? m.chat : botNumber;

                if (!isSetProses(targetId, set_proses)) return m.reply(`Belum ada teks proses yang diatur di sini.`);

                removeSetProses(targetId, set_proses);
                m.reply(`✅ Berhasil menghapus teks proses. Kembali ke default.`);
                break;
            }

            // setdone / changedone / delsetdone
            case 'setdone':
            case 'changedone':
            case 'setd':
            case 'changed': {
                if (!(m.isGroup ? isAdmins : isCreator)) return m.reply('Fitur Khusus Admin & Owner!');
                if (!text) return m.reply(`Format salah! Contoh:\n${prefix + command} Pesanan @user sudah selesai! Terima kasih ya! @newline\n\nVariabel:\n@user, @pesanan, @pesan, @jam, @tanggal, @newline, @2newline`);

                const processedText = replaceNewlines(text);
                const targetId = m.isGroup ? m.chat : botNumber;

                if (isSetDone(targetId, set_done)) {
                    changeSetDone(processedText, targetId, set_done);
                    m.reply(`✅ Berhasil mengubah teks selesai!`);
                } else {
                    addSetDone(processedText, targetId, set_done);
                    m.reply(`✅ Berhasil mengatur teks selesai!`);
                }
                break;
            }

            case 'delsetdone':
            case 'delsetd': {
                if (!(m.isGroup ? isAdmins : isCreator)) return m.reply('Fitur Khusus Admin & Owner!');
                const targetId = m.isGroup ? m.chat : botNumber;

                if (!isSetDone(targetId, set_done)) return m.reply(`Belum ada teks selesai yang diatur di sini.`);

                removeSetDone(targetId, set_done);
                m.reply(`✅ Berhasil menghapus teks selesai. Kembali ke default.`);
                break;
            }

          
            // tutorsetlist
            case 'tutorsetlist': {
                const tutorText = `
*PENJELASAN CARA MENGGUNAKAN SETLIST*

Setlist adalah fitur untuk design ulang tampilan List berikut penjelasannya:

*List* : Menampilkan produk jualan kamu
*Setlist* : Setting Header Text Dibagian Atas List
*Setlist2* : Setting Tanda atau Symbol Dibagian Belakang List
*Setlist3* : Setting Footer Text Dibagian Bawah List
*Resetwdlist* : Hapus database Setlist, mengembalikan ke setelan default

*WORDING COMMAND*
@user : Tag User
@tanggal : Tanggal hari ini (contoh: 01/01/2024)
@day : Hari Ini (contoh: Senin)
@tgl : Hari + Tanggal (contoh: Senin, 01 Januari 2024)
@wib : Waktu WIB (contoh: 10:30:00)
@wit : Waktu WIT (contoh: 11:30:00)
@wita : Waktu WITA (contoh: 12:30:00)
@jam : Waktu WIB juga
@group : Nama Grup
@totallist : Total List Produk di Grup
@newline : Garis baru kebawah (seperti enter)
@2newline : 2 Garis baru kebawah (seperti dua kali enter)

*Penjelasan Newline:*
Newline itu semacam enter, kalo newline langsung pake enter yang di keyboard lu, di WhatsApp bakal ke hapus makanya dibikin kode @newline biar ga dihapus otomatis sama WhatsApp. Kode @newline pake di awal atau akhir wording lu, kalo di tengah tengah pake enter di keyboard lu aja.

*Contoh Penggunaan:*
${prefix}setlist Halo @user, ini list produk kami! @newline
${prefix}setlist2 ➡️
${prefix}setlist3 Terima kasih sudah mampir! @newline
`;
                m.reply(tutorText);
                break;
            }

            // setlist (header)
            case 'setlist': {
                if (!m.isGroup) return m.reply('Fitur Khusus Group!');
                if (!isAdmins && !isCreator) return m.reply('Fitur Khusus Admin & Owner!');
                if (!text) return m.reply(`Format salah! Contoh:\n${prefix + command} *Halo Kak* @user👋\n── 📆 𝖉𝖆𝖙𝖊   : @day, @tanggal\n── ⏰ 𝖙𝖎𝖒𝖊  : @wib\nBerikut beberapa list yang tersedia saat ini silahkan dipilih kak\n*╭─────✧ [ LIST MENU ]*\n*│*`);

                const processedText = replaceNewlines(text);
                const targetId = m.chat;

                if (isSetListHeader(targetId, setlist_header)) {
                    changeSetListHeader(processedText, targetId, setlist_header);
                    m.reply(`✅ Berhasil mengubah header list! Coba ketik *list* untuk melihat perubahannya.`);
                } else {
                    addSetListHeader(processedText, targetId, setlist_header);
                    m.reply(`✅ Berhasil mengatur header list! Coba ketik *list* untuk melihat perubahannya.`);
                }
                break;
            }

            // setlist2 (symbol)
            case 'setlist2': {
                if (!m.isGroup) return m.reply('Fitur Khusus Group!');
                if (!isAdmins && !isCreator) return m.reply('Fitur Khusus Admin & Owner!');
                if (!text) return m.reply(`Format salah! Contoh:\n${prefix + command} ➡️`);

                const processedText = replaceNewlines(text);
                const targetId = m.chat;

                if (isSetListSymbol(targetId, setlist_symbol)) {
                    changeSetListSymbol(processedText, targetId, setlist_symbol);
                    m.reply(`✅ Berhasil mengubah simbol list! Coba ketik *list* untuk melihat perubahannya.`);
                } else {
                    addSetListSymbol(processedText, targetId, setlist_symbol);
                    m.reply(`✅ Berhasil mengatur simbol list! Coba ketik *list* untuk melihat perubahannya.`);
                }
                break;
            }

            // setlist3 (footer)
            case 'setlist3': {
                if (!m.isGroup) return m.reply('Fitur Khusus Group!');
                if (!isAdmins && !isCreator) return m.reply('Fitur Khusus Admin & Owner!');
                if (!text) return m.reply(`Format salah! Contoh:\n${prefix + command} *│*\n*╰───────✧* \nUntuk melihat detail produk dan harga silahkan ketik nama produk yang ada pada list di atas.\n`);

                const processedText = replaceNewlines(text);
                const targetId = m.chat;

                if (isSetListFooter(targetId, setlist_footer)) {
                    changeSetListFooter(processedText, targetId, setlist_footer);
                    m.reply(`✅ Berhasil mengubah footer list! Coba ketik *list* untuk melihat perubahannya.`);
                } else {
                    addSetListFooter(processedText, targetId, setlist_footer);
                    m.reply(`✅ Berhasil mengatur footer list! Coba ketik *list* untuk melihat perubahannya.`);
                }
                break;
            }

            // resetsetlist
            case 'resetsetlist': {
                if (!m.isGroup) return m.reply('Fitur Khusus Group!');
                if (!isAdmins && !isCreator) return m.reply('Fitur Khusus Admin & Owner!');
                const targetId = m.chat;

                removeSetListHeader(targetId, setlist_header);
                removeSetListSymbol(targetId, setlist_symbol);
                removeSetListFooter(targetId, setlist_footer);

                m.reply(`✅ Berhasil mereset semua pengaturan list ke default!`);
                break;
            }

            //=================================================//
            // FITUR SLR (SLOW RESPONSE) - NEW
            //=================================================//
            case 'slr': {
                if (!isAdmins && !isCreator) return m.reply('Fitur ini hanya untuk Admin atau Owner!');
                let user = global.db.data.users[m.sender];

                if (args[0] === 'on') {
                    user.slrTime = + new Date;
                    user.slrReason = text.substring(args[0].length + 1).trim(); // Ambil sisa teks sebagai alasan
                    reply(`⏳${m.sender.split("@")[0]} Sedang Slow Respon \n📢 *Alasan:* ${user.slrReason ? user.slrReason : 'Tidak ada alasan spesifik.'}\n\n> Mohon bersabar ya, pesan akan dibalas lebih lambat dari biasanya. Terima kasih! 🙏`);
                } else if (args[0] === 'off') {
                    if (user.slrTime === -1) {
                        return m.reply('Kamu tidak sedang dalam mode Slow Response.');
                    }
                    reply(`✅ Kak *@${m.sender.split("@")[0]}* sudah kembali online dan tidak lagi dalam mode Slow Response! 🎉`);
                    user.slrTime = -1;
                    user.slrReason = '';
                } else {
                    m.reply(`Format salah! Gunakan:\n*${prefix}slr on [alasan]* untuk mengaktifkan\n*${prefix}slr off* untuk menonaktifkan`);
                }
            }
                break;
//=================================================//
case 'mlreg':
case 'cekml':
case 'mlregion': {
    await addReaction(m.chat, m.key, '⏳'); // REACTION: Proses
    if (!m.isGroup) {
        m.reply('Fitur Khusus Penyewa Bot');
        await addReaction(m.chat, m.key, '❌'); // REACTION: Gagal
        return;
    }
    if (!text) {
        m.reply(`─────〔  *CEK REGION MLBB* 〕─────\n\n- Contoh : ${command} 1265789123 15250`);
        await addReaction(m.chat, m.key, '❌'); // REACTION: Gagal
        return;
    }

    let [userId, serverId] = text.split(" ");
    if (serverId) {
        serverId = serverId.replace(/[()]/g, '');
    }

    if (!userId || !serverId || isNaN(userId) || isNaN(serverId)) {
        m.reply("ID Server tidak ditemukan, silahkan cek ulang");
        await addReaction(m.chat, m.key, '❌'); // REACTION: Gagal
        return;
    }
    const url = `https://dev.luckycat.my.id/api/stalker/mobile-legend?users=${userId}&servers=${serverId}`;

    try {
        const response = await fetch(url);
        const result = await response.json();

        if (result.status && result.data) {
            const { nickname, country } = result.data;
            m.reply(`─────〔  *CEK REGION MLBB* 〕─────

*ID Game* : ${userId} (${serverId})
*Nickname* : ${nickname}
*Region* : ${country}`);
            await addReaction(m.chat, m.key, '✅'); // REACTION: Berhasil
        } else {
            m.reply("Gagal mengambil data. Pastikan ID dan server yang dimasukkan benar.");
            await addReaction(m.chat, m.key, '❌'); // REACTION: Gagal
        }
    } catch (error) {
        m.reply("Terjadi kesalahan saat mengambil data. Silakan coba lagi nanti.");
        await addReaction(m.chat, m.key, '❌'); // REACTION: Gagal
    }
    break;
}


case 'cekff':{
if (args.length == 0) return m.reply(`─────〔  *FREE FIRE STALK* 〕─────\n\n- Contoh : ${prefix + command} 570098876`)
      const id = body.split(" ")[1];
    //  const zona = body.split(" ")[2];
 var ff = await fetchJson(`https://api.isan.eu.org/nickname/ff?id=${id}`)
 const hasil = `─────〔  *FREE FIRE STALK* 〕─────

*Nama Game* : ${ff.game}
*ID Game* : ${id}
*Nickname* : ${ff.name || null}`
m.reply(hasil);
}break

case 'cekmcgg':{
if (!m.isGroup) return reply('Fitur Khusus Penyewa Bot');
if (args.length == 0) return m.reply(`─────〔  *MAGIC CHESS GO GO STALK* 〕─────\n\n- Contoh : ${prefix + command} 10100 1001`)
      const id = body.split(" ")[1];
      let server = body.split(" ")[2];
      server = server.replace(/^\((\d+)\)$/, '$1');
 var idgame = await fetchJson(`https://api.isan.eu.org/nickname/mcgg?id=${id}&server=${server}`)
 const hasil = `─────〔  *MAGIC CHESS GO GO RESULT* 〕─────

*Nama Game* : ${idgame.game}
*ID Game* : ${id} ( ${server} )
*Nickname* : ${idgame.name || null}`
m.reply(hasil);
}break

case 'ceklnd':{
if (!m.isGroup) return reply('Fitur Khusus Penyewa Bot');
if (args.length == 0) return m.reply(`─────〔  *LOVE AND DEEPSPACE STALK* 〕─────\n\n- Contoh : ${prefix + command} 81001445172`)
      const id = body.split(" ")[1];
    //   let server = body.split(" ")[2];
     //  server = server.replace(/^\((\d+)\)$/, '$1');
 var idgame = await fetchJson(`https://api.isan.eu.org/nickname/ld?id=${id}`)
 const hasil = `─────〔  *LOVE AND DEEPSPACE RESULT* 〕─────

*Nama Game* : ${idgame.game}
*ID Game* : ${id}
*Nickname* : ${idgame.name || null}`
m.reply(hasil);
} break

case 'cekag':{
if (args.length == 0) return m.reply(`─────〔  *AETHER GAZER STALK* 〕─────\n\n- Contoh : ${prefix + command} 53687200000`)
      const id = body.split(" ")[1];
      //const server = body.split(" ")[2];
 var idgame = await fetchJson(`https://api.isan.eu.org/nickname/ag?id=${id}`)
 const hasil = `─────〔  *AETHER GAZER STALK* 〕─────

*Nama Game* : ${idgame.game}
*ID Game* : ${id}
*Nickname* : ${idgame.name || null}`
m.reply(hasil);
}break

case 'cekgi':{
if (args.length == 0) return m.reply(`─────〔  *GENSHIN IMPACT STALK* 〕─────\n\n- Contoh : ${prefix + command} 600000000`)
      const id = body.split(" ")[1];
      //const server = body.split(" ")[2];
 var idgame = await fetchJson(`https://api.isan.eu.org/nickname/gi?id=${id}`)
 const hasil = `─────〔  *GENSHIN IMPACT STALK* 〕─────

*Nama Game* : ${idgame.game}
*ID Game* : ${id}
*Server* : ${idgame.server}
*Nickname* : ${idgame.name || null}`
m.reply(hasil);
}break

case 'cekhsr':{
if (args.length == 0) return m.reply(`─────〔  *HONKAI: STAR RAIL STALK* 〕─────\n\n- Contoh : ${prefix + command} 600000001`)
      const id = body.split(" ")[1];
      //const server = body.split(" ")[2];
 var idgame = await fetchJson(`https://api.isan.eu.org/nickname/hsr?id=${id}`)
 const hasil = `─────〔  *HONKAI: STAR RAIL STALK* 〕─────

*Nama Game* : ${idgame.game}
*ID Game* : ${id}
*Server* : ${idgame.server}
*Nickname* : ${idgame.name || null}`
m.reply(hasil);
}break

case 'cekhi':{
if (args.length == 0) return m.reply(`─────〔  *HONKAI IMPACT 3RD STALK* 〕─────\n\n- Contoh : ${prefix + command} 10000001`)
      const id = body.split(" ")[1];
      //const server = body.split(" ")[2];
 var idgame = await fetchJson(`https://api.isan.eu.org/nickname/hi?id=${id}`)
 const hasil = `─────〔  *HONKAI IMPACT 3RD STALK* 〕─────

*Nama Game* : ${idgame.game}
*ID Game* : ${id}
*Nickname* : ${idgame.name || null}`
m.reply(hasil);
}break

case 'cekpb':{
if (args.length == 0) return m.reply(`─────〔  *POINT BLANK STALK* 〕─────\n\n- Contoh : ${prefix + command} wakwaw55`)
      const id = body.split(" ")[1];
      //const server = body.split(" ")[2];
 var idgame = await fetchJson(`https://api.isan.eu.org/nickname/pb?id=${id}`)
 const hasil = `─────〔  *POINT BLANK STALK* 〕─────

*Nama Game* : ${idgame.game}
*ID Game* : ${id}
*Nickname* : ${idgame.name || null}`
m.reply(hasil);
}break

case 'ceksm':{
if (args.length == 0) return m.reply(`─────〔  *SAUSAGE MAN STALK* 〕─────\n\n- Contoh : ${prefix + command} 5sn9jf`)
      const id = body.split(" ")[1];
      //const server = body.split(" ")[2];
 var idgame = await fetchJson(`https://api.isan.eu.org/nickname/sm?id=${id}`)
 const hasil = `─────〔  *SAUSAGE MAN STALK* 〕─────

*Nama Game* : ${idgame.game}
*ID Game* : ${id}
*Nickname* : ${idgame.name || null}`
m.reply(hasil);
}break

case 'ceksus':{
if (args.length == 0) return m.reply(`─────〔  *SUPER SUS STALK* 〕─────\n\n- Contoh : ${prefix + command} 15916600`)
      const id = body.split(" ")[1];
      //const server = body.split(" ")[2];
 var idgame = await fetchJson(`https://api.isan.eu.org/nickname/sus?id=${id}`)
 const hasil = `─────〔  *SUPER SUS STALK* 〕─────

*Nama Game* : ${idgame.game}
*ID Game* : ${id}
*Nickname* : ${idgame.name || null}`
m.reply(hasil);
}break

case 'cekvalo':{
if (args.length == 0) return m.reply(`─────〔  *VALORANT STALK* 〕─────\n\n- Contoh ID INDO : ${prefix + command} yuyun#123\n- Contoh ID NON INDO : ${prefix + command} Westbourne#USA`)
      let id = body.split(" ")[1];
      id = id.replace('#', '%23');
      //const server = body.split(" ")[2];
 var idgame = await fetchJson(`https://api.isan.eu.org/nickname/valo?id=${id}`)
 let hasil = `─────〔  *VALORANT STALK* 〕─────

*Nama Game* : ${idgame.game}
*ID Game* : ${id}
*Server* : ${idgame.server}
*Nickname* : ${idgame.name || null}`
hasil = hasil.replace(/%23/g, '#');
m.reply(hasil);
}break

case 'cekpgr':{
if (args.length == 0) return m.reply(`─────〔  *PUNISHING: GRAY RAVEN STALK* 〕─────\n\n- Contoh : ${prefix + command} 16746755 AP\n\n*Keterangan untuk identifikasi server:*\n- AP (Asia-Pasifik),\n- EU (Europe),\n- NA (North America)`)
      const id = body.split(" ")[1];
      const server = body.split(" ")[2];
 var idgame = await fetchJson(`https://api.isan.eu.org/nickname/pgr?id=${id}&server=${server}`)
 const hasil = `─────〔  *PUNISHING: GRAY RAVEN STALK* 〕─────

*Nama Game* : ${idgame.game}
*ID Game* : ${id}
*Server* : ${idgame.server}
*Nickname* : ${idgame.name || null}`
m.reply(hasil);
}break

case 'cekzzz':{
if (args.length == 0) return m.reply(`─────〔  *ZENLESS ZONE ZERO STALK* 〕─────\n\n- Contoh : ${prefix + command} 1000000100`)
      const id = body.split(" ")[1];
    //  const server = body.split(" ")[2];
 var idgame = await fetchJson(`https://api.isan.eu.org/nickname/zzz?id=${id}`)
 const hasil = `─────〔  *ZENLESS ZONE ZERO STALK* 〕─────

*Nama Game* : ${idgame.game}
*ID Game* : ${id}
*Server* : ${idgame.server}
*Nickname* : ${idgame.name || null}`
m.reply(hasil);
}break

case 'cekaov':{
if (args.length == 0) return m.reply(`─────〔  *ARENA OF VALOR STALK* 〕─────\n\n- Contoh : ${prefix + command} 124590895269021`)
      const id = body.split(" ")[1];
    //  const server = body.split(" ")[2];
 var idgame = await fetchJson(`https://api.isan.eu.org/nickname/aov?id=${id}`)
 const hasil = `─────〔  *ARENA OF VALOR STALK* 〕─────

*Nama Game* : ${idgame.game}
*ID Game* : ${id}
*Nickname* : ${idgame.name || null}`
m.reply(hasil);
}break

case 'cekcod':
case 'cekcodm': {
        if (!text) return m.reply(`─────〔  *CALL OF DUTY  STALK* 〕─────\n\n- Contoh : ${prefix + command} 243402956362890880`);
        // Assuming cekCodm is a function defined elsewhere or needs to be removed
        // For now, I'll comment out the call to cekCodm as it's not defined in the provided context.
        // If you want to keep stalk functions, ensure their dependencies are met.
        // cekCodm(text)
        //     .then(data => {
        //     if (data.message === "Success") {
        //         const hasil = `─────〔  *CALL OF DUTY  STALK* 〕─────
        // *ID Game*: ${text}
        // *Nickname:* ${data.data}`;
        //         client.sendMessage(m.chat, { text: hasil }, { quoted: m });
        //     } else {
        //         return m.reply(`Maaf, username tidak ditemukan`);
        //     }
        // }).catch(error => {
        //     console.error('Error:', error);
        // });
        m.reply("Fungsi cekcodm tidak tersedia atau memerlukan implementasi tambahan.");
    break;}

case 'cekpubg': {
        if (!text) return m.reply(`─────〔  *PUBG MOBILE STALK* 〕─────\n\n- Contoh : ${prefix + command} 5178789962`);
        // Assuming cekPubg is a function defined elsewhere or needs to be removed
        // cekPubg(text)
        //     .then(data => {
        //     if (data.message === "Success") {
        //         const hasil = `─────〔  *PUBG MOBILE STALK* 〕─────
        // *ID Game*: ${text}
        // *Nickname:* ${data.data}`;
        //         client.sendMessage(m.chat, { text: hasil }, { quoted: m });
        //     } else {
        //         return m.reply(`Maaf, username tidak ditemukan`);
        //     }
        // }).catch(error => {
        //     console.error('Error:', error);
        // });
        m.reply("Fungsi cekpubg tidak tersedia atau memerlukan implementasi tambahan.");
    break;}

case 'cekhok': {
        if (!text) return m.reply(`─────〔  *HONOR OF KINGS STALK* 〕─────\n\n- Contoh : ${prefix + command} 9373893688518913655`);
        // Assuming cekHok is a function defined elsewhere or needs to be removed
        // cekHok(text)
        //     .then(data => {
        //     if (data.message === "Success") {
        //         const hasil = `─────〔  *HONOR OF KINGS STALK* 〕─────
        // *ID Game*: ${text}
        // *Nickname:* ${data.data}`;
        //         client.sendMessage(m.chat, { text: hasil }, { quoted: m });
        //     } else {
        //         return m.reply(`Maaf, username tidak ditemukan`);
        //     }
        // }).catch(error => {
        //     console.error('Error:', error);
        // });
        m.reply("Fungsi cekhok tidak tersedia atau memerlukan implementasi tambahan.");
    break;}
//=================================================//
            //=================================================//
            //       CODE ENDING = GAPERLU DI APA APAIN          //
            //=================================================//
            default:
                if (budy.startsWith('=>')) {
                    if (!isCreator) return m.reply("Fitur Khusus Owner.")
                    function Return(sul) {
                        sat = JSON.stringify(sul, null, 2)
                        bang = util.format(sat)
                        if (sat == undefined) {
                            bang = util.format(sul)
                        }
                        return reply(bang)
                    }
                    try {
                        reply(util.format(eval(`(async () => { return ${budy.slice(3)} })()`)))
                    } catch (e) {
                        reply(String(e))
                    }
                }

                if (budy.startsWith('>')) {
                    if (!isCreator) return m.reply("Fitur Khusus Owner.")
                    try {
                        let evaled = await eval(budy.slice(2))
                        if (typeof evaled !== 'string') evaled = require('util').inspect(evaled)
                        await reply(evaled)
                    } catch (err) {
                        await reply(String(err))
                    }
                }
                if (budy.startsWith('$')) {
                    if (!isCreator) return m.reply("Fitur Khusus Owner.")
                    exec(budy.slice(2), (err, stdout) => {
                        if (err) return reply(err)
                        if (stdout) return reply(stdout)
                    })
                }
                if (isCommand && budy.toLowerCase() != undefined) { // Changed from isCmd to isCommand
                    if (m.chat.endsWith('broadcast')) return
                    if (m.isBaileys) return
                    let msgs = global.db.data.database
                    if (!(budy.toLowerCase() in msgs)) return
                    voltra.copyNForward(m.chat, msgs[budy.toLowerCase()], true, { quoted: m })
                }
        }
    } catch (err) {
        console.log(util.format(err))
        let e = String(err)
        const errorNumbers = global.owner.map(num => num + '@s.whatsapp.net');

        for (let num of errorNumbers) {
            voltra.sendMessage(num, {
                text: `Hai developer, ada error di bot ${global.namabot}\n\n` + util.format(e)
            });
        }
        if (e.includes("conflict")) return
        if (e.includes("Cannot derive from empty media key")) return
        if (e.includes("not-authorized")) return
        if (e.includes("already-exists")) return
        if (e.includes("rate-overlimit")) return
        if (e.includes("Connection Closed")) return
        if (e.includes("Timed Out")) return
        if (e.includes("Value not found")) return
        if (e.includes("Socket connection timeout")) return
    }
}
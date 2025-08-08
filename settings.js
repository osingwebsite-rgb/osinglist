const fs = require('fs')
const chalk = require('chalk')

// DATA OWNER
global.xprefix = '' // Jangan Diubah
global.namastore = 'OSING BOTSTORE' // Nama Store
global.owner = ['6285804546789'] // Nomer Owner
global.nomerbot = '6283132819941' // Nomer Bot
global.ownername = 'Osingweb sumber digital' // Nama Owner
global.botname = 'OSING BOTSTORE' // Nama Bot
global.linkgc = "premtimes.com" // Link Grup


// DATA STICKER 
global.packname = "Sticker By" // Nama Pack Stiker
global.author = global.ownername


// PAYMENT MANUAL
global.pp_bot = fs.readFileSync("./image/foto.jpg") // Foto Profile Bot
global.qris = fs.readFileSync("./image/qris.jpg") // Foto Qris
global.caption_pay = `─────〔  *QRIS ALL PAYMENT* 〕─────

Semua *M-BANKING & E-WALLET* bisa *SCAN QRIS DIATAS* (Cari fitur SCAN & Masukin Barcode Diatas)

Mau ganti payment? ketik .setpay`

//bot sett
global.autoblocknumber = '92' // set autoblock country code 
global.antiforeignnumber = '91' // set anti foreign number country code
global.wagc = 'https://whatsapp.com/channel/0029Vb7RrJhEAKW5sVGojC24'; // Ganti dengan link grup WhatsApp Anda
global.welcome = true; // Aktifkan welcome/left
global.anticall = true; // Aktifkan anti-call
global.antiswview = true; // Aktifkan anti-status view
global.adminevent = true; // Aktifkan admin event
global.groupevent = true; // Aktifkan group event
//msg

global.mess = {
    limit: 'Your limit is up!',
    nsfw: 'Nsfw is disabled in this group, Please tell the admin to enable',
    done: 'DONE✅',
    error: 'EROR❗',
    success: 'Here you go!'
}

let file = require.resolve(__filename)
fs.watchFile(file, () => {
    fs.unwatchFile(file)
    console.log(chalk.redBright(`Update'${__filename}'`))
    delete require.cache[file]
    require(file)
})
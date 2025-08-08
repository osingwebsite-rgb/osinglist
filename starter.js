require('./settings');
// Hapus baris ini: const { handleGroupParticipantsUpdate } = require('./welcome-handler');
const makeWASocket = require("@whiskeysockets/baileys").default;
const { uncache, nocache } = require('./lib/loader');
const { color } = require('./lib/color'); // Assuming this is a simple color function
const NodeCache = require("node-cache");
const readline = require("readline");
const pino = require('pino');
const { Boom } = require('@hapi/boom');
const { Low, JSONFile } = require('./lib/lowdb');
const yargs = require('yargs/yargs');
const fs = require('fs');
const chalk = require('chalk'); // Likely used for console coloring
const CFonts = require('cfonts'); // Used for ASCII art text
const FileType = require('file-type');
const path = require('path');
const axios = require('axios');
const _ = require('lodash');
const moment = require('moment-timezone');
const PhoneNumber = require('awesome-phonenumber');
const { imageToWebp, videoToWebp, writeExifImg, writeExifVid } = require('./lib/exif');
const { smsg, isUrl, generateMessageTag, getBuffer, getSizeMedia, fetch, await: awaitFunc, sleep, reSize } = require('./lib/myfunc'); // Renamed 'await' to 'awaitFunc' to avoid keyword conflict
const { default: voltraConnect, getAggregateVotesInPollMessage, delay, PHONENUMBER_MCC, makeCacheableSignalKeyStore, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, generateForwardMessageContent, prepareWAMessageMedia, generateWAMessageFromContent, generateMessageID, downloadContentFromMessage, jidDecode, proto, Browsers} = require("@whiskeysockets/baileys");

// --- Tambahkan fungsi getProfilePictureBuffer di sini ---
// Path untuk gambar default (sesuaikan dengan lokasi di Pterodactyl Anda)
// Contoh: Jika folder 'image' ada di /home/container/image/
const DEFAULT_WELCOME_IMAGE_PATH = '/home/container/image/welcome_image.jpg';
const DEFAULT_LEFT_IMAGE_PATH = '/home/container/image/left_image.jpg';

/**
 * Mengunduh foto profil pengguna atau mengembalikan buffer gambar default.
 * @param {object} conn Baileys connection object.
 * @param {string} jid JID (WhatsApp ID) pengguna.
 * @param {string} defaultImagePath Path ke gambar default jika foto profil tidak tersedia.
 * @returns {Promise<Buffer>} Buffer gambar.
 */
async function getProfilePictureBuffer(conn, jid, defaultImagePath) {
    try {
        const ppUrl = await conn.profilePictureUrl(jid, 'image');
        // Ganti 'fetch' dengan 'axios.get' dan pastikan responseType adalah 'arraybuffer'
        const response = await axios.get(ppUrl, { responseType: 'arraybuffer' });
        // Axios secara otomatis akan melempar error jika status bukan 2xx, jadi tidak perlu cek response.ok
        return Buffer.from(response.data);
    } catch (error) {
        console.error(`Error fetching profile picture for ${jid}:`, error.message);
        // Fallback to default image if fetching fails or no profile picture
        if (fs.existsSync(defaultImagePath)) {
            return fs.readFileSync(defaultImagePath);
        } else {
            console.warn(`Default image not found at ${defaultImagePath}. Using a placeholder.`);
            // Return a small transparent buffer as a last resort placeholder
            return Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
        }
    }
}
// --- Akhir fungsi getProfilePictureBuffer ---


global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse());
global.db = new Low(new JSONFile(`database/database-all.json`));

global.DATABASE = global.db;
global.loadDatabase = async function loadDatabase() {
  if (global.db.READ) return new Promise((resolve) => setInterval(function () { (!global.db.READ ? (clearInterval(this), resolve(global.db.data == null ? global.loadDatabase() : global.db.data)) : null) }, 1 * 1000));
  if (global.db.data !== null) return;
  global.db.READ = true;
  await global.db.read();
  global.db.READ = false;
  global.db.data = {
    users: {},
    database: {},
    chats: {},
    game: {},
    settings: {},
    message: {},
    ...(global.db.data || {})
  };
  global.db.chain = _.chain(global.db.data);
};
loadDatabase();

if (global.db) setInterval(async () => {
   if (global.db.data) await global.db.write();
}, 30 * 1000);

const usePairingCode = true;

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));


// Display "OsingWeb" using CFonts
CFonts.say('\nOsingWeb\n', {
  font: 'block',
  align: 'center',
  colors: ['#00ff00']
});

console.log(color('====================================', 'green')); // This line was heavily obfuscated
console.log(color('Preamteam Bot Auto Order', 'yellow')); // This line was heavily obfuscated
console.log(color('====================================', 'yellow')); // This line was heavily obfuscated
console.log(color('Special Price for Reseller Aplikasi Premium', 'yellow')); // This line was heavily obfuscated
console.log(color('+++++++++++++++++++++++++++', 'red')); // This line was heavily obfuscated
console.log(color('Pembelian diluar osingweb bukan tanggung jawab kami!', 'yellow')); // This line was heavily obfuscated

// =================================================//
// END DEOBFUSCATED SECTION

async function startvoltra() {
  let { version, isLatest } = await fetchLatestBaileysVersion();
  const {  state, saveCreds } = await useMultiFileAuthState(`./session`);
  const msgRetryCounterCache = new NodeCache();
  const voltra = makeWASocket({
    logger: pino({ level: 'silent' }),
    printQRInTerminal: !usePairingCode,
    browser: ['Ubuntu', 'chrome', '121.0.6167.159'],
    patchMessageBeforeSending: (message) => {
      const requiresPatch = !!(
        message.buttonsMessage ||
        message.templateMessage ||
        message.listMessage
      );
      if (requiresPatch) {
        message = {
          viewOnceMessage: {
            message: {
              messageContextInfo: {
                deviceListMetadataVersion: 2,
                deviceListMetadata: {},
              },
              ...message,
            },
          },
        };
      }
      return message;
    },
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
    },
    markOnlineOnConnect: true, // set false for offline
    generateHighQualityLinkPreview: true, // make high preview link
    getMessage: async (key) => {
      if (store) { // 'store' is not defined in this scope, might be a global or imported elsewhere
        const msg = await store.loadMessage(key.remoteJid, key.id);
        return msg.message || undefined;
      }
      return {
        conversation: "OSINGWEB!"
      };
    },
    msgRetryCounterCache,
    defaultQueryTimeoutMs: undefined,
  });

  if (usePairingCode && !voltra.authState.creds.registered) {
    const phoneNumber = await question(color('\nMasukan Nomor Whatsapp Kamu Diawali Dengan 62\n» Contoh: 081xxx❎ | 6281xxx✅\n', 'yellow'));
    const code = await voltra.requestPairingCode(phoneNumber.trim());
    const formattedCode = `${code.substring(0, 4)} - ${code.substring(4)}`;
      

    console.log(color(`⚠︎ Kode Pairing Bot Whatsapp kamu :`, "gold"), color(`${formattedCode}`, "white"));
  }

  voltra.ev.on('connection.update', async (update) => {
    const {
      connection,
      lastDisconnect
    } = update;
    try {
      if (connection === 'close') {
        let reason = new Boom(lastDisconnect?.error)?.output.statusCode;
        if (reason === DisconnectReason.badSession) {
          console.log(`Bad Session File, Please Delete Session and Scan Again`);
          startvoltra();
        } else if (reason === DisconnectReason.connectionClosed) {
          console.log("Connection closed, reconnecting....");
          startvoltra();
        } else if (reason === DisconnectReason.connectionLost) {
          console.log("Connection Lost from Server, reconnecting...");
          startvoltra();
        } else if (reason === DisconnectReason.connectionReplaced) {
          console.log("Connection Replaced, Another New Session Opened, Please Close Current Session First");
          startvoltra();
        } else if (reason === DisconnectReason.loggedOut) {
          console.log(`Device Logged Out, Please Delete Session and Scan Again.`);
          startvoltra();
        } else if (reason === DisconnectReason.restartRequired) {
          console.log("Restart Required, Restarting...");
          startvoltra();
        } else if (reason === DisconnectReason.timedOut) {
          console.log("Connection TimedOut, Reconnecting...");
          startvoltra();
        } else voltra.end(`Unknown DisconnectReason: ${reason}|${connection}`);
      } else if (connection === 'connecting') {
        console.log(color(`\n─┤`, `gold`), `「`, color(`OsingWeb Sumber Digital`, `white`), `」`, color(`]─`, `gold`));
      } else if (connection === "open") {
        console.log(color(` └`, `gold`), color(`Bot Store Connected\n`, `green`));
      }
    } catch (err) {
      console.log('Error in Connection.update ' + err);
      startvoltra();
    }
  });

  voltra.ev.on('creds.update', saveCreds);
  voltra.ev.on("messages.upsert",  () => { });

  // Farewell/Welcome event handler
  voltra.ev.on('group-participants.update', async (anu) => {
    // Pastikan ini adalah event dari grup
    if (!anu.id.endsWith('@g.us')) {
        return;
    }

    try {
        let metadata = await voltra.groupMetadata(anu.id);
        let participants = anu.participants;
        const groupName = metadata.subject;

        for (let num of participants) {
            const userName = await voltra.getName(num); // Mendapatkan nama pengguna
            let ppuser; // Variabel untuk menyimpan buffer gambar profil pengguna

            if (anu.action == 'add') {
                // Ambil gambar profil pengguna atau gunakan default welcome
                ppuser = await getProfilePictureBuffer(voltra, num, DEFAULT_WELCOME_IMAGE_PATH);

                const xtime = moment.tz('Asia/Jakarta').format('HH:mm:ss');
                const xdate = moment.tz('Asia/Jakarta').format('DD/MM/YYYY');
                const xmembers = metadata.participants.length;

                let textnya = `𝗛𝗮𝗹𝗼 𝗝𝘂𝗿𝗮𝗴𝗮𝗻 @${num.split("@")[0]}!🫶🏼
Selamat datang di *${groupName}* 🎉

*📌 Info kamu:*
• Member ke: *${xmembers}*
• Join pada: *${xtime} ${xdate}*

🫱🏻‍🫲🏽 Silahkan baca *Deskripsi Grup* terlebih dahulu ya`;

                await voltra.sendMessage(anu.id, {
                    image: ppuser, // Menggunakan buffer gambar yang sudah diambil
                    caption: textnya,
                    contextInfo: {
                        mentionedJid: [num],
                        "externalAdReply": {
                            "showAdAttribution": true,
                            "containsAutoReply": true,
                            "title": ` ${global.botname}`,
                            "body": `${ownername}`,
                            "previewType": "PHOTO",
                            "thumbnailUrl": ``, // Kosongkan karena kita pakai thumbnail dari ppuser
                            "thumbnail": ppuser, // Menggunakan buffer gambar sebagai thumbnail
                            "sourceUrl": `${wagc}`
                        }
                    }
                });
                console.log(`Sent welcome message to ${userName} in ${groupName}`);

            } else if (anu.action == 'remove') {
                // Ambil gambar profil pengguna atau gunakan default left
                ppuser = await getProfilePictureBuffer(voltra, num, DEFAULT_LEFT_IMAGE_PATH);

                const Xtime = moment.tz('Asia/Jakarta').format('HH:mm:ss');
                const Xdate = moment.tz('Asia/Jakarta').format('DD/MM/YYYY');
                const jumlahMem = metadata.participants.length;

                let textnya = `👋 @${num.split("@")[0]} telah keluar dari grup *${groupName}*.

Terima kasih sudah mampir.  
Kalau masih butuh produk kami, jangan sungkan untuk kembali ya 😄

> 💬 Team kami tetap siap bantu lewat chat pribadi!`;

                await voltra.sendMessage(anu.id, {
                    image: ppuser, // Menggunakan buffer gambar yang sudah diambil
                    caption: textnya,
                    contextInfo: {
                        mentionedJid: [num],
                        "externalAdReply": {
                            "showAdAttribution": true,
                            "containsAutoReply": true,
                            "title": ` ${global.botname}`,
                            "body": `${ownername}`,
                            "previewType": "PHOTO",
                            "thumbnailUrl": ``, // Kosongkan karena kita pakai thumbnail dari ppuser
                            "thumbnail": ppuser, // Menggunakan buffer gambar sebagai thumbnail
                            "sourceUrl": `${wagc}`
                        }
                    }
                });
                console.log(`Sent left message to ${userName} in ${groupName}`);
            }
        }
    } catch (err) {
        console.error('Error in group-participants.update handler:', err);
    }
  });

  // Anti Call
  voltra.ev.on('call', async (XXPapa) => {
    if (global.anticall) {
      console.log(XXPapa);
      for (let XXFucks of XXPapa) {
        if (XXFucks.isGroup == false) {
          if (XXFucks.status == "offer") {
            let XXBlokMsg = await voltra.sendTextWithMentions(XXFucks.from, `*${voltra.user.name}* can't receive ${XXFucks.isVideo ? `video` : `voice` } call. Sorry @${XXFucks.from.split('@')[0]} you will be blocked. If called accidentally please contact the owner to be unblocked !`);
            voltra.sendContact(XXFucks.from, global.owner, XXBlokMsg);
            await sleep(8000);
            await voltra.updateBlockStatus(XXFucks.from, "block");
          }
        }
      }
    }
  });

  // Auto status view
  voltra.ev.on('messages.upsert', async chatUpdate => {
    if (global.antiswview) {
      mek = chatUpdate.messages[0];
      if (mek.key && mek.key.remoteJid === 'status@broadcast') {
        await voltra.readMessages([mek.key]);
      }
    }
  });

  // Admin event handler
  voltra.ev.on('group-participants.update', async (anu) => {
    if (global.adminevent) {
      console.log(anu);
      try {
        let participants = anu.participants;
        for (let num of participants) {
          let ppuser, ppgroup;
          try {
            ppuser = await voltra.profilePictureUrl(num, 'image');
          } catch (err) {
            ppuser = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png?q=60';
          }
          try {
            ppgroup = await voltra.profilePictureUrl(anu.id, 'image');
          } catch (err) {
            ppgroup = 'https://i.ibb.co/RBx5SQC/avatar-group-large-v2.png?q=60';
          }

          if (anu.action == 'promote') {
            const Xtime = moment.tz('Asia/Jakarta').format('HH:mm:ss');
            const Xdate = moment.tz('Asia/Jakarta').format('DD/MM/YYYY');
            let textnya = ` 𝗖𝗼𝗻𝗴𝗿𝗮𝘁𝘀🎉 @${num.split("@")[0]}, you have been *promoted* to *admin* 🥳`;
            voltra.sendMessage(anu.id, {
              text: textnya,
              contextInfo: {
                mentionedJid: [num],
                "externalAdReply": {
                  "showAdAttribution": true,
                  "containsAutoReply": true,
                  "title": ` ${global.botname}`,
                  "body": `${ownername}`,
                  "previewType": "PHOTO",
                  "thumbnailUrl": ``,
                  "thumbnail": ppuser, // Menggunakan ppuser yang sudah diambil
                  "sourceUrl": `${wagc}`
                }
              }
            });
          } else if (anu.action == 'demote') {
            const Xtime = moment.tz('Asia/Jakarta').format('HH:mm:ss');
            const Xdate = moment.tz('Asia/Jakarta').format('DD/MM/YYYY');
            let textnya = `𝗢𝗼𝗽𝘀‼️ @${num.split("@")[0]}, you have been *demoted* from *admin* 😬`;
            voltra.sendMessage(anu.id, {
              text: textnya,
              contextInfo: {
                mentionedJid: [num],
                "externalAdReply": {
                  "showAdAttribution": true,
                  "containsAutoReply": true,
                  "title": ` ${global.botname}`,
                  "body": `${ownername}`,
                  "previewType": "PHOTO",
                  "thumbnailUrl": ``,
                  "thumbnail": ppuser, // Menggunakan ppuser yang sudah diambil
                  "sourceUrl": `${wagc}`
                }
              }
            });
          }
        }
      } catch (err) {
        console.log(err);
      }
    }
  });

  // Detect group update
    // Detect group update
  voltra.ev.on("groups.update", async (json) => {
    if (global.groupevent) {
      try {
        // ppgroup is not defined in this scope, assuming it's a global or from welcome event
        // try { ppgroup = await voltra.profilePictureUrl(anu.id, 'image'); } catch (err) { ppgroup = 'https://i.ibb.co/RBx5SQC/avatar-group-large-v2.png?q=60'; }
        console.log(json);
        const res = json[0];
        if (res.announce == true) {
          await sleep(2000);
          // voltra.sendMessage(res.id, {
          //   text: `「 Group Settings Change 」\n\nGroup has been closed by admin, Now only admins can send messages !`,
          // });
        } else if (res.announce == false) {
          await sleep(2000);
          // voltra.sendMessage(res.id, {
          //   text: `「 Group Settings Change 」\n\nThe group has been opened by admin, Now participants can send messages !`,
          // });
        } else if (res.restrict == true) {
          await sleep(2000);
          // voltra.sendMessage(res.id, {
          //   text: `「 Group Settings Change 」\n\nGroup info has been restricted, Now only admin can edit group info !`,
          // });
        } else if (res.restrict == false) {
          await sleep(2000);
          // voltra.sendMessage(res.id, {
          //   text: `「 Group Settings Change 」\n\nGroup info has been opened, Now participants can edit group info !`,
          // });
        } else if(!res.desc == ''){
          await sleep(2000);
          // voltra.sendMessage(res.id, {
          //   text: `「 Group Settings Change 」\n\n*Group description has been changed to*\n\n${res.desc}`,
          // });
        } else {
          await sleep(2000);
          // voltra.sendMessage(res.id, {
          //   text: `「 Group Settings Change 」\n\n*Group name has been changed to*\n\n*${res.subject}*`,
          // });
        }
      } catch (err) {
        console.log(err);
      }
    }
  });


  // Respond to poll messages
  async function getMessage(key){
    if (store) { // 'store' is not defined in this scope
      const msg = await store.loadMessage(key.remoteJid, key.id);
      return msg?.message;
    }
    return {
      conversation: "OSINGWEB!"
    };
  }
  voltra.ev.on('messages.update', async chatUpdate => {
    for(const { key, update } of chatUpdate) {
      if(update.pollUpdates && key.fromMe) {
        const pollCreation = await getMessage(key);
        if(pollCreation) {
          const pollUpdate = await getAggregateVotesInPollMessage({
            message: pollCreation,
            pollUpdates: update.pollUpdates,
          });
          var toCmd = pollUpdate.filter(v => v.voters.length !== 0)[0]?.name;
          if (toCmd == undefined) return;
          // xprefix is not defined in this scope, assuming it's a global
          // var prefCmd = xprefix + toCmd;
          // voltra.appenTextMessage(prefCmd, chatUpdate); // appenTextMessage is not a standard Baileys method
        }
      }
    }
  });

  voltra.ev.on('messages.upsert', async chatUpdate => {
    //console.log(JSON.stringify(chatUpdate, undefined, 2))
    try {
      mek = chatUpdate.messages[0];
      if (!mek.message) return;
      mek.message = (Object.keys(mek.message)[0] === 'ephemeralMessage') ? mek.message.ephemeralMessage.message : mek.message;
      if (mek.key && mek.key.remoteJid === 'status@broadcast') return;
      if (!voltra.public && !mek.key.fromMe && chatUpdate.type === 'notify') return;
      if (mek.key.id.startsWith('Xeon') && mek.key.id.length === 16) return;
      if (mek.key.id.startsWith('BAE5')) return;
      m = smsg(voltra, mek);
      require("./voltra")(voltra, m, chatUpdate);
    } catch (err) {
      console.log(err);
    }
  });

  voltra.decodeJid = (jid) => {
    if (!jid) return jid;
    if (/:\d+@/gi.test(jid)) {
      let decode = jidDecode(jid) || {};
      return decode.user && decode.server && decode.user + '@' + decode.server || jid;
    } else return jid;
  };

  voltra.getName = (jid, withoutContact = false) => {
    id = voltra.decodeJid(jid);
    withoutContact = voltra.withoutContact || withoutContact;
    let v;
    if (id.endsWith("@g.us")) return new Promise(async (resolve) => {
      v = {};
      if (!(v.name || v.subject)) v = voltra.groupMetadata(id) || {};
      resolve(v.name || v.subject || PhoneNumber('+' + id.replace('@s.whatsapp.net', '')).getNumber('international'));
    });
    else v = id === '0@s.whatsapp.net' ? {
      id,
      name: 'WhatsApp'
    } : id === voltra.decodeJid(voltra.user.id) ?
      voltra.user :
      ({});
    return (withoutContact ? '' : v.name) || v.subject || v.verifiedName || PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international');
  };

  voltra.sendContact = async (jid, kon, quoted = '', opts = {}) => {
    let list = [];
    for (let i of kon) {
      list.push({
        displayName: await voltra.getName(i),
        vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${await voltra.getName(i)}\nFN:${await voltra.getName(i)}\nitem1.TEL;waid=${i.split('@')[0]}:${i.split('@')[0]}\nitem1.X-ABLabel:Mobile\nEND:VCARD`
      });
    }
    voltra.sendMessage(jid, { contacts: { displayName: `${list.length} Contact`, contacts: list }, ...opts }, { quoted });
  };

  voltra.public = true;

  voltra.serializeM = (m) => smsg(voltra, m);

  voltra.sendText = (jid, text, quoted = '', options) => voltra.sendMessage(jid, {
    text: text,
    ...options
  }, {
    quoted,
    ...options
  });

  voltra.sendImage = async (jid, path, caption = '', quoted = '', options) => {
    let buffer = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,` [1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0);
    return await voltra.sendMessage(jid, {
      image: buffer,
      caption: caption,
      ...options
    }, {
      quoted
    });
  };

  voltra.sendTextWithMentions = async (jid, text, quoted, options = {}) => voltra.sendMessage(jid, {
    text: text,
    mentions: [...text.matchAll(/@(\d{0,16})/g)].map(v => v[1] + '@s.whatsapp.net'),
    ...options
  }, {
    quoted
  });

  voltra.sendImageAsSticker = async (jid, path, quoted, options = {}) => {
    let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0);
    let buffer;
    if (options && (options.packname || options.author)) {
      buffer = await writeExifImg(buff, options);
    } else {
      buffer = await imageToWebp(buff);
    }
    await voltra.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted })
      .then( response => {
        fs.unlinkSync(buffer);
        return response;
      });
  };

  voltra.sendAudio = async (jid, path, quoted = '', ptt = false, options) => {
    let buffer = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0);
    return await voltra.sendMessage(jid, { audio: buffer, ptt: ptt, ...options }, { quoted });
  };

  voltra.sendVideo = async (jid, path, caption = '', quoted = '', gif = false, options) => {
    let buffer = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0);
    return await voltra.sendMessage(jid, { video: buffer, caption: caption, gifPlayback: gif, ...options }, { quoted });
  };

  voltra.sendVideoAsSticker = async (jid, path, quoted, options = {}) => {
    let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0);
    let buffer;
    if (options && (options.packname || options.author)) {
      buffer = await writeExifVid(buff, options);
    } else {
      buffer = await videoToWebp(buff);
    }
    await voltra.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted });
    return buffer;
  };

  voltra.downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => {
    let quoted = message.msg ? message.msg : message;
    let mime = (message.msg || message).mimetype || '';
    let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0];
    const stream = await downloadContentFromMessage(quoted, messageType);
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }
    let type = await FileType.fromBuffer(buffer);
    trueFileName = attachExtension ? (filename + '.' + type.ext) : filename;
    // save to file
    await fs.writeFileSync(trueFileName, buffer);
    return trueFileName;
  };

  voltra.sendFileUrl = async (jid, url, caption, quoted, options = {}) => {
    let mime = '';
    let res = await axios.head(url);
    mime = res.headers['content-type'];
    if (mime.split("/")[1] === "gif") {
      return voltra.sendMessage(jid, { video: await getBuffer(url), caption: caption, gifPlayback: true, ...options}, { quoted: quoted, ...options});
    }
    let type = mime.split("/")[0]+"Message";
    if(mime === "application/pdf"){
      return voltra.sendMessage(jid, { document: await getBuffer(url), mimetype: 'application/pdf', caption: caption, ...options}, { quoted: quoted, ...options });
    }
    if(mime.split("/")[0] === "image"){
      return voltra.sendMessage(jid, { image: await getBuffer(url), caption: caption, ...options}, { quoted: quoted, ...options});
    }
    if(mime.split("/")[0] === "video"){
      return voltra.sendMessage(jid, { video: await getBuffer(url), caption: caption, mimetype: 'video/mp4', ...options}, { quoted: quoted, ...options });
    }
    if(mime.split("/")[0] === "audio"){
      return voltra.sendMessage(jid, { audio: await getBuffer(url), caption: caption, mimetype: 'audio/mpeg', ...options}, { quoted: quoted, ...options });
    }
  };

  voltra.getFile = async (PATH, save) => {
    let res;
    let data = Buffer.isBuffer(PATH) ? PATH : /^data:.*?\/.*?;base64,/i.test(PATH) ? Buffer.from(PATH.split`,`[1], 'base64') : /^https?:\/\//.test(PATH) ? await (res = await getBuffer(PATH)) : fs.existsSync(PATH) ? (filename = PATH, fs.readFileSync(PATH)) : typeof PATH === 'string' ? PATH : Buffer.alloc(0);
    //if (!Buffer.isBuffer(data)) throw new TypeError('Result is not a buffer')
    let type = await FileType.fromBuffer(data) || {
      mime: 'application/octet-stream',
      ext: '.bin'
    };
    filename = path.join(__filename, '../src/' + new Date * 1 + '.' + type.ext);
    if (data && save) fs.promises.writeFile(filename, data);
    return {
      res,
      filename,
      size: await getSizeMedia(data),
      ...type,
      data
    };
  };

  voltra.sendFile = async (jid, path, filename = '', caption = '', quoted, ptt = false, options = {}) => {
    let type = await voltra.getFile(path, true);
    let { res, data: file, filename: pathFile } = type;

    if (res && res.status !== 200 || file.length <= 65536) {
      try {
        throw {
          json: JSON.parse(file.toString())
        };
      } catch (e) {
        if (e.json) throw e.json;
      }
    }

    let opt = {
      filename
    };

    if (quoted) opt.quoted = quoted;
    if (!type) options.asDocument = true;

    let mtype = '',
      mimetype = type.mime,
      convert;

    if (/webp/.test(type.mime) || (/image/.test(type.mime) && options.asSticker)) mtype = 'sticker';
    else if (/image/.test(type.mime) || (/webp/.test(type.mime) && options.asImage)) mtype = 'image';
    else if (/video/.test(type.mime)) mtype = 'video';
    else if (/audio/.test(type.mime)) {
      // toPTT and toAudio are not defined in this context, assuming they are from lib/myfunc or similar
      // convert = await (ptt ? toPTT : toAudio)(file, type.ext);
      // file = convert.data;
      // pathFile = convert.filename;
      mtype = 'audio';
      mimetype = 'audio/ogg; codecs=opus';
    } else mtype = 'document';

    if (options.asDocument) mtype = 'document';

    delete options.asSticker;
    delete options.asLocation;
    delete options.asVideo;
    delete options.asDocument;
    delete options.asImage;

    let message = { ...options, caption, ptt, [mtype]: { url: pathFile }, mimetype };
    let m;

    try {
      m = await voltra.sendMessage(jid, message, { ...opt, ...options });
    } catch (e) {
      //console.error(e)
      m = null;
    } finally {
      if (!m) m = await voltra.sendMessage(jid, { ...message, [mtype]: file }, { ...opt, ...options });
      file = null;
      return m;
    }
  };

  voltra.cMod = (jid, copy, text = '', sender = voltra.user.id, options = {}) => {
    //let copy = message.toJSON()
    let mtype = Object.keys(copy.message)[0];
    let isEphemeral = mtype === 'ephemeralMessage';
    if (isEphemeral) {
      mtype = Object.keys(copy.message.ephemeralMessage.message)[0];
    }
    let msg = isEphemeral ? copy.message.ephemeralMessage.message : copy.message;
    let content = msg[mtype];
    if (typeof content === 'string') msg[mtype] = text || content;
    else if (content.caption) content.caption = text || content.caption;
    else if (content.text) content.text = text || content.text;
    if (typeof content !== 'string') msg[mtype] = {
      ...content,
      ...options
    };
    if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant;
    else if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant; // Duplicate line
    if (copy.key.remoteJid.includes('@s.whatsapp.net')) sender = sender || copy.key.remoteJid;
    else if (copy.key.remoteJid.includes('@broadcast')) sender = sender || copy.key.remoteJid;
    copy.key.remoteJid = jid;
    copy.key.fromMe = sender === voltra.user.id;

    return proto.WebMessageInfo.fromObject(copy);
  };

  voltra.sendMedia = async (jid, path, fileName = '', caption = '', quoted = '', options = {}) => {
    let types = await voltra.getFile(path, true);
    let { mime, ext, res, data, filename } = types;
    if (res && res.status !== 200 || file.length <= 65536) { // 'file' is not defined here
      try { throw { json: JSON.parse(file.toString()) }; } // 'file' is not defined here
      catch (e) { if (e.json) throw e.json; }
    }
    let type = '', mimetype = mime, pathFile = filename;
    if (options.asDocument) type = 'document';
    if (options.asSticker || /webp/.test(mime)) {
      let { writeExif } = require('./lib/exif');
      let media = { mimetype: mime, data };
      // global.packname and global.author are not defined in this context
      pathFile = await writeExif(media, { packname: options.packname ? options.packname : global.packname, author: options.author ? options.author : global.author, categories: options.categories ? options.categories : [] });
      await fs.promises.unlink(filename);
      type = 'sticker';
      mimetype = 'image/webp';
    }
    else if (/image/.test(mime)) type = 'image';
    else if (/video/.test(mime)) type = 'video';
    else if (/audio/.test(mime)) type = 'audio';
    else type = 'document';
    await voltra.sendMessage(jid, { [type]: { url: pathFile }, caption, mimetype, fileName, ...options }, { quoted, ...options });
    return fs.promises.unlink(pathFile);
  };

  voltra.copyNForward = async (jid, message, forceForward = false, options = {}) => {
    let vtype;
    if (options.readViewOnce) {
      message.message = message.message && message.message.ephemeralMessage && message.message.ephemeralMessage.message ? message.message.ephemeralMessage.message : (message.message || undefined);
      vtype = Object.keys(message.message.viewOnceMessage.message)[0];
      delete(message.message && message.message.ignore ? message.message.ignore : (message.message || undefined));
      delete message.message.viewOnceMessage.message[vtype].viewOnce;
      message.message = {
        ...message.message.viewOnceMessage.message
      };
    }
    let mtype = Object.keys(message.message)[0];
    let content = await generateForwardMessageContent(message, forceForward);
    let ctype = Object.keys(content)[0];
    let context = {};
    if (mtype != "conversation") context = message.message[mtype].contextInfo;
    content[ctype].contextInfo = {
      ...context,
      ...content[ctype].contextInfo
    };
    const waMessage = await generateWAMessageFromContent(jid, content, options ? {
      ...content[ctype],
      ...options,
      ...(options.contextInfo ? {
        contextInfo: {
          ...content[ctype].contextInfo,
          ...options.contextInfo
        }
      } : {})
    } : {});
    await voltra.relayMessage(jid, waMessage.message, { messageId:  waMessage.key.id });
    return waMessage;
  };

  voltra.sendPoll = (jid, name = '', values = [], selectableCount = 1) => { return voltra.sendMessage(jid, { poll: { name, values, selectableCount }}); };

  voltra.parseMention = (text = '') => {
    return [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(v => v[1] + '@s.whatsapp.net');
  };

  voltra.downloadMediaMessage = async (message) => {
    let mime = (message.msg || message).mimetype || '';
    let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0];
    const stream = await downloadContentFromMessage(message, messageType);
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }
    return buffer;
  };
  return voltra;
}

startvoltra();

process.on('uncaughtException', function (err) {
  let e = String(err);
  if (e.includes("conflict")) return;
  if (e.includes("Cannot derive from empty media key")) return;
  if (e.includes("Socket connection timeout")) return;
  if (e.includes("not-authorized")) return;
  if (e.includes("already-exists")) return;
  if (e.includes("rate-overlimit")) return;
  if (e.includes("Connection Closed")) return;
  if (e.includes("Timed Out")) return;
  if (e.includes("Value not found")) return;
  console.log('Caught exception: ', err);
});

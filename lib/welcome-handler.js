const fs = require('fs');
const path = require('path');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

// Path untuk gambar default
// Asumsi file welcome_image.jpg dan left_image.jpg ada di direktori 'image'
// yang satu level di atas direktori 'MultipleFiles'.
// path.join(__dirname, '..', 'image', 'welcome_image.jpg') akan mengarah ke:
// MultipleFiles/../image/welcome_image.jpg  =>  image/welcome_image.jpg
const DEFAULT_WELCOME_IMAGE_PATH = path.join(__dirname, '..', 'image', 'welcome_image.jpg');
const DEFAULT_LEFT_IMAGE_PATH = path.join(__dirname, '..', 'image', 'left_image.jpg');

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
        const response = await fetch(ppUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch profile picture: ${response.statusText}`);
        }
        return Buffer.from(await response.arrayBuffer());
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

/**
 * Handler untuk event peserta grup masuk atau keluar.
 * @param {object} conn Baileys connection object.
 * @param {object} update Update object dari event group-participants.update.
 */
async function handleGroupParticipantsUpdate(conn, update) {
    const { id: groupId, participants, action } = update;

    // Pastikan ini adalah event dari grup
    if (!groupId.endsWith('@g.us')) {
        return;
    }

    const metadata = await conn.groupMetadata(groupId).catch(e => null);
    if (!metadata) {
        console.error(`Could not fetch group metadata for ${groupId}`);
        return;
    }

    const groupName = metadata.subject;

    for (const participantJid of participants) {
        const userName = await conn.getName(participantJid);

        if (action === 'add') {
            // Welcome message
            const welcomeMessage = `🥳 Selamat datang @${participantJid.split('@')[0]}!\nNama: *${userName}*\nGrup: *${groupName}*\nSemoga betah ya di sini 😁`;
            const welcomeImageBuffer = await getProfilePictureBuffer(conn, participantJid, DEFAULT_WELCOME_IMAGE_PATH);

            await conn.sendMessage(groupId, {
                image: welcomeImageBuffer,
                caption: welcomeMessage,
                mentions: [participantJid]
            });
            console.log(`Sent welcome message to ${userName} in ${groupName}`);

        } else if (action === 'remove') {
            // Left message
            const leftMessage = `👋 Selamat tinggal @${participantJid.split('@')[0]}!\nNama: *${userName}*\nGrup: *${groupName}*\nSemoga sukses di luar sana 🙏`;
            const leftImageBuffer = await getProfilePictureBuffer(conn, participantJid, DEFAULT_LEFT_IMAGE_PATH);

            await conn.sendMessage(groupId, {
                image: leftImageBuffer,
                caption: leftMessage,
                mentions: [participantJid]
            });
            console.log(`Sent left message to ${userName} in ${groupName}`);
        }
    }
}

module.exports = {
    handleGroupParticipantsUpdate
};

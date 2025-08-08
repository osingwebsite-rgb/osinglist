const fs = require('fs');

// ====================================================================================================
// Fungsi pembantu untuk membaca dan menulis file JSON
// ====================================================================================================
function readJsonFile(filePath) {
    try {
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf8');
            const parsedData = JSON.parse(data);
            // Pastikan data yang dibaca adalah array, jika tidak, inisialisasi ulang
            if (!Array.isArray(parsedData)) {
                console.warn(`[WARNING] ${filePath} is not an array. Reinitializing.`);
                fs.writeFileSync(filePath, '[]');
                return [];
            }
            return parsedData;
        }
    } catch (e) {
        console.error(`Error reading or parsing ${filePath}:`, e.message);
        // Jika ada error, inisialisasi ulang file dengan array kosong
        fs.writeFileSync(filePath, '[]');
    }
    return []; // Mengembalikan array kosong jika file tidak ada atau error
}

function writeJsonFile(filePath, data) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    } catch (e) {
        console.error(`Error writing ${filePath}:`, e);
    }
}

// ====================================================================================================
// Fungsi untuk manajemen sewa (sewa.json) - BARU DITAMBAHKAN KE SINI
// ====================================================================================================
const SEWA_FILE_PATH = './database/sewa.json';

// Pastikan file sewa.json ada saat bot dimulai
if (!fs.existsSync(SEWA_FILE_PATH)) {
    fs.writeFileSync(SEWA_FILE_PATH, '[]');
}

// Fungsi untuk memuat data sewa dari file
function loadSewaData() {
    const SEWA_FILE_PATH = './database/sewa.json';
    try {
        if (fs.existsSync(SEWA_FILE_PATH)) {
            const data = fs.readFileSync(SEWA_FILE_PATH, 'utf8');
            const parsedData = JSON.parse(data);
            // Pastikan data yang dibaca adalah array, jika tidak, inisialisasi ulang
            if (!Array.isArray(parsedData)) {
                console.warn(`[WARNING] ${SEWA_FILE_PATH} is not an array. Reinitializing.`);
                fs.writeFileSync(SEWA_FILE_PATH, '[]');
                return [];
            }
            return parsedData;
        }
    } catch (e) {
        console.error(`Error reading or parsing ${SEWA_FILE_PATH}:`, e.message);
        // Jika ada error, inisialisasi ulang file dengan array kosong
        fs.writeFileSync(SEWA_FILE_PATH, '[]');
    }
    return []; // Mengembalikan array kosong jika file tidak ada atau error
}


// Fungsi untuk menyimpan data sewa ke file
function saveSewaData(data) {
    const SEWA_FILE_PATH = './database/sewa.json';
    fs.writeFileSync(SEWA_FILE_PATH, JSON.stringify(data, null, 2));
}


function addSewa(groupId, groupLink, durationInDays, groupName) {
    let sewaData = loadSewaData(); // Memuat data sewa dari file
    const moment = require('moment-timezone'); // Pastikan moment di-import
    const startDate = moment().tz('Asia/Jakarta');
    const endDate = startDate.clone().add(durationInDays, 'days');

    const existingIndex = sewaData.findIndex(s => s.id === groupId);
    if (existingIndex !== -1) {
        // Update existing sewa
        sewaData[existingIndex].link = groupLink; // Update link jika perlu
        sewaData[existingIndex].startDate = startDate.toISOString();
        sewaData[existingIndex].endDate = endDate.toISOString();
        sewaData[existingIndex].groupName = groupName; // Update nama grup jika perlu
    } else {
        // Add new sewa
        sewaData.push({
            id: groupId, // Menyimpan ID grup
            link: groupLink,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            groupName: groupName // Menyimpan nama grup
        });
    }
    saveSewaData(sewaData); // Simpan data sewa yang diperbarui
    return true; // Mengembalikan true jika berhasil
}

function deleteSewa(groupId) {
    let sewaData = readJsonFile(SEWA_FILE_PATH);
    const initialLength = sewaData.length;
    sewaData = sewaData.filter(s => s.id !== groupId);
    writeJsonFile(SEWA_FILE_PATH, sewaData);
    return sewaData.length < initialLength;
}

function getSewaList() {
    return readJsonFile(SEWA_FILE_PATH);
}

function getSewaData(groupId) {
    return readJsonFile(SEWA_FILE_PATH).find(s => s.id === groupId);
}

function isSewaActive(groupId) {
    const moment = require('moment-timezone'); // Import moment di sini jika fungsi ini berdiri sendiri
    const sewa = getSewaData(groupId);
    if (!sewa) return false;
    return moment().tz('Asia/Jakarta').isBefore(moment(sewa.endDate));
}


// ====================================================================================================
// Fungsi untuk set_proses.json
// ====================================================================================================
function isSetProses(groupID, _db) {
    return _db.some(x => x.id === groupID);
}

function changeSetProses(text, groupID, _db) {
    const index = _db.findIndex(x => x.id === groupID);
    if (index !== -1) {
        _db[index].text = text;
        writeJsonFile('./database/set_proses.json', _db);
        return true;
    }
    return false;
}

function addSetProses(text, groupID, _db) {
    _db.push({ id: groupID, text: text });
    writeJsonFile('./database/set_proses.json', _db);
}

function removeSetProses(groupID, _db) {
    const index = _db.findIndex(x => x.id === groupID);
    if (index !== -1) {
        _db.splice(index, 1);
        writeJsonFile('./database/set_proses.json', _db);
        return true;
    }
    return false;
}

function getTextSetProses(groupID, _db) {
    const entry = _db.find(x => x.id === groupID);
    return entry ? entry.text : null;
}

// ====================================================================================================
// Fungsi untuk set_done.json
// ====================================================================================================
function isSetDone(groupID, _db) {
    return _db.some(x => x.id === groupID);
}

function changeSetDone(text, groupID, _db) {
    const index = _db.findIndex(x => x.id === groupID);
    if (index !== -1) {
        _db[index].text = text;
        writeJsonFile('./database/set_done.json', _db);
        return true;
    }
    return false;
}

function addSetDone(text, groupID, _db) {
    _db.push({ id: groupID, text: text });
    writeJsonFile('./database/set_done.json', _db);
}

function removeSetDone(groupID, _db) {
    const index = _db.findIndex(x => x.id === groupID);
    if (index !== -1) {
        _db.splice(index, 1);
        writeJsonFile('./database/set_done.json', _db);
        return true;
    }
    return false;
}

function getTextSetDone(groupID, _db) {
    const entry = _db.find(x => x.id === groupID);
    return entry ? entry.text : null;
}

// ====================================================================================================
// Fungsi untuk set_open.json
// ====================================================================================================
function isSetOpen(groupID, _db) {
    return _db.some(x => x.id === groupID);
}

function changeSetOpen(text, groupID, _db) {
    const index = _db.findIndex(x => x.id === groupID);
    if (index !== -1) {
        _db[index].text = text;
        writeJsonFile('./database/set_open.json', _db);
        return true;
    }
    return false;
}

function addSetOpen(text, groupID, _db) {
    _db.push({ id: groupID, text: text });
    writeJsonFile('./database/set_open.json', _db);
}

function removeSetOpen(groupID, _db) {
    const index = _db.findIndex(x => x.id === groupID);
    if (index !== -1) {
        _db.splice(index, 1);
        writeJsonFile('./database/set_open.json', _db);
        return true;
    }
    return false;
}

function getTextSetOpen(groupID, _db) {
    const entry = _db.find(x => x.id === groupID);
    return entry ? entry.text : null;
}

// ====================================================================================================
// Fungsi untuk set_close.json
// ====================================================================================================
function isSetClose(groupID, _db) {
    return _db.some(x => x.id === groupID);
}

function changeSetClose(text, groupID, _db) {
    const index = _db.findIndex(x => x.id === groupID);
    if (index !== -1) {
        _db[index].text = text;
        writeJsonFile('./database/set_close.json', _db);
        return true;
    }
    return false;
}

function addSetClose(text, groupID, _db) {
    _db.push({ id: groupID, text: text });
    writeJsonFile('./database/set_close.json', _db);
}

function removeSetClose(groupID, _db) {
    const index = _db.findIndex(x => x.id === groupID);
    if (index !== -1) {
        _db.splice(index, 1);
        writeJsonFile('./database/set_close.json', _db);
        return true;
    }
    return false;
}

function getTextSetClose(groupID, _db) {
    const entry = _db.find(x => x.id === groupID);
    return entry ? entry.text : null;
}

// ====================================================================================================
// Fungsi untuk setlist_header.json
// ====================================================================================================
function isSetListHeader(groupID, _db) {
    return _db.some(x => x.id === groupID);
}

function changeSetListHeader(text, groupID, _db) {
    const index = _db.findIndex(x => x.id === groupID);
    if (index !== -1) {
        _db[index].text = text;
        writeJsonFile('./database/setlist_header.json', _db);
        return true;
    }
    return false;
}

function addSetListHeader(text, groupID, _db) {
    _db.push({ id: groupID, text: text });
    writeJsonFile('./database/setlist_header.json', _db);
}

function removeSetListHeader(groupID, _db) {
    const index = _db.findIndex(x => x.id === groupID);
    if (index !== -1) {
        _db.splice(index, 1);
        writeJsonFile('./database/setlist_header.json', _db);
        return true;
    }
    return false;
}

function getTextSetListHeader(groupID, _db) {
    const entry = _db.find(x => x.id === groupID);
    return entry ? entry.text : null;
}

// ====================================================================================================
// Fungsi untuk setlist_symbol.json
// ====================================================================================================
function isSetListSymbol(groupID, _db) {
    return _db.some(x => x.id === groupID);
}

function changeSetListSymbol(text, groupID, _db) {
    const index = _db.findIndex(x => x.id === groupID);
    if (index !== -1) {
        _db[index].text = text;
        writeJsonFile('./database/setlist_symbol.json', _db);
        return true;
    }
    return false;
}

function addSetListSymbol(text, groupID, _db) {
    _db.push({ id: groupID, text: text });
    writeJsonFile('./database/setlist_symbol.json', _db);
}

function removeSetListSymbol(groupID, _db) {
    const index = _db.findIndex(x => x.id === groupID);
    if (index !== -1) {
        _db.splice(index, 1);
        writeJsonFile('./database/setlist_symbol.json', _db);
        return true;
    }
    return false;
}

function getTextSetListSymbol(groupID, _db) {
    const entry = _db.find(x => x.id === groupID);
    return entry ? entry.text : null;
}

// ====================================================================================================
// Fungsi untuk setlist_footer.json
// ====================================================================================================
function isSetListFooter(groupID, _db) {
    return _db.some(x => x.id === groupID);
}

function changeSetListFooter(text, groupID, _db) {
    const index = _db.findIndex(x => x.id === groupID);
    if (index !== -1) {
        _db[index].text = text;
        writeJsonFile('./database/setlist_footer.json', _db);
        return true;
    }
    return false;
}

function addSetListFooter(text, groupID, _db) {
    _db.push({ id: groupID, text: text });
    writeJsonFile('./database/setlist_footer.json', _db);
}

function removeSetListFooter(groupID, _db) {
    const index = _db.findIndex(x => x.id === groupID);
    if (index !== -1) {
        _db.splice(index, 1);
        writeJsonFile('./database/setlist_footer.json', _db);
        return true;
    }
    return false;
}

function getTextSetListFooter(groupID, _db) {
    const entry = _db.find(x => x.id === groupID);
    return entry ? entry.text : null;
}

// ====================================================================================================
// Fungsi untuk list.json (tambahan status isClose)
// ====================================================================================================
function setResponListStatus(groupID, key, isClose, _db) {
    let position = null;
    Object.keys(_db).forEach((x) => {
        if (_db[x].id === groupID && _db[x].key === key) {
            position = x;
        }
    });
    if (position !== null) {
        _db[position].isClose = isClose;
        // Menggunakan writeJsonFile untuk konsistensi
        writeJsonFile('./database/list.json', _db);
        return true;
    }
    return false;
}

function renameList(groupID, oldKey, newKey, _db) {
    let position = null;
    Object.keys(_db).forEach((x) => {
        if (_db[x].id === groupID && _db[x].key === oldKey) {
            position = x;
        }
    });
    if (position !== null) {
        _db[position].key = newKey;
        // Menggunakan writeJsonFile untuk konsistensi
        writeJsonFile('./database/list.json', _db);
        return true;
    }
    return false;
}

// Fungsi yang sudah ada
function addResponList(groupID, key, response, isImage, image_url, _db) {
    var obj_add = {
        id: groupID,
        key: key,
        response: response,
        isImage: isImage,
        image_url: image_url,
        isClose: false // Tambahkan properti isClose default false
    }
    _db.push(obj_add)
    // Menggunakan writeJsonFile untuk konsistensi
    writeJsonFile('./database/list.json', _db)
}

function getDataResponList(groupID, key, _db) {
    let position = null
    Object.keys(_db).forEach((x) => {
        if (_db[x].id === groupID && _db[x].key === key) {
            position = x
        }
    })
    if (position !== null) {
        return _db[position]
    }
}

function isAlreadyResponList(groupID, key, _db) {
    let found = false
    Object.keys(_db).forEach((x) => {
        if (_db[x].id === groupID && _db[x].key === key) {
            found = true
        }
    })
    return found
}

function sendResponList(groupId, key, _dir) {
    let position = null
    Object.keys(_dir).forEach((x) => {
        if (_dir[x].id === groupId && _dir[x].key === key) {
            position = x
        }
    })
    if (position !== null) {
        return _dir[position].response
    }
}

function isAlreadyResponListGroup(groupID, _db) {
    let found = false
    Object.keys(_db).forEach((x) => {
        if (_db[x].id === groupID) {
            found = true
        }
    })
    return found
}

function delResponList(groupID, key, _db) {
    let position = null
    Object.keys(_db).forEach((x) => {
        if (_db[x].id === groupID && _db[x].key === key) {
            position = x
        }
    })

    if (position !== null) {
        _db.splice(position, 1)
        // Menggunakan writeJsonFile untuk konsistensi
        writeJsonFile('./database/list.json', _db)
    }
}

function updateResponList(groupID, key, response, isImage, image_url, _db) {
    let position = null
    Object.keys(_db).forEach((x) => {
        if (_db[x].id === groupID && _db[x].key === key) {
            position = x
        }
    });
    if (position !== null) {
        _db[position].response = response;
        _db[position].isImage = isImage;
        _db[position].image_url = image_url;
        // Menggunakan writeJsonFile untuk konsistensi
        writeJsonFile('./database/list.json', _db);
    }
}

module.exports = {
    // Fungsi manajemen sewa - BARU
     loadSewaData,
    saveSewaData,
    addSewa,
    deleteSewa,
    getSewaList,
    getSewaData,
    isSewaActive,

    // Fungsi list.json
    addResponList,
    delResponList,
    isAlreadyResponList,
    isAlreadyResponListGroup,
    sendResponList,
    updateResponList,
    getDataResponList,
    setResponListStatus,
    renameList,

    // Export fungsi-fungsi set_proses.json
    isSetProses, changeSetProses, addSetProses, removeSetProses, getTextSetProses,
    // Export fungsi-fungsi set_done.json
    isSetDone, changeSetDone, addSetDone, removeSetDone, getTextSetDone,
    // Export fungsi-fungsi set_open.json
    isSetOpen, changeSetOpen, addSetOpen, removeSetOpen, getTextSetOpen,
    // Export fungsi-fungsi set_close.json
    isSetClose, changeSetClose, addSetClose, removeSetClose, getTextSetClose,
    // Export fungsi-fungsi setlist_header.json
    isSetListHeader, changeSetListHeader, addSetListHeader, removeSetListHeader, getTextSetListHeader,
    // Export fungsi-fungsi setlist_symbol.json
    isSetListSymbol, changeSetListSymbol, addSetListSymbol, removeSetListSymbol, getTextSetListSymbol,
    // Export fungsi-fungsi setlist_footer.json
    isSetListFooter, changeSetListFooter, addSetListFooter, removeSetListFooter, getTextSetListFooter,
}

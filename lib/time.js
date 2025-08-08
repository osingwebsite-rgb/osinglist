   // lib/time.js

   const moment = require('moment-timezone'); // Pastikan moment-timezone terinstal

   /**
    * Mengembalikan objek yang berisi tanggal dan waktu yang diformat untuk berbagai zona waktu.
    * Format jam: HH:mm:ss
    * Format tanggal: DD-MM-YYYY
    * Format tgl: Day, date-month-year
    */
   function getFormattedDateTime() {
       const optionsTime = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
       const optionsDate = { year: 'numeric', month: '2-digit', day: '2-digit' };
       const optionsDayName = { weekday: 'long' };

       const now = new Date();

       // WIB (Waktu Indonesia Barat)
       const wibTime = new Intl.DateTimeFormat('id-ID', { ...optionsTime, timeZone: 'Asia/Jakarta' }).format(now);
       const wibDate = new Intl.DateTimeFormat('id-ID', { ...optionsDate, timeZone: 'Asia/Jakarta' }).format(now);
       const wibDayName = new Intl.DateTimeFormat('id-ID', { ...optionsDayName, timeZone: 'Asia/Jakarta' }).format(now);
       const wibFullDate = `${wibDayName}, ${wibDate.replace(/\//g, '-')}`;

       // WITA (Waktu Indonesia Tengah)
       const witaTime = new Intl.DateTimeFormat('id-ID', { ...optionsTime, timeZone: 'Asia/Makassar' }).format(now);
       const witaDate = new Intl.DateTimeFormat('id-ID', { ...optionsDate, timeZone: 'Asia/Makassar' }).format(now);
       const witaDayName = new Intl.DateTimeFormat('id-ID', { ...optionsDayName, timeZone: 'Asia/Makassar' }).format(now);
       const witaFullDate = `${witaDayName}, ${witaDate.replace(/\//g, '-')}`;

       // WIT (Waktu Indonesia Timur)
       const witTime = new Intl.DateTimeFormat('id-ID', { ...optionsTime, timeZone: 'Asia/Jayapura' }).format(now);
       const witDate = new Intl.DateTimeFormat('id-ID', { ...optionsDate, timeZone: 'Asia/Jayapura' }).format(now);
       const witDayName = new Intl.DateTimeFormat('id-ID', { ...optionsDayName, timeZone: 'Asia/Jayapura' }).format(now);
       const witFullDate = `${witDayName}, ${witDate.replace(/\//g, '-')}`;

       return {
           // Untuk penggunaan umum (default WIB)
           jam: wibTime,
           tanggal: wibDate.replace(/\//g, '-'),
           day: wibDayName,
           tgl: wibFullDate,

           // Spesifik per zona waktu
           wib: wibTime,
           tanggalWIB: wibDate.replace(/\//g, '-'),
           dayWIB: wibDayName,
           tglWIB: wibFullDate,

           wita: witaTime,
           tanggalWITA: witaDate.replace(/\//g, '-'),
           dayWITA: witaDayName,
           tglWITA: witaFullDate,

           wit: witTime,
           tanggalWIT: witDate.replace(/\//g, '-'),
           dayWIT: witDayName,
           tglWIT: witFullDate,
       };
   }

   module.exports = {
       getFormattedDateTime
   };
   
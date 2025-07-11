require('dotenv').config();

module.exports = {
    prefix: process.env.PREFIX || '.',
    botName: process.env.BOT_NAME || 'whatsapp-bot',
    owner: process.env.OWNER_NUMBER || '',
    packname: process.env.PACK_NAME || 'Gafiled',
    author: process.env.AUTHOR || 'naxordeve',
    SESSION_ID: process.env.SESSION_ID || '',
    HASTEBIN: process.env.HASTEBIN || '427ab9bad04c076e1d20bfd8d4bae160b6598120246fee71dde98ffb4da39abe79b11890ae4f8c535abb07036a34fff9ad1d83183d71c97b876123069acf5f8e',
    packname: process.env.PACKNAME || 'ɠαɾϝιҽʅɗ',
    author: process.env.AUTHOR || 'ɳαxσɾ',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 100 * 1024 * 1024,
    timezone: process.env.TIMEZONE || 'UTC',
    WORK_TYPE: process.env.WORK_TYPE || 'public',
};

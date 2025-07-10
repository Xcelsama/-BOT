require('dotenv').config();

module.exports = {
    prefix: process.env.PREFIX || '.',
    botName: process.env.BOT_NAME || 'whatsapp-bot',
    owner: process.env.OWNER_NUMBER || '',
    packname: process.env.PACK_NAME || 'Gafiled',
    author: process.env.AUTHOR || 'naxordeve',
    SESSION_ID: process.env.SESSION_ID || '',
    packname: process.env.PACKNAME || 'ɠαɾϝιҽʅɗ',
    author: process.env.AUTHOR || 'ɳαxσɾ',
    autoRead: process.env.AUTO_READ === 'true' || true,
    autoTyping: process.env.AUTO_TYPING === 'true' || false,
    autoRecording: process.env.AUTO_RECORDING === 'true' || false,
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 100 * 1024 * 1024,
    timezone: process.env.TIMEZONE || 'UTC',
    WORK_TYPE: process.env.WORK_TYPE || 'public',
};

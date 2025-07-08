require('dotenv').config();
const { loadTheme } = require('./lib/themes');

const theme = loadTheme();

module.exports = {
    prefix: process.env.PREFIX || '.',
    botName: process.env.BOT_NAME || theme.displayName || 'whatsapp-bot',
    owner: process.env.OWNER_NUMBER || '',
    packname: process.env.PACK_NAME || 'Gafiled',
    author: process.env.AUTHOR || theme.name || 'naxordeve',
    SESSION_ID: process.env.SESSION_ID || 'xastral~irumaroqox',
    autoRead: process.env.AUTO_READ === 'true' || true,
    autoTyping: process.env.AUTO_TYPING === 'true' || false,
    autoRecording: process.env.AUTO_RECORDING === 'true' || false,
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 100 * 1024 * 1024,
    timezone: process.env.TIMEZONE || 'UTC',
    WORK_TYPE: process.env.WORK_TYPE || 'public',
    theme: theme
};

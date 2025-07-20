require('dotenv').config();
const isTrue = (x) => x === 'true' || x === true;

module.exports = {
    prefix: process.env.PREFIX || '.',
    owner: process.env.OWNER_NUMBER || '',
    mods: process.env.MODS || '',
    packname: process.env.PACKNAME || 'ɠαɾϝιҽʅɗ',
    author: process.env.AUTHOR || 'ɳαxσɾ',
    SESSION_ID: process.env.SESSION_ID || '',
    HASTEBIN: process.env.HASTEBIN || '57575e64f0071399dbffa7b2ec6ac1ed32d3e9167f87893dcd4fdcfc73de970a1348c31b4711d06426298080cf6072e4ff3fd9675af1bb08101ab259e05f1bbe',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 100 * 1024 * 1024,
    timezone: process.env.TIMEZONE || 'UTC',
    WORK_TYPE: process.env.WORK_TYPE || 'public',
};


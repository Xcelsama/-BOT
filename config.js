require('dotenv').config();

module.exports = {
    PREFIX: new RegExp(process.env.PREFIX || '^[!/.#?~]'),
    OWNER_NUM: process.env.OWNER_NUMBER || '27686881509',
    MODS: (process.env.MODS || '27686881509').split(',').filter(Boolean),
    
    BOT_NAME: process.env.BOT_NAME || 'X-Astral',
    
    GROK_API: process.env.GROK_API || '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', //get key at console.groq.com

    SESSION_ID: process.env.SESSION_ID || '', //session id
    

    MONGODB_URI: process.env.MONGODB_URI || 'mongodb+srv://whatsbixby:whatsbixby@cluster0.idp3t.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', // get url at mongodb.atlas
    
    PASTE_BIN_API: process.env.PASTE_BIN_API || 'ypkqXUGgzysc_yLPTBaEZ_G3G-nvjEsh', //pastebin key for session 

    API: 'https://diegoson-naxordeve.hf.space',
    
    FOOTER: process.env.FOOTER || '© wabot',
    LANG: process.env.LANG || 'en',
    WORKTYPE: process.env.WORK_TYPE || 'private'
};



require('dotenv').config();
var Toggle = (x) => x === "true";

module.exports = {
    PREFIX: new RegExp(process.env.PREFIX || '^[!/.#?~]'),
    OWNER_NUM: process.env.OWNER_NUMBER || '27686881509',
    MODS: (process.env.MODS || '27686881509').split(',').filter(Boolean),
    
    BOT_NAME: process.env.BOT_NAME || 'X-ASTRAL',
    
    GROK_API: process.env.GROK_API || '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', //get key at console.groq.com

    SESSION_ID: process.env.SESSION_ID || '', //session id

    GEMINI_API_KEY: process.env.GEMINI_API_KEY || 'AIzaSyCzlWIpR-ljOkX2InphFWau4OESfk_HJyY',

    PORT: process.env.PORT || '3000',
    
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb+srv://xastral:naxordeve27@cluster0.xkzaq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', // get url at mongodb.atlas
       
    API: 'https://diegoson-astarl.hf.space',

    FOOTER: process.env.FOOTER || '© whatsapp',
    LANG: process.env.LANG || 'en',
    WORKTYPE: process.env.WORK_TYPE || 'private'
};



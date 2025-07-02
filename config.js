var Toggle = (x) => x === "true";
require('dotenv').config();

module.exports = {
    BOT_NAME: process.env.BOT_NAME || 'X Astral',
    PREFIX: process.env.PREFIX || '',
    OWNER: process.env.OWNER || '',
    API: 'https://diegoson-astarl.hf.space',
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb+srv://xastral:naxordeve27@cluster0.xkzaq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', // get url at mongodb.atlas
       
    SESSION_ID: process.env.SESSION_ID || 'whatsapp-bot',
    AUTO_READ: process.env.AUTO_READ === 'true',
    WORKTYPE: process.env.WORKTYPE || '',
    AUTO_TYPING: process.env.AUTO_TYPING === 'true',
    PRESENCE: process.env.PRESENCE || 'available',
    LOG_LEVEL: process.env.LOG_LEVEL || 'silent',
    PORT: process.env.PORT || 8000
};

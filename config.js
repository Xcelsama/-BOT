const fs = require('fs-extra');
const path = require('path');

function Themes() {
    const c = process.env.BOT_THEME || 'garfiled';
    const x = path.join(__dirname, './lib/Themes', `${c.toLowerCase()}.json`); 
    if (fs.existsSync(x)) {
    return JSON.parse(fs.readFileSync(x, 'utf8'));
    } else {
    console.warn(`Theme ${c} not found`);
    return JSON.parse(fs.readFileSync(path.join(__dirname, './lib/Themes', 'garfield.json'), 'utf8'));
        }
    return {
            name: 'Default',
            displayName: 'whatsapp-bot',
            emojis: { connected: '✅', disconnected: '❌', command: '►', package: '📦', total: '📊' },
            messages: { connected: 'Connected', disconnected: 'Disconnected' }
        };
    }
}

const theme = Themes();
module.exports = {
    prefix: '.',
    botName: theme.displayName || 'whatsapp-bot',
    owner: 'Bot Owner',
    packname: 'Bot Sticker',
    author: theme.name || 'naxordeve',
    session_id: 'bot-session',
    autoRead: true,
    autoTyping: false,
    autoRecording: false,
    maxFileSize: 100 * 1024 * 1024, 
    timezone: 'UTC',
    theme: theme
};

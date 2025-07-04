const { makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const pino = require('pino');
const fs = require('fs');
const path = require('path');
const config = require('./config');
const { serialize } = require('./lib/serialize');
const { loadCommands } = require('./lib/commands');
const { SessionCode } = require('./lib/session');

const logger = pino({ level: 'silent' });
const sessionDir = path.join(__dirname, 'lib/Session');

if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true });



async function connect() {
    await SessionCode(config.SESSION_ID, "./lib/Session");
    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
    
    const conn = makeWASocket({
        auth: state,
        logger,
        browser: ['Bot', 'Chrome', '1.0.0']
    });

    conn.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        
        if (connection === 'close') {
            console.log(`${config.theme.emojis.disconnected} ${config.theme.messages.disconnected}`);
            const shouldReconnect = (lastDisconnect?.error instanceof Boom) ? 
                lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut : false;
            if (shouldReconnect) {
                connect();
            }
        } else if (connection === 'open') {
            console.log(`${config.theme.emojis.connected} ${config.theme.messages.connected}`);
        }
    });

    conn.ev.on('creds.update', saveCreds);
    
    conn.ev.on('messages.upsert', async (m) => {
        const message = m.messages[0];
        if (!message.key.fromMe && m.type === 'notify') {
            const msg = serialize(message, conn);
            const commands = await loadCommands();
            const text = msg.body?.toLowerCase() || '';
            const prefix = config.prefix;
            if (!text.startsWith(prefix)) return;
            
            if (config.WORK_TYPE === 'private' && !msg.isSelf) {
                return; 
            }
            
            const args = text.slice(prefix.length).split(' ');
            const command = args[0];
            for (const cmd of commands) {
                if (cmd.command === command || (cmd.aliases && cmd.aliases.includes(command))) {
                    try {
                        await cmd.handler(msg);
                    } catch (error) {
                        console.error(error);
                    }
                    break;
                }
            }
        }
    });

    return conn;
}

connect();

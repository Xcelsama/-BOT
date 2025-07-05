const { makeWASocket,Browsers, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const pino = require('pino');
const fs = require('fs');
const path = require('path');
const config = require('../config');
const { serialize } = require('./serialize');
const { loadCommands } = require('./Modules/commands');
const { SessionCode } = require('./session');

const sessionDir = path.join(__dirname, 'Session');
if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir);

    const connect = async () => {
    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
    
    const conn = makeWASocket({
        auth: state,
        logger: pino({ level: 'silent' }),
        browser: Browsers.macOS("Chrome")
    });

    conn.ev.on('connection.update', ({ connection, lastDisconnect }) => {
    if (connection === 'open') {
        console.log(`${config.theme.emojis.connected} ${config.theme.messages.connected}`);
    } else if (connection === 'close') {
        console.log(`${config.theme.emojis.disconnected} ${config.theme.messages.disconnected}`);
        if (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) connect();
     }
   });

    conn.ev.on('creds.update', saveCreds);
    
    conn.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.key.fromMe && m.type === 'notify') {
            const message = serialize(msg, conn);
            const commands = await loadCommands();
            const text = message.body?.toLowerCase() || '';
            const prefix = config.prefix;

            if (config.WORK_TYPE === 'private' && !message.isSelf) {
                return; 
            }

            const args = text.slice(prefix.length).split(' ');
            const command = args[0];

            for (const cmd of commands) {
                const prefixed = text.startsWith(prefix);

                if (
                    prefixed &&
                    (cmd.command === command || (cmd.aliases && cmd.aliases.includes(command)))
                ) {
                    try {
                        await cmd.handler(message);
                    } catch (error) {
                        console.error(error);
                    }
                    break;
                }

                if (cmd.on === 'text' && message.body) {
                    try {
                        await cmd.handler(message);
                    } catch (error) {
                        console.error(error);
                    }
                }
            }
        }
    });

    return conn;
}

module.exports = { connect };

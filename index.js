const { default: makeWASocket, 
     useMultiFileAuthState, 
     DisconnectReason 
    } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const pino = require('pino');
const chalk = require('chalk');
const fs = require('fs-extra');
const path = require('path');
const { serialize } = require('./lib/serialize');
const { loadCommands } = require('./lib/commands');
const config = require('./config');
const logger = pino({ level: 'silent' });

async function connect() {
    const { state, saveCreds } = await useMultiFileAuthState('./auth');
    const conn = makeWASocket({
        auth: state,
        logger,
        browser: ['Bot', 'Chrome', '1.0.0']
    });

    conn.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        
        if (connection === 'close') {
            console.log(`${config.theme.emojis.disconnected} ${config.theme.messages.disconnected}`);
            const x_connect = (lastDisconnect?.error instanceof Boom) ? 
            lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut : false;
            if (x_connect) {
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
            const serialized = serialize(message, conn);
            await handleMessage(serialized, conn);
        }
    });

    return conn;
}

async function handleMessage(message, conn) {
    const commands = await loadCommands();
    const text = message.body?.toLowerCase() || '';
    const prefix = config.prefix;
    if (!text.startsWith(prefix)) return;    
    const args = text.slice(prefix.length).split(' ');
    const command = args[0];
    for (const cmd of commands) {
        if (cmd.command === command || (cmd.aliases && cmd.aliases.includes(command))) {
            try {
                await cmd.handler(message);
            } catch (error) {
            console.error(error);
            }
            break;
        }
    }
}

connect();

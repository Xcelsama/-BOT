const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    Browsers
} = require('@whiskeysockets/baileys');
const axios = require('axios');
const { Boom } = require('@hapi/boom');
const pino = require('pino');
const { serialize } = require('./serialize');
const fs = require('fs');
const { MultiAuth } = require("./session");
const path = require('path');
const config = require('../../config');
const { getCommand } = require('./command');
const { plugins } = require('../../WAclient/plug-ins');
const { connectMongoDB, connectSQLite } = require('./DB/database');

const sessionDir = path.join(__dirname, "lib", "auth");

if (!fs.existsSync(sessionDir)) {
    fs.mkdirSync(sessionDir, { recursive: true });
}
const cred = path.join(sessionDir, "creds.json");
if (!fs.existsSync(cred)) {
    MultiAuth(config.SESSION_ID, cred);
}

const startBot = async () => {
    try {
        await connectMongoDB();
        connectSQLite();

        const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
        const conn = makeWASocket({
            printQRInTerminal: false,
            auth: state,
            logger: pino({ level: 'silent' }),
            browser: Browsers.macOS("Chrome"),
            downloadHistory: false,
            syncFullHistory: false,
            markOnlineOnConnect: false,
            generateHighQualityLinkPreview: true,
            retryRequestDelayMs: 10000,
            maxRetries: 5,
            defaultQueryTimeoutMs: 60000,
            getMessage: async key => {
                if (store) {
                    const msg = await store.loadMessage(key.remoteJid, key.id);
                    return msg?.message || undefined;
                }
                return { conversation: '' };
            }
        });

        conn.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect } = update;
            if (connection === 'open') {
                plugins();
                const start_up = `X ASTRAL ONLINE\n\nPREFIX : ${config.PREFIX.source}\nVERSION : 4.0.0`;
                await conn.sendMessage(conn.user.id, { text: start_up });
                console.log('Bot connected.');
            } else if (connection === 'close') {
                if ((lastDisconnect?.error instanceof Boom)?.output?.statusCode !== DisconnectReason.loggedOut) {
                    startBot();
                }
            }
        });

        conn.ev.on('creds.update', saveCreds);

        conn.ev.on('messages.upsert', async (m) => {
            const msg = await serialize(conn, m.messages[0]);
            const { PREFIX } = config;

            if (msg.body?.startsWith('$')) {
                if (msg.fromMe || msg.sender.split('@')[0] === config.OWNER_NUM || config.MODS.includes(msg.sender.split('@')[0])) {
                    try {
                        let evaled = await eval(`(async () => { ${msg.body.slice(1)} })()`);
                        if (typeof evaled !== 'string') evaled = require('util').inspect(evaled);
                        await msg.reply(`${evaled}`);
                    } catch (err) {
                        await msg.reply(`${err}`);
                    }
                    return;
                }
            }

            if (!msg.body || !PREFIX.test(msg.body)) return;
            if (config.WORKTYPE === 'private' && !(msg.fromMe || msg.sender.split('@')[0] === config.OWNER_NUM || config.MODS.includes(msg.sender.split('@')[0]))) return;

            const cm = msg.cmd.slice(1);
            const command = getCommand(cm);
            if (!command) return;
            try {
                await command.callback(msg, msg.args, conn);
            } catch (err) {
                console.error(`${cm}:`, err);
                await msg.reply(`${err.message}`);
            }
        });

    } catch (err) {
        console.error(err);
    }
};

module.exports = { startBot };
  

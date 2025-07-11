const { default: makeWASocket, Browsers, useMultiFileAuthState } = require('baileys');
const pino = require('pino');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const config = require('../config.js');
const fs = require('fs');
const serialize = require('./serialize');
const { loadPlugins } = require('./plugins');

const connect = async () => {
    const sessionDir = path.join(__dirname, 'Session');
    if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir);

    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
    const conn = makeWASocket({
        printQRInTerminal: false,
        auth: state,
        browser: Browsers.macOS("Chrome"),
        logger: pino({ level: 'silent' }),
        downloadHistory: false,
        syncFullHistory: false,
        markOnlineOnConnect: false,
        getMessage: false,
        emitOwnEvents: false,
        generateHighQualityLinkPreview: true
    });

    let plugins = [];

    conn.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'open') {
            console.log('✅ Garfield connected');
            plugins = await loadPlugins();
        }
        if (connection === 'close') {
            console.log(lastDisconnect?.error);
            setTimeout(connect, 3000);
        }
    });

    conn.ev.on('creds.update', saveCreds);

    conn.ev.on('call', async (call) => {
        for (const c of call) {
            if (c.isOffer) {
                try {
                    const callerJid = c.from;
                    await conn.rejectCall(c.callId, callerJid);
                    await conn.sendMessage(callerJid, {
                        text: 'Sorry, I do not accept calls',
                    });
                } catch {}
            }
        }
    });

   
conn.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify' || !messages || !messages.length) return;
    const msg = messages[0];
    if (!msg.message) return;
    if (!plugins.length) return;
    const message = await serialize(msg, conn);
    if (!message || !message.body) return;
    console.log(message.body);

    const cmdEvent =
        config.WORK_TYPE === 'public' ||
        (config.WORK_TYPE === 'private' && (message.fromMe || config.mods));

    if (!cmdEvent) return;
    const control = config.prefix || process.env.PREFIX;
    if (message.body.startsWith(control)) {
        const [cmd, ...args] = message.body.slice(1).split(' ');
        const match = args.join(' ');
        const found = plugins.find(p => p.command === cmd);
        if (found) {
            await found.exec(message, match);
        }
    }
});
};

module.exports = { connect };

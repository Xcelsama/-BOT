const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    Browsers,
    fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const pino = require('pino');
const fs = require('fs');
const path = require('path');
const config = require('../config');
const { serialize } = require('./serialize');
const { loadCommands, commands } = require('./commands');
const { connectDB } = require('./models/mongodb');

module.exports.connect = async () => {
    await connectDB();
    const sessionDir = path.join(__dirname, 'Session');
    if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir);

    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
    const { version } = await fetchLatestBaileysVersion();
    const conn = makeWASocket({
        version,
        auth: state,
        logger: pino({ level: 'silent' }),
        browser: Browsers.macOS("Chrome"),
        downloadHistory: false,
        syncFullHistory: false,
        generateHighQualityLinkPreview: true,
        retryRequestDelayMs: undefined
    });

    conn.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'open') {
            console.log('✅ connected');
            setTimeout(async () => {
                await loadCommands();
                console.log(`Loaded: ${commands.size}`);
            }, 2000);
        }

        if (connection === 'close') {
            const reconnect = (lastDisconnect?.error instanceof Boom) &&
                lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (reconnect) {
                console.log('Reconnecting in 3 seconds...');
                setTimeout(() => module.exports.connect(), 3000);
            }
        }
    });

    conn.ev.on('creds.update', saveCreds);

    conn.ev.on('messages.upsert', async (msgUpdate) => {
        const { messages, type } = msgUpdate;
        if (type !== 'notify') return;
        for (const m of messages) {
            if (!m.message || m.key.fromMe) continue;
            try {
                const msg = serialize(m, conn);
                if (config.AUTO_READ) {
                    await conn.readMessages([msg.key]);
                }
                await handleCommand(msg, conn);
            } catch (err) {
                console.error(err);
            }
        }
    });

    conn.ev.on('call', async (callUpdate) => {
        const { CallReject } = require('./database');
        const callReject = await CallReject.findOne();
        if (callReject && callReject.enabled) {
            for (const call of callUpdate) {
                if (call.status === 'offer') {
                    await conn.rejectCall(call.id, call.from);
                    await conn.sendMessage(call.from, {
                        text: callReject.message
                    });
                }
            }
        }
    });
};

async function handleCommand(msg, conn) {
    const body = msg.body?.trim();
    if (!body || !body.startsWith(config.PREFIX)) return;

    const args = body.slice(config.PREFIX.length).trim().split(/ +/);
    const cmd = args.shift()?.toLowerCase();
    const text = args.join(' ');
    const user_cx = msg.sender;
    const isOwner = user_cx === config.OWNER + '@s.whatsapp.net';
    const isMod = config.MODS.includes(user_cx.replace('@s.whatsapp.net', ''));
    const isAuthorized = isOwner || isMod;

    if (config.WORKTYPE === 'private' && !isAuthorized) return;

    if ((cmd === 'eval' || cmd === 'e' || cmd === '>') && isAuthorized) {
        if (!text) return;
        try {
            let result = await eval(`(async () => { ${text} })()`);
            if (typeof result === 'object') {
                result = JSON.stringify(result, null, 2);
            }
            await msg.reply(`\n\`\`\`${result}\`\`\``);
        } catch (err) {
            await msg.reply(`\n\`\`\`${err.message}\`\`\``);
        }
        return;
    }

    const command = commands.get(cmd);
    if (!command) return;
    try {
        await command.execute(msg, text);
    } catch (err) {
        console.error(`[${cmd}]:`, err);
    }
        }

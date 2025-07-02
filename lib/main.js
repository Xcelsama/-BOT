const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const pino = require('pino');
const fs = require('fs');
const path = require('path');
const config = require('../config');
const { serialize } = require('./serialize');
const { loadCommands, commands } = require('./commands');
const { connectDB } = require('./database');

class WhatsAppBot {
    constructor() {
        this.sock = null;
        this.connected = false;
    }

    async start() {
        await connectDB();
        await this.connect();
    }

    async connect() {
        const SessionDir = path.join(__dirname, 'Session');
        if (!fs.existsSync(SessionDir)) fs.mkdirSync(SessionDir);
        
        const { state, saveCreds } = await useMultiFileAuthState(SessionDir);
        const { version } = await fetchLatestBaileysVersion();
        this.conn = makeWASocket({
            version,
            auth: state,
            logger: pino({ level: 'silent' }),
            browser: Browsers.macOS("Chrome"),
            downloadHistory: false,
            syncFullHistory: false,
            generateHighQualityLinkPreview: true,
            retryRequestDelayMs: undefined
        });

        this.conn.ev.on('connection.update', (update) => {
            const { connection, lastDisconnect } = update;
            if (connection === 'open') {
                console.log('✅ connected');
                this.connected = true;
                setTimeout(() => this.loadCommands(), 2000);
            }

            if (connection === 'close') {
                this.connected = false;
                const reconnect = (lastDisconnect?.error instanceof Boom) &&
                    lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
                if (reconnect) {
                    console.log('Reconnecting in 3 seconds...');
                    setTimeout(() => this.connect(), 3000);
                } 
            }
        });

        this.conn.ev.on('creds.update', saveCreds);
        this.conn.ev.on('messages.upsert', (msg) => this.handleMessage(msg));
        this.conn.ev.on('call', (call) => this.handleCall(call));
    }

    async handleCall(callUpdate) {
        const { CallReject } = require('./database');
            const callReject = await CallReject.findOne();
            if (callReject && callReject.enabled) {
                for (const call of callUpdate) {
                    if (call.status === 'offer') {
                        await this.conn.rejectCall(call.id, call.from);
                        await this.conn.sendMessage(call.from, {
                            text: callReject.message
                        });
                    }
                }
            }
    }

    async loadCommands() {
        await loadCommands();
        console.log(`Loaded: ${commands.size}`);
    }

    async handleMessage(msgUpdate) {
        const { messages, type } = msgUpdate;
        if (type !== 'notify') return;
        for (const m of messages) {
            if (!m.message || m.key.fromMe) continue;
            try { const msg = serialize(m, this.conn);
                if (config.AUTO_READ) {
                    await this.conn.readMessages([msg.key]);
                }
                await this.processCommand(msg);
            } catch (error) {
                console.error(error);
            }
        }
    }

    async processCommand(msg) {
        const body = msg.body?.trim();
        if (!body || !body.startsWith(config.PREFIX)) return;
        const args = body.slice(config.PREFIX.length).trim().split(/ +/);
        const cmd = args.shift()?.toLowerCase();
        const text = args.join(' ');
        const user_cx = msg.sender;
        const isOwner = user_cx === config.OWNER + '@s.whatsapp.net';
        const isMod = config.MODS.includes(user_cx.replace('@s.whatsapp.net', ''));
        const isAuthorized = isOwner || isMod;
        if (config.WORKTYPE === 'private' && !isAuthorized) {
            return; 
        }
        if ((cmd === 'eval' || cmd === 'e' || cmd === '>') && isAuthorized) {
            if (!text) return;
            try { 
                let result = await eval(`(async () => { ${text} })()`); 
                if (typeof result === 'object') {
                    result = JSON.stringify(result, null, 2);
                }
                
                await msg.reply(`\n\`\`\`${result}\`\`\``);
            } catch (error) {
                await msg.reply(`\n\`\`\`${error.message}\`\`\``);
            }
            return;
        }

        const command = commands.get(cmd);
        if (!command) return;
        try { 
            await command.execute(msg, text);
        } catch (error) {
            console.error(`[${cmd}]:`, error);
        }
    }
}

const bot = new WhatsAppBot();
module.exports = { bot };

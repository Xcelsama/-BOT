const { makeWASocket, DisconnectReason, useMultiFileAuthState, Browsers } = require('@whiskeysockets/baileys');
const P = require('pino');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');
const config = require('../config');
const { serialize } = require('../Message/serialize');
const { commands, textHandler } = require('../plugins/module');

class WhatsAppBot {
    constructor() {
      
    }

    async start() {
        const { state, saveCreds } = await useMultiFileAuthState(config.sessionName);
        
        const conn = makeWASocket({
            auth: state,
            printQRInTerminal: false,
            logger: P({ level: 'silent' }),
            browser: config.browser,
            generateHighQualityLinkPreview: true
        });

        conn.ev.on('creds.update', saveCreds);
        
        conn.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect } = update;
            
            if (connection === 'close') {
                const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
                console.log(lastDisconnect?.error);
                if (shouldReconnect && config.autoReconnect) {
                    console.log('Reconnecting...');
                    this.start();
                }
            } else if (connection === 'open') {
                console.log('✅ connected successfully');
               this.loadCommands();
            }
        });

        conn.ev.on('messages.upsert', async ({ messages, type }) => {
            if (type !== 'notify') return;
            for (const message of messages) {
                const msg = serialize(conn, message);
                await this.ForMessages(conn, msg);
            }
        });

        this.conn = conn;
        return conn;
    }

    async ForMessages(conn, msg) {
        if (!msg.body || msg.isSelf) return;
        const body = msg.body.trim();
        const Module = body.startsWith(config.prefix);
        if (!Module && txt) {
            try {
                await txt.handler(msg, body);
            } catch (error) {
                console.error(error);
            }
            return;
        }
        
        if (!Module) return;
        const args = body.slice(config.prefix.length).trim().split(/ +/);
        const cmd_name = args.shift().toLowerCase();
        const text = args.join(' ');
        if (cmd_name === '$' && msg.sender === config.ownerNumber) {
            try { const result = await eval(`(async () => { ${text} })()`);
                await msg.reply(`\n\`\`\`\n${typeof result === 'object' ? JSON.stringify(result, null, 2) : result}\n\`\`\``);
                return;
            } catch (error) {
                await msg.reply(`\n\`\`\`\n${error.message}\n\`\`\``);
                return;
            }
        }
        
        const command = commands.get(cmd_name);
        if (!command) return;
        try {            
        await command.handler(msg, text);
        } catch (error) {
            console.error(error);
            }
    }

    loadCommands() {
        const pluginsDir = path.join(__dirname, '../plugins');
        if (!fs.existsSync(pluginsDir)) {
            fs.mkdirSync(pluginsDir, { recursive: true });
            return;
        }
        
        const files = fs.readdirSync(pluginsDir).filter(file => file.endsWith('.js') && file !== 'module.js');
        for (const file of files) {
        try { require(path.join(pluginsDir, file));
        console.log(`✅ Cmds Loaded : ${file}`);
          } catch (error) {
               }
        }
        
        console.log(`Total commands: ${commands.size}`);
    }
}

module.exports = WhatsAppBot;
               

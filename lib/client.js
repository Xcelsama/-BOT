const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    Browsers,
    proto, 
    getContentType,
    downloadContentFromMessage,
    areJidsSameUser,
    jidNormalizedUser
} = require('@whiskeysockets/baileys');
const axios = require('axios');
const { Boom } = require('@hapi/boom');
const pino = require('pino');
const fs = require('fs');
const { MultiAuth } = require("./session");
const path = require('path');
const config = require('../config');
const { getCommand } = require('./command');
const { plugins } = require('../WAclient/plugins');
const {connectMongoDB} = require('./DB/database');

const rateOverLimit = new Map();

const serialize = async (conn, msg) => {
    if (msg.key) {
        msg.id = msg.key.id;
        msg.user = msg.key.remoteJid;
        msg.fromMe = msg.key.fromMe;
        msg.isGroup = msg.user.endsWith('@g.us');
        msg.sender = msg.isGroup && msg.key.participant ? jidNormalizedUser(msg.key.participant) : jidNormalizedUser(msg.user);
    }

    if (msg.message) {
        msg.type = getContentType(msg.message);
        msg.body = msg.message.conversation || 
                   msg.message.extendedTextMessage?.text || 
                   msg.message.imageMessage?.caption || 
                   msg.message.videoMessage?.caption || 
                   msg.message.documentMessage?.caption || 
                   msg.message.viewOnceMessageV2?.message?.imageMessage?.caption ||
                   msg.message.viewOnceMessageV2?.message?.videoMessage?.caption || '';

        const [cmd, ...args] = msg.body.trim().split(/ +/);
        msg.cmd = cmd;
        msg.args = args.join(' ');
        msg.text = args.join(' ');
        msg.mentions = msg.body.match(/@(\d*)/g)?.map(x => x.split('@')[1] + '@s.whatsapp.net') || [];

        if (msg.isGroup) {
            if (rateOverLimit.has(msg.user)) {
                msg.groupMetadata = rateOverLimit.get(msg.user);
            } else {
                try {
                    const groupMetadata = await conn.groupMetadata(msg.user);
                    rateOverLimit.set(msg.user, groupMetadata);
                    msg.groupMetadata = groupMetadata;
                } catch (error) {
                    console.error(error);
                    msg.groupMetadata = {};
                }
            }

            msg.groupName = msg.groupMetadata.subject || '';
            msg.groupDesc = msg.groupMetadata.desc || '';
            msg.groupMembers = msg.groupMetadata.participants || [];
            msg.groupAdmins = msg.groupMembers.filter(p => p.admin).map(p => p.id);
            msg.isAdmin = msg.groupAdmins.includes(msg.sender);
            msg.isBotAdmin = msg.groupAdmins.includes(conn.user.id);
            msg.participants = msg.groupMembers.map(u => u.id);
        }

        msg.reply = async (content, options = {}) => {
            if (typeof content === 'string') {
                return conn.sendMessage(msg.user, { text: content }, { quoted: msg });
            }
            return conn.sendMessage(msg.user, content, { quoted: msg });
        };

        msg.send = async (content, options = {}) => {
            if (typeof content === 'string') {
                content = { text: content };
            }
            const sent = await conn.sendMessage(msg.user, content, options);
            if (sent.key) {
                await conn.sendMessage(msg.user, {
                    react: { text: "✅", key: sent.key }
                });
            }
            return sent;
        };

        msg.react = async (emoji = '✅') => {
            await conn.sendMessage(msg.user, {
                react: {
                    text: emoji,
                    key: msg.key
                }
            });
        };

        msg.groupClose = async (jid, enabled) => {
           return await conn.groupSettingUpdate(msg.user, 'announcement');
        };

        msg.groupOpen = async (jid, enabled) => {
           return await conn.groupSettingUpdate(msg.user, 'not_announcement');
        };

        msg.addUser = async (user) => {
            const res = await conn.groupParticipantsUpdate(msg.user, [user], 'add');
            if (res[0].status === "409") throw new Error('Cannot add directly');
            return res;
        };

        msg.kickUser = async (user) => {
            return await conn.groupParticipantsUpdate(msg.user, [user], 'remove');
        };

        msg.addAdmin = async (user) => {
            return await conn.groupParticipantsUpdate(msg.user, [user], 'promote');
        };

        msg.removeAdmin = async (user) => {
            return await conn.groupParticipantsUpdate(msg.user, [user], 'demote');
        };

        msg.revokeLink = async () => {
            return await conn.groupRevokeInvite(msg.user);
        };

        msg.getGroupLink = async () => {
            const code = await conn.groupInviteCode(msg.user);
            return `https://chat.whatsapp.com/${code}`;
        };

        if (msg.message.extendedTextMessage?.contextInfo?.quotedMessage) {
            msg.quoted = {
                message: msg.message.extendedTextMessage.contextInfo.quotedMessage,
                sender: jidNormalizedUser(msg.message.extendedTextMessage.contextInfo.participant),
                fromMe: msg.message.extendedTextMessage.contextInfo.participant === conn.user.id,
                type: getContentType(msg.message.extendedTextMessage.contextInfo.quotedMessage),
            };

            msg.quoted.download = async () => {
                const type = msg.quoted.type;
                if (!msg.quoted.message[type]) return null;
                return downloadContentFromMessage(msg.quoted.message[type], type.split('Message')[0]);
            };
        }

        if (msg.type === 'viewOnceMessageV2' && msg.message.viewOnceMessageV2?.message) {
            msg.viewOnce = {
                type: getContentType(msg.message.viewOnceMessageV2.message),
                message: msg.message.viewOnceMessageV2.message
            };
        }

        msg.download = async () => {
            const type = msg.type === 'viewOnceMessageV2' 
                ? getContentType(msg.message.viewOnceMessageV2.message)
                : msg.type;

            if (!msg.message[type] && !(msg.message.viewOnceMessageV2?.message?.[type])) {
                return null;
            }

            return downloadContentFromMessage(
                msg.type === 'viewOnceMessageV2' 
                    ? msg.message.viewOnceMessageV2.message[type] 
                    : msg.message[type], 
                type.split('Message')[0]
            );
        };

        msg.getJson = () => {
            try {
                if (msg.quoted) {
                    return JSON.parse(msg.quoted.message.conversation || 
                           msg.quoted.message.extendedTextMessage?.text || 
                           msg.quoted.message.imageMessage?.caption || 
                           msg.quoted.message.videoMessage?.caption || '');
                }
                return JSON.parse(msg.body);
            } catch (e) {
                return null;
            }
        };

        msg.Profile = async (jid = msg.sender) => {
            try {const pp = await conn.profilePictureUrl(jid, 'image');
                return pp;
            } catch (error) {
                return 'https://i.ibb.co/4mLTxhv/profile.jpg';
            }
        };

        msg.toFullpp = async (imaged, isGroup = false) => {
            try {
                const response = await axios.get(imaged, { responseType: 'arraybuffer' });
                const imgBuffer = Buffer.from(response.data);
                const Jimp = require('jimp');
                const jimp = await Jimp.read(imgBuffer);
                const min = jimp.getWidth();
                const max = jimp.getHeight();
                const cropped = jimp.crop(0, 0, min, max);
                const img = await cropped.scaleToFit(720, 720).getBufferAsync(Jimp.MIME_JPEG);
                
                await conn.query({
                    tag: "iq",
                    attrs: {
                        to: `isGroup ? msg.user : 's.whatsapp.net'`,
                        type: "set",
                        xmlns: "w:profile:picture"
                    },
                    content: [
                        {
                            tag: "picture",
                            attrs: { type: "image" },
                            content: img
                        }
                    ]
                });
                return true;
            } catch (error) {
                console.error(error);
                return false;
            }
        };

        msg.tagAll = async (message = '') => {
            if (!msg.isGroup) return;
            let teks = message ? message : '';
            for (let mem of msg.participants) {
                teks += `@${mem.split('@')[0]}\n`;
            }
            await msg.reply(teks, { mentions: msg.participants });
        };

        msg.getJids = async () => {
            const chats = Object.entries(await conn.chats).filter(([jid, chat]) => jid.endsWith('@g.us'));
            return chats.map(([jid]) => jid);
        };

        msg.loadMessages = async (jid, count) => {
            return await conn.loadMessages(jid, count);
        };
    }

    return msg;
};

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
        var ctn = new Map();
        conn.ev.on('call', async (call) => {
            for (let c of call) {
                if (c.status === "offer") {
                    await conn.rejectCall(c.id, c.from);
                    
                    if (ctn.has(c.from)) {
                        await conn.updateBlockStatus(c.from, "block");
                        await conn.sendMessage(c.from, { text: "*You have been blocked for calling a bot*" });
                    } else {
                        ctn.set(c.from, true);
                        await conn.sendMessage(c.from, { text: "*Auto call rejection enabled\n\nCalling again will result in a block*" });
                    }
                }
            }
        });
        conn.ev.on('group-participants.update', async (update) => {
            var Group = require('./DB/schemas/GroupSchema');
            const gi = update.id;
            let groupMetadata;
            if (rateOverLimit.has(gi)) {
                groupMetadata = rateOverLimit.get(gi);
            } else {
                groupMetadata = await conn.groupMetadata(gi);
                rateOverLimit.set(gi, groupMetadata);
            }

            const group = await Group.findOne({ id: gi }) || await new Group({ id: gi }).save();
            if (!group) return;
            for (const participant of update.participants) {
                const pp = await conn.profilePictureUrl(participant, 'image').catch(() => 'https://i.ibb.co/4mLTxhv/profile.jpg');
                if (update.action === 'add' && group.welcome) {
                    var welcomemsg = group.welcomemsg
                        .replace('@user', `@${participant.split('@')[0]}`)
                        .replace('@group', groupMetadata.subject)
                        .replace('@desc', groupMetadata.desc || '')
                        .replace('@count', groupMetadata.participants.length);
                    await conn.sendMessage(gi, {image: { url: pp }, caption: welcomemsg, mentions: [participant]
                    });
                } else if (update.action === 'remove' && group.goodbye) {
                    var goodbyemsg = group.goodbyemsg
                        .replace('@user', `@${participant.split('@')[0]}`)
                        .replace('@group', groupMetadata.subject)
                        .replace('@desc', groupMetadata.desc || '')
                        .replace('@count', groupMetadata.participants.length);

                    await conn.sendMessage(gi, {image: { url: pp }, caption: goodbyemsg,
                    mentions: [participant]
                    });
                }
            }
        });
        const kf = new Set();
        conn.ev.on('messages.upsert', async (m) => {
            const msg = await serialize(conn, m.messages[0]);
            const { PREFIX } = config;
            if (msg.key?.remoteJid === 'status@broadcast') {
                var st_id = `${msg.key.participant}_${msg.key.id}`;
                if (!kf.has(st_id) && !conn.areJidsSameUser(msg.key.participant, conn.user.id)) {
                    const res = ['🍚', '🤗', '😡', '💝', '💖', '💗', '🤍','👀','🌚','🗿','🫦','🤢'];
                    await conn.sendMessage('status@broadcast', {
                        react: {text: res[Math.floor(Math.random() * res.length)],
                        key: msg.key
                        }}, {statusJidList: [msg.key.participant]
                    });
                    kf.add(st_id);
                }
            }
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

            if (!msg.body || !PREFIX.test(msg.body)) {
                if (config.WORKTYPE === 'private' && !(msg.fromMe || msg.sender.split('@')[0] === config.OWNER_NUM || config.MODS.includes(msg.sender.split('@')[0]))) return;
                var cmds = getAllCommands();
                cmds.map(async (cmd) => {
                    let content = '';
                    if (msg.type === 'imageMessage') content = msg.message?.imageMessage?.caption;
                    else if (msg.type === 'videoMessage') content = msg.message?.videoMessage?.caption;
                    else content = msg.message?.conversation || msg.message?.extendedTextMessage?.text;
                    try { if (cmd.on === msg.type) await cmd.callback(msg, content, conn);
                        else if (cmd.on === 'text' && content) await cmd.callback(msg, content, args, conn);
                    } catch (e) {
                        console.error(e);
                    }
                });
                return;
            }

            if (config.WORKTYPE === 'private' && !(msg.fromMe || msg.sender.split('@')[0] === config.OWNER_NUM || config.MODS.includes(msg.sender.split('@')[0]))) return;
            const cm = msg.cmd.slice(1);
            const command = getCommand(cm);
            if (!command) return;
            try { await command.callback(msg, msg.args, conn);
            } catch (err) {
                console.error(`${cm}:`, err);
                let ea = `*-- ERROR  [XASTRAL] --*\n*JID:* ${msg.sender}\n*ERROR:* ${err.message}\n\n_--made with ❤️--_`;
                await msg.reply(ea);
            }
        });

    } catch (err) {
        console.error(err);
    }
};

module.exports = { startBot };

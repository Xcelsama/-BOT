const {
    proto, 
    getContentType,
    downloadContentFromMessage,
    areJidsSameUser,
    jidNormalizedUser
} = require('baileys');
var config = require('../config');
var axios = require('axios');
const rateOverLimit = new Map();

const serialize = async (conn, msg) => {
    if (!msg || !msg.key || !msg.key.remoteJid) {
        console.log('empty nor invalid key...');
        return null;
    }
    
    if (msg.key) {
        msg.id = msg.key.id;
        msg.user = msg.key.remoteJid;
        msg.fromMe = msg.key.fromMe;
        msg.isGroup = msg.user.endsWith('@g.us');
        msg.sender = msg.isGroup && msg.key.participant ? jidNormalizedUser(msg.key.participant) : jidNormalizedUser(msg.user);
        
        if (msg.isGroup && msg.key.participant) {
            msg.participant = jidNormalizedUser(msg.key.participant);
        }
        
        if (msg.key.participant && msg.isGroup) {
            msg.sender = jidNormalizedUser(msg.key.participant);
        }
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

        let cmd, args;
        if (msg.body.match(config.PREFIX)) {
            [cmd, ...args] = msg.body.trim().split(/ +/);
        } else {
           [cmd, ...args] = msg.body.trim().split(/ +/);
        }
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
            msg.groupAdmins = msg.groupMembers.filter(p => p.admin === 'admin' || p.admin === 'superadmin').map(p => p.id);
            msg.isAdmin = msg.groupAdmins.includes(msg.sender);
            msg.isBotAdmin = msg.groupAdmins.includes(jidNormalizedUser(conn.user.id));
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
                    react: { text: "", key: sent.key }
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
                sender: jidNormalizedUser(msg.message.extendedTextMessage.contextInfo.participant || msg.message.extendedTextMessage.contextInfo.remoteJid),
                fromMe: areJidsSameUser(msg.message.extendedTextMessage.contextInfo.participant || msg.message.extendedTextMessage.contextInfo.remoteJid, conn.user.id),
                type: getContentType(msg.message.extendedTextMessage.contextInfo.quotedMessage),
            };

            msg.quoted.download = async () => {
                const type = msg.quoted.type;
                if (!type || !msg.quoted.message || !msg.quoted.message[type]) {
                return null;
                }try {
                    const stream = await downloadContentFromMessage(msg.quoted.message[type], type.split('Message')[0]);
                    let buffer = Buffer.from([]);
                    for await (const chunk of stream) {
                    buffer = Buffer.concat([buffer, chunk]);
                    }
                    return buffer;
                } catch (error) {
                    console.error(error);
                    return null;
                }
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

    if (!type || (!msg.message[type] && !(msg.message.viewOnceMessageV2?.message?.[type]))) {
        return null;
    }

    let mdl;
    if (msg.type === 'viewOnceMessageV2') {
        mdl = msg.message.viewOnceMessageV2.message[type];
    } else {
        mdl = msg.message[type];
    }

    if (!mdl) return null;
    try {
        const stream = await downloadContentFromMessage(mdl, type.split('Message')[0]);
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }
        return buffer;
    } catch (error) {
        console.error(error);
        return null;
    }
       };

        msg.getJson = async (url, options) => {
        try {
        options = options || {}; 
        const res = await axios({
            method: "GET",
            url: url,
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36",
            },
            ...options,
        });
        return res.data;
       } catch (err) {
        return err;
        }
      }
        msg.Profile = async (jid = msg.sender) => {
            try {const pp = await conn.profilePictureUrl(jid, 'image');
                return pp;
            } catch (error) {
                return 'https://i.ibb.co/4mLTxhv/profile.jpg';
            }
        };

        msg.updateProfilePicture = async (buffer) => {
            const Jimp = require('jimp');
            if(!Buffer.isBuffer(buffer)) return "no buffer found";
            const image = await Jimp.read(buffer);
            const min = image.getWidth();
            const max = image.getHeight();
            const cropped = image.clone().crop(0, 0, min, max);
            const scaled = await cropped.scaleToFit(720, 720);
            const proUrl = await scaled.getBufferAsync(Jimp.MIME_JPEG);
            await conn.query({tag: 'iq',
            attrs: {to: '@s.whatsapp.net', type: 'set', xmlns: 'w:profile:picture' },
            content: [{ tag: 'picture',
            attrs: { type: 'image' },
            content: proUrl }]
            });
            return true;
        };

        msg.BlockStatus = async (jid, action) => {
            return await conn.updateBlockStatus(jid, action);
        };
        msg.tagAll = async (message = '') => {
            if (!msg.isGroup) return;
            let teks = message ? message : '';
            for (let mem of msg.participants) {
                teks += `@${mem.split('@')[0]}\n`;
            }
            await msg.reply(teks, { mentions: msg.participants });
        };

        msg.groupJoin = async (code) => {
            const group = await conn.groupAcceptInvite(code);
            return group;
        };

        msg.groupLeave = async () => {
            return await conn.groupLeave(msg.user);
        };
        msg.getJids = async () => {
            const chats = await conn.groupFetchAllParticipating();
            return Object.keys(chats).filter(jid => jid.endsWith('@g.us'));
        };
         msg.getRequestList = async () => {
            const result = await conn.groupRequestParticipantsList(msg.user);
            return result;
        };

        msg.handleRequest = async (participants, action) => {
            return await conn.groupRequestParticipantsUpdate(msg.user, participants, action);
        };
        
        msg.pollinations = async (question, modelIndex = 0) => {
            try { const pollinations = require('./pollinations');
            return await pollinations.chat(question, modelIndex);
            } catch (error) {
            throw new Error(`${error.message}`);
            }
        };
        
        msg.generateImage = async (prompt, modelIndex = 0) => {
            try { const pollinations = require('./pollinations');
                return await pollinations.image(prompt, modelIndex, {
                    width: "1024",
                    height: "1024",
                    safe: false
                });
            } catch (error) {
            throw new Error(`${error.message}`);
            }
        };
        
        msg.generateVoice = async (text, modelIndex = 0) => {
            try {
            const pollinations = require('./pollinations');
            return await pollinations.voice(text, modelIndex);
            } catch (error) {
            throw new Error(`${error.message}`);
            }
        };
        
        msg.Genius = async (query) => {
            try {
            var res = await axios.get(`https://api.paxsenix.biz.id/lyrics/genius?q=${query}`);
            return res.data;
            } catch (error) {
            throw new Error(`${error.message}`);
            }
        };
        msg.setGroupPP = async (content) => {
            if (!msg.isGroup) throw new Error('This is not a group');
            const { img } = await conn.generateProfilePicture(content);
            await conn.query({
                tag: 'iq',
                attrs: {
                    to: 's.whatsapp.net',
                    type: 'set',
                    xmlns: 'w:profile:picture'
                },
                content: [
                    {
                        tag: 'picture',
                        attrs: { type: 'image', target: msg.user },
                        content: img
                    }
                ]
            });
        };
            
        msg.loadMessages = async (jid, count = 100) => {
            return await conn.loadMessages(jid, count);
        };

        msg.isSameUser = (jid1, jid2) => {
            return areJidsSameUser(jid1, jid2);
        };
    }

    return msg;
};

module.exports = {serialize};

const { proto, getContentType, downloadContentFromMessage, jidNormalizedUser } = require('@whiskeysockets/baileys');
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
        msg.args = args;
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

        msg.revoke = async () => {
            await conn.groupRevokeInvite(msg.user);
            return 'Group link revoked';
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
    }

    return msg;
};

module.exports = { serialize };
            

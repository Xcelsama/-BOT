const { proto, getContentType, downloadContentFromMessage } = require('baileys');

const jidNormalizer = (jid) => {
    if (!jid) return jid;
    return jid.replace(/:\d+@/, '@');
};

function serialize(message, conn) {
    if (!message) return message;

    const m = {};
    m.conn = conn;
    m.key = message.key;
    m.id = message.key.id;
    m.chat = jidNormalizer(message.key.remoteJid);
    m.fromMe = message.key.fromMe;
    m.isGroup = m.chat.endsWith('@g.us');
    m.sender = message.key.fromMe ? jidNormalizer(conn?.user?.id) : (m.isGroup ? jidNormalizer(message.key.participant) : m.chat);

    const msg = message.message;
    if (!msg) {
        console.warn(message);
        return m;
    }

    m.type = getContentType(msg);
    m.message = msg;

    const content = msg[m.type] || {};

    if (m.type === 'conversation') {
        m.body = msg.conversation;
    } else if (m.type === 'extendedTextMessage') {
        m.body = content.text || '';
    } else if (m.type === 'imageMessage') {
        m.body = content.caption || '';
    } else if (m.type === 'videoMessage') {
        m.body = content.caption || '';
    } else if (m.type === 'audioMessage') {
        m.body = content.caption || '';
    } else if (m.type === 'documentMessage') {
        m.body = content.caption || '';
    } else {
        m.body = '';
    }

    m.quoted = null;
    if (content.contextInfo?.quotedMessage) {
        const cont = content.contextInfo;
        m.quoted = {
            key: {
                remoteJid: jidNormalizer(m.chat),
                fromMe: cont.participant === jidNormalizer(conn?.user?.id),
                id: cont.stanzaId,
                participant: jidNormalizer(cont.participant)
            },
            message: cont.quotedMessage,
            type: getContentType(cont.quotedMessage),
            sender: jidNormalizer(cont.participant),
            body: ''
        };

        const q = m.quoted.type;
        const qMsg = cont.quotedMessage || {};
        if (q === 'conversation') {
            m.quoted.body = qMsg.conversation;
        } else if (q === 'extendedTextMessage') {
            m.quoted.body = qMsg.extendedTextMessage?.text || '';
        } else if (q === 'imageMessage') {
            m.quoted.body = qMsg.imageMessage?.caption || '';
        } else if (q === 'videoMessage') {
            m.quoted.body = qMsg.videoMessage?.caption || '';
        }
    }

    m.send = async (text, type = 'text', options = {}) => {
        if (options.edit && options.edit.id) {
            return await conn.sendMessage(m.chat, { text, edit: options.edit });
        } else {
            return await conn.sendMessage(m.chat, { text });
        }
    };

    m.reply = async (text) => {
        return await conn.sendMessage(m.chat, { text }, { quoted: message });
    };

    m.downloadMedia = async () => {
        try {
            if (['imageMessage', 'videoMessage', 'audioMessage', 'documentMessage', 'stickerMessage'].includes(m.type)) {
                const stream = await downloadContentFromMessage(content, m.type.replace('Message', ''));
                const chunks = [];
                for await (const chunk of stream) chunks.push(chunk);
                return Buffer.concat(chunks);
            }
            return null;
        } catch (error) {
            console.error('Download error:', error);
            return null;
        }
    };

    m.download = m.downloadMedia;

    return m;
}

module.exports = { serialize };

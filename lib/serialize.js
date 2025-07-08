const { 
    proto, 
    getContentType, 
    downloadContentFromMessage 
} = require('baileys');

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
    m.sender = message.key.fromMe ? jidNormalizer(conn.user.id) : (m.isGroup ? jidNormalizer(message.key.participant) : m.chat);

    const msg = message.message;
    m.type = getContentType(msg);
    m.message = msg;
    
    if (m.type === 'conversation') {
        m.body = msg.conversation;
    } else if (m.type === 'extendedTextMessage') {
        m.body = msg.extendedTextMessage.text;
    } else if (m.type === 'imageMessage') {
        m.body = msg.imageMessage.caption || '';
    } else if (m.type === 'videoMessage') {
        m.body = msg.videoMessage.caption || '';
    } else if (m.type === 'audioMessage') {
        m.body = msg.audioMessage.caption || '';
    } else if (m.type === 'documentMessage') {
        m.body = msg.documentMessage.caption || '';
    } else {
        m.body = '';
    }
    
    m.quoted = null;
    if (msg[m.type] && msg[m.type].contextInfo) {
        const cont = msg[m.type].contextInfo;
        if (cont.quotedMessage) {
            m.quoted = {
                key: {
                    remoteJid: jidNormalizer(m.chat),
                    fromMe: cont.participant === jidNormalizer(conn.user.id),
                    id: cont.stanzaId,
                    participant: jidNormalizer(cont.participant)
                },
                message: cont.quotedMessage,
                type: getContentType(cont.quotedMessage),
                sender: jidNormalizer(cont.participant),
                body: ''
            };
            
            const q = m.quoted.type;
            if (q === 'conversation') {
                m.quoted.body = cont.quotedMessage.conversation;
            } else if (q === 'extendedTextMessage') {
                m.quoted.body = cont.quotedMessage.extendedTextMessage.text;
            } else if (q === 'imageMessage') {
                m.quoted.body = cont.quotedMessage.imageMessage.caption || '';
            } else if (q === 'videoMessage') {
                m.quoted.body = cont.quotedMessage.videoMessage.caption || '';
            }
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
            if (m.type === 'imageMessage' || m.type === 'videoMessage' || m.type === 'audioMessage' || m.type === 'documentMessage' || m.type === 'stickerMessage') {
                const buffer = await downloadContentFromMessage(msg[m.type], m.type.replace('Message', ''));
                const chunks = [];
                for await (const chunk of buffer) {
                chunks.push(chunk);
                }
                return Buffer.concat(chunks);
            }
            return null;
        } catch (error) {
            console.error(error);
            return null;
        }
    };
    
    m.download = m.downloadMedia;
    
    return m;
}

module.exports = { serialize };    
        

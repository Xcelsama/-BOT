const {
    getContentType,
    downloadContentFromMessage,
    jidNormalizedUser,
    downloadMediaMessage,
} = require('baileys');

const serialize = (msg, conn) => {
    if (!msg) return {};
    
    const message = {};
    const mtype = getContentType(msg.message);
    
    message.key = msg.key;
    message.id = msg.key.id;
    message.jid = msg.key.remoteJid;
    message.fromMe = msg.key.fromMe;
    message.isSelf = message.fromMe;
    message.isGroup = message.jid.endsWith('@g.us');
    message.sender = jidNormalizedUser(message.fromMe ? conn.user.id : message.isGroup ? msg.key.participant : message.jid);
    
    message.mtype = mtype;
    message.msg = msg.message[mtype];
    message.body = message.msg?.text || message.msg?.caption || message.msg?.conversation || message.msg?.selectedButtonId || message.msg?.singleSelectReply?.selectedRowId || '';    
    if (message.msg?.contextInfo?.quotedMessage) {
        const quotedType = getContentType(message.msg.contextInfo.quotedMessage);
        message.quoted = {
            key: {
                id: message.msg.contextInfo.stanzaId,
                fromMe: message.msg.contextInfo.participant === jidNormalizedUser(conn.user.id),
                remoteJid: message.jid
            },
            message: message.msg.contextInfo.quotedMessage,
            mtype: quotedType,
            msg: message.msg.contextInfo.quotedMessage[quotedType],
            sender: jidNormalizedUser(message.msg.contextInfo.participant),
            text: message.msg.contextInfo.quotedMessage[quotedType]?.text || 
                  message.msg.contextInfo.quotedMessage[quotedType]?.caption || 
                  message.msg.contextInfo.quotedMessage.conversation || ''
        };
        
        message.quoted.download = async () => {
            return await downloadContentFromMessage(message.quoted.msg, quotedType.replace('Message', ''));
        };
    }
  
    const qt = ['imageMessage', 'videoMessage', 'audioMessage', 'documentMessage', 'stickerMessage'];
    if (qt.includes(mtype)) {
        message.download = async () => {
            return await downloadContentFromMessage(message.msg, mtype.replace('Message', ''));
        };
    }
    
    message.reply = async (text, options = {}) => {
        return await conn.sendMessage(message.jid, { text, ...options }, { quoted: msg });
    };
    
    message.react = async (emoji) => {
        return await conn.sendMessage(message.jid, {
            react: {
                text: emoji,
                key: message.key
            }
        });
    };
    
    message.send = async (content, options = {}) => {
        if (typeof content === 'string') {
            return await conn.sendMessage(message.jid, { text: content, ...options }, { quoted: msg });
        } else if (content && typeof content === 'object') {
            return await conn.sendMessage(message.jid, { ...content, ...options }, { quoted: msg });
        }
        return await conn.sendMessage(message.jid, content, { quoted: msg });
    };
    
    message.sendImage = async (buffer, caption = '', options = {}) => {
        return await conn.sendMessage(message.jid, { 
            image: buffer, 
            caption, 
            ...options 
        }, { quoted: msg });
    };
    
    message.sendVideo = async (buffer, caption = '', options = {}) => {
        return await conn.sendMessage(message.jid, { 
            video: buffer, 
            caption, 
            ...options 
        }, { quoted: msg });
    };
    
    message.sendAudio = async (buffer, options = {}) => {
        return await conn.sendMessage(message.jid, { 
            audio: buffer, 
            mimetype: 'audio/mp4',
            ...options 
        }, { quoted: msg });
    };
    
    message.sendDocument = async (buffer, filename, mimetype, options = {}) => {
        return await conn.sendMessage(message.jid, { 
            document: buffer, 
            fileName: filename,
            mimetype,
            ...options 
        }, { quoted: msg });
    };
    
    message.sendSticker = async (buffer, options = {}) => {
        return await conn.sendMessage(message.jid, { 
            sticker: buffer,
            ...options 
        }, { quoted: msg });
    };
    
    return message;
};

module.exports = { serialize };

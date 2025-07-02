const {
    jidNormalizedUser,
    getContentType,
    downloadContentFromMessage,
    generateWAMessageFromContent,
    proto
} = require('@whiskeysockets/baileys');
const fs = require('fs-extra');
const path = require('path');

const serialize = (msg, conn) => {
    if (!msg.message) return msg;
    const m = {
        key: msg.key,
        message: msg.message,
        pushName: msg.pushName,
        sender: jidNormalizedUser(msg.key.participant || msg.key.remoteJid),
        from: msg.key.remoteJid,
        isGroup: msg.key.remoteJid.endsWith('@g.us'),
        participant: msg.key.participant,

        body: getMessageBody(msg),
        type: getContentType(msg.message),

        reply: (text) => reply(msg, conn, text),
        send: (content, type = 'text') => send(msg, conn, content, type),
        react: (emoji) => react(msg, conn, emoji),
        delete: () => deleteMessage(msg, conn),
        download: () => downloadMedia(msg),
        quoted: getQuotedMessage(msg, conn)
    };

    return m;
};

const getMessageBody = (msg) => {
    const content = msg.message;
    const type = getContentType(content);
    switch (type) {
        case 'conversation':
            return content.conversation;
        case 'extendedTextMessage':
            return content.extendedTextMessage?.text;
        case 'imageMessage':
            return content.imageMessage?.caption || '';
        case 'videoMessage':
            return content.videoMessage?.caption || '';
        case 'documentMessage':
            return content.documentMessage?.caption || '';
        case 'audioMessage':
            return content.audioMessage?.caption || '';
        default:
            return '';
    }
};

const getQuotedMessage = (msg, conn) => {
    const quotedMessage = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (!quotedMessage) return null;
    return serialize({
        key: {
            remoteJid: msg.key.remoteJid,
            participant: msg.message.extendedTextMessage.contextInfo.participant,
            id: msg.message.extendedTextMessage.contextInfo.stanzaId
        },
        message: quotedMessage
    }, conn);
};

const reply = async (msg, conn, text) => {
    return await conn.sendMessage(msg.key.remoteJid, {
        text: text
    }, {
        quoted: msg
    });
};

const send = async (msg, conn, content, type = 'text') => {
    const jid = msg.key.remoteJid;
    let conteg = {};
    switch (type) {
        case 'text':
            conteg= { text: content };
            break;
        case 'image':
            conteg = { image: content };
            break;
        case 'video':
            conteg = { video: content };
            break;
        case 'audio':
            conteg = { audio: content, mimetype: 'audio/mp4' };
            break;
        case 'document':
            conteg = { document: content };
            break;
        case 'sticker':
            conteg = { sticker: content };
            break;
        default:
            conteg = { text: content };
    }

    return await conn.sendMessage(jid, conteg);
};

const react = async (msg, conn, emoji) => {
    return await conn.sendMessage(msg.key.remoteJid, {
        react: {
            text: emoji,
            key: msg.key
        }
    });
};

const deleteMessage = async (msg, conn) => {
    return await conn.sendMessage(msg.key.remoteJid, {
        delete: msg.key
    });
};

const downloadMedia = async (msg) => {
    const content = msg.message;
    const type = getContentType(content);
    if (!['imageMessage', 'videoMessage', 'audioMessage', 'documentMessage', 'stickerMessage'].includes(type)) {
        return null;
        }try {
        const stream = await downloadContentFromMessage(content[type], type.replace('Message', ''));
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

module.exports = { serialize };

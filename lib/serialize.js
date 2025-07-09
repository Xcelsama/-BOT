const { getContentType, downloadContentFromMessage, jidNormalizedUser } = require('baileys');

class Message {
    constructor(msg, conn) {
        this.raw = msg;
        this.conn = conn;
        this.key = msg.key;
        this.id = msg.key.id;
        this.from = msg.key.remoteJid;
        this.sender = msg.key.fromMe ? jidNormalizedUser(conn.user.id) : jidNormalizedUser(msg.key.participant || msg.key.remoteJid);
        this.isGroup = this.from.endsWith('@g.us');
        this.pushName = msg.pushName || 'gafield';

        this.type = getContentType(msg.message);
        const content = msg.message[this.type];
        this.body = this.extractBody(content);
        this.content = content;

        this.quoted = this.extractQuoted();
    }

    extractBody(content) {
        const t = this.type;
        return t === 'conversation' ? content :
               t === 'extendedTextMessage' ? content.text :
               t === 'imageMessage' ? content.caption :
               t === 'videoMessage' ? content.caption :
               t === 'templateButtonReplyMessage' ? content.selectedDisplayText :
               '';
    }

    extractQuoted() {
        const context = this.raw.message?.extendedTextMessage?.contextInfo;
        const quotedMsg = context?.quotedMessage;
        if (!quotedMsg) return null;

        const qType = getContentType(quotedMsg);
        const qContent = quotedMsg[qType];

        return {
            type: qType,
            msg: qContent,
            fromMe: context.participant === this.conn.user.id,
            participant: context.participant,
            id: context.stanzaId,
            key: {
                remoteJid: this.from,
                fromMe: context.participant === this.conn.user.id,
                id: context.stanzaId,
                participant: context.participant
            },
            download: async () => {
                const stream = await downloadContentFromMessage(qContent, qType.replace('Message', ''));
                const chunks = [];
                for await (const chunk of stream) chunks.push(chunk);
                return Buffer.concat(chunks);
            }
        };
    }

    async download() {
        const stream = await downloadContentFromMessage(this.content, this.type.replace('Message', ''));
        const chunks = [];
        for await (const chunk of stream) chunks.push(chunk);
        return Buffer.concat(chunks);
    }

    async send(payload, options = {}) {
        if (payload?.delete) {
            return this.conn.sendMessage(this.from, { delete: payload.delete });
        }

        const msg = typeof payload === 'string' ? { text: payload } : payload;

        if (options.edit) {
            msg.edit = options.edit;
        }

        return this.conn.sendMessage(this.from, msg, { quoted: this.raw });
    }
}

module.exports = (msg, conn) => new Message(msg, conn);

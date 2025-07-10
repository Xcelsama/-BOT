const { getContentType, downloadContentFromMessage, jidNormalizedUser } = require('baileys');

const groupCache = new Map();

class Message {
    constructor(msg, conn) {
        this.raw = msg;
        this.conn = conn;
        this.key = msg.key;
        this.id = msg.key.id;
        this.from = msg.key.remoteJid;
        this.sender = this.key.fromMe
            ? jidNormalizedUser(conn.user.id)
            : jidNormalizedUser(msg.key.participant || msg.key.remoteJid);
        this.isGroup = this.from.endsWith('@g.us');
        this.pushName = msg.pushName || 'gafield';

        this.type = getContentType(msg.message);
        const content = msg.message[this.type];
        this.body = this._extractBody(content);
        this.content = content;

        this.quoted = this._extractQuoted();
    }

    async loadGroupInfo() {
        if (!this.isGroup) return;

        const cached = groupCache.get(this.from);
        const now = Date.now();
        if (cached && now - cached.timestamp < 5 * 60 * 1000) {
            this.groupMetadata = cached.data;
        } else {
            const meta = await this.conn.groupMetadata(this.from);
            groupCache.set(this.from, { data: meta, timestamp: now });
            this.groupMetadata = meta;
        }

        this.groupParticipants = this.groupMetadata.participants;
        this.groupAdmins = this.groupParticipants.filter(p => p.admin).map(p => p.id);
        this.groupOwner = this.groupMetadata.owner || this.groupAdmins[0];
        this.joinApprovalMode = this.groupMetadata.joinApprovalMode || false;
        this.memberAddMode = this.groupMetadata.memberAddMode || false;
        this.announce = this.groupMetadata.announce || false;
        this.restrict = this.groupMetadata.restrict || false;
        this.isAdmin = this.groupAdmins.includes(this.sender);
        this.isBotAdmin = this.groupAdmins.includes(jidNormalizedUser(this.conn.user.id));
    }

    async muteGroup() {
        return this.conn.groupSettingUpdate(this.from, 'announcement');
    }

    async unmuteGroup() {
        return this.conn.groupSettingUpdate(this.from, 'not_announcement');
    }

    async setSubject(text) {
        return this.conn.groupUpdateSubject(this.from, text);
    }

    async setDescription(text) {
        return this.conn.groupUpdateDescription(this.from, text);
    }

    async addParticipant(jid) {
        return this.conn.groupParticipantsUpdate(this.from, [jid], 'add');
    }

    async removeParticipant(jid) {
        return this.conn.groupParticipantsUpdate(this.from, [jid], 'remove');
    }

    async promoteParticipant(jid) {
        return this.conn.groupParticipantsUpdate(this.from, [jid], 'promote');
    }

    async demoteParticipant(jid) {
        return this.conn.groupParticipantsUpdate(this.from, [jid], 'demote');
    }

    async leaveGroup() {
        return this.conn.groupLeave(this.from);
    }

    async inviteCode() {
        return this.conn.groupInviteCode(this.from);
    }

    async revokeInvite() {
        return this.conn.groupRevokeInvite(this.from);
    }

    async getInviteInfo(code) {
        return this.conn.groupGetInviteInfo(code);
    }

    async joinViaInvite(code) {
        return this.conn.groupAcceptInvite(code);
    }

    async getJoinRequests() {
        return this.conn.groupRequestParticipantsList(this.from);
    }

    async updateJoinRequests(jids, action = 'approve') {
        return this.conn.groupRequestParticipantsUpdate(this.from, jids, action);
    }

    async setMemberAddMode(enable = true) {
        return this.conn.groupSettingUpdate(this.from, enable ? 'not_announcement' : 'announcement');
    }

    getParticipants() {
        return this.groupParticipants || [];
    }

    isParticipant(jid) {
        return this.getParticipants().some(p => p.id === jid);
    }

    _extractBody(content) {
        const t = this.type;
        return t === 'conversation' ? content :
               t === 'extendedTextMessage' ? content.text :
               t === 'imageMessage' ? content.caption :
               t === 'videoMessage' ? content.caption :
               t === 'templateButtonReplyMessage' ? content.selectedDisplayText :
               '';
    }

    _extractQuoted() {
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

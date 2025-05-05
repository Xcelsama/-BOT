const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  Browsers,
  areJidsSameUser,
  jidNormalizedUser
} = require('baileys');               
const axios = require('axios');
const { Boom } = require('@hapi/boom');
const pino = require('pino');
const fs = require('fs');
const path = require('path');
const config = require('../config');
const { getCommand, getAllCommands } = require('./command');
const { plugins } = require('../WAclient/plugins');
var {serialize} = require('./serialize');
const NodeCache = require('node-cache');
const msgRetryCounterCache = new NodeCache({stdTTL: 60 * 10, checkperiod: 60, useClones: false
});
const rateOverLimit = new Map();

const sessionDir = path.join(__dirname, 'multi_auth');
if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir);
const startBot = async () => {
    try {
        const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
        const conn = makeWASocket({
            printQRInTerminal: false,
            auth: state,
            logger: pino({ level: 'silent' }),
            browser: Browsers.macOS("Chrome"),
            downloadHistory: false,
            syncFullHistory: false,
            shouldSyncHistoryMessage: () => false,
            markOnlineOnConnect: false,
            patchMessageBeforeSending: (message) => {
                const req = !!(
                    message.buttonsMessage ||
                    message.templateMessage ||
                    message.listMessage
                );
                if (req) {
                    message = {
                        viewOnceMessage: {
                            message: {
                                messageContextInfo: {
                                    deviceListMetadataVersion: 2,
                                    deviceListMetadata: {},
                                },
                                ...message,
                            },
                        },
                    };
                }
                return message;
            },
            generateHighQualityLinkPreview: true,
            retryRequestDelayMs: undefined,
            maxRetries: 5,
            defaultQueryTimeoutMs: undefined,
            msgRetryCounterCache: {
                get: (key) => Promise.resolve(msgRetryCounterCache.get(key?.toString())),
                set: (key, value) => {
                    msgRetryCounterCache.set(key?.toString(), value);
                    return Promise.resolve();
                }
            },
            getMessage: false
        });

      //store.bind(conn.ev)
      conn.ev.on('connection.update', async (update) => {
          const { connection, lastDisconnect } = update;
          if (connection === 'open') {
              plugins();
              try {
                  const start_up = `X ASTRAL ONLINE\n\nPREFIX : ${config.PREFIX?.source || '!'}\nVERSION : 4.0.0`;
                  if (conn.user?.id) {
                      await conn.sendMessage(conn.user.id, { text: start_up });
                  }
              } catch (error) {
                  console.log(error);
              }
              console.log('Bot connected');
          } else if (connection === 'close') {
              if ((lastDisconnect?.error instanceof Boom)?.output?.statusCode !== DisconnectReason.loggedOut) {
                  startBot();
              }
          }
      });

      conn.ev.on('creds.update', saveCreds);
      const Call = require('./models/schemas/CallSchema');
      conn.ev.on('call', async (call) => {
          for (let c of call) {
              if (c.status === "offer") {
                  const settings = await Call.findOne({}) || await new Call({}).save();
                  if (settings.globalAutoReject) {
                      await conn.rejectCall(c.id, c.from);
                      await conn.sendMessage(c.from, { text: "*Auto call rejection is currently enabled*" });
                  }
              }
          }
      });
      conn.ev.on('group-participants.update', async (update) => {
          var Group = require('./models/schemas/GroupSchema');
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
      conn.ev.on('messages.upsert', async (m) => {
      const msg = await serialize(conn, m.messages[0]);
      const { PREFIX } = config;
      if (msg.body?.startsWith('$')) {
              if (msg.fromMe || msg.sender.split('@')[0] === config.OWNER_NUM || config.MODS.includes(msg.sender.split('@')[0])) {
                  try {
                      const path = require('path');
                      let evaled = await eval(`(async () => { 
                          process.chdir(path.join(__dirname, '..')); 
                          return ${msg.body.slice(1)}; 
                      })()`);
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
              return;
          }

          if (config.WORKTYPE === 'private' && !(msg.fromMe || msg.sender.split('@')[0] === config.OWNER_NUM || config.MODS.includes(msg.sender.split('@')[0]))) return;
          const cm = msg.cmd.slice(1);
          const command = getCommand(cm);
          if (!command) return;
          try {
              await command.callback(msg, msg.args, conn);
              
              for (const cmd of getAllCommands()) {
                  if (cmd.on) {
                      if ((cmd.on === "text" && msg.type === "conversation") ||
                          (cmd.on === "video" && msg.type === "videoMessage") ||
                          (cmd.on === "audio" && msg.type === "audioMessage") ||
                          (cmd.on === "sticker" && msg.type === "stickerMessage") ||
                          (cmd.on === "image" && msg.type === "imageMessage")
                      ) {
                          await cmd.callback(msg, conn);
                      }
                  }
              }
          } catch (err) {
              console.error(`${cm}:`, err);
              let ea = `*-- ERROR  [XASTRAL] --*\n\n*Jid:* ${msg.sender}\n\n*Error:* ${err.message}\n\n_--made with ❤️--_`;
              await msg.reply(ea);
          }
      });

  } catch (err) {
      console.error(err);
  }
};

module.exports = { startBot };

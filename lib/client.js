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
const {Ytml} = require('../WAclient/commands/ytauto');
const {xDl} = require('../WAclient/commands/xauto');
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
      let startup = false;
      conn.ev.on('connection.update', async (update) => {
          const { connection, lastDisconnect } = update;
          if (connection === 'open' && !startup) {
              plugins();
              try { var CMD_NUM = getAllCommands();
                  const pedi = CMD_NUM.length;
                  const authority = config.MODS.length;
                  const sudos = config.OWNER_NUM ? 1 : 0; 
                  const ged = authority + sudos;
                  const Call = require('./models/schemas/CallSchema');
                  const mobile = await Call.findOne({}) || { globalAutoReject: false };
                  const callRejectStatus = mobile.globalAutoReject ? '✅' : '❎';
                  const start_up = `*X ASTRAL ONLINE*\n\nPREFIX: ${config.PREFIX?.source}\nMODE: ${config.WORKTYPE || process.env.WORK_TYPE}\nPLUGINS: ${pedi}\n\n\nSUDO: ${authority}\nPrivileg: ${ged}\nCall Reject: ${callRejectStatus}`;
                  if (conn.user?.id) {
                      await conn.sendMessage(conn.user.id, { text: start_up });
                      startup = true;
                  }
              } catch (error) {
                    try { const er = `*ERROR DETECTED*\n\nError: ${error.message}\nStack: ${error.stack}\n\nTime: ${new Date().toLocaleString()}`;
                      if (conn.user?.id && config.OWNER_NUM) {
                          await conn.sendMessage(config.OWNER_NUM + '@s.whatsapp.net', { text: er });
                      }} catch (noti) {}
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
        await Ytml(msg);
        await xDl(msg);
        const { PREFIX } = config;
        if (msg.body?.startsWith('$')) {
            if (
                msg.fromMe ||
                msg.sender.split('@')[0] === config.OWNER_NUM ||
                config.MODS.includes(msg.sender.split('@')[0])
            ) {
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
        if (config.WORKTYPE === 'private' &&
            !(msg.fromMe || msg.sender.split('@')[0] === config.OWNER_NUM || config.MODS.includes(msg.sender.split('@')[0]))) {
            return;
        }

        let cm;
        if (PREFIX.test(msg.body)) {
            cm = msg.cmd.slice(1); 
        } else if (msg.body) {
            cm = msg.cmd; 
        } else {
            return;
        }
        const command = getCommand(cm);
        if (command) {
            try {
                await command.callback(msg, msg.args, conn);
            } catch (err) {
                console.error(`${cm}:`, err);
                let ea = `*-- ERROR  [XASTRAL] --*\n\n*Jid:* ${msg.sender}\n\n*Error:* ${err.message}\n\n_--made with ❤️--_`;
                await msg.reply(ea);
            }
            return;
        }
        if (msg.body && !msg.fromMe) {
            const AiChat = require('./models/schemas/chatbot');
            const History = require('./models/schemas/save');
            try { 
                const chatId = msg.isGroup ? msg.user : msg.sender;
                var SK = await AiChat.findOne({ id: chatId });
                if (SK && SK.enabled) {
                    let r = false;
                    if (!msg.isGroup) {
                        r = true;
                    } else {
                        const neo = conn.user.id.split(':')[0] + '@s.whatsapp.net';
                        const sxt = msg.mentions.includes(neo);
                        const lid = msg.quoted && msg.quoted.fromMe;
                        r = sxt || lid;
                    }
                    
                    if (r) {
                        let question = msg.body;
                        if (sxt) {
                        question = question.replace(/@\d+/g, '').trim();
                        } if (question.length > 0) {
                          let meta = await History.findOne({
                                id: msg.sender,
                                gid: chatId
                            });  
                            if (!meta) {
                                meta = new History({
                                    id: msg.sender,
                                    gid: chatId,
                                    messages: []
                                });
                            }
                            meta.messages.push({role: 'user', content: question, timestamp: new Date()});
                            meta.cleanupOldMessages();
                            meta.lastUpdated = new Date();
                            const tki = ['fox','generate image', 'create image', 'make image', 'draw', 'generate picture', 'create picture', 'make picture'];
                            const gen = tki.some(keyword => question.toLowerCase().includes(keyword));
                            const ct = ['anora','generate voice','say this', 'speak this', 'voice message', 'can you say this'];
                            const pnn = /^say\s|^\s*say\s/i;
                            const isvn = ct.some(keyword => question.toLowerCase().includes(keyword)) || pnn.test(question);
                            const advice = ['anora', 'tell me', 'can you tell me', 'advice', 'help me', 'suggest', 'recommend', 'ai'];
                            const shift = advice.some(keyword => question.toLowerCase().includes(keyword));
                            if (gen) {
                                await msg.react('✨¨');
                                try { let prompt = question.toLowerCase();
                                    for (const keyword of tki) {
                                        if (question.toLowerCase().includes(keyword)) {
                                            prompt = question.toLowerCase().replace(keyword, '').replace(/of|:|,/g, '').trim();
                                            break;
                                        }
                                    }
                                    if (prompt.length > 0) {
                                        const ima = await msg.generateImage(prompt);
                                        await msg.send({
                                            image: { url: ima },
                                            caption: `*Generated by X Astral*`
                                        });
                                    } else {
                                    await msg.reply('Please provide a description for the image you want me to generate');
                                    }
                                } catch (error) {
                                  console.error(error);
                                  await msg.reply('_unable to generate_');
                                }
                            } else if (isvn) {
                                await msg.react('✨');
                                try { let text = question.toLowerCase();
                                    for (const keyword of ct) {
                                        if (question.toLowerCase().includes(keyword)) {
                                            text = question.toLowerCase().replace(keyword, '').replace(/:|,/g, '').trim();
                                            break;
                                        }
                                    } if (text.length > 0) {
                                        const vn = await msg.generateVoice(text);
                                        await msg.send({
                                            audio: { url: vn },
                                            mimetype: 'audio/mpeg',
                                            ptt: true
                                        });
                                    } else {
                                    await msg.reply('Please provide the text you want me to convert to voice');
                                    }
                                } catch (error) {
                                  console.error(error);
                                 }
                            } else {
                                if (shift) {
                                await msg.react('✨');
                                } else {
                                await msg.react('✨');
                                }try { 
                                    let coi = question;
                                    if (meta.messages.length > 1) {
                                       const rec = meta.messages.slice(-11, -1);
                                        const context = rec.map(msg => 
                                        `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
                                        ).join('\n')
                                        coi = `${question}`;
                                    }

                                    const response = await msg.pollinations(coi, SK.modelIndex || 0);
                                    if (response && typeof response === 'string') {
                                    meta.messages.push({role: 'assistant', content: response, timestamp: new Date()});
                                    await meta.save();
                                    await msg.reply(response);
                                    } else {
                                    await msg.reply('_unable baby_');
                                    }
                                } catch (error) {
                                    console.error(error);
                                    await msg.reply('_unable gorgeous_');
                                }
                            }
                        }
                    }
                }
            } catch (error) {
                console.error(error);
            }
        } });
      } catch (err) {
        console.error(err);
    }
};
module.exports = {startBot};

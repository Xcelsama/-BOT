const { Command } = require('../../lib/');
const Group = require('../../lib/models/schemas/GroupSchema');

Command({
  cmd_name: 'autodl',
  category: 'admin',
  desc: ''
})(async (msg) => {
  if (!msg.isGroup) return;
  if (!msg.isAdmin && msg.fromMe) return;
  let db = await Group.findOne({ id: msg.user });
  if (!db) {
  db = new Group({ id: msg.user, autodl: false }); }
  db.autodl = !db.autodl;
  await db.save();
  await msg.reply(`autodl been *${db.autodl ? 'enabled' : 'disabled'}*`);
});

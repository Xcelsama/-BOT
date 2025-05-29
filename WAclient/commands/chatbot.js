var { Command } = require('../../lib/');
const AiChat = require('../../lib/models/schemas/chatbot');
const pollinations = require('../../lib/pollinations');

Command({
  cmd_name: 'aichat',
  category: 'AI',
  desc: 'Toggle AI chat feature on/off'
})(async (msg) => {
  if (!msg.isGroup) return;
  if (!msg.isAdmin && msg.fromMe) return;
  const args = msg.text.toLowerCase().split(' ');
  const action = args[0];
  let aiChat = await AiChat.findOne({ id: msg.user });
   if (!aiChat) {
      aiChat = new AiChat({ id: msg.user });
    } if (action === 'on' || action === 'enable') {
      aiChat.enabled = true;
      await aiChat.save();
      return msg.reply('Chatbot been enabled');
    } else if (action === 'off' || action === 'disable') {
      aiChat.enabled = false;
      await aiChat.save();
      return msg.reply('Chatbot been disabled');
    } else if (action === 'model') {
      const modelIndex = parseInt(args[1]);
      if (isNaN(modelIndex) || modelIndex < 0 || modelIndex >= pollinations.models.chat.length) {
        let md = '*Available AI Models:*\n\n';
        pollinations.models.chat.forEach((model, index) => {
        md += `${index}. ${model.description} (${model.name})\n`;
        });
        md += `\nCurrent model: ${aiChat.modelIndex || 0}\n\nUse: .aichat model <number>`;
        return msg.reply(md);
      }
      aiChat.modelIndex = modelIndex;
      await aiChat.save();
      const sl = pollinations.models.chat[modelIndex];
      return msg.reply(`model changed: ${sl.description}`);
    } else if (action === 'status') {
      const status = aiChat.enabled ? 'Enabled' : 'Disabled';
      const cur = pollinations.models.chat[aiChat.modelIndex || 0];
      return msg.reply(`*AI Chat Status*\n\nStatus: ${status}\nModel: ${cur.description}\n\nuse:\n.aichat on/off - Toggle AI chat\n.aichat model - Change AI model`);
    } else {
      return msg.reply('usage:\n.aichat on - Enable AI chat\n.aichat off - Disable AI chat\n.aichat model - View/change AI model\n.aichat status - View current settings');
    }
});

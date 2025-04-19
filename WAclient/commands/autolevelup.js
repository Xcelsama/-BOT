const {Command} = require('../../lib/command');
const config = require('../../config');
const Levels = require('discord-xp');
Levels.setURL(config.MONGODB_URI);

Command({
  on: 'text'
})(async(msg) => {
  if (!config.XP_SYSTEM) return;
  var ctx = new Map();
  const roles = { 5: "🥉 Bronze",
  10: "🥈 Silver",  15: "🥇 Gold", 20: "💎 Diamond", 25: "👑 Crown", 30: "🌟 Star",  40: "🔮 Master", 50: "🎭 Legend", 60: "❤️ Super Saiyan"
  };
  var _patch = 6; 
   const cu = (ctx.get(msg.sender) || 0) + 1;
    ctx.set(msg.sender, cu);
    if (cu >= _patch) {
      const rx = Math.floor(Math.random() * 10) + 15; 
      const max = await Levels.appendXp(msg.sender, "main", rx);
      ctx.set(msg.sender, 0); 
      if (max) {
        const user = await Levels.fetch(msg.sender, "main");
        var ig = await msg.Profile(msg.sender);
        let type = "🌱 Newbie";
        for (const [level, role] of Object.entries(roles)) {
          if (user.level >= parseInt(level)) {
            type = role;
          }
        }

        await msg.send({image: { url: ig }, caption: `*===[LEVEL UP]===*\n\n*👤 User:* @${msg.sender.split(}\n*📊 Level:* ${user.level}\n*💫 XP:* ${user.xp}\n*🎯 Role:* ${type}\n\n_keep up_`,
          mentions: [msg.sender]
        });
      }
    }
});

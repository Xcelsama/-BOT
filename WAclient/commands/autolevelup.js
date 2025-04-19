
const {Command} = require('../../lib/command');
const Levels = require('discord-xp');

// Connect to MongoDB
Levels.setURL(process.env.MONGODB_URI || "mongodb://localhost:27017/whatsapp");

// Message counter for each user
const messageCounter = new Map();
const MSG_THRESHOLD = 6; // Number of messages needed for XP

const roles = {
  5: "🥉 Bronze",
  10: "🥈 Silver", 
  15: "🥇 Gold",
  20: "💎 Diamond",
  25: "👑 Crown",
  30: "🌟 Star",
  40: "🔮 Master",
  50: "🎭 Legend"
};

const config = require('../../config');

Command({
  on: 'text'
})(async(msg) => {
  if (!config.XP_SYSTEM) return;
  try {
    // Increment message counter for user
    const currentCount = (messageCounter.get(msg.sender) || 0) + 1;
    messageCounter.set(msg.sender, currentCount);

    // Only proceed if message threshold is reached
    if (currentCount >= MSG_THRESHOLD) {
      const randomXp = Math.floor(Math.random() * 10) + 15; // Random XP between 15-25
      const hasLeveledUp = await Levels.appendXp(msg.sender, "main", randomXp);
      messageCounter.set(msg.sender, 0); // Reset counter

      if (hasLeveledUp) {
        const user = await Levels.fetch(msg.sender, "main");
        const ppUrl = await msg.Profile(msg.sender);
        let userRole = "🌱 Newbie";
        
        // Find the highest role for current level
        for (const [level, role] of Object.entries(roles)) {
          if (user.level >= parseInt(level)) {
            userRole = role;
          }
        }

        await msg.reply({
          image: { url: ppUrl },
          caption: `*🎉 LEVEL UP!*\n\n*👤 User:* @${msg.sender.split('@')[0]}\n*📊 Level:* ${user.level}\n*💫 XP:* ${user.xp}\n*🎯 Role:* ${userRole}\n\n_Send ${MSG_THRESHOLD} messages to earn XP!_`,
          mentions: [msg.sender]
        });
      }
    }
  } catch (err) {
    console.error("Error in XP system:", err);
  }
});

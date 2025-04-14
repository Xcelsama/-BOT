const { Command } = require('../../lib/command');

Command({
    cmd_name: "fullpp",
    aliases: ["fp"],
    category: "owner",
    desc: "Set full profile picture"
})
(async ( msg ) => {
        if (!msg.fromMe) return;
        let image;
        if (msg.quoted && msg.quoted.type.includes('image')) {
            const buffer = await msg.quoted.download();
            image = buffer;
        } else if (msg.type.includes('image')) {
            const buffer = await msg.download();
            image = buffer;
        } else {
            return msg.reply('*_Please reply to an image_*');
        }
        var success = await msg.toFullpp(image);
        if (success) {
            await msg.reply('*_Profile picture updated_*');
        } else {
            await msg.reply('_err_');
        }
});

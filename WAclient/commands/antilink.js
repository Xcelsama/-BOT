
const { Command } = require('../../lib/command');
const Group = require('../../lib/DB/schemas/GroupSchema');

Command({
    cmd_name: 'antilink',
    category: 'admin',
    desc: 'Toggle antilink protection for groups'
})(async (msg, text, conn) => {
    if (!msg.isGroup) return msg.reply('This command only works in groups!');
    if (!msg.isAdmin && !msg.isSudo) return msg.reply('Only admins can use this command!');
    
    try {
        let group = await Group.findOne({ id: msg.user });
        if (!group) {
            group = new Group({ id: msg.user });
        }
        
        group.antilink = !group.antilink;
        await group.save();
        
        return msg.reply(`✅ Antilink has been ${group.antilink ? 'enabled' : 'disabled'} in this group`);
    } catch (error) {
        console.error('Antilink error:', error);
        return msg.reply('Failed to toggle antilink status');
    }
});

Command({
    on: 'text'
})(async (msg) => {
    if (!msg.isGroup) return;
    
    try {
        const group = await Group.findOne({ id: msg.user });
        if (!group || !group.antilink) return;
        
        if (msg.isAdmin || msg.isSudo) return;
        if (!msg.isBotAdmin) return;

        const linkRegex = /(https?:\/\/)?(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*)/gi;
        
        if (linkRegex.test(msg.body)) {
            await msg.kickUser(msg.sender);
            return msg.reply('❌ Links are not allowed in this group!');
        }
    } catch (error) {
        console.error('Antilink check error:', error);
    }
});

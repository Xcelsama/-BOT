var {Command} = require('../../lib/command');
const Group = require('../../lib/DB/schemas/GroupSchema');

Command({
    cmd_name: 'antilink',
    category: 'admin',
    desc: 'Toggle antilink protection for groups'
})(async (msg) => {
    if (!msg.isGroup) return;
    if (!msg.isAdmin) return;
        let group = await Group.findOne({ id: msg.user });
        if (!group) { group = new Group({ id: msg.user });
        } group.antilink = !group.antilink;
        await group.save();
        return msg.reply(`✅ Antilink has been ${group.antilink ? 'enabled' : 'disabled'}`);
});

Command({
    on: 'text'
})(async (msg) => {
    if (!msg.isGroup) return;
        const group = await Group.findOne({ id: msg.user });
        if (!group || !group.antilink) return;
        if (msg.isAdmin) return;
        if (!msg.isBotAdmin) return;
        var ctx = /(https?:\/\/)?(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*)/gi;
        if (ctx.test(msg.body)) {
            await msg.kickUser(msg.sender);
            return msg.reply('*===[ANTILINK]===*\n\n_Links not allowed_');
        }
});

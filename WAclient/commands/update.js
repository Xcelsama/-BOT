const git = require('simple-git')();

Command({
    cmd_name: 'update',
    category: 'owner',
    desc: 'Update bot from repo'
})(async (msg) => {
    if (!msg.fromMe) return;
     await msg.reply('*Checking updates...*');
     await git.fetch();
     const st = await git.status();
     if (!st.behind) return msg.reply('*Bot is up to date*');
     const log = await git.log(['HEAD..origin/main']);
     const cl = log.all
            .map(c => `• ${c.message}`)
            .join('\n');
    
        if (msg.body.includes('now')) {
            await msg.reply('*Updating...*');
            await git.pull();
            return msg.reply('*✓ Updated*\n_Restart to apply changes_');
        }
});

const git = require('simple-git')();

Command({
    cmd_name: 'update',
    category: 'owner',
    desc: 'Update bot from repo'
})(async (m, { conn }) => {
    if (!m.fromMe) return m.reply('❌ Owner only');

    try {
        await m.reply('*Checking updates...*');
        await git.fetch();
        
        const st = await git.status();
        if (!st.behind) return m.reply('*Bot is up to date!*');

        const log = await git.log(['HEAD..origin/main']);
        const cl = log.all
            .map(c => `• ${c.message}`)
            .join('\n');

        if (m.body.includes('now')) {
            await m.reply('*Updating...*');
            await git.pull();
            return m.reply('*✓ Updated!*\n_Restart to apply changes_');
        }

        await m.reply(`*Updates found!*\n\n${cl}\n\n_Send .update now to update_`);
        
    } catch (e) {
        console.log('Update error:', e);
        await m.reply('❌ ' + e.message);
    }
});
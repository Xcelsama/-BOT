var { Command } = require('../../lib/command');
var {getTwitterVideo} = require('./Func/twitter.js');

Command({
    cmd_name: 'twitter',
    aliases: ['tw', 'twdl'],
    category: 'downloader',
    desc: 'Download Twitter video'
})(async (msg) => {
    var url = extractUrl(msg.text);
    if (!url && msg.quoted) {
    url = extractUrl(msg.quoted.message?.conversation || msg.quoted.message?.extendedTextMessage?.text || '');}
    if (!url) return msg.reply('*_Please provide a Twitter url_*');
    const data = await getTwitterVideo(url);
    if (!data) return;
    await msg.send({video: { url: data.video },caption: `*Username:* ${data.username}\n*Caption:* ${data.caption}`,mimetype: 'video/mp4'});
});

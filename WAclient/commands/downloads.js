const { Command } = require('../../lib/command');
var { monospace, extractUrl } = require('../../lib/Functions');
const axios = require('axios');

Command({
  cmd_name: 'gitclone',
  aliases: ['git'],
  category: 'downloader',
  desc: 'Download git repo'
})(async (msg) => {
    const me = /(?:https?:\/\/|git@)github\.com[\/:]([^\/\s]+)\/([^\/\s]+)(?:\.git)?/;
    const eg = me.exec(msg.text);
    if (!eg) return msg.reply('_Provide git repo_');
    const [_, username, repo] = eg;
    const api = `https://api.github.com/repos/${username}/${repo.replace(/\.git$/, "")}`;
    const res = await axios.get(api).catch(() => null);
    if (!res || res.status !== 200) return;
    const { name, stargazers_count, forks_count } = res.data;
    const caption = `**Name:** ${name}\n**Forks:** ${forks_count}\n\n*X ASTRAL*`;
    await msg.send({document: { url: `${api}/zipball` }, caption, fileName: `${repo}.zip`, mimetype: "application/zip"});
  });
        
Command({
    cmd_name: 'tiktok',
    aliases: ["tik"],
    category: 'downloader',
    desc: 'Download TikTok video'
})(async (msg, conn) => {
    const url = extractUrl(msg.text);
    if (!url && msg.quoted) {
      url = extractUrl(msg.quoted.message?.conversation || msg.quoted.message?.extendedTextMessage?.text || '');
    }if (!url) return msg.reply('Please provide ttk url');
    const res = await axios.get(`https://diegoson-naxordeve.hf.space/tiktok?url=${url}`);
    if (res.data && res.data.data) {
        const data = res.data.data;
        const voidi = data.hdPlayUrl || data.playUrl;
        const video = await axios.get(voidi, { responseType: 'arraybuffer' });
        await msg.send({video: Buffer.from(video.data, 'binary'), mimetype: 'video/mp4', caption: `*Title:* ${data.title}\n*Music:* ${data.musicTitle}\n*By:* ${data.nickname}\n\n*Stats:*\n▢ ${data.playCount} Plays\n▢ ${data.diggCount} Likes\n▢ ${data.commentCount} Comments\n▢ ${data.shareCount} Shares\n▢ ${data.downloadCount} Downloads`       
        });
    }
});

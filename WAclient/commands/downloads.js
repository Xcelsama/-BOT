const { Command } = require('../../lib/command');
var { monospace, extractUrl } = require('../../Functions');
const axios = require('axios');

Command({
    cmd_name: 'tik',
    category: 'media',
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
        await msg.send({video: Buffer.from(video.data, 'binary'), mimetype: 'video/mp4', caption: `*Title:* ${data.title}\n*Music:* ${data.musicTitle}\n*By:* ${data.musicAuthor}`
        });
    }
});

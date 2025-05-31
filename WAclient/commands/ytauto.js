const { extractUrl, savetube } = require('../../lib/');
const Group = require('../../lib/models/schemas/GroupSchema');
const Ytml = async (msg) => {
  if (!msg.isGroup) return;
  const db = await Group.findOne({ id: msg.user });
  if (!db || !db.autodl) return;
  const url = extractUrl(msg.body);
  if (!url) return;
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    try { if (!savetube.isUrl(url)) return;
      const download = await savetube.download(url, '720');
      if (!download.status) return;
      const result = download.result;
      await msg.send({ video: { url: result.download },caption: `*Title:* ${result.title}\n*Quality:* ${result.quality}p\n*Duration:* ${result.duration}`
      });
    } catch (error) {
      console.log(error);
    }
  }
};

module.exports = { Ytml };

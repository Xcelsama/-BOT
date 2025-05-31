const { extractUrl } = require('../../lib/');
const { twitter } = require('./Func/twitterDl');
const Group = require('../../lib/models/schemas/GroupSchema');

const xDl = async (msg) => {
  if (!msg.isGroup) return;
  const db = await Group.findOne({ id: msg.user });
  if (!db || !db.autodl) return;
  const url = extractUrl(msg.body);
  if (!url) return;
  if (url.includes('twitter.com') || url.includes('x.com')) {
    try { const result = await twitter(url);
      if (!result.downloads || !result.downloads.length) return;
        const v = result.downloads.find(d => 
        d.label.includes('720p') || d.label.includes('HD') || d.label.includes('video')
      ) || result.downloads[0];
      if (v && v.url) {
        await msg.send({video: { url: v.url },caption: `*Title:* ${result.title || 'Twitter'}\n*Duration:* ${result.duration || '.'}`
        });
      }
    } catch (error) {
      console.log(error);
    }
  }
};

module.exports = { xDl };
          

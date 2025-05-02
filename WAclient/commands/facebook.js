var { Command } = require('../../lib/command');
const { extractUrl } = require('../../lib/Functions');
var config = require('../../config');
var axios = require('axios');

Command({
  cmd_name: 'fb',
  aliases: ["facebook"],
  category: 'downloader',
  desc: 'Download Facebook videos'
})(async (msg) => {
  let url = extractUrl(msg.text);
  if (!url && msg.quoted) {
    url = extractUrl(
      msg.quoted.message?.conversation || 
      msg.quoted.message?.extendedTextMessage?.text || ''
    );
  } 
  if (!url) return msg.reply('Please provide a facebook url');
  let { data } = await axios.get(`${config.API}/facebook?url=${url}`);
  if (data.status !== 200 || !data.data) return;
  let vid = data.data['720p (HD)'] || data.data['360p (SD)'];
  if (!vid) return;
  await msg.send({video: { url: vid }, caption: `*▢Quality:* ${data.data['720p (HD)'] ? 'HD (720p)' : 'SD (360p)'}\n*Made with❤️*`});
});

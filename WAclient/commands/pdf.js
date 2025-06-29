const { Command } = require('../../lib/command');
const axios = require('axios');

Command({
  cmd_name: 'pdf',
  category: 'downloader',
  desc: 'Download and send a PDF'
})(async (msg, text) => {
  if (!text || !text.startsWith('http')) return msg.reply('_Please provide a valid direct PDF url_');
  if (!text.includes('.pdf')) return msg.reply('_The link must point to a PDF file_');
  const response = await axios.get(text, {
    responseType: 'arraybuffer',
    timeout: 15000
  }).catch(() => null);

  if (!response || response.status !== 200) return;
  await msg.send({document: Buffer.from(response.data), mimetype: 'application/pdf',fileName: 'file.pdf' });
});
  

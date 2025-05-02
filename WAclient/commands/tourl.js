const { Command } = require('../../lib/command');
const { fromBuffer } = require('file-type');
const FormData = require('form-data');
const fetch = require('node-fetch');

const catbox = async (buffer) => {
  let { ext } = await fromBuffer(buffer);
  let bodyForm = new FormData();
  bodyForm.append("fileToUpload", buffer, "file." + ext);
  bodyForm.append("reqtype", "fileupload");
  let res = await fetch("https://catbox.moe/user/api.php", {
    method: "POST",
    body: bodyForm,
  });

  let data = await res.text();
  return data;
};

Command({
    cmd_name: 'tourl',
    aliases: ['upload'],
    category: 'tools',
    desc: 'Upload media to catbox and get url'
})(async (msg) => {
    if (!msg.quoted) return msg.reply('*Reply to a media message*');
    const buffer = await msg.quoted.download();
    if (!buffer) return;
    try { const url = await catbox(buffer);
    await msg.reply(`\n${url}`);
    } catch (error) {
    await msg.reply('*err*');
    }
});

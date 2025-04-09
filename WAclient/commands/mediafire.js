const axios = require("axios");
var config = require('../../config');
var { Command } = require('../../lib/command');
let {extractUrl} = require('../../lib/Functions');

Command({
    cmd_name: "mediafire",
    aliases: ["mf", "mfire"],
    category: "downloader",
    desc: "Download MediaFire file"
})(async (msg) => {
    let url = extractUrl(msg.text);
    if (!url && msg.quoted) {
        url = extractUrl(
            msg.quoted.message?.conversation || msg.quoted.message?.extendedTextMessage?.text || ""
        );
    }
    if (!url || !url.startsWith("https://www.mediafire.com/")) return msg.reply("*_Please provide a valid mediafire url_*");
    const api = `${config.API}/mediafire?url=${url}`;
    const { data } = await axios.get(api);
    if (data?.downloadLink) {
        await msg.send({document: { url: data.downloadLink },fileName: data.fileName, mimetype: 'application/octet-stream', caption: `*Name:* ${data.fileName}\n*Size:* ${data.fileSize}\n*X ASTRAL*`
        });
    }
});
      

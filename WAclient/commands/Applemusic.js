var { Command } = require("../lib/command");
var {downloadAppleMusic} = require("./Func//appleDl");
var {AddMetadata} = require("./Func/Mp3Data");

Command({
  cmd_name: "appledl",
  category: "downloader",
  desc: "Download songs from Apple Music"
})(async (msg) => {
  if (!msg.text) return msg.reply("Provide a valid Apple Music track url");
  let result = await downloadAppleMusic(msg.text);
  if (!result || !result.downloadUrl) return;
  let audioBuffer = await AddMetadata(result.downloadUrl, result.metadata.cover, { 
    title: result.metadata.name, 
    artist: result.metadata.artist.name, 
    album: result.metadata.album.name 
  });

  await msg.send({audio: audioBuffer,mimetype: "audio/mpeg"});
});
    

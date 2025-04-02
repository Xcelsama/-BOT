var { Command } = require("../../lib/command");
var {downloadAppleMusic} = require("./Func//appleDl");
var {AddMetadata} = require("./Func/Mp3Data");
var { searchAppleMusic } = require("./Func/appleSearch");

Command({
  cmd_name: "applesearch",
  category: "search",
  desc: "Search for songs on Apple Music"
})(async (msg) => {
  if (!msg.text) return msg.reply("_Provide a song name to search_");
  let results = await searchAppleMusic(msg.text);
  if (!results || results.length === 0) return;
  results = results.slice(0, 12); 
  let res = results.map((song, i) => 
    `*Apple Search*:\n\n*${i + 1}${song.title}*\n*▢Artist:* ${song.artist.name}\n${song.song}`
  ).join("\n\n");

  await msg.reply(res);
});

Command({
  cmd_name: "applemusic",
  aliases: ["appledl"],
  category: "downloader",
  desc: "Download songs from Apple Music"
})(async (msg) => {
  if (!msg.text) return msg.reply("Provide a valid Apple Music track url");
  let result = await downloadAppleMusic(msg.text);
  if (!result || !result.downloadUrl) return;
  msg.reply(`*Downloading: ${results.title}...*`);
  let aud = await AddMetadata(result.downloadUrl, result.metadata.cover, { 
    title: result.metadata.name, 
    artist: result.metadata.artist.name, 
    album: result.metadata.album.name 
  });

  await msg.send({audio: aud,mimetype: "audio/mpeg"});
});
    

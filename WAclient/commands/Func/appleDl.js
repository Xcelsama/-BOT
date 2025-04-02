const axios = require("axios");

async function downloadAppleMusic(url) {
  if (!url.includes("music.apple.com")) return null;
  try {let sear = await axios.get("https://aaplmusicdownloader.com/api/composer/ytsearch/mytsearch.php",{ params: { link: url } });
    if (!sear.data?.videoid) return null;
    let dld = await axios.get("https://aaplmusicdownloader.com/api/ytdl.php?q=" + sear.data.videoid);
    if (!dld.data?.dlink) return null;
    return { downloadUrl: dld.data.dlink };
  } catch {
    return null;
  }
}

module.exports = {downloadAppleMusic};

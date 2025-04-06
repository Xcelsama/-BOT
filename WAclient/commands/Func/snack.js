const axios = require("axios");
const cheerio = require("cheerio");

async function snackSearch(q) {
  const res = await axios.get("https://www.snackvideo.com/discover/" + q);
  const $ = cheerio.load(res.data);
  const content = $("#ItemList").text().trim();
  if (!content) throw { msg: "opps" };
  const json = JSON.parse(content);
  return json.map((a) => ({
    title: a.name,
    thumbnail: a.thumbnailUrl[0],
    uploaded: new Date(a.uploadDate).toLocaleString(),
    stats: {
      watch: a.interactionStatistic[0].userInteractionCount,
      likes: a.interactionStatistic[1].userInteractionCount,
      comment: a.commentCount,
      share: a.interactionStatistic[2].userInteractionCount,
    },
    author: {
      name: a.creator.mainEntity.name,
      alt_name: a.creator.mainEntity.alternateName,
      bio: a.creator.mainEntity.description,
      avatar: a.creator.mainEntity.image,
      stats: {
        likes: a.creator.mainEntity.interactionStatistic[0].userInteractionCount,
        followers: a.creator.mainEntity.interactionStatistic[1].userInteractionCount,
      },
    },
    url: a.url,
  }));
}

async function snackDownload(url) {
  const res = await axios.get(url);
  const $ = cheerio.load(res.data);
  const json = JSON.parse($("#VideoObject").text().trim());
  return {
    metadata: {
      title: json.name,
      thumbnail: json.thumbnailUrl[0],
      uploaded: new Date(json.uploadDate).toLocaleString(),
      comment: json.commentCount,
      watch: json.interactionStatistic[0].userInteractionCount,
      likes: json.interactionStatistic[1].userInteractionCount,
      share: json.interactionStatistic[2].userInteractionCount,
      author: json.creator.mainEntity.name,
    },
    download: json.contentUrl,
  };
}

module.exports = { snackSearch, snackDownload };

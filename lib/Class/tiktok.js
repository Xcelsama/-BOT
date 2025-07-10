const axios = require('axios');
const qs = require('qs');

class TikTok {
  constructor() {
    this.apiUrl = 'https://tikwm.com/api/';
    this.headers = {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Accept': 'application/json, text/javascript, */*; q=0.01',
      'X-Requested-With': 'XMLHttpRequest'
    };
  }

  async download(url) {
    try {
      const data = qs.stringify({
        url: url,
        count: 12,
        cursor: 0,
        web: 1,
        hd: 1
      });

      const response = await axios.post(this.apiUrl, data, {
        headers: this.headers
      });
      if (response.data.code === 0) {
        const videoData = response.data.data;
        return {
          author: "naxor",
          status: 200,
          data: {
            id: videoData.id,
            title: videoData.title,
            cover: `https://tikwm.com${videoData.cover}`,
            playUrl: `https://tikwm.com${videoData.play}`,
            hdPlayUrl: `https://tikwm.com${videoData.hdplay}`,
            musicUrl: `https://tikwm.com${videoData.music}`,
            musicTitle: videoData.music_info.title,
            musicAuthor: videoData.music_info.author,
            playCount: videoData.play_count,
            diggCount: videoData.digg_count,
            commentCount: videoData.comment_count,
            shareCount: videoData.share_count,
            downloadCount: videoData.download_count,
            avatar: `https://tikwm.com${videoData.author.avatar}`,
            nickname: videoData.author.nickname,
            isAd: videoData.is_ad,
          }
        };
      }

      return {
        author: "naxor",
        status: 400,
        message: "err"
      };
    } catch (error) {
      return {
        author: "naxor",
        status: 500,
        error: error.message
      };
    }
  }
}

module.exports = TikTok;
      

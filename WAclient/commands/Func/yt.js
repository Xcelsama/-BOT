var axios = require('axios');

const getYouTubeMP3 = async (url) => {
    if (!url || typeof url !== "string") throw new Error("Invalid url");
    const a = `https://bk9.fun/download/ytmp3?url=${url}`;
    const { data } = await axios.get(a, { timeout: 10000 });
    if (!data.status || !data.BK9) throw new Error("Invalid");

    return {
        id: data.BK9.id,
        title: data.BK9.title,
        thumbnail: data.BK9.image,
        downloadUrl: data.BK9.downloadUrl,
    };
};

module.exports = { getYouTubeMP3 };

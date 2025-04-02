const axios = require("axios");

const getTwitterVideo = async (url) => {
    if (!url || typeof url !== "string") throw new Error("Invalid url");
    const xxx = `https://bk9.fun/download/twitter?url=${url}`;
    const { data } = await axios.get(xxx, { timeout: 10000 });
    if (!data.status || !data.BK9) throw new Error("Invalid");
    return {
        username: data.BK9.username,
        caption: data.BK9.caption,
        thumbnail: data.BK9.thumbnail,
        video: data.BK9.HD,
    };
};

module.exports = { getTwitterVideo };

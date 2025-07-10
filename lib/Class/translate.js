const fetch = require('node-fetch');

class Translator {
  constructor() {
    this.baseUrl = 'https://translate.googleapis.com/translate_a/single';
  }

  async translate(query = "", lang) {
    if (!query.trim()) return "";
    try {
      const url = new URL(this.baseUrl);
      url.searchParams.append("client", "gtx");
      url.searchParams.append("sl", "auto");
      url.searchParams.append("dt", "t");
      url.searchParams.append("tl", lang);
      url.searchParams.append("q", query);
      const response = await fetch(url.href);
      const data = await response.json();
      const translatedText = data ? data[0].map(([a]) => a).join(" ") : "";  
      return {
        author: "naxor",
        status: 200,
        data: {
          originalText: query,
          translatedText: translatedText,
          targetLanguage: lang,
          sourceLanguage: data[2] || 'auto'
        }
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

module.exports = Translator;

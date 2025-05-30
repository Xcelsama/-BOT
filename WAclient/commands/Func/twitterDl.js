const axios = require('axios');
const cheerio = require('cheerio');


const twitter = async (url) => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await axios("https://savetwitter.net/api/ajaxSearch", {
        method: "POST",
        headers: {
          "content-type": "application/x-www-form-urlencoded; charset=UTF-8"
        },
        data: `q=${encodeURIComponent(url)}&lang=en&cftoken=`
      });

      const $ = cheerio.load(response.data.data);
      
      const title = $('.tw-middle h3').text().trim();
      const duration = $('.tw-middle p').text().trim();
      const twitterId = $('#TwitterId').val();
      const thumbnail = $('.image-tw img').attr('src');

      const downloads = [];
      $('.dl-action a.tw-button-dl').each((i, el) => {
        downloads.push({
          label: $(el).text().trim(),
          url: $(el).attr('href'),
          isConvert: $(el).hasClass('action-convert'),
          audioUrl: $(el).data('audiourl') || null,
        });
      });

      const scriptContent = $('script')
        .map((i, el) => $(el).html())
        .get()
        .join('\n');

      const k_url_convert = /k_url_convert\s*=\s*["']([^"']+)["']/.exec(scriptContent)?.[1];
      const k_exp = /k_exp\s*=\s*["']([^"']+)["']/.exec(scriptContent)?.[1];
      const k_token = /k_token\s*=\s*["']([^"']+)["']/.exec(scriptContent)?.[1];
      const result = {
        title,
        duration,
        twitterId,
        thumbnail,
        downloads,
        metadata: {
          k_url_convert,
          k_exp,
          k_token,
        },
      };

      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { twitter };
  

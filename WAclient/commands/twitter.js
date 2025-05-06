const { Command } = require('../../lib/command');
const { extractUrl } = require('../../lib/Functions');
const axios = require('axios');
const cheerio = require('cheerio');

Command({
    cmd_name: 'twitter',
    aliases: ['xdl', 'xtwitter', 'x'],
    category: 'downloader',
    desc: 'Download Twitter/X videos'
})(async (msg) => {
    let url = extractUrl(msg.text);
    if (!url && msg.quoted) {
    url = extractUrl(msg.quoted.message?.conversation || msg.quoted.message?.extendedTextMessage?.text || ''); }
    if (!url) return msg.reply('*Please provide a Twitter/X URL*');
    const xtwt = async (url) => {
    try { const res = await axios.post('https://twmate.com/', new URLSearchParams({
    page: url,ftype: 'all',ajax: '1'
    }), {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8','Accept': '*/*','X-Requested-With': 'XMLHttpRequest','User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Mobile Safari/537.36',
    'Referer': 'https://twmate.com/',
         }
    });
        const $ = cheerio.load(res.data);
        const vid = [];
        $('.btn-dl').each((index, element) => {
        const quality = $(element).parent().prev().text().trim();  
        const dl_url = $(element).attr('href');
        vid.push({ quality, dl_url });
    }); return vid;
    } catch (error) { console.error(error);
        return null;
        }
    };
     const links = await xtwt(url);
     if (!links || links.length === 0) {
     return msg.reply('opez'); }
     const video = links[links.length - 1];
     await msg.send({video: { url: video.dl_url },caption: `*Quality:* ${video.quality}`,mimetype: 'video/mp4'
    });

});
                        

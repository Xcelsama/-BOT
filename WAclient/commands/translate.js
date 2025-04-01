const { Command } = require('../../lib/command');
const axios = require('axios');

Command({
    cmd_name: 'trt',
    aliases: ['translate'],
    category: 'tools',
    desc: 'Translate text to specified language'
})(async (msg) => {
    let txt = msg.text;
    if (!txt && msg.quoted) {
        txt = msg.quoted.message?.conversation || 
                  msg.quoted.message?.extendedTextMessage?.text || '';
    }
    
    if (!txt) return msg.reply('Please provide text and language code\nExample: .trt Hello world|en\nOr reply to a msg');
    const [query, lang = 'en'] = textToTranslate.split('|').map(item => item.trim());
    if (!query) return msg.reply('Please provide text to translate');
    const { data } = await axios.get(`https://diegoson-naxordeve.hf.space/translate?query=${query}&lang=${lang}`);
    if (data?.translatedText) {
        await msg.reply(`\n*${data.translatedText}*`);
    }
});

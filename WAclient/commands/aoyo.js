const axios = require("axios");
var { Command } = require('../../lib/command');
Command({
    cmd_name: 'aoyo',
    aliases: ['aiexp'],
    category: 'AI',
    desc: 'Ask AI a question'
})(async (msg) => {
    const question = msg.text;
    if (!question) return msg.reply('*_Please provide a question_*');
    await msg.send({ text: '*Thinking...*' }).then(async (m) => {
        const { data } = await axios.get(
            `https://fastrestapis.fasturl.cloud/aiexperience/aoyo?ask=${question}`,
            { headers: { accept: 'application/json' }, timeout: 10000 }
        );

        if (data?.status === 200 && data?.result) {
            await msg.send({ text: `${data.result.answer}`, edit: m.key });
        }
    });
});
   

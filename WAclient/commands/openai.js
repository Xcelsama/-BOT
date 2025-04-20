const {Command} = require('../../lib/command');
const axios = require('axios');
const fetch = require('node-fetch');
var config = require('../../config');

Command({
    cmd_name: 'groq',
    category: 'AI',
    desc: 'Generate AI response'
})(async (msg) => {
    if (!config.GROK_API) return msg.reply("Groq API key is missing");
    const m = msg.text;
    if (!m) return msg.reply("Please provide a message");
    var v = await msg.send("Processing...");
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${config.GROK_API}` }, 
        body: JSON.stringify({ model: "llama-3.3-70b-versatile", messages: [{ role: "user", content: m }] })
    });
    var data = await res.json();
    if (data.choices?.[0]?.message?.content?.trim()) 
        await msg.send({ text: data.choices[0].message.content.trim(), edit: v.key });
});
Command({
    cmd_name: 'llama',
    category: 'AI',
    desc: 'Chat with Llama AI'
})(async (msg, conn) => {
    const query = msg.text;
    if (!query) return msg.reply('_Please provide a query_');
    const res = await axios.get(`https://nikka-api.vercel.app/ai/llama?q=${query}`);
    if (res.data && res.data.data) {
        await msg.reply(res.data.data);
    } 
});

Command({
    cmd_name: 'teachme',
    category: 'AI',
    desc: 'Get educational responses from TeachMe AI'
})(async (msg, conn) => {
    var query = msg.text;
    if (!query) return msg.reply('_Please provide a query_');
    var res = await axios.get(`https://nikka-api.vercel.app/ai/teachme?q=${query}&apiKey=nikka`);
    if (res.data && res.data.data && res.data.data.data) {
        await msg.reply(res.data.data.data);
    } 
});

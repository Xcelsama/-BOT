const { GoogleGenAI } = require('@google/genai');
const { Command } = require("../../lib/command");
var config = require("../../config");

Command({
    cmd_name: "gemini",
    category: "AI",
    desc: "Google gemini pro"
})(async (msg) => {
    if (!config.GEMINI_API_KEY) return msg.reply("*Missing GEMINI_API_KEY please provide api*");
    if (!msg.text && !msg.quoted?.image) return msg.reply("*_Please provide a prompt_*");
    var v = await msg.send("Processing...");
    const ai = new GoogleGenAI({ apiKey: config.GEMINI_API_KEY });
    try {
        if (msg.quoted?.image) {
            const model = ai.getGenerativeModel({ model: "gemini-pro-vision" });
            var img = await msg.quoted.download();
            const result = await model.generateContent([img, msg.text || "Describe this image"]);
            const res = await result.response;
            await msg.send({ text: res.text(), edit: v.key });
        } else {
            const model = ai.getGenerativeModel({ model: "gemini-pro" });
            const result = await model.generateContent(msg.text);
            const res = await result.response;
            await msg.send({ text: res.text(), edit: v.key });
        }
    } catch (error) {
        await msg.send({ text: error.message, edit: v.key });
    }
});

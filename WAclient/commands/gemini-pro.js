const genai = require('@google/genai');
const {Command} = require("../../lib/command");
var config = require("../../config");

Command({
    cmd_name: "gemini",
    category: "AI",
    desc: "Google gemini pro"
})(async (msg) => {
    if (!config.GEMINI_API_KEY) return msg.reply("*Missing GEMINI_API_KEY please provide api*");
    if (!msg.text && !msg.quoted?.image) return msg.reply("*_Please provide a prompt_*");
    var v = await msg.send("Processing..."); 
        genai.configure({ apiKey: config.GEMINI_API_KEY });
        if (msg.quoted?.image) {
            const model = genai.getGenerativeModel({ model: "gemini-pro-vision" });
            var img = await msg.quoted.download();
            const result = await model.generateContent([img, msg.text || "Describe this image"]);
            let res = await result.response;
            await msg.send({ text: res.text(), edit: v.key });
        } else {
            var model = genai.getGenerativeModel({ model: "gemini-pro" });
            const result = await model.generateContent(msg.text);
            let res = await result.response;
            await msg.send({ text: res.text(), edit: v.key });
        }
});

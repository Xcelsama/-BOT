const axios = require("axios");
var { Command } = require("../../lib/command");

Command({
  cmd_name: "deepseek",
  category: "AI",
  desc: "Chat with DeepSeek AI",
  })(async (msg) => {
   if (!msg.text) return msg.send("_Please provide a q_");
   const { data } = await axios
      .post("https://ai.clauodflare.workers.dev/chat", {
        model: "@cf/deepseek-ai/deepseek-r1-distill-qwen-32b",
        messages: [{ role: "user", content: msg.text }],
      })
      .catch((e) => e.response);

    const v = data?.data?.response?.split("</think>").pop()?.trim() || "_ehe_";
    await msg.reply(v);
});

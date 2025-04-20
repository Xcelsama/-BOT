const fetch = require("node-fetch");
var {Command} = require('../../lib/command');
var config = require('../../config');

Command({
  cmd_name: "askai",
  category: "AI",
  desc: "Ask Gemini AI anything",
}) 
async (msg) => {
  if (!msg.text) return msg.reply("*_Please provide a prompt_*");
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${config.GEMINI_API_KEY}`;
  const body = { contents: [
      {
        parts: [
          { text: msg.text }
        ]
      }
    ]
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  const json = await res.json();
  const reply = json?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!reply) return;
  return msg.reply(reply);
};

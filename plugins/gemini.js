const { Module } = require('../lib/plugins');

Module({
  command: 'gemini',
  package: 'ai',
  description: 'Ask Gemini any'
})(async (message, match) => {
  const Gemini = require('../lib/Gemini');
  const g = new Gemini();
  if (!match && !message.quoted) return await message.send('_prompt or reply to an image_');
  let buffer = null;
  if (message.quoted && message.quoted.type === 'image') {
  buffer = await message.quoted.download(); }
  const res = await g.chat({
    prompt: match,
    img: buffer
  });

  if (!res || !res.candidates?.length) return await message.send("_tyr maybe ldk_");
  const output = res.candidates[0]?.content?.parts?.map(x => x.text).join("\n");
  await message.send(output);
});

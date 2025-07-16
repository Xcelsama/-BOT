const { Module } = require('../lib/plugins');
const { Quiz } = require('anime-quiz');
const quiz = new Quiz();
const sessions = new Map();

Module({
  command: 'animequiz',
  package: 'games',
  description: 'Play an Anime quiz game',
})(async (message) => {
  await startQuiz(message);
});

Module({
  on: 'text'
})(async (message) => {
  const session = sessions.get(message.sender);
  const text = message.body?.trim().toLowerCase();
  if (!session || !text) return;
  const current = session.quiz;
  const guess = text.length === 1 && parseInt(text)
  ? current.options[parseInt(text) - 1]?.toLowerCase()
  : text;
  if (guess === current.answer.toLowerCase()) {
    clearTimeout(session.timeout);
    await message.send('✅ Correct\n\n_Next question coming..._');
    setTimeout(() => startQuiz(message), 2000);
  } else {
    clearTimeout(session.timeout);
    await message.send(`❌ Wrong\nAnswer was: *${current.answer}*`);
    sessions.delete(message.sender);
  }
});

async function startQuiz(message) {
  const data = quiz.getRandom();
  let text = `🎌 *Anime Quiz Game*\n\n`;
  text += `🧠 *Question:*\n${data.question}\n\n`;
  text += `🎯 *Options:*\n`;
  text += `1️⃣  ${data.options[0]}\n`;
  text += `2️⃣  ${data.options[1]}\n`;
  text += `3️⃣  ${data.options[2]}\n`;
  text += `4️⃣  ${data.options[3]}\n`;
  text += `\n💬 _Reply with the correct num (1-4)_`;

  const timeout = setTimeout(() => {
    message.send('⏱️ Time\'s up Quiz ended');
    sessions.delete(message.sender);
  }, 60000);

  sessions.set(message.sender, {quiz: data,timeout,});
  await message.send(text);
   }

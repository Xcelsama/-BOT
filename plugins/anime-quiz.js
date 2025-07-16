const { Module } = require('../lib/plugins');
const { Quiz } = require('anime-quiz');
const he = require('he');
const quiz = new Quiz();
const sessions = new Map();

Module({
  command: 'animequiz',
  package: 'games',
  description: 'Play an Anime quiz game'
})(async (message, match) => {
  if (!message.isGroup) return;
  if (sessions.has(message.from)) return await message.send('A quiz is already running in this group');
  const max = parseInt(match) || 0;
  await startQuiz(message, { maxQuestions: max });
});

Module({
  on: 'text'
})(async (message) => {
  if (!message.isGroup) return;
  const session = sessions.get(message.from);
  if (!session || message.sender !== session.starter) return;
  const text = message.body?.trim().toLowerCase();
  if (!text) return;
  const options = session.quiz.options;
  const correct = session.quiz.answer.toLowerCase();
  const guess = /^\d+$/.test(text) ? options[parseInt(text) - 1]?.toLowerCase() : text;
  clearTimeout(session.timeout);
  if (guess === correct) {
    session.score++;
    session.asked++;
    if (session.max > 0 && session.asked >= session.max) {
      await message.send(`🎉 Quiz Complete\n\n🏅 Final Score: *${session.score}*`);
      return sessions.delete(message.from);
    }

  await message.send(`✅ Correct\n🏅 Score: *${session.score}*  ❤️ Lives: *${session.lives}*\n\n_Next question coming..._`);
  return setTimeout(() => startQuiz(message, session), 1500);
  }

  session.lives--;
  if (session.lives <= 0) {
  await message.send(`*Wrong*\n💀 Game Over\n\n📊 Final Score: *${session.score}*`);
  return sessions.delete(message.from);}
  await message.send(`*Wrong*\n💡 Correct Answer: *${session.quiz.answer}*\n❤️ Lives Left: *${session.lives}*\n\n_Next question coming..._`);
  setTimeout(() => startQuiz(message, session), 1500);
});

async function startQuiz(message, existing = null) {
  const raw = quiz.getRandom();
  const data = {
    question: he.decode(raw.question),
    options: raw.options.map(opt => he.decode(opt)),
    answer: he.decode(raw.answer)
  };

  const session = existing ?? {
    score: 0,
    lives: 3,
    asked: 0,
    max: 0,
    starter: message.sender
  };

  session.quiz = data;
  session.timeout = setTimeout(() => {
    message.send('Time\'s up Quiz ended');
    sessions.delete(message.from);
  }, 60000);

  sessions.set(message.from, session);
  let text = `🎌 *Anime Quiz Game*\n\n`;
  text += `🧠 *Question:*\n${data.question}\n\n`;
  text += `🎯 *Options:*\n`;
  data.options.forEach((opt, i) => {
    text += `${i + 1}️⃣  ${opt}\n`;
  });

  text += `\n*❤️ Lives:* *${session.lives}*\n*🏅 Score:* *${session.score}*`;
  if (session.max > 0) {
  text += `\n*📋 Question:* *${session.asked + 1}/${session.max}*`;
  }

  text += `\n💬 _Reply with the correct num (1-4)_`;
  await message.send(text);
}

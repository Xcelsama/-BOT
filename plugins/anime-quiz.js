const { Module } = require('../lib/plugins');
const { Quiz } = require('anime-quiz');
const quiz = new Quiz();
const sessions = new Map();

Module({
  command: 'animequiz',
  package: 'games',
  description: 'Play an Anime quiz game',
})(async (message, match) => {
  if (!message.isGroup) return;
  if (sessions.has(message.from)) {
  return await message.send('_A quiz is already running in this group_');}
  const max = parseInt(match) || 0;
  await startQuiz(message, { maxQuestions: max });
});

Module({
  on: 'text'
})(async (message) => {
  if (!message.isGroup) return;
  const session = sessions.get(message.from);
  if (!session) return;
  if (message.sender !== session.starter) return;
  const text = message.body?.trim().toLowerCase();
  if (!text) return;
  const current = session.quiz;
  const guess = text.length === 1 && parseInt(text)
  ? current.options[parseInt(text) - 1]?.toLowerCase()
  : text;
  if (guess === current.answer.toLowerCase()) {
    clearTimeout(session.timeout);
    session.score++;
    session.askedQuestions++;
    if (session.maxQuestions > 0 && session.askedQuestions >= session.maxQuestions) {
    await message.send(`🎉 You completed ${session.maxQuestions} questions\n\n🏅 Final Score: *${session.score}*`);
    sessions.delete(message.from);
    return;
    }

    await message.send(`✅ Correct\n🏅 Score: *${session.score}*\n❤️ Lives: *${session.lives}*\n\n_Next question coming..._`);
    setTimeout(() => startQuiz(message, session), 2000);
  } else {
    session.lives--;
    if (session.lives <= 0) {
      clearTimeout(session.timeout);
      await message.send(`❌ Wrong\n💀 Game Over\n\n📊 Final Score: *${session.score}*`);
      sessions.delete(message.from);
    } else {
      clearTimeout(session.timeout);
      await message.send(`❌ Wrong\n💡 Correct answer: *${current.answer}*\n❤️ Lives left: *${session.lives}*\n\n_Next question coming..._`);
      setTimeout(() => startQuiz(message, session), 2000);
    }
  }
});

async function startQuiz(message, existing = null) {
  const data = quiz.getRandom();
  const timeout = setTimeout(() => {
    message.send('⏱️ Time\'s up Game ended');
    sessions.delete(message.from);
  }, 60000);

  const session = existing || {
    quiz: null,
    score: 0,
    lives: 3,
    askedQuestions: 0,
    maxQuestions: 0,
    timeout: null,
    starter: message.sender,
  };

  session.quiz = data;
  session.timeout = timeout;
  if (!existing) session.maxQuestions = session.maxQuestions || 0;
  sessions.set(message.from, session);
  let text = `🎌 *Anime Quiz Game*\n\n`;
  text += `🧠 *Question:*\n${data.question}\n\n`;
  text += `🎯 *Options:*\n`;
  text += `1️⃣  ${data.options[0]}\n`;
  text += `2️⃣  ${data.options[1]}\n`;
  text += `3️⃣  ${data.options[2]}\n`;
  text += `4️⃣  ${data.options[3]}\n`;
  text += `\n*❤️ Lives:* *${session.lives}*\n*🏅 Score:* *${session.score}*`;
  if (session.maxQuestions > 0) {
    text += `   📋 Question: *${session.askedQuestions + 1}/${session.maxQuestions}*`;
  }
  text += `\n💬 _Reply with the correct num (1-4)_`;
  await message.send(text);
}

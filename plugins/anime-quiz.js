const { Module } = require('../lib/plugins');
const { Quiz } = require('anime-quiz');
const game = new Map();

Module({
  command: 'animequiz',
  description: 'Anime quiz game for groups only',
})(async (message) => {
  if (!message.isGroup) return;
  if (game.has(message.from)) return await message.reply('A quiz is already running');
  const quiz = new Quiz();
  const get = quiz.getRandom();
  const session = {starter: message.sender,score: 0,lives: 3,current: get,total: 1,quiz,};
  game.set(message.from, session);
  const options = get.options.map((opt, i) => `${i + 1}. ${opt}`).join('\n');
  const content = `*🎌 Anime Quiz Game*\n\n*🧠 Question:*\n${get.question}\n\n*🎯 Options:*\n${options}\n\n*❤️ Lives:* *${session.lives}*\n*🏅 Score:* *${session.score}*\n*📋 Question:* *${session.total}/6*\n*💬 _Reply with the correct num (1-4)_*`;
  await message.send(content);
});

Module({
  on: 'text',
})(async (message) => {
  const session = game.get(message.from);
  if (!session || message.sender !== session.starter) return;
  const answer = message.body.trim();
  const a = session.current.answer;
  const options = session.current.options;
  const selected =
    /^[1-4]$/.test(answer) && options[parseInt(answer) - 1]
      ? options[parseInt(answer) - 1]
      : options.find((opt) => opt.toLowerCase() === answer.toLowerCase());
  if (!selected) return;
  if (selected === a) {
    session.score++;
  } else {
    session.lives--;
  }

  if (session.lives === 0 || session.total >= 6) {
    game.delete(message.from);
    return await message.send(
      `🛑 *Game Over*\n\n*🏅 Final Score:* *${session.score}* / ${session.total}`
    );
  }

  const next = session.quiz.getRandom();
  session.current = next;
  session.total++;
  const op = next.options.map((opt, i) => `${i + 1}. ${opt}`).join('\n');
  const re = `${selected === a ? '✅ *Correct!*' : '❌ *Wrong*'}\n\n🧠 *Question:*\n${next.question}\n\n🎯 *Options:*\n${op}\n\n*❤️ Lives:* *${session.lives}*\n*🏅 Score:* *${session.score}*\n*📋 Question:* *${session.total}/6*\n*💬 _Reply with the correct num (1-4)_*`;
  await message.send(re);
});

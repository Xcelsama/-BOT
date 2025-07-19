const { Module } = require('../lib/plugins');
const { Quiz } = require('anime-quiz');
const game = new Map();

Module({
  command: 'animequiz',
  package: 'games',
  description: 'Anime quiz game for groups only',
})(async (message, match) => {
  if (!message.isGroup) return;
  if (game.has(message.from)) return await message.reply('_A quiz is already running_');
  const count = Math.min(parseInt(match) || 6, 20);
  const quiz = new Quiz();
  const get = quiz.getRandom();
  const session = {
    starter: message.sender,
    score: 0,
    lives: 3,
    total: 1,
    max: count,
    quiz,
    current: get
  };
  game.set(message.from, session);
  const options = get.options.map((opt, i) => `${i + 1}. ${opt}`).join('\n');
  const content = `🎌 *Anime Quiz Game*\n\n🧠 *Question:*\n${get.question}\n\n🎯 *Options:*\n${options}\n\n❤️ *Lives:* ${session.lives}\n🏅 *Score:* ${session.score}\n📋 *Question:* ${session.total}/${session.max}\n\n*💬 Reply with the correct num (1-4)*`;
  await message.send(content);
});

Module({
  on: 'text',
})(async (message) => {
  const session = game.get(message.from);
  if (!session || message.sender !== session.starter) return;
  const body = message.body.trim();
  if (!/^[1-4]$/.test(body)) return;
  const index = parseInt(body) - 1;
  const options = session.current.options;
  const correct = session.current.answer;
  const selected = options[index];
  if (!selected) return;
  let feedback;
  if (selected === correct) {
    session.score++;
    feedback = '✅ *Correct*';
  } else {
    session.lives--;
    feedback = `❌ *Wrong*\n✅ *Answer:* ${correct}`; }
  if (session.lives === 0 || session.total >= session.max) {
    game.delete(message.from);
    return await message.send(
      `🛑 *Game Over*\n\n🏅 *Final Score:* ${session.score} / ${session.total}`
    );
  }

  const next = session.quiz.getRandom();
  session.current = next;
  session.total++;
  const op = next.options.map((opt, i) => `${i + 1}. ${opt}`).join('\n');
  const q = `${feedback}\n\n🧠 *Question:*\n${next.question}\n\n🎯 *Options:*\n${op}\n\n❤️ *Lives:* ${session.lives}\n🏅 *Score:* ${session.score}\n📋 *Question:* ${session.total}/${session.max}\n\n*💬 Reply with the correct num (1-4)*`;
  await message.send(q);
});

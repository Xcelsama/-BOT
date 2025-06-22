const { Command } = require('../../lib/');
const { activeQuizzes } = require('./animequiz');

Command({
    cmd_name: 'answer',
    aliases: ['ans', 'a'],
    category: 'games',
    desc: 'Answer anime quiz questions'
})(async (msg) => {
    if (!msg.isGroup) return;
    const ctx = msg.key.remoteJid;
    const args = msg.text.split(' ').slice(1);
    const answer = parseInt(args[0]);
    const userx = msg.sender;
    const useri = msg.pushName || msg.sender.split('@')[0];

    if (!activeQuizzes.has(ctx)) {
        await msg.reply('use `quiz start` to begin a new quiz');
        return;
    }
    if (!answer || isNaN(answer)) {
        await msg.reply('Please provide a valid answer number (1-5)\nExample: `answer 2`');
        return;
    }
    const quiz = activeQuizzes.get(ctx);
    const result = quiz.submitAnswer(userx, answer, useri);
    if (result.success) {
        await msg.reply(result.message);
    } else {
        await msg.reply(result.message);
    }
});
                        

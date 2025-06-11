const { Command } = require('../../lib/');
const AnimeQuiz = require('../../lib/animequiz');
const activeQuizzes = new Map();
module.exports.activeQuizzes = activeQuizzes;

Command({
    cmd_name: 'quiz',
    aliases: ['animequiz', 'aq'],
    category: 'games',
    desc: 'Play Anime Quiz game (Groups only)'
})(async (msg) => {
    if (!msg.isGroup) return;
    const ctx = msg.key.remoteJid;
    const args = msg.text.split(' ').slice(1);
    const action = args[0];
    const userx = msg.sender;
    const useri = msg.pushName || msg.sender.split('@')[0];
    if (!action || action === 'start') {
        const questions = parseInt(args[1]) || 10;
        if (questions < 5 || questions > 50) {
            await msg.reply('Number of questions must be between 5 and 50');
            return;
        }

        const quiz = new AnimeQuiz();
        const result = quiz.startQuiz(questions);
        activeQuizzes.set(ctx, quiz);
        await msg.reply(result.message);
        return;
    }

    if (action.toLowerCase() === 'join') {
        if (!activeQuizzes.has(ctx)) {
            await msg.reply(`use \`quiz start\` to begin`);
            return;
        }

        const quiz = activeQuizzes.get(ctx);
        const result = quiz.joinQuiz(user', useri);
        await msg.reply(result.message);
        return;
    }

    if (action === 'begin') {
        if (!activeQuizzes.has(ctx)) {
            await msg.reply(`use \`quiz start\` to begin`);
            return;
        }

        const quiz = activeQuizzes.get(ctx);
        const result = quiz.startQuestions();
        if (result.success) {
            await msg.reply(result.message);
        } else {
            await msg.reply(`${result.message}`);
        }
        return;
    }

    

    if (action === 'next') {
        if (!activeQuizzes.has(ctx)) {
            await msg.reply(`use \`quiz start\` to begin`);
            return;
        }

        const quiz = activeQuizzes.get(ctx);
        const results = quiz.getCurrentResults();
        if (results) {
            await msg.reply(results);
        }

        setTimeout(async () => {
            const nexr = quiz.nextQuestion();
            if (nexr.gameOver) {
                await msg.reply(nexr.message);
                activeQuizzes.delete(ctx);
            } else {
                await msg.reply(nexr.message);
            }
        }, 2000);
        return;
    }

    if (action === 'scores') {
        if (!activeQuizzes.has(ctx)) {
            await msg.reply(`use \`quiz start\` to begin`);
            return;
        }

        const quiz = activeQuizzes.get(ctx);
        const result = quiz.getScores();
        if (result.success) {
            await msg.reply(result.message);
        } else {
            await msg.reply(`${result.message}`);
        }
        return;
    }

    if (action === 'end' || action === 'stop') {
        if (activeQuizzes.has(ctx)) {
            const quiz = activeQuizzes.get(ctx);
            const result = quiz.endQuiz();
            await msg.reply(result.message);
            activeQuizzes.delete(ctx);
        } else {
            await msg.reply('No active quiz to end');
        }
        return;
    }


    const txt = `*ANIME QUIZ CMDS*’

\`quiz start <5-50>\` - Start new quiz (default: 10 questions)
\`join\` - Join the quiz
\`quiz begin\` - Begin the questions
\`answer <1-5>\` - Answer current question
\`quiz next\` - Force next question (admin)
\`quiz scores\` - Show current scores
\`quiz end\` - End current quiz

*Note: Win*`;

    await msg.reply(txt);
});

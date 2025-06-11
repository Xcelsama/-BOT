const {Command} = require('../../lib/');
const TicTacToe = require('../../lib/tictactoe');


Command({
    cmd_name: 'ttt',
    aliases: ['tictactoe', 'xo'],
    category: 'games',
    desc: 'Play Tic Tac Toe'
})(async (msg) => {
    const ctx = new Map();
    if (!msg.isGroup) return;
    const v = msg.key.remoteJid;
    const args = msg.text.split(' ').slice(1);
    const action = args[0];
    const p = msg.sender;
    if (!action || action === 'start') {
        const game = new TicTacToe();
        ctx.set(v, game);
        const res = `🎮 *TIC TAC TOE* 🎮\n\n${game.xTable()}\n\n*How to play:*\n• use \`${msg.prefix}ttt join\` to join the game\n• use \`${msg.prefix}ttt move <1-9>\` to make a move\n• ✅ = Player X, ❎ = Player O\n• Positions: 1-9 (1=top-left, 9=bottom-right)\n• Use \`${msg.prefix}ttt reset\` to start over`;
        await msg.reply(res);
        return;
    }

    if (action === 'join') {
        if (!ctx.has(v)) {
            await msg.reply(`use \`${msg.prefix}ttt start\` to begin`);
            return;
        }

        const game = ctx.get(v);
        const result = game.joinGame(p);
        if (result.success) {
            const res = `🎮 *TIC TAC TOE* 🎮\n\n${game.xTable()}\n\n✅ ${result.message}`;
            await msg.reply(res);
        } else {
            await msg.reply(`${result.message}`);
        }
        return;
    }

    if (action === 'move') {
        if (!ctx.has(v)) {
            await msg.reply(`use \`${msg.prefix}ttt start\` to begin`);
            return;
        }

        const position = parseInt(args[1]);
        if (isNaN(position)) {
            await msg.reply('Please provide a valid position (1-9)');
            return;
        }

        const game = ctx.get(v);
        const result = game.makeMove(position, p);
        let res = `🎮 *TIC TAC TOE* 🎮\n\n${game.xTable()}`;
        if (!result.success) {
            res += `\n\n${result.message}`;
        } else {
            if (result.gameOver) {
                if (result.winner === 'draw') {
                    res += `\n\n🤝 ${result.message}`;
                } else {
                    res += `\n\n🎉 ${result.message}`;
                }
                res += `\n\nuse \`${msg.prefix}ttt start\` to play again`;
                ctx.delete(v);
            }
        }

        await msg.reply(res);
        return;
    }

    if (action === 'reset') {
        if (ctx.has(v)) {
            ctx.delete(v);
            await msg.reply('use `' + msg.prefix + 'ttt start` to begin a new game');
        } else {
            await msg.reply('no active game to reset');
        }
        return;
    }

    if (action === 'status') {
        if (!ctx.has(v)) {
            await msg.reply(`use \`${msg.prefix}ttt start\` to begin`);
            return;
        }

        const game = ctx.get(v);
        const res = `🎮 *TIC TAC TOE* 🎮\n\n${game.xTable()}`;
        await msg.reply(res);
        return;
    }

    const txt = `🎮 *TIC TAC TOE CMDS* 🎮

\`${msg.prefix}ttt start\` - Start new game
\`${msg.prefix}ttt join\` - Join the game
\`${msg.prefix}ttt move <1-9>\` - Make a move
\`${msg.prefix}ttt status\` - Show current board
\`${msg.prefix}ttt reset\` - Reset current game

*Symbols:* ✅ = Player X, ❎ = Player O
*Example:* \`${msg.prefix}ttt move 5\` (places mark in center)

*Note: Win*`;
    await msg.reply(txt);
});

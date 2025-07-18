const { Module } = require('../lib/plugins');
const game = new Map();

Module({
  command: 'connect4',
  package: 'games',
  description: 'Start Connect Four'
})(async (message, match) => {
  if (!message.isGroup) return;
  const mention = message.raw.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
  if (!mention) return await message.send('_Please mention a user to challenge_');
  if (game.has(message.from)) return await message.send('A game is already in progress');
  const board = Array.from({ length: 7 }, () => Array(6).fill(''));
  const info = {
    board,
    player1: message.sender,
    player2: mention,
    current: null,
    started: false,
    timeoutId: null 
  };

  info.timeoutId = setTimeout(() => {
    if (game.has(message.from) && !info.started) {
      game.delete(message.from);
      message.send('_Game canceled: challenger did not accept in time_');
    }
  }, 60 * 1000);

  game.set(message.from, info);
  await message.send(`🎮 *Connect Four*\n\n${mention.split('@')[0]}\ntype *join* to accept challenge`, { mentions: [mention] });
});

Module({
  on: 'text'
})(async (message) => {
  const session = game.get(message.from);
  if (!session) return;
  const { player1, player2, board, started, timeoutId } = session;
  const sender = message.sender;
  const body = message.body.trim().toLowerCase();
  const ctx = (board) => {
    const sta = ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣'];
    let str = '*🎯 Connect Four*\n\n';
    for (let r = 0; r < 7; r++) {
      str += sta[r] + ' ';
      for (let c = 0; c < 6; c++) {
        str += board[r][c] || '⚪';
      }
      str += '\n';
    }
    return str;
  };

  const checkWin = (board, token) => {
    const ROWS = 7, COLS = 6;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c <= COLS - 4; c++) {
        if (
          board[r][c] === token &&
          board[r][c+1] === token &&
          board[r][c+2] === token &&
          board[r][c+3] === token
        ) return true;
      }
    }
    for (let c = 0; c < COLS; c++) {
      for (let r = 0; r <= ROWS - 4; r++) {
        if (
          board[r][c] === token &&
          board[r+1][c] === token &&
          board[r+2][c] === token &&
          board[r+3][c] === token
        ) return true;
      }
    }
    for (let r = 0; r <= ROWS - 4; r++) {
      for (let c = 0; c <= COLS - 4; c++) {
        if (
          board[r][c] === token &&
          board[r+1][c+1] === token &&
          board[r+2][c+2] === token &&
          board[r+3][c+3] === token
        ) return true;
      }
    }
    for (let r = 0; r <= ROWS - 4; r++) {
      for (let c = 3; c < COLS; c++) {
        if (
          board[r][c] === token &&
          board[r+1][c-1] === token &&
          board[r+2][c-2] === token &&
          board[r+3][c-3] === token
        ) return true;
      }
    }
    return false;
  };

  if (!started) {
    if (sender === player2 && body === 'join') {
      clearTimeout(timeoutId); 
      session.started = true;
      session.current = player1;
      const view = ctx(board) +
        `\n🔴 <${player1.split('@')[0]}>\n🟡 <${player2.split('@')[0]}>\n\n🔴 *${player1.split('@')[0]}* starts`;
      return await message.send(view, { mentions: [player1, player2] });
    }
    return;
  }

  if (body === 'surrender') {
    if (sender !== player1 && sender !== player2) return;
    const opponent = sender === player1 ? player2 : player1;
    game.delete(message.from);
    return await message.send(`*${sender.split('@')[0]} surrendered\n${opponent.split('@')[0]} wins*`, { mentions: [sender, opponent] });
  }

  if (sender !== session.current) return;
  if (!/^[1-7]$/.test(body)) return await message.reply('Please reply with a column number between 1 and 7');
  const col = parseInt(body) - 1;
  for (let row = 6; row >= 0; row--) {
    if (!board[row][col]) {
      board[row][col] = sender === player1 ? '🔴' : '🟡';
      if (checkWin(board, board[row][col])) {
        const result = ctx(board) +
          `\n🔴 <${player1.split('@')[0]}>\n🟡 <${player2.split('@')[0]}>\n\n🎉 *${sender.split('@')[0]} wins*`;
        game.delete(message.from);
        return await message.send(result, { mentions: [player1, player2] });
      }

      if (board.every(r => r.every(cell => cell))) {
        const draw = ctx(board) +
          `\n🔴 <${player1.split('@')[0]}>\n🟡 <${player2.split('@')[0]}>\n\n🤝 *Its a draw*`;
        game.delete(message.from);
        return await message.send(draw, { mentions: [player1, player2] });
      }

      session.current = sender === player1 ? player2 : player1;
      const turn = ctx(board) +
        `\n🔴 <${player1.split('@')[0]}>\n🟡 <${player2.split('@')[0]}>\n\n🎯 *${session.current.split('@')[0]}'s turn*`;
      return await message.send(turn, { mentions: [player1, player2] });
    }
  }

  return await message.send('This column is full. Choose another one');
});

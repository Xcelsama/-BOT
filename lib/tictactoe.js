class TicTacToe {
    constructor() {
        this.board = Array(9).fill(' ');
        this.players = { X: null, O: null };
        this.currentPlayer = 'X';
        this.gameOver = false;
        this.winner = null;
        this.cooldown = true;
    }

    xTable() {
        const b = this.board.map(cell => {
            if (cell === 'X') return '✅';
            if (cell === 'O') return '❎';
            return '⬜';
        });
        
        return `
│ ${b[0]} │ ${b[1]} │ ${b[2]} 
│ ${b[3]} │ ${b[4]} │ ${b[5]} 
│ ${b[6]} │ ${b[7]} │ ${b[8]}

${this.getGameStatus()}`;
    }

    getGameStatus() {
        if (this.cooldown) {
            const vn = this.players.X ? 'O' : 'X';
            const symbol = waitingFor === 'X' ? '✅' : '❎';
            return `Waiting for Player ${vn} ${symbol} to join...`;
        }
        
        if (this.gameOver) {
            if (this.winner === 'draw') return 'Game Over - Draw';
            const symbol = this.winner === 'X' ? '✅' : '❎';
            return `Game Over - Player ${this.winner} ${symbol} Wins`;
        }
        
        const symbol = this.currentPlayer === 'X' ? '✅' : '❎';
        return `Current Turn: Player ${this.currentPlayer} ${symbol}`;
    }

    joinGame(xid) {
        if (!this.players.X) {
            this.players.X = xid;
            return { success: true, message: 'Joined', symbol: 'X' };
        } else if (!this.players.O && this.players.X !== xid) {
            this.players.O = xid;
            this.cooldown = false;
            return { success: true, message: '0 joined', symbol: 'O' };
        } else if (this.players.X === xid || this.players.O === x) {
            const symbol = this.players.X === x ? 'X' : 'O';
            const emoji = symbol === 'X' ? '✅' : '❎';
            return { success: true, message: `You are already Player ${symbol} ${emoji}`, symbol };
        } else {
            return { success: false, message: 'Game is full, Both players already joined' };
        }
    }

    makeMove(position, cid) {
        const index = position - 1;
        if (this.cooldown) {
            return { success: false, message: 'Waiting for another player to join' };
        }
        
        if (this.gameOver) {
            return { success: false, message: 'Game is already over' };
        }
        
        const sx = this.players.X === cid ? 'X' : 
                           this.players.O === cid ? 'O' : null;
        
        if (!sx) {
            return { success: false, message: 'You are not part of this game' };
        }
        
        if (sx !== this.currentPlayer) {
            const cr = this.currentPlayer === 'X' ? '✅' : '❎';
            return { success: false, message: `Wait for your turn, Current player: ${this.currentPlayer} ${cr}` };
        }
        
        if (position < 1 || position > 9) {
            return { success: false, message: 'Invalid position, use 1-9' };
        }
        
        if (this.board[index] !== ' ') {
            return { success: false, message: 'Position already taken' };
        }
        
        this.board[index] = this.currentPlayer;
        if (this.checkWin()) {
            this.gameOver = true;
            this.winner = this.currentPlayer;
            const emoji = this.currentPlayer === 'X' ? '✅' : '❎';
            return { 
                success: true, 
                message: `Player ${this.currentPlayer} ${emoji} wins`,
                gameOver: true,
                winner: this.currentPlayer
            };
        }
        
        if (this.checkDraw()) {
            this.gameOver = true;
            return { 
                success: true, 
                message: "Its a draw",
                gameOver: true,
                winner: 'draw'
            };
        }
        
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        return { success: true, message: 'Move successful' };
    }
    checkWin() {
        const winers = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], 
            [0, 3, 6], [1, 4, 7], [2, 5, 8], 
            [0, 4, 8], [2, 4, 6] 
        ];
        
        return winers.some(pattern => {
            return pattern.every(index => 
                this.board[index] !== ' ' && 
                this.board[index] === this.board[pattern[0]]
            );
        });
    }

    checkDraw() {
        return this.board.every(cell => cell !== ' ');
    }

    reset() {
        this.board = Array(9).fill(' ');
        this.players = { X: null, O: null };
        this.currentPlayer = 'X';
        this.gameOver = false;
        this.winner = null;
        this.cooldown = true;
    }

    getInfo() {
        return {
            board: this.board,
            players: this.players,
            currentPlayer: this.currentPlayer,
            gameOver: this.gameOver,
            winner: this.winner,
            cooldown: this.cooldown
        };
    }
}

module.exports = TicTacToe;

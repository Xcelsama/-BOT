
<old_str>class AnimeQuiz {
    constructor() {
        this.players = new Map();
        this.currentQuiz = null;
        this.gameActive = false;
        this.answers = new Map();
        this.scores = new Map();
        this.currentQuestionIndex = 0;
        this.totalQuestions = 10;
        this.questionTimeout = null;
        this.waitingForAnswers = false;
    }

    // Start new quiz session
    startQuiz(totalQuestions = 10) {
        this.players.clear();
        this.answers.clear();
        this.scores.clear();
        this.currentQuestionIndex = 0;
        this.totalQuestions = totalQuestions;
        this.gameActive = true;
        this.waitingForAnswers = false;
        
        return {
            success: true,
            message: `🎮 *ANIME QUIZ STARTED!* 🎮\n\nTotal Questions: ${totalQuestions}\nUse "join" to participate!\n\nWaiting for players to join...`
        };
    }

    // Player joins the quiz
    joinQuiz(playerId, playerName) {
        if (!this.gameActive) {
            return { success: false, message: 'No active quiz! Start one first.' };
        }

        if (this.players.has(playerId)) {
            return { success: false, message: 'You are already in the quiz!' };
        }

        if (this.waitingForAnswers) {
            return { success: false, message: 'Quiz already in progress! Wait for the next question.' };
        }

        this.players.set(playerId, playerName);
        this.scores.set(playerId, 0);

        return {
            success: true,
            message: `✅ ${playerName} joined the quiz!\nTotal players: ${this.players.size}`
        };
    }

    // Start the actual quiz questions
    startQuestions() {
        if (this.players.size === 0) {
            return { success: false, message: 'No players joined! Cannot start quiz.' };
        }

        this.currentQuestionIndex = 0;
        return this.nextQuestion();
    }

    // Get next question
    nextQuestion() {
        if (this.currentQuestionIndex >= this.totalQuestions) {
            return this.endQuiz();
        }

        const { Quiz } = require('anime-quiz');
        const { getRandom } = new Quiz();
        this.currentQuiz = getRandom();
        this.answers.clear();
        this.waitingForAnswers = true;
        this.currentQuestionIndex++;

        const options = this.currentQuiz.options
            .map((option, index) => `${index + 1}. ${option}`)
            .join('\n');

        return {
            success: true,
            question: this.currentQuiz,
            message: `📝 *Question ${this.currentQuestionIndex}/${this.totalQuestions}*\n\n${this.currentQuiz.question}\n\n${options}\n\n*Reply with: answer <number>*\n*Example: answer 2*`
        };
    }

    // Submit answer
    submitAnswer(playerId, answerIndex) {
        if (!this.gameActive) {
            return { success: false, message: 'No active quiz!' };
        }

        if (!this.players.has(playerId)) {
            return { success: false, message: 'You are not in the quiz! Join first.' };
        }

        if (!this.waitingForAnswers) {
            return { success: false, message: 'No question active!' };
        }

        if (this.answers.has(playerId)) {
            return { success: false, message: 'You already answered this question!' };
        }

        if (answerIndex < 1 || answerIndex > this.currentQuiz.options.length) {
            return { success: false, message: `Invalid answer! Choose 1-${this.currentQuiz.options.length}` };
        }

        const selectedAnswer = this.currentQuiz.options[answerIndex - 1];
        this.answers.set(playerId, {
            answer: selectedAnswer,
            correct: selectedAnswer === this.currentQuiz.answer,
            time: Date.now()
        });

        if (selectedAnswer === this.currentQuiz.answer) {
            this.scores.set(playerId, this.scores.get(playerId) + 1);
        }

        return {
            success: true,
            message: `✅ Answer submitted: ${selectedAnswer}`
        };
    }

    // Check if all players answered
    allPlayersAnswered() {
        return this.answers.size === this.players.size;
    }

    // Get current results
    getCurrentResults() {
        if (!this.currentQuiz) return null;

        let results = `📊 *RESULTS FOR QUESTION ${this.currentQuestionIndex}*\n\n`;
        results += `❓ ${this.currentQuiz.question}\n`;
        results += `✅ Correct Answer: ${this.currentQuiz.answer}\n\n`;

        for (const [playerId, playerName] of this.players) {
            const answer = this.answers.get(playerId);
            if (answer) {
                const status = answer.correct ? '✅' : '❌';
                results += `${status} ${playerName}: ${answer.answer}\n`;
            } else {
                results += `⏰ ${playerName}: No answer\n`;
            }
        }

        return results;
    }

    // End quiz and show final results
    endQuiz() {
        this.gameActive = false;
        this.waitingForAnswers = false;

        let finalResults = `🏆 *FINAL QUIZ RESULTS* 🏆\n\n`;
        
        // Sort players by score
        const sortedPlayers = Array.from(this.players.entries())
            .map(([id, name]) => ({ id, name, score: this.scores.get(id) }))
            .sort((a, b) => b.score - a.score);

        sortedPlayers.forEach((player, index) => {
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '👤';
            finalResults += `${medal} ${player.name}: ${player.score}/${this.totalQuestions}\n`;
        });

        finalResults += `\n🎮 Thanks for playing! Use "quiz start" to play again.`;

        return {
            success: true,
            gameOver: true,
            message: finalResults
        };
    }

    // Get current scores
    getScores() {
        if (!this.gameActive) {
            return { success: false, message: 'No active quiz!' };
        }

        let scoreBoard = `📊 *CURRENT SCORES*\n\n`;
        
        const sortedPlayers = Array.from(this.players.entries())
            .map(([id, name]) => ({ id, name, score: this.scores.get(id) }))
            .sort((a, b) => b.score - a.score);

        sortedPlayers.forEach((player) => {
            scoreBoard += `👤 ${player.name}: ${player.score} points\n`;
        });

        scoreBoard += `\nQuestion: ${this.currentQuestionIndex}/${this.totalQuestions}`;

        return { success: true, message: scoreBoard };
    }

    // Get game status
    getStatus() {
        return {
            gameActive: this.gameActive,
            waitingForAnswers: this.waitingForAnswers,
            playersCount: this.players.size,
            currentQuestion: this.currentQuestionIndex,
            totalQuestions: this.totalQuestions
        };
    }
}</old_str>
<new_str>class AnimeQuiz {
    constructor() {
        this.players = new Map();
        this.currentQuiz = null;
        this.gameActive = false;
        this.answers = new Map();
        this.scores = new Map();
        this.currentQuestionIndex = 0;
        this.totalQuestions = 10;
        this.questionTimeout = null;
        this.waitingForAnswers = false;
    }

    // Start new quiz session
    startQuiz(totalQuestions = 10) {
        this.players.clear();
        this.answers.clear();
        this.scores.clear();
        this.currentQuestionIndex = 0;
        this.totalQuestions = totalQuestions;
        this.gameActive = true;
        this.waitingForAnswers = false;
        
        return {
            success: true,
            message: `📒 *ANIME QUIZ STARTED!* 📒\n\n📝 Total Questions: ${totalQuestions}\n🎯 Type "join" to participate!\n\n⏳ Waiting for players to join...`
        };
    }

    // Player joins the quiz
    joinQuiz(playerId, playerName) {
        if (!this.gameActive) {
            return { success: false, message: '❌ No active quiz! Start one first.' };
        }

        if (this.players.has(playerId)) {
            return { success: false, message: '❌ You are already in the quiz!' };
        }

        if (this.waitingForAnswers) {
            return { success: false, message: '❌ Quiz already in progress! Wait for the next question.' };
        }

        this.players.set(playerId, playerName);
        this.scores.set(playerId, 0);

        return {
            success: true,
            message: `✅ ${playerName} joined the quiz!\n👥 Total players: ${this.players.size}`
        };
    }

    // Start the actual quiz questions
    startQuestions() {
        if (this.players.size === 0) {
            return { success: false, message: '❌ No players joined! Cannot start quiz.' };
        }

        this.currentQuestionIndex = 0;
        return this.nextQuestion();
    }

    // Get next question
    nextQuestion() {
        if (this.currentQuestionIndex >= this.totalQuestions) {
            return this.endQuiz();
        }

        const { Quiz } = require('anime-quiz');
        const { getRandom } = new Quiz();
        this.currentQuiz = getRandom();
        this.answers.clear();
        this.waitingForAnswers = true;
        this.currentQuestionIndex++;

        const emojiNumbers = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'];
        const options = this.currentQuiz.options
            .map((option, index) => `${emojiNumbers[index]} ${option}`)
            .join('\n');

        return {
            success: true,
            question: this.currentQuiz,
            message: `📒 *Question ${this.currentQuestionIndex}/${this.totalQuestions}* 📒\n\n❓ ${this.currentQuiz.question}\n\n${options}\n\n💡 *Reply with: answer <number>*\n📝 *Example: answer 2*`
        };
    }

    // Submit answer
    submitAnswer(playerId, answerIndex) {
        if (!this.gameActive) {
            return { success: false, message: '❌ No active quiz!' };
        }

        if (!this.players.has(playerId)) {
            return { success: false, message: '❌ You are not in the quiz! Type "join" first.' };
        }

        if (!this.waitingForAnswers) {
            return { success: false, message: '❌ No question active!' };
        }

        if (this.answers.has(playerId)) {
            return { success: false, message: '❌ You already answered this question!' };
        }

        if (answerIndex < 1 || answerIndex > this.currentQuiz.options.length) {
            return { success: false, message: `❌ Invalid answer! Choose 1-${this.currentQuiz.options.length}` };
        }

        const selectedAnswer = this.currentQuiz.options[answerIndex - 1];
        this.answers.set(playerId, {
            answer: selectedAnswer,
            correct: selectedAnswer === this.currentQuiz.answer,
            time: Date.now()
        });

        if (selectedAnswer === this.currentQuiz.answer) {
            this.scores.set(playerId, this.scores.get(playerId) + 1);
        }

        const emojiNumbers = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'];
        return {
            success: true,
            message: `✅ Answer submitted: ${emojiNumbers[answerIndex - 1]} ${selectedAnswer}`
        };
    }

    // Check if all players answered
    allPlayersAnswered() {
        return this.answers.size === this.players.size;
    }

    // Get current results
    getCurrentResults() {
        if (!this.currentQuiz) return null;

        let results = `📊 *RESULTS FOR QUESTION ${this.currentQuestionIndex}* 📊\n\n`;
        results += `❓ ${this.currentQuiz.question}\n`;
        results += `✅ Correct Answer: ${this.currentQuiz.answer}\n\n`;

        for (const [playerId, playerName] of this.players) {
            const answer = this.answers.get(playerId);
            if (answer) {
                const status = answer.correct ? '✅' : '❌';
                results += `${status} ${playerName}: ${answer.answer}\n`;
            } else {
                results += `⏰ ${playerName}: No answer\n`;
            }
        }

        return results;
    }

    // End quiz and show final results
    endQuiz() {
        this.gameActive = false;
        this.waitingForAnswers = false;

        let finalResults = `🏆 *FINAL QUIZ RESULTS* 🏆\n\n`;
        
        // Sort players by score
        const sortedPlayers = Array.from(this.players.entries())
            .map(([id, name]) => ({ id, name, score: this.scores.get(id) }))
            .sort((a, b) => b.score - a.score);

        sortedPlayers.forEach((player, index) => {
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '👤';
            finalResults += `${medal} ${player.name}: ${player.score}/${this.totalQuestions}\n`;
        });

        finalResults += `\n🎮 Thanks for playing! Use quiz command to play again.`;

        return {
            success: true,
            gameOver: true,
            message: finalResults
        };
    }

    // Get current scores
    getScores() {
        if (!this.gameActive) {
            return { success: false, message: '❌ No active quiz!' };
        }

        let scoreBoard = `📊 *CURRENT SCORES* 📊\n\n`;
        
        const sortedPlayers = Array.from(this.players.entries())
            .map(([id, name]) => ({ id, name, score: this.scores.get(id) }))
            .sort((a, b) => b.score - a.score);

        sortedPlayers.forEach((player) => {
            scoreBoard += `👤 ${player.name}: ${player.score} points\n`;
        });

        scoreBoard += `\n📝 Question: ${this.currentQuestionIndex}/${this.totalQuestions}`;

        return { success: true, message: scoreBoard };
    }

    // Get game status
    getStatus() {
        return {
            gameActive: this.gameActive,
            waitingForAnswers: this.waitingForAnswers,
            playersCount: this.players.size,
            currentQuestion: this.currentQuestionIndex,
            totalQuestions: this.totalQuestions
        };
    }
}</new_str>

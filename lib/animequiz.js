
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
            message: `🎮 *ANIME QUIZ STARTED* 🎮\n\nTotal Questions: ${totalQuestions}\nUse "join"\n\nWaiting for players to join...`
        };
    }

    joinQuiz(cid, x) {
        if (!this.gameActive) {
            return { success: false, message: 'No active quiz' };
        }

        if (this.players.has(cid)) {
            return { success: false, message: 'You are already in the quiz' };
        }

        if (this.waitingForAnswers) {
            return { success: false, message: 'Quiz already in progress Wait for the next question' };
        }

        this.players.set(cid, x);
        this.scores.set(cid, 0);

        return {
            success: true,
            message: `${x} joined the quiz\nTotal players: ${this.players.size}`
        };
    }

    startQuestions() {
        if (this.players.size === 0) {
            return { success: false, message: 'No players joined, Cannot start quiz' };
        }

        this.currentQuestionIndex = 0;
        return this.nextQuestion();
    }

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

    submitAnswer(cid, a) {
        if (!this.gameActive) {
            return { success: false, message: 'No active quiz' };
        }

        if (!this.players.has(cid)) {
            return { success: false, message: 'You are not in the quiz Join first' };
        }

        if (!this.waitingForAnswers) {
            return { success: false, message: 'No question active' };
        }

        if (this.answers.has(cid)) {
            return { success: false, message: 'You already answered this question' };
        }

        if (a < 1 || a > this.currentQuiz.options.length) {
            return { success: false, message: `Invalid answer Choose 1-${this.currentQuiz.options.length}` };
        }

        const naxor = this.currentQuiz.options[a - 1];
        this.answers.set(cid, {
            answer: naxor,
            correct: naxor === this.currentQuiz.answer,
            time: Date.now()
        });

        if (naxor === this.currentQuiz.answer) {
            this.scores.set(cid, this.scores.get(cid) + 1);
        }

        return {
            success: true,
            message: `${naxor}`
        };
    }

    allPlayersAnswered() {
        return this.answers.size === this.players.size;
    }

    getCurrentResults() {
        if (!this.currentQuiz) return null;
        let results = `📊 *RESULTS FOR QUESTION ${this.currentQuestionIndex}*\n\n`;
        results += `❓ ${this.currentQuiz.question}\n`;
        results += `✅ Correct Answer: ${this.currentQuiz.answer}\n\n`;

        for (const [cid, a] of this.players) {
            const answer = this.answers.get(cid);
            if (answer) {
                const status = answer.correct ? '✅' : '❌';
                results += `${status} ${a}: ${answer.answer}\n`;
            } else {
                results += `⏰ ${a}: No answer\n`;
            }
        }

        return results;
    }

    endQuiz() {
        this.gameActive = false;
        this.waitingForAnswers = false;

        let fn = `🏆 *FINAL QUIZ RESULTS* 🏆\n\n`;
        
        const sorte = Array.from(this.players.entries())
            .map(([id, name]) => ({ id, name, score: this.scores.get(id) }))
            .sort((a, b) => b.score - a.score);

        sorte.forEach((player, index) => {
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '👤';
            fn += `${medal} ${player.name}: ${player.score}/${this.totalQuestions}\n`;
        });

        fn += `\n🎮 Thanks for playing`;

        return {
            success: true,
            gameOver: true,
            message: fn
        };
    }

    getScores() {
        if (!this.gameActive) {
            return { success: false, message: 'No active quiz!' };
        }

        let scor = `📊 *CURRENT SCORES*\n\n`;
        
        const sorte = Array.from(this.players.entries())
            .map(([id, name]) => ({ id, name, score: this.scores.get(id) }))
            .sort((a, b) => b.score - a.score);

        sorte.forEach((player) => {
            scor += `👤 ${player.name}: ${player.score} points\n`;
        });

        scor += `\nQuestion: ${this.currentQuestionIndex}/${this.totalQuestions}`;

        return { success: true, message: scor };
    }

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
            message: `📒 *ANIME QUIZ STARTED* 📒\n\n📝 Total Questions: ${totalQuestions}\n🎯 Type "join" to participate\n\n⏳ Waiting for players to join...`
        };
    }

    joinQuiz(cid, a) {
        if (!this.gameActive) {
            return { success: false, message: 'No active quiz' };
        }

        if (this.players.has(cid)) {
            return { success: false, message: 'You are already in the quiz' };
        }

        if (this.waitingForAnswers) {
            return { success: false, message: 'Quiz already in progress Wait for the next question' };
        }

        this.players.set(cid, a);
        this.scores.set(cid, 0);

        return {
            success: true,
            message: `${a} joined the quiz\n👥 Total players: ${this.players.size}`
        };
    }

    startQuestions() {
        if (this.players.size === 0) {
            return { success: false, message: 'No players joined Cannot start quiz' };
        }

        this.currentQuestionIndex = 0;
        return this.nextQuestion();
    }

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

        const em = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'];
        const options = this.currentQuiz.options
            .map((option, index) => `${emo[index]} ${option}`)
            .join('\n');

        return {
            success: true,
            question: this.currentQuiz,
            message: `📒 *Question ${this.currentQuestionIndex}/${this.totalQuestions}* 📒\n\n❓ ${this.currentQuiz.question}\n\n${options}\n\n💡 *Reply with: answer <number>*\n📝 *Example: answer 2*`
        };
    }

    submitAnswer(cid, a) {
        if (!this.gameActive) {
            return { success: false, message: 'No active quiz' };
        }

        if (!this.players.has(cid)) {
            return { success: false, message: 'You are not in the quiz Type "join" first' };
        }

        if (!this.waitingForAnswers) {
            return { success: false, message: 'No question active' };
        }

        if (this.answers.has(cid)) {
            return { success: false, message: 'You already answered this question' };
        }

        if (a < 1 || a > this.currentQuiz.options.length) {
            return { success: false, message: `Invalid answerChoose 1-${this.currentQuiz.options.length}` };
        }

        const naxor = this.currentQuiz.options[a - 1];
        this.answers.set(cid, {
            answer: naxor,
            correct: naxor === this.currentQuiz.answer,
            time: Date.now()
        });

        if (naxor === this.currentQuiz.answer) {
            this.scores.set(cid, this.scores.get(cid) + 1);
        }

        const emo = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'];
        return {
            success: true,
            message: `Answer submitted: ${emo[a - 1]} ${naxor}`
        };
    }

    allPlayersAnswered() {
        return this.answers.size === this.players.size;
    }

    getCurrentResults() {
        if (!this.currentQuiz) return null;
        let results = `📊 *RESULTS FOR QUESTION ${this.currentQuestionIndex}* 📊\n\n`;
        results += `❓ ${this.currentQuiz.question}\n`;
        results += `✅ Correct Answer: ${this.currentQuiz.answer}\n\n`;

        for (const [cid, a] of this.players) {
            const answer = this.answers.get(cid);
            if (answer) {
                const status = answer.correct ? '✅' : '❌';
                results += `${status} ${a}: ${answer.answer}\n`;
            } else {
                results += `⏰ ${a}: No answer\n`;
            }
        }

        return results;
    }

    endQuiz() {
        this.gameActive = false;
        this.waitingForAnswers = false;

        let fn = `🏆 *FINAL QUIZ RESULTS* 🏆\n\n`;
        const sorte = Array.from(this.players.entries())
            .map(([id, name]) => ({ id, name, score: this.scores.get(id) }))
            .sort((a, b) => b.score - a.score);

        sorte.forEach((player, index) => {
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '👤';
            fn += `${medal} ${player.name}: ${player.score}/${this.totalQuestions}\n`;
        });

        fn += `\n🎮 Thanks for playing`;

        return {
            success: true,
            gameOver: true,
            message: fn
        };
    }

    getScores() {
        if (!this.gameActive) {
            return { success: false, message: '❌ No active quiz!' };
        }

        let scor = `📊 *CURRENT SCORES* 📊\n\n`;
        
        const sorte = Array.from(this.players.entries())
            .map(([id, name]) => ({ id, name, score: this.scores.get(id) }))
            .sort((a, b) => b.score - a.score);

        sorte.forEach((player) => {
            scor += `👤 ${player.name}: ${player.score} points\n`;
        });

        scor += `\n📝 Question: ${this.currentQuestionIndex}/${this.totalQuestions}`;

        return { success: true, message: scor };
    }

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

const TIME_PER_ANSWER_MSECS = 25_000;
const MAX_HEALTH = 100;

const CORRECT_HEALTH_LOSS = 10;
const CORRECT_COMBO_HEALTH_LOSS = 25;

const INCORRECT_HEALTH_LOSS = 5;
const TIMEOUT_HEALTH_LOSS = 10;

export class MathBattleGame {
    constructor(
        private questionSet: QuestionSet,
        private interaction: Interaction,
    ) {
    }

    currentBattle: Battle | null = null;
    state: null | 'playing' | 'victory' | 'game_over' = null;
    battleId = 0;

    async playBattle() {
        this.state = 'playing';
        this.currentBattle = new Battle(this.battleId++, this.questionSet, this.interaction);
        this.state = await this.currentBattle.play();
    }

    reset() {
        this.currentBattle = null;
    }
}

class Battle {
    constructor(
        public id: number,
        private questionSet: QuestionSet,
        private interaction: Interaction,
    ) {}

    playerHealth = MAX_HEALTH;
    opponentHealth = MAX_HEALTH;
    comboCounter = 0;

    async play() {
        while (this.playerHealth > 0 && this.opponentHealth > 0) {
            const {question, correctAnswer} = this.questionSet.getQuestion();
            await this.playQuestion(question, correctAnswer);
        }

        console.log('done', this.playerHealth, this.opponentHealth);
        if (this.playerHealth <= 0) return 'game_over';
        return 'victory';
    }

    playQuestion(question: string, correctAnswer: string) {
        return new Promise<void>((resolve) => {

            const getHit = (combo?: number) => {
                this.playerHealth -= INCORRECT_HEALTH_LOSS;
                this.comboCounter = 0;
                this.interaction.getHit(combo);
                if (this.playerHealth <=0) {
                    timing.end();
                    resolve();
                }
                return false;
            }

            const win = () => {
                this.interaction.correct();
                this.opponentHealth = Math.max(0, this.opponentHealth - CORRECT_HEALTH_LOSS);
                this.comboCounter = 0;
                resolve();
                timing.end();
                return true;
            }

            const winWithCombo = () => {
                this.comboCounter++;
                if (this.comboCounter === 3) {
                    this.interaction.correct(this.comboCounter);
                    this.opponentHealth = Math.max(0, this.opponentHealth - CORRECT_COMBO_HEALTH_LOSS);
                    this.comboCounter = 0;
                } else {
                    this.interaction.correct(this.comboCounter);
                    this.opponentHealth = Math.max(0, this.opponentHealth - CORRECT_HEALTH_LOSS);
                }
                timing.end();
                resolve();
                return true;
            }

            const lose = () => {
                this.interaction.incorrect(3, correctAnswer);
                this.playerHealth = Math.max(0, this.playerHealth - TIMEOUT_HEALTH_LOSS);
                this.comboCounter = 0;
                resolve();
            }

            console.log('asking next question');
            const timing = this.interaction.ask(question, TIME_PER_ANSWER_MSECS, (answer, timeTaken) => {
                if (answer !== correctAnswer) return getHit();
                else if (timeTaken > TIME_PER_ANSWER_MSECS / 3) return win();
                else return winWithCombo();
            });

            timing.afterPortion(1/3, () => getHit(1));
            timing.afterPortion(2/3, () => getHit(2));
            timing.afterPortion(3/3, lose);
        })
    }
}

export class QuestionSet {
    constructor(private qs: Array<{ question: string, correctAnswer: string }> ) {
    }

    idx = 0;

    getQuestion() {
        return this.qs[(this.idx++) % this.qs.length];
    }

    jumble() {
        return new QuestionSet(this.qs
            .map((q) => ({ q, r: Math.random() }))
            .sort((a, b) => a.r < b.r ? -1 : 1)
            .map(({ q }) => q));
    }

    static of(...sets: QuestionSet[]): QuestionSet {
        return new QuestionSet(sets.flatMap((s) => s.qs));
    }
}

interface Interaction {
    ask(question: string, timeoutMsecs: number, answer: (v: string, timeTaken: number) => boolean): PendingAnswer;
    correct(combo?: number): void;
    getHit(combo?: number): void;
    incorrect(combo?: number, correctAnswer?: string): void;
}

export interface PendingAnswer {
    afterPortion(portion: number, handler: () => void): void;
    after(msecs: number, handler: () => void): void;
    end(): void;
}

export class AnswerTimeoutException extends Error {

}
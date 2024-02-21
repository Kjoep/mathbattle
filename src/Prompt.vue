<template>
    <div>
        <div class="Prompt"
             :style="`--timeout: ${timing.maxTime}ms; --time: ${timing.currentTime}ms; --timeportion: ${timing.timePortion}`"
             :class="{
                 pending: timing.state === 'running',
                 paused: timing.state === 'paused',
                 greatSpeed: speed === 'great',
                 goodSpeed: speed === 'good',
                 badSpeed: speed === 'bad',
                 correct: feedback === 'correct',
                 incorrect: feedback === 'incorrect',
              }">
            <svg class="timer">
                <circle class="progress-circle"
                        cx="50%" cy="50%" r="45%" fill="transparent" stroke-width="1vw" />
            </svg>
            <span class="question">{{ question }}</span>
            <spam v-if="revealed" class="revealed">{{ revealed }}</spam>
            <input v-else class="answer" ref="inputRef" type="text" v-model="answer"
                   @keydown.enter="(answer && answerFn) ? answerFn() : null" />
        </div>
    </div>
</template>
<script setup lang="ts">

import {reactive, ref} from "vue";
    import type {PendingAnswer} from "@/game";
    import {startTiming, Timing} from "@/timing";

    const timing = ref<Timing>(startTiming(1));
    const feedback = ref<'correct' | 'incorrect' | null>(null);

    const speed = ref<'great' | 'good' | 'bad'>('great');

    let ready: Promise<any> = Promise.resolve();
    const question = ref<string | null>(null);
    const revealed = ref<string | null>(null);
    const answer = ref<string>('');
    const answerFn = ref<(() => void) | null>(null);
    const inputRef = ref<HTMLInputElement>();

    function ask($question: string, timeoutMsecs: number, submitAnswer: (v: string, timeTaken: number) => boolean): PendingAnswer {
        const newTiming = reactive(startTiming(timeoutMsecs));
        schedule(() => new Promise<void>((resolve, reject) => {
            timing.value = newTiming;
            newTiming.start();
            question.value = $question;
            answer.value = '';
            speed.value = 'great';

            newTiming.afterPortion(1/3, () => {
                speed.value = 'good';
            });

            newTiming.afterPortion(2/3,() => {
                speed.value = 'bad';
            });

            newTiming.onEnd(() => {
                console.log('resolving because end')
                resolve();
            });

            answerFn.value = () => {
                const result = submitAnswer(answer.value, newTiming.currentTime);
                if (!result) {
                    answer.value = '';
                    feedback.value = null;
                    setTimeout(() => feedback.value = 'incorrect', 1);
                }
                else {
                    console.log('resolving because nice')
                    resolve();
                }
            }
            inputRef.value?.focus();
        }).then(() => answerFn.value = () => {}));

        return {
            after: newTiming.after.bind(newTiming),
            afterPortion: newTiming.afterPortion.bind(newTiming),
            end: newTiming.end.bind(newTiming),
        }
    }

    function correct() {
        schedule(async () => {
            feedback.value = null;
            await sleep(1);
            feedback.value = 'correct';
            await sleep(1500);
            feedback.value = null;
        });
        return ready;
    }

    function incorrect(correctAnswer?: string) {
        schedule(async () => {
            feedback.value = null;
            await sleep(1);
            feedback.value = 'incorrect';
            revealed.value = correctAnswer ?? null;
            await sleep(1500);
            feedback.value = null;
            revealed.value = null;
        });
        return ready;
    }

    function schedule(fn: () => Promise<any>) {
        console.log('scheduling');
        ready = ready.then(fn);
    }

    defineExpose({ ask, correct, incorrect })

    function sleep(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

</script>
<style lang="scss" scoped>
    .Prompt {
        width: 15vw;
        height: 15vw;
        background-color: rgba(#000, .6);
        color: white;
        border-radius: 100%;
        position: relative;
        display: flex;
        flex-direction: column;
        justify-content: center;
        transform-origin: center center;
        box-shadow: rgba(#000, .8) 0 3px 0 0;

        &.pending .progress-circle {
            animation: countdown var(--timeout) linear forwards;
            transition: stroke .2s;
        }

        &.paused .progress-circle {
            stroke-dasharray: calc((1 - var(--timeportion)) * 282.75%) calc(var(--timeportion) * 282.75%);
            stroke-dashoffset: calc(70.68% - (var(--timeportion) * 282.75%));
        }

        &.correct {
            animation: correct 1.5s linear;
        }

        &.incorrect {
            animation: incorrect 1.5s linear;
        }

        &.greatSpeed .progress-circle {
            stroke: #1fce1f;
        }
        &.goodSpeed .progress-circle {
            stroke: #ce9c1f;
        }
        &.badSpeed .progress-circle {
            stroke: #c71313;
        }

        .timer {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
        }

        .question, .revealed {
            font-size: 4vw;
            font-weight: bold;
            text-align: center;
            z-index: 10;
        }

        .answer {
            font-size: 3.5vw;
            font-weight: bold;
            text-align: center;
            border: none;
            outline: none;
            z-index: 10;
            background: transparent;
            color: inherit;
        }
    }

    @keyframes countdown {
        from {
            stroke-dasharray: 282.75% 0;
            stroke-dashoffset: 70.68%;
        }

        to {
            stroke-dasharray: 0 282.75%;
            stroke-dashoffset: -212.75%;
        }
    }

    @keyframes correct {
        from {
            transform: scale(1);
            box-shadow: rgba(#000, .8) 0 3px 0 0;
        }

        10% {
            transform: scale(1.2) translateY(-15%);
            background-color: #1fce1f;
            box-shadow: rgba(#000, .8) 0 13px 5px -5px;
        }

        97% {
            transform: scale(1.2) translateY(-15%);
            background-color: #1fce1f;
            box-shadow: rgba(#000, .8) 0 13px 5px -5px;
        }

        to {
            transform: scale(1);
            background-color: rgba(#000, .6);
            box-shadow: rgba(#000, .8) 0 3px 0 0;
        }
    }

    @keyframes incorrect {
        from {
            transform: translateX(0);
        }
        10%, 30%, 50%, 70%, 90% {
            transform: translateX(-3%);
            background-color: #981616;
        }
        20%, 40%, 60%, 80% {
            transform: translateX(+3%);
            background-color: #981616;
        }
        to {
            transform: translateX(0);
        }
    }
</style>
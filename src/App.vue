<template>
    <main>
        <div class="scene">
            <div v-if="game.currentBattle" class="player-area">
                <div class="name">Michiel</div>
                <HealthBar class="player-health" :value="game.currentBattle.playerHealth" />
                <div class="combo" v-if="game.currentBattle.comboCounter > 0">Combo: {{ game.currentBattle.comboCounter }}x</div>
            </div>
            <div v-if="game.currentBattle" class="opponent-area">
                <div class="name">Bob the Sheep</div>
                <HealthBar class="opponent-health" :value="game.currentBattle.opponentHealth" />
            </div>
            <Prompt class="prompt" ref="promptRef" />
            <FightScene v-if="game.currentBattle" :key="`battle_${game.currentBattle.id}`"
                        :player="Fighter" :opponent="BobTheSheep"
                        ref="fightSceneRef" class="fight-scene" />
        </div>
        <div v-if="!game.currentBattle" class="game-menu">
            <h1>Math Battle!</h1>
            <button @click="game.playBattle()">Start</button>
        </div>
    </main>
</template>


<script setup lang="ts">
    import {MathBattleGame, QuestionSet} from "@/game";
    import {divisions, multiplications} from "@/multiplications";
    import {reactive, ref, watch} from "vue";
    import Prompt from "@/Prompt.vue";
    import HealthBar from "@/HealthBar.vue";
    import FightScene from "@/FightScene.vue";
    import Fighter from "@/puppets/Fighter.vue";
    import {sleep} from "@/utils/promises";
    import BobTheSheep from "@/puppets/BobTheSheep.vue";

    const promptRef = ref<InstanceType<typeof Prompt> | null>(null);
    const fightSceneRef = ref<InstanceType<typeof FightScene> | null>(null);

    const questions = QuestionSet.of(
        multiplications(3),
        multiplications(4),
        divisions(3),
        divisions(4),
    ).jumble()

    const game = reactive(new MathBattleGame(questions, {
        ask(question, timeoutMsecs, submitAnswer) {
            if (!promptRef.value) throw new Error('prompt ref should be defined by now.');
            return promptRef.value.ask(question, timeoutMsecs, submitAnswer);
        },
        correct(combo?: number) {
            if (combo === 3) fightSceneRef.value?.punch3();
            else if (combo === 2) fightSceneRef.value?.punch2();
            else fightSceneRef.value?.punch();

            return promptRef.value?.correct();
        },
        incorrect(combo?: number, correctAnswer?: string) {
            if (combo === 3) fightSceneRef.value?.opponentPunch3();
            else if (combo === 2) fightSceneRef.value?.opponentPunch2();
            else fightSceneRef.value?.opponentPunch();

            return promptRef.value?.incorrect(correctAnswer);
        },
        getHit(combo?: number) {
            if (combo === 3) fightSceneRef.value?.opponentPunch3();
            else if (combo === 2) fightSceneRef.value?.opponentPunch2();
            else fightSceneRef.value?.opponentPunch();
        }
    }));

    watch(() => game.state, async () => {
        if (game.state === 'victory') {
            fightSceneRef.value?.win();
            await sleep(5000);
            game.reset();
        }
        if (game.state === 'game_over') {
            fightSceneRef.value?.lose();
            await sleep(5000);
            game.reset();
        }
    })

</script>


<style scoped lang="scss">

    .scene {
        background: transparent url('@/assets/pasture.svg') no-repeat bottom;
        background-size: cover;
        height: 100vh;
        width: 100vw;

        .fight-scene {
            position: absolute;
            bottom: 3vh;
            height: 100vw;
            width: 100vw;
            left: 50%;
            transform: translateX(-50%);

            @media (orientation: landscape) {
                height: 80vh;
                width: 80vh;
                bottom: 0;
            }
        }

    }

    .player-area, .opponent-area {
        position: absolute;
        top: 3vh;
        display: flex;
        flex-direction: column;

        .name {
            margin-bottom: 1vh;
            font-size: 2vw;
            color: #FFBF00;
            text-shadow: rgba(#000, .3) 0px 1px 2px;
        }

        .combo {
            margin-top: 1vh;
            font-size: 1.6vw;
            color: #FFBF00;
            text-shadow: rgba(#000, .3) 0px 1px 2px;
        }
    }

    .player-area {
        left: 3vw;
        align-items: flex-start;
    }
    .opponent-area {
        right: 3vw;
        align-items: flex-end;
        .opponent-health {
            transform: rotateZ(180deg);
        }
    }
    .prompt {
        position: absolute;
        top: 15vh;
        left: 50%;
        transform: translateX(-50%);
        z-index: 9;
    }

    .game-menu {
        text-align: center;
        min-width: 400px;
        position: absolute;
        z-index: 20;
        padding: 40px;
        background-color: #bd5f22;
        color: white;
        border: solid black 2px;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);

        button {
            padding: 10px 20px;
            font-family: inherit;
            font-size: 20px;
            color: inherit;
            background-color: inherit;
            border: solid white 2px;
            border-radius: 10px;
            margin-top: 4rem;
        }
    }

</style>

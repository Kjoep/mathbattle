<template>
    <div class="PuppetTest">
        <FightScene class="fight-scene" ref="fightScene" :player="player" :opponent="opponent" />
        <div class="controls">
            <button @click.prevent="fightScene?.punch()">Punch</button>
            <button @click.prevent="fightScene?.punch2()">Punch 2</button>
            <button @click.prevent="fightScene?.punch3()">Punch 3</button>
            <button @click.prevent="fightScene?.opponentPunch()">get hit</button>
            <button @click.prevent="fightScene?.opponentPunch2()">get hit 2</button>
            <button @click.prevent="fightScene?.opponentPunch3()">get hit 3</button>
            <button @click.prevent="fightScene?.win()">win</button>
            <button @click.prevent="fightScene?.lose()">lose</button>
            <select v-model="player">
                <option v-for="(f, name) in fighters" :value="f">{{ name }}</option>
            </select>
            <select v-model="opponent">
                <option v-for="(f, name) in fighters" :value="f">{{ name }}</option>
            </select>
        </div>
    </div>

</template>
<script setup lang="ts">
    import Fighter from "@/puppets/Fighter.vue";
    import {ref} from "vue";
    import FightScene from "@/FightScene.vue";
    import BobTheSheep from "@/puppets/BobTheSheep.vue";

    const fightScene = ref<InstanceType<typeof FightScene>>();

    const player = ref(Fighter);
    const opponent = ref(Fighter);

    const fighters = {
        Fighter,
        BobTheSheep,
    }

</script>
<style scoped lang="scss">

    .PuppetTest {
        display: flex;
        flex-direction: row;
        height: 100vh;
        width: 99vw;
        background-color: #6060b6;

        > * {
            flex-grow: 1;
        }
    }

    .fight-scene {
        width: 50vw;
        height: 50vw;
    }

    .controls {
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        border: dashed black 2px;
        padding: 15px;
        background-color: silver;

        button {
            padding: 15px;
        }
    }

</style>
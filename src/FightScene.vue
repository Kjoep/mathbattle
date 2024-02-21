<template>
    <div class="FightScene" ref="sceneRef">
        <Component class="player" :is="player" ref="playerRef" />
        <Component class="opponent" :is="opponent" ref="opponentRef" />
    </div>
</template>
<script setup lang="ts">

import {getCurrentInstance, onBeforeUnmount, ref} from "vue";
    import Fighter from "@/puppets/Fighter.vue";
    import {sleep} from "@/utils/promises";

    const key = getCurrentInstance()?.vnode.key;

    const { player, opponent } = defineProps<{player: any, opponent: any}>();

    const sceneRef = ref<HTMLDivElement>();
    const playerRef = ref<InstanceType<typeof Fighter> | null>(null);
    const opponentRef = ref<InstanceType<typeof Fighter> | null>(null);

    async function punch() {
        sceneRef.value?.classList.add('punching');
        sceneRef.value?.classList.remove('getHit');
        await sleep(playerRef.value?.punch() ?? 0);
        opponentRef.value?.getHit();
    }

    async function punch2() {
        sceneRef.value?.classList.add('punching');
        sceneRef.value?.classList.remove('getHit');
        await sleep(playerRef.value?.punch2() ?? 0);
        opponentRef.value?.getHit();
    }

    async function punch3() {
        sceneRef.value?.classList.add('punching');
        sceneRef.value?.classList.remove('getHit');
        await sleep(playerRef.value?.punch3() ?? 0);
        opponentRef.value?.getHit();
    }

    async function opponentPunch() {
        sceneRef.value?.classList.remove('punching');
        sceneRef.value?.classList.add('getHit');
        await sleep(opponentRef.value?.punch() ?? 0);
        playerRef.value?.getHit();
    }

    async function opponentPunch2() {
        sceneRef.value?.classList.remove('punching');
        sceneRef.value?.classList.add('getHit');
        await sleep(opponentRef.value?.punch2() ?? 0);
        playerRef.value?.getHit();
    }

    async function opponentPunch3() {
        sceneRef.value?.classList.remove('punching');
        sceneRef.value?.classList.add('getHit');
        await sleep(opponentRef.value?.punch3() ?? 0);
        playerRef.value?.getHit();
    }

    async function win() {
        await sleep(1000);
        playerRef.value?.victory();
        opponentRef.value?.ko();
    }

    async function lose() {
        await sleep(1000);
        opponentRef.value?.victory();
        playerRef.value?.ko();
    }

    defineExpose({ punch, punch2, punch3, opponentPunch, opponentPunch2, opponentPunch3, win, lose })


</script>
<style scoped lang="scss">

    .FightScene {
        position: relative;
        overflow: hidden;

        &.punching .player {
            z-index: 2;
        }
        &.getHit .opponent {
            z-index: 2;
        }

        .player, .opponent {
            position: absolute;
            bottom: -14%;
            height: 90%;
            width: 75%;
            z-index: 1;
        }

        .player {
            left: 0;
        }

        .opponent {
            right: 0;
            transform: scaleX(-100%);
        }

    }
</style>
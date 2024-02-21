<template>
    <div class="HealthBar">
        <div class="value" :style="{ 'width': `${value}%` }"></div>
    </div>
</template>
<script setup lang="ts">
    const { value } = defineProps<{ value: number }>();
</script>
<style lang="scss" scoped>

    .HealthBar {
        border: solid #FFBF00 3px;
        background-color: #AF0000;
        height: 3vw;
        width: 40vw;

        .value {
            background-color: #FFAF00;
            height: 100%;
            transition: width .2s linear;
        }
    }

</style>
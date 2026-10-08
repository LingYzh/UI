<script setup>
import { UContainer, UMain, UThemeProvider, URow, UCol, UCard } from '../index';
</script>

<template>
    <u-theme-provider tag="section" with-background>
        <u-container tag="article" fluid :max-width="560" :height="260">
            <u-main tag="div" scrollable :height="180" :min-height="0" class="mb-4">
                <u-card v-for="index in 6" :key="index" :title="`独立滚动内容 ${index}`" class="mb-2" />
            </u-main>
            <u-row dense align="start" align-md="center" justify="start" justify-md="space-between" align-content="stretch">
                <u-col cols="auto"><span>窄屏靠前</span></u-col>
                <u-col cols="auto"><span>宽屏两端对齐</span></u-col>
            </u-row>
        </u-container>
    </u-theme-provider>
</template>

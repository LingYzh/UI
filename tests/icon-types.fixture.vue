<script setup lang="ts">
import { defineComponent, h, ref } from 'vue';
import { mdiAccount, mdiClose } from '@mdi/js';
import type { IconValue } from '../src/ui/icon-config';
import type { HotkeyMap } from '../src/ui/hotkey';
import Icon from '../src/components/Icon.vue';
import UiButton from '../src/ui/UiButton.vue';
import UiInput from '../src/ui/UiInput.vue';
import UiCard from '../src/ui/UiCard.vue';
import UiPagination from '../src/ui/UiPagination.vue';
import UCarousel from '../src/ui/UCarousel.vue';
import UCarouselItem from '../src/ui/UCarouselItem.vue';
import UStepper from '../src/ui/UStepper.vue';
import UStepperItem from '../src/ui/UStepperItem.vue';
import UStepperVertical from '../src/ui/UStepperVertical.vue';
import UField from '../src/ui/UField.vue';
import UiSwitch from '../src/ui/UiSwitch.vue';
import UHotkey from '../src/ui/UHotkey.vue';
import UDataTable from '../src/ui/UDataTable.vue';
import UDataTableVirtual from '../src/ui/UDataTableVirtual.vue';
import UiDataTableServer from '../src/ui/UiDataTableServer.vue';

const pathIcon: IconValue = mdiAccount;
const pathArrayIcon: IconValue = [mdiAccount, [mdiClose, 0.35]];
const componentIcon = defineComponent({
    name: 'IconValueTypeFixtureComponent',
    setup() {
        return () => h('span', 'component icon');
    }
});
const componentIconValue: IconValue = componentIcon;
const page = ref(1);
const carouselItem = ref('first');
const step = ref('profile');
const checked = ref(true);
const stepItems = [
    { title: 'Profile', value: 'profile', props: { icon: pathArrayIcon } },
    { title: 'Review', value: 'review', props: { icon: componentIconValue } }
];
const keyMap: HotkeyMap = {
    ctrl: { default: { text: 'Control', icon: componentIconValue } }
};
const tableHeaders = [{ title: 'Name', key: 'name', sortable: true }];
const tableItems = [{ id: 1, name: 'Example row' }];
</script>

<template>
    <Icon :icon="pathIcon" />
    <Icon :icon="pathArrayIcon" />
    <Icon :icon="componentIconValue" />
    <UiButton :icon="componentIconValue" :prepend-icon="pathArrayIcon" :append-icon="pathIcon" />
    <UiInput label="Input" model-value="value" clearable :clear-icon="componentIconValue" />
    <UiCard title="Card" :prepend-icon="pathIcon" :append-icon="pathArrayIcon" />
    <UiPagination v-model="page" :length="5" :prev-icon="componentIconValue" :next-icon="pathArrayIcon" :first-icon="pathIcon" :last-icon="pathArrayIcon" />
    <UCarousel v-model="carouselItem" :delimiter-icon="componentIconValue" :show-arrows="false">
        <UCarouselItem value="first">First slide</UCarouselItem>
        <UCarouselItem value="second">Second slide</UCarouselItem>
    </UCarousel>
    <UStepperItem title="Standalone" value="standalone" :icon="componentIconValue" />
    <UStepper v-model="step" :items="stepItems" :hide-actions="true" />
    <UStepperVertical v-model="step" :items="stepItems" :hide-actions="true" />
    <UField label="Field" active dirty clearable :clear-icon="pathIcon" :prepend-inner-icon="pathArrayIcon" :append-inner-icon="componentIconValue">
        <template #default><input aria-label="Field control" /></template>
    </UField>
    <UiSwitch v-model="checked" label="Switch" :true-icon="componentIconValue" :false-icon="pathArrayIcon" />
    <UHotkey keys="ctrl" display-mode="icon" platform="pc" :listen="false" :key-map="keyMap" />
    <UDataTable :headers="tableHeaders" :items="tableItems" :sort-icon="componentIconValue" :sort-asc-icon="pathArrayIcon" :sort-desc-icon="pathIcon" :first-icon="pathIcon" :last-icon="componentIconValue" :prev-icon="pathArrayIcon" :next-icon="pathIcon" />
    <UDataTableVirtual :headers="tableHeaders" :items="tableItems" :sort-icon="componentIconValue" :sort-asc-icon="pathArrayIcon" :sort-desc-icon="pathIcon" />
    <UiDataTableServer :headers="tableHeaders" :items="tableItems" :items-length="tableItems.length" :sort-icon="componentIconValue" :first-icon="pathIcon" :last-icon="pathArrayIcon" />
</template>

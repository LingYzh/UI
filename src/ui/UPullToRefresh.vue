<script setup lang="ts">
import { useDefaults } from './defaults';
import { usePullRefreshState, type PullRefreshLoadContext } from './pull-refresh-state';
const rawProps = withDefaults(defineProps<{
    threshold?: number;
    pullDownThreshold?: number;
    resistance?: number;
    disabled?: boolean;
}>(), { threshold: 72, resistance: 0.5 });
const props = useDefaults(rawProps, 'UPullToRefresh');
const emit = defineEmits<{ refresh: [context: PullRefreshLoadContext]; load: [context: PullRefreshLoadContext] }>();
const { root, distance, refreshing, canRefresh, goingUp, begin, move, end, cancel, reset } = usePullRefreshState(() => props, context => {
    // Both event names describe the same request and share one idempotent done.
    emit('load', context);
    emit('refresh', context);
});
defineExpose({ element: root, distance, refreshing, canRefresh, goingUp, cancel, reset });
</script>

<template>
    <div ref="root" class="u-pull-to-refresh" :aria-busy="refreshing"
        @touchstart.passive="begin" @touchmove.passive="move" @touchend="end" @touchcancel="cancel"
        @mousedown="begin" @mousemove="move" @mouseup="end" @mouseleave="end">
        <div v-if="distance || refreshing" class="u-pull-indicator" role="status">
            <slot name="pullDownPanel" :can-refresh="canRefresh" :going-up="goingUp" :refreshing="refreshing">
                <slot name="indicator" :distance="refreshing ? 0 : distance" :refreshing="refreshing">
                    {{ refreshing ? '正在刷新…' : canRefresh ? '松开刷新' : '下拉刷新' }}
                </slot>
            </slot>
        </div>
        <div :style="{ transform: `translateY(${refreshing ? 0 : distance}px)` }"><slot :refreshing="refreshing" /></div>
    </div>
</template>

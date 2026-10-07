<script setup lang="ts">
import { onBeforeUnmount } from 'vue';
import UiButton from './UiButton.vue';
import { snackbar, snackbarState, type SnackbarPosition } from './snackbar';
import { uiText } from './locale';
import { useUiTheme } from './theme';
const theme = useUiTheme();
const positions: SnackbarPosition[] = ['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'];
function focusout(event: FocusEvent, id: number) {
    if (!(event.currentTarget as HTMLElement).contains(event.relatedTarget as Node | null)) snackbarState.resume(id, 'focus');
}
onBeforeUnmount(snackbar.clear);
</script>

<template>
    <Teleport to="body">
        <TransitionGroup v-for="position in positions" :key="position" tag="div" name="ui-snackbar" class="ui-snackbar-stack" :style="theme.styles.value" :data-ui-theme="theme.name.value" :data-theme="theme.current.value.dark ? 'dark' : 'light'" :data-position="position">
            <div v-for="notice in snackbarState.notices.value.filter((item) => item.position === position)" :key="notice.id" class="ui-snackbar" :data-tone="notice.tone" :role="notice.tone === 'error' ? 'alert' : 'status'" aria-atomic="true" @pointerenter="snackbarState.pause(notice.id, 'pointer')" @pointerleave="snackbarState.resume(notice.id, 'pointer')" @focusin="snackbarState.pause(notice.id, 'focus')" @focusout="focusout($event, notice.id)">
                <span class="ui-snackbar-mark" aria-hidden="true">{{ notice.tone === 'success' ? '✓' : notice.tone === 'error' ? '!' : 'i' }}</span>
                <span class="ui-snackbar-message">{{ notice.message }}</span>
                <UiButton variant="text" size="sm" icon :aria-label="uiText('snackbar.close')" @click="snackbar.dismiss(notice.id)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg></UiButton>
            </div>
        </TransitionGroup>
    </Teleport>
</template>

import test from 'node:test';
import assert from 'node:assert/strict';
import { confirmDialog, confirmState } from '../src/ui/confirm.ts';

test('confirmDialog queues requests in order and resolves each with its own answer', async () => {
    confirmState.cancelAll();
    const first = confirmDialog({ title: '删除', message: '删除账号？', tone: 'danger' });
    const second = confirmDialog('第二条');
    assert.deepEqual(confirmState.queue.value.map((item) => item.message), ['删除账号？', '第二条']);
    assert.equal(confirmState.queue.value[0].tone, 'danger');

    // Host 在弹窗关闭后按队首结算。
    confirmState.settle(confirmState.queue.value[0].id, true);
    assert.equal(await first, true);
    assert.deepEqual(confirmState.queue.value.map((item) => item.message), ['第二条']);
    confirmState.settle(confirmState.queue.value[0].id, false);
    assert.equal(await second, false);
    assert.equal(confirmState.queue.value.length, 0);
});

test('settling an unknown or already settled request is a no-op', async () => {
    confirmState.cancelAll();
    const pending = confirmDialog('唯一请求');
    const id = confirmState.queue.value[0].id;
    confirmState.settle(id + 999, true);
    assert.equal(confirmState.queue.value.length, 1);
    confirmState.settle(id, true);
    confirmState.settle(id, false);
    assert.equal(await pending, true);
});

test('cancelAll resolves every pending request with false', async () => {
    confirmState.cancelAll();
    const requests = [confirmDialog('a'), confirmDialog('b'), confirmDialog('c')];
    confirmState.cancelAll();
    assert.deepEqual(await Promise.all(requests), [false, false, false]);
    assert.equal(confirmState.queue.value.length, 0);
});

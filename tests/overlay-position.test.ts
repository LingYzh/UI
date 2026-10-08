import assert from 'node:assert/strict';
import test from 'node:test';
import { connectedOverlayPosition } from '../src/ui/overlay-position';

const viewport = { left: 0, top: 0, width: 800, height: 600 };
const target = { left: 300, top: 200, width: 100, height: 40 };
const size = { width: 200, height: 100 };

function position(props: Parameters<typeof connectedOverlayPosition>[0], rtl = false) {
    return connectedOverlayPosition(props, target, size, viewport, rtl);
}

test('connected placement supports numeric, string and tuple offsets with logical RTL alignment', () => {
    assert.deepEqual(position({ location: 'bottom-start', offset: [6, 4], viewportMargin: 12 }), {
        position: 'fixed', inset: 'auto', margin: '0', left: '304px', top: '246px',
        transformOrigin: 'top left', positionArea: 'none', positionTryFallbacks: 'none'
    });
    assert.equal(position({ location: 'bottom-start', offset: '6 4', viewportMargin: 12 }).left, '304px');
    assert.equal(position({ location: 'bottom-start', offset: 6, viewportMargin: 12 }).top, '246px');
    assert.deepEqual(
        [position({ location: 'bottom-start', offset: [6, 4], viewportMargin: 12 }, true).left,
            position({ location: 'bottom-start', offset: [6, 4], viewportMargin: 12 }, true).transformOrigin],
        ['204px', 'top right']
    );
});

test('origin auto, overlap and explicit anchor preserve the requested transform point', () => {
    const overlap = position({ location: 'bottom-start', offset: [6, 4], origin: 'overlap', viewportMargin: 12 });
    assert.equal(overlap.top, '146px');
    assert.equal(overlap.transformOrigin, 'bottom left');

    const explicit = position({ location: 'bottom-start', offset: [6, 4], origin: 'top right', viewportMargin: 12 });
    assert.equal(explicit.left, '104px');
    assert.equal(explicit.top, '246px');
    assert.equal(explicit.transformOrigin, 'top right');
});

test('connected placement flips, clamps to viewport margins and can stick to an offscreen target', () => {
    const flipped = connectedOverlayPosition(
        { location: 'bottom-start', viewportMargin: 12 },
        { left: 700, top: 550, width: 50, height: 40 }, size, viewport
    );
    assert.equal(flipped.left, '550px');
    assert.equal(flipped.top, '450px');

    const clamped = connectedOverlayPosition(
        { location: 'bottom-start', viewportMargin: '24' },
        { left: 0, top: 100, width: 50, height: 30 }, size, viewport
    );
    assert.equal(clamped.left, '24px');
    assert.equal(clamped.top, '130px');

    const stuck = connectedOverlayPosition(
        { location: 'bottom-start', viewportMargin: 50, stickToTarget: true },
        { left: 10, top: 10, width: 40, height: 20 }, { width: 100, height: 40 }, { left: 0, top: 0, width: 400, height: 300 }
    );
    assert.equal(stuck.left, '10px');
    assert.equal(stuck.top, '30px');
});

/**
 * Touch Controls Module
 * Handles all touch-based gestures for mobile gameplay.
 */
import * as Socket from './socket.js';
import { DIRECTIONS } from './config.js';

let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;
let touchStartTime = 0;

const SWIPE_THRESHOLD = 50; // Minimum distance for a swipe
const TAP_THRESHOLD = 20;   // Max distance for a tap
const TAP_TIME_THRESHOLD = 200; // Max time in ms for a tap
const HARD_DROP_VELOCITY = 0.5; // px/ms for a hard drop
const REPEAT_DELAY = 120; // Continuous press repeat delay (ms)

let controlsInitialized = false;
const pointerBindings = new Map(); // pointerId -> buttonId
const repeatIntervals = new Map(); // pointerId -> intervalId

const CONTROL_ACTIONS = {
    'btn-left': () => Socket.moveBlock(DIRECTIONS.LEFT),
    'btn-right': () => Socket.moveBlock(DIRECTIONS.RIGHT),
    'btn-down': () => Socket.moveBlock(DIRECTIONS.DOWN),
    'btn-rotate': () => Socket.rotateBlock(),
    'btn-drop': () => Socket.dropBlock(),
    'btn-hold': () => Socket.holdBlock()
};

const REPEATABLE_BUTTONS = new Set(['btn-left', 'btn-right', 'btn-down', 'btn-rotate']);

function handleGesture() {
    const dx = touchEndX - touchStartX;
    const dy = touchEndY - touchStartY;
    const elapsedTime = Date.now() - touchStartTime;

    // Check for tap first (low movement, short time)
    if (Math.abs(dx) < TAP_THRESHOLD && Math.abs(dy) < TAP_THRESHOLD && elapsedTime < TAP_TIME_THRESHOLD) {
        console.log('Gesture: Tap (Rotate)');
        Socket.rotateBlock();
        return;
    }

    // Check for vertical swipe (drop) - must be more vertical than horizontal
    if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > SWIPE_THRESHOLD) {
        if (dy > 0) { // Downward swipe
            const velocity = dy / elapsedTime;
            if (velocity > HARD_DROP_VELOCITY) {
                console.log('Gesture: Hard Drop');
                Socket.dropBlock();
            } else {
                console.log('Gesture: Soft Drop');
                Socket.moveBlock(DIRECTIONS.DOWN);
            }
        }
        // Upward swipe could be another action, but is ignored for now.
    }
    // Check for horizontal swipe (move) - must be more horizontal than vertical
    else if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > SWIPE_THRESHOLD) {
        const moveCount = Math.floor(Math.abs(dx) / (SWIPE_THRESHOLD / 2));
        for (let i = 0; i < moveCount; i++) {
            if (dx > 0) {
                console.log('Gesture: Move Right');
                Socket.moveBlock(DIRECTIONS.RIGHT);
            } else {
                console.log('Gesture: Move Left');
                Socket.moveBlock(DIRECTIONS.LEFT);
            }
        }
    }
}

function startControlAction(pointerId, buttonId, buttonEl) {
    const action = CONTROL_ACTIONS[buttonId];
    if (!action) return;

    action();
    pointerBindings.set(pointerId, buttonId);

    if (REPEATABLE_BUTTONS.has(buttonId)) {
        if (repeatIntervals.has(pointerId)) {
            clearInterval(repeatIntervals.get(pointerId));
        }
        const intervalId = setInterval(action, REPEAT_DELAY);
        repeatIntervals.set(pointerId, intervalId);
    }

    if (buttonEl && buttonEl.setPointerCapture) {
        try {
            buttonEl.setPointerCapture(pointerId);
        } catch (_) {
            // Ignore browsers that do not support pointer capture
        }
    }
}

function stopControlAction(pointerId) {
    const buttonId = pointerBindings.get(pointerId);
    if (!buttonId) return;

    if (repeatIntervals.has(pointerId)) {
        clearInterval(repeatIntervals.get(pointerId));
        repeatIntervals.delete(pointerId);
    }

    pointerBindings.delete(pointerId);
}

function shouldHandleGesture(target) {
    return !target.closest('.mobile-controls-inline');
}

export function initTouchControls() {
    if (controlsInitialized) return;

    const gameContainer = document.getElementById('game-container');
    if (!gameContainer) return;

    document.addEventListener('pointerdown', (event) => {
        const button = event.target.closest('.mobile-controls-inline button');
        if (!button) return;

        const buttonId = button.id;
        if (!CONTROL_ACTIONS[buttonId]) return;

        event.preventDefault();
        startControlAction(event.pointerId, buttonId, button);
    }, { passive: false });

    const pointerStopHandler = (event) => {
        if (!pointerBindings.has(event.pointerId)) return;
        stopControlAction(event.pointerId);
        const button = event.target && event.target.closest('.mobile-controls-inline button');
        if (button && button.releasePointerCapture) {
            try {
                button.releasePointerCapture(event.pointerId);
            } catch (_) {
                // Ignore if capture was not set
            }
        }
    };

    document.addEventListener('pointerup', pointerStopHandler, { passive: true });
    document.addEventListener('pointercancel', pointerStopHandler, { passive: true });
    document.addEventListener('pointerleave', pointerStopHandler, { passive: true });

    gameContainer.addEventListener('touchstart', (e) => {
        if (!shouldHandleGesture(e.target)) {
            return;
        }

        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
        touchStartTime = Date.now();
    }, { passive: true });

    gameContainer.addEventListener('touchmove', (e) => {
        if (!shouldHandleGesture(e.target)) {
            return;
        }

        e.preventDefault();
    }, { passive: false });

    gameContainer.addEventListener('touchend', (e) => {
        if (!shouldHandleGesture(e.target)) {
            return;
        }

        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        handleGesture();
    }, { passive: true });

    console.log('📱 Touch controls initialized.');
    controlsInitialized = true;
}
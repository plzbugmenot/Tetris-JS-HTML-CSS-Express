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

function handleGesture() {
    const dx = touchEndX - touchStartX;
    const dy = touchEndY - touchStartY;
    const elapsedTime = Date.now() - touchStartTime;

    // Check for tap first
    if (Math.abs(dx) < TAP_THRESHOLD && Math.abs(dy) < TAP_THRESHOLD && elapsedTime < TAP_TIME_THRESHOLD) {
        console.log('Gesture: Tap (Rotate)');
        Socket.rotateBlock();
        return;
    }

    // Check for vertical swipe (drop)
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
    }
    // Check for horizontal swipe (move)
    else if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > SWIPE_THRESHOLD) {
        if (dx > 0) {
            console.log('Gesture: Move Right');
            Socket.moveBlock(DIRECTIONS.RIGHT);
        } else {
            console.log('Gesture: Move Left');
            Socket.moveBlock(DIRECTIONS.LEFT);
        }
    }
}

export function initTouchControls() {
    const gameContainer = document.getElementById('game-container');
    const holdButton = document.getElementById('mobile-hold-btn');

    if (!gameContainer || !holdButton) return;

    holdButton.addEventListener('click', () => {
        console.log('Action: Stash (Hold)');
        Socket.holdBlock();
    });

    gameContainer.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
        touchStartTime = Date.now();
    }, { passive: true });

    gameContainer.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        handleGesture();
    }, { passive: true });

    console.log('📱 Touch controls initialized.');
}
/**
 * 鍵盤控制模組
 * 負責處理鍵盤輸入和遊戲控制
 */

import { KEY_CODES, DIRECTIONS } from './config.js';

let onMoveBlock = null;
let onRotateBlock = null;
let onDropBlock = null;
let onHoldBlock = null; // 新增 hold 回調
let isGameActive = false;

/**
 * 初始化鍵盤監聽
 * @param {Function} moveCallback - 移動方塊回調
 * @param {Function} rotateCallback - 旋轉方塊回調
 * @param {Function} dropCallback - 快速下落回調
 * @param {Function} holdCallback - 暫存方塊回調
 */
export function initKeyboard(moveCallback, rotateCallback, dropCallback, holdCallback) {
    onMoveBlock = moveCallback;
    onRotateBlock = rotateCallback;
    onDropBlock = dropCallback;
    onHoldBlock = holdCallback; // 設置 hold 回調

    document.addEventListener('keydown', handleKeyDown);
    console.log('⌨️ 鍵盤控制已初始化');
}

/**
 * 設置遊戲活躍狀態
 * @param {boolean} active - 是否活躍
 */
export function setGameActive(active) {
    isGameActive = active;
}

/**
 * 處理鍵盤按下事件
 * @param {KeyboardEvent} event - 鍵盤事件
 */
function handleKeyDown(event) {
    if (!isGameActive) return;

    const key = event.code;

    if ([KEY_CODES.ARROW_UP, KEY_CODES.ARROW_DOWN, KEY_CODES.ARROW_LEFT, KEY_CODES.ARROW_RIGHT, KEY_CODES.SPACE, KEY_CODES.SHIFT_LEFT].includes(key)) {
        event.preventDefault();
    }

    switch (key) {
        case KEY_CODES.ARROW_LEFT:
        case KEY_CODES.KEY_A:
            if (onMoveBlock) onMoveBlock(DIRECTIONS.LEFT);
            break;

        case KEY_CODES.ARROW_RIGHT:
        case KEY_CODES.KEY_D:
            if (onMoveBlock) onMoveBlock(DIRECTIONS.RIGHT);
            break;

        case KEY_CODES.ARROW_DOWN:
        case KEY_CODES.KEY_S:
            if (onMoveBlock) onMoveBlock(DIRECTIONS.DOWN);
            break;

        case KEY_CODES.ARROW_UP:
        case KEY_CODES.KEY_W:
            if (onRotateBlock) onRotateBlock();
            break;

        case KEY_CODES.SPACE:
            if (onDropBlock) onDropBlock();
            break;
        
        // 新增 hold 功能
        case KEY_CODES.SHIFT_LEFT:
        case KEY_CODES.KEY_C: // 添加 C 鍵作為備用
            if (onHoldBlock) onHoldBlock();
            break;

        default:
            break;
    }
}

/**
 * 移除鍵盤監聽
 */
export function removeKeyboardListeners() {
    document.removeEventListener('keydown', handleKeyDown);
    console.log('⌨️ 鍵盤監聽已移除');
}

/**
 * 顯示控制說明
 */
export function showControls() {
    const controls = `
    遊戲控制:
    ⬅️ A / ← : 左移
    ➡️ D / → : 右移
    ⬇️ S / ↓ : 快速下移
    🔄 W / ↑ : 旋轉
    ⚡ 空白鍵 : 瞬間下落
    HOLD C / Shift: 暫存方塊
  `;
    console.log(controls);
}

export default {
    initKeyboard,
    setGameActive,
    removeKeyboardListeners,
    showControls,
};
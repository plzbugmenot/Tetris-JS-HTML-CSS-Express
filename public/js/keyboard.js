/**
 * 鍵盤控制模組
 * 負責處理鍵盤輸入和遊戲控制
 */

import { KEY_CODES, DIRECTIONS } from './config.js';

let onMoveBlock = null;
let onRotateBlock = null;
let onDropBlock = null;
let isGameActive = false;

/**
 * 初始化鍵盤監聽
 * @param {Function} moveCallback - 移動方塊回調
 * @param {Function} rotateCallback - 旋轉方塊回調
 * @param {Function} dropCallback - 快速下落回調
 */
export function initKeyboard(moveCallback, rotateCallback, dropCallback) {
    onMoveBlock = moveCallback;
    onRotateBlock = rotateCallback;
    onDropBlock = dropCallback;

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
    // 如果遊戲不活躍,不處理
    if (!isGameActive) return;

    const key = event.code;

    // 防止箭頭鍵滾動頁面
    if ([KEY_CODES.ARROW_UP, KEY_CODES.ARROW_DOWN, KEY_CODES.ARROW_LEFT, KEY_CODES.ARROW_RIGHT, KEY_CODES.SPACE].includes(key)) {
        event.preventDefault();
    }

    switch (key) {
        // 左移
        case KEY_CODES.ARROW_LEFT:
        case KEY_CODES.KEY_A:
            if (onMoveBlock) {
                onMoveBlock(DIRECTIONS.LEFT);
            }
            break;

        // 右移
        case KEY_CODES.ARROW_RIGHT:
        case KEY_CODES.KEY_D:
            if (onMoveBlock) {
                onMoveBlock(DIRECTIONS.RIGHT);
            }
            break;

        // 下移
        case KEY_CODES.ARROW_DOWN:
        case KEY_CODES.KEY_S:
            if (onMoveBlock) {
                onMoveBlock(DIRECTIONS.DOWN);
            }
            break;

        // 旋轉
        case KEY_CODES.ARROW_UP:
        case KEY_CODES.KEY_W:
            if (onRotateBlock) {
                onRotateBlock();
            }
            break;

        // 快速下落
        case KEY_CODES.SPACE:
            if (onDropBlock) {
                onDropBlock();
            }
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
  `;
    console.log(controls);
}

export default {
    initKeyboard,
    setGameActive,
    removeKeyboardListeners,
    showControls,
};

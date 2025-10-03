/**
 * 前端配置模組
 * 定義所有前端常數和遊戲狀態
 */

// 遊戲狀態常數
export const GAME_STATES = {
    READY: 'READY',
    GAME: 'GAME',
    WIN: 'WIN',
    LOSE: 'LOSE',
    ELIMINATED: 'ELIMINATED',
    SPECTATOR: 'SPECTATOR'
};

// 遊戲參數
export const GAME_CONFIG = {
    FRAME: 10,
    BOARD_HEIGHT: 21,
    BOARD_WIDTH: 10,
    MAX_PLAYERS: 8,
};

// 鍵盤按鍵映射
export const KEY_CODES = {
    ARROW_LEFT: 'ArrowLeft',
    ARROW_RIGHT: 'ArrowRight',
    ARROW_UP: 'ArrowUp',
    ARROW_DOWN: 'ArrowDown',
    KEY_A: 'KeyA',
    KEY_D: 'KeyD',
    KEY_W: 'KeyW',
    KEY_S: 'KeyS',
    KEY_C: 'KeyC',
    SPACE: 'Space',
    SHIFT_LEFT: 'ShiftLeft',
};

// 方向常數
export const DIRECTIONS = {
    LEFT: 'LEFT',
    RIGHT: 'RIGHT',
    DOWN: 'DOWN',
    UP: 'UP',
};

// 顏色配置
export const COLORS = {
    PRIMARY: '#4CAF50',
    SECONDARY: '#2196F3',
    DANGER: '#f44336',
    WARNING: '#ff9800',
    SUCCESS: '#8BC34A',
};

// DOM 元素 ID
export const DOM_IDS = {
    REGISTER: 'register',
    NAME_INPUT: 'name',
    GAME_CONTAINER: 'game-container',
    MESSAGE_DISPLAY: 'message-display',
    START_BUTTON: 'start-game-btn',
    ROOM_STATUS: 'room-status',
    PLAYERS_INFO: 'players-info',
    SCOREBOARD: 'scoreboard',
    SCORE_LIST: 'score-list',
    GAME_OVER_OVERLAY: 'game-over-overlay',
    GAME_OVER_MESSAGE: 'game-over-message',
    FINAL_SCORE_LIST: 'final-score-list',
};

export default {
    GAME_STATES,
    GAME_CONFIG,
    KEY_CODES,
    DIRECTIONS,
    COLORS,
    DOM_IDS,
};

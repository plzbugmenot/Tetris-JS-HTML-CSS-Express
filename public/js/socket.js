/**
 * Socket 連接管理模組
 * 負責 Socket.IO 連接和事件監聽
 */

import { GAME_STATES } from './config.js';
import * as UI from './ui.js';

// 全局變數
let socket = null;
let mySocketId = null;
let allPlayers = [];
let myPlayerData = null;
let maxPlayers = 4;
let gameState = GAME_STATES.READY;

// 回調函數
let onGameStateUpdate = null;
let onPlayerEliminated = null;
let onGameOver = null;

/**
 * 初始化 Socket 連接
 * @param {Function} onStateUpdate - 狀態更新回調
 * @param {Function} onEliminated - 玩家淘汰回調
 * @param {Function} onGameEnd - 遊戲結束回調
 */
export function initSocket(onStateUpdate, onEliminated, onGameEnd) {
    // 從全局獲取 socket (由 index.html 提供)
    socket = window.socket;

    if (!socket) {
        console.error('Socket not available');
        return;
    }

    // 設置回調
    onGameStateUpdate = onStateUpdate;
    onPlayerEliminated = onEliminated;
    onGameOver = onGameEnd;

    // 設置事件監聽
    setupSocketListeners();

    mySocketId = socket.id;
    console.log('Socket initialized:', mySocketId);
}

/**
 * 設置 Socket 事件監聽器
 */
function setupSocketListeners() {
    if (!socket) return;

    // 連線成功
    socket.on('connect', () => {
        console.log('✅ Socket 已連接:', socket.id);
        mySocketId = socket.id;
    });

    // 新玩家加入響應
    socket.on('newUserResponse', (data) => {
        console.log('👤 新玩家加入:', data);
        maxPlayers = data.maxPlayers || 4;
        UI.updateRoomStatus(data.size, maxPlayers);

        if (data.size >= 2) {
            UI.showStartButton();
        }
    });

    // 連線被拒絕
    socket.on('connectionRejected', (data) => {
        UI.showMessage(data.reason, 'error');
        UI.showRegisterForm();
    });

    // 遊戲開始失敗
    socket.on('gameStartFailed', (data) => {
        UI.showMessage(data.reason, 'error');
    });

    // 玩家離線
    socket.on('playerDisconnected', (data) => {
        UI.showMessage(`${data.userName} 已離開遊戲`, 'info');
        UI.updateRoomStatus(data.remainingPlayers, maxPlayers);

        if (data.remainingPlayers < 2) {
            UI.hideStartButton();
        }
    });

    // 遊戲狀態更新
    socket.on('stateOfUsers', (data) => {
        allPlayers = data.users;
        gameState = data.gameState;

        // 找出我的玩家數據
        myPlayerData = allPlayers.find(p => p.socketID === mySocketId);

        // 觸發回調
        if (onGameStateUpdate) {
            onGameStateUpdate({
                allPlayers,
                myPlayerData,
                gameState,
                mySocketId
            });
        }

        // 更新計分板
        if (gameState === GAME_STATES.GAME) {
            UI.updateScoreboard(allPlayers, gameState);
        }
    });

    // 玩家被淘汰
    socket.on('playerEliminated', (data) => {
        console.log(`🚫 玩家淘汰: ${data.userName} (${data.who})`);
        UI.showMessage(`${data.userName} 被淘汰！`, 'error');

        // 觸發回調
        if (onPlayerEliminated) {
            onPlayerEliminated(data);
        }

        // 更新計分板
        UI.updateScoreboard(allPlayers, gameState);
    });

    // 所有玩家都失敗
    socket.on('allPlayersGameOver', (data) => {
        console.log('🎮 遊戲結束！', data);
        UI.showGameOverScreen(data);

        // 觸發回調
        if (onGameOver) {
            onGameOver(data);
        }
    });

    // 準備狀態
    socket.on('readyStateEmit', () => {
        gameState = GAME_STATES.READY;
        UI.hideGameOverScreen();
        UI.showMessage('遊戲結束，準備開始新遊戲', 'info');

        // 隱藏計分板
        const scoreboard = document.getElementById('scoreboard');
        if (scoreboard) {
            scoreboard.style.display = 'none';
        }

        // 顯示開始按鈕
        if (allPlayers.length >= 2) {
            UI.showStartButton();
        }
    });

    // 消行動畫事件
    socket.on('lineCleared', (data) => {
        console.log(`✨ 消行動畫: ${data.userName} 消除了 ${data.linesCleared} 行`);

        // 觸發自定義事件，通知渲染模組播放動畫
        window.dispatchEvent(new CustomEvent('playLineClearAnimation', {
            detail: data
        }));
    });
}

/**
 * 註冊新玩家
 * @param {string} userName - 玩家名稱
 */
export function registerPlayer(userName) {
    if (!socket) {
        console.error('Socket not initialized');
        return;
    }

    if (!userName || userName.trim() === '') {
        UI.showMessage('請輸入玩家名稱', 'error');
        return;
    }

    const data = {
        userName: userName.trim(),
        socketID: socket.id
    };

    socket.emit('newUser', data);
    UI.hideRegisterForm();
    UI.showMessage(`歡迎 ${userName}！`, 'success');
}

/**
 * 開始遊戲
 */
export function startGame() {
    if (!socket) {
        console.error('Socket not initialized');
        return;
    }

    socket.emit('startGameWithCouplePlayer');
    UI.hideStartButton();
    UI.showMessage('遊戲開始！', 'success');
}

/**
 * 發送方塊移動指令
 * @param {string} direction - 移動方向
 */
export function moveBlock(direction) {
    if (!socket || !mySocketId) return;

    socket.emit('moveBlock', {
        socketID: mySocketId,
        direction: direction
    });
}

/**
 * 發送方塊旋轉指令
 */
export function rotateBlock() {
    if (!socket || !mySocketId) return;

    socket.emit('changeDirection', {
        socketID: mySocketId
    });
}

/**
 * 發送方塊快速下落指令
 */
export function dropBlock() {
    if (!socket || !mySocketId) return;

    socket.emit('dropBlock', {
        socketID: mySocketId
    });
}

/**
 * 獲取當前玩家數據
 */
export function getMyPlayerData() {
    return myPlayerData;
}

/**
 * 獲取所有玩家數據
 */
export function getAllPlayers() {
    return allPlayers;
}

/**
 * 獲取我的 Socket ID
 */
export function getMySocketId() {
    return mySocketId;
}

/**
 * 獲取當前遊戲狀態
 */
export function getGameState() {
    return gameState;
}

export default {
    initSocket,
    registerPlayer,
    startGame,
    moveBlock,
    rotateBlock,
    dropBlock,
    getMyPlayerData,
    getAllPlayers,
    getMySocketId,
    getGameState,
};

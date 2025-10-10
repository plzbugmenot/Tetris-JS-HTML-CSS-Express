/**
 * 主入口文件
 * 整合所有模組並初始化遊戲
 */

import { GAME_STATES } from './config.js';
import * as Socket from './socket.js';
import * as UI from './ui.js';
import * as Render from './render.js';
import * as Keyboard from './keyboard.js';

// ==================== 全局變數 ====================
let isInitialized = false;

// ==================== 初始化 ====================
/**
 * 初始化遊戲
 */
function init() {
    console.log('🎮 遊戲初始化中...');

    // 等待 socket 準備好
    if (typeof window.socket !== 'undefined' && window.socket) {
        initializeGame();
    } else {
        window.addEventListener('socketReady', () => {
            initializeGame();
        });
    }
}

/**
 * 初始化遊戲模組
 */
function initializeGame() {
    if (isInitialized) {
        console.warn('⚠️ 遊戲已經初始化');
        return;
    }

    // 初始化 Socket
    Socket.initSocket(
        handleGameStateUpdate,
        handlePlayerEliminated,
        handleGameOver
    );

    // 初始化鍵盤控制 (新增 holdBlock)
    Keyboard.initKeyboard(
        Socket.moveBlock,
        Socket.rotateBlock,
        Socket.dropBlock,
        Socket.holdBlock // 新增 hold 功能
    );

    // 顯示控制說明
    Keyboard.showControls();

    // 新增觀戰功能
    setupSpectatorSwitch();

    isInitialized = true;
    console.log('✅ 遊戲初始化完成');
}

// 新增觀戰功能
function setupSpectatorSwitch() {
    const playerElements = document.querySelectorAll('.player'); // 假設每個玩家都有 .player 類別
    playerElements.forEach(playerElement => {
        playerElement.addEventListener('click', () => {
            const socketID = playerElement.dataset.socketId; // 假設 socketID 存在於 data-attribute
            Socket.setSpectatorTarget(socketID);
        });
    });
}

// ==================== 回調函數 ====================
/**
 * 處理遊戲狀態更新
 * @param {Object} data - 遊戲狀態數據
 */
function handleGameStateUpdate(data) {
    const { allPlayers, myPlayerData, gameState, mySocketId } = data;

    // 檢查是否為觀戰者
    const isSpectator = myPlayerData && myPlayerData.playerType === 'SPECTATOR';

    // 如果是觀戰者且還沒有設置觀戰目標，自動選擇第一個挑戰者
    if (isSpectator && !Socket.getSpectatorTarget()) {
        const challengers = allPlayers.filter(p => p.playerType !== 'SPECTATOR');
        if (challengers.length > 0) {
            Socket.setSpectatorTarget(challengers[0].socketID);
        }
    }

    // 渲染玩家棋盤
    Render.renderAllPlayers(allPlayers, mySocketId, isSpectator);

    // 每次重新渲染玩家列表後，都要重新設定點擊事件
    setupSpectatorSwitch();

    // Debug: 觀察遊戲狀態
    // console.log('GameState:', gameState);

    if (gameState === GAME_STATES.GAME) {
        // 只有遊戲進行中才渲染方塊
        Render.updateAllBoards(allPlayers, isSpectator);

        // 只有挑戰者可以操作，觀戰者不能操作
        const isChallenger = myPlayerData && myPlayerData.playerType !== 'SPECTATOR';
        Keyboard.setGameActive(isChallenger);
    } else {
        // 非遊戲狀態，禁止操作
        Keyboard.setGameActive(false);
        // 可選：清空棋盤或顯示等待畫面
        // Render.clearAllBoards();
    }
}

/**
 * 處理玩家淘汰
 * @param {Object} data - 淘汰數據
 */
function handlePlayerEliminated(data) {
    // 添加淘汰效果
    Render.addEliminationEffect(data.socketID);
}

/**
 * 處理遊戲結束
 * @param {Object} data - 遊戲結束數據
 */
function handleGameOver(data) {
    // 1. 停用鍵盤
    Keyboard.setGameActive(false);
    console.log('🏁 遊戲結束處理中...', data);

    // 注意：不再重複顯示遊戲結束畫面，已由 socket.js 的 allPlayersGameOver 事件處理
    // 注意：不再執行頁面刷新，讓伺服器端的 readyStateEmit 事件處理重置
}

// ==================== 全局函數 (供 HTML 調用) ====================
/**
 * 註冊玩家 (由 HTML 按鈕調用)
 */
window.registerPlayer = function () {
    const nameInput = document.getElementById('name');
    if (!nameInput) return;

    const playerName = nameInput.value.trim();
    Socket.registerPlayer(playerName);
};

/**
 * 開始遊戲 (由 HTML 按鈕調用)
 */
window.requestStartGame = function () {
    Socket.startGame();
};

/**
 * 加入挑戰 (由 HTML 按鈕調用)
 */
window.requestJoinChallenge = function () {
    Socket.joinChallenge();
};

// ==================== 啟動遊戲 ====================
// 當 DOM 載入完成後初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

console.log('📦 主模組已載入');
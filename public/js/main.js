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

    // 初始化鍵盤控制
    Keyboard.initKeyboard(
        Socket.moveBlock,
        Socket.rotateBlock,
        Socket.dropBlock
    );

    // 顯示控制說明
    Keyboard.showControls();

    isInitialized = true;
    console.log('✅ 遊戲初始化完成');
}

// ==================== 回調函數 ====================
/**
 * 處理遊戲狀態更新
 * @param {Object} data - 遊戲狀態數據
 */
function handleGameStateUpdate(data) {
    const { allPlayers, myPlayerData, gameState, mySocketId } = data;

    // 渲染所有玩家（只顯示靜態資訊，不渲染方塊）
    Render.renderAllPlayers(allPlayers, mySocketId);

    // Debug: 觀察遊戲狀態
    console.log('GameState:', gameState);

    if (gameState === GAME_STATES.GAME) {
        // 只有遊戲進行中才渲染方塊
        Render.updateAllBoards(allPlayers);

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
    console.log('🏁 遊戲結束，排行榜顯示中...', data);

    // 2. 呼叫 ui.js 裡的函式來顯示排行榜
    //    (這一步確認您的程式碼已經在做了)
    UI.showGameOverScreen(data);

    // 3. 設定一個計時器，在排行榜顯示一段時間後執行動作
    setTimeout(() => {
        // 4. (可選) 讓排行榜優雅地消失
        UI.hideGameOverScreen();

        // 5. 執行網頁重新整理
        console.log('🔄 正在重新整理頁面...');
        location.reload();

    }, 5000); // 5000 毫秒 = 5 秒。您可以根據需要調整這個時間
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
 * 加入挑戰並直接開始遊戲 (由 HTML 按鈕調用)
 */
window.requestJoinChallenge = function () {
    Socket.joinChallenge();
    Socket.startGame(); // 加入挑戰後直接開始遊戲
};

// ==================== 啟動遊戲 ====================
// 當 DOM 載入完成後初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

console.log('📦 主模組已載入');

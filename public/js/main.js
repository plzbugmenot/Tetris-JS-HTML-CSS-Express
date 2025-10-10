/**
 * 主入口文件
 * 整合所有模組並初始化遊戲
 */

import { GAME_STATES } from './config.js';
import * as Socket from './socket.js';
import { DIRECTIONS } from './config.js';
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

    // 設定觸控按鈕的事件監聽
    setupTouchControls();

    isInitialized = true;
    console.log('✅ 遊戲初始化完成');
}

// V V V V V V V 新增的完整函數 V V V V V V V
/**
 * 設定觸控按鈕的事件監聽 (【支援長按的最終版本】)
 */
function setupTouchControls() {
    console.log('📱 觸控按鈕已設定 (支援長按)');

    const controls = {
        'btn-left': () => Socket.moveBlock(DIRECTIONS.LEFT),
        'btn-right': () => Socket.moveBlock(DIRECTIONS.RIGHT),
        'btn-down': () => Socket.moveBlock(DIRECTIONS.DOWN),
        'btn-rotate': () => Socket.rotateBlock(),
        'btn-drop': () => Socket.dropBlock(),
        'btn-hold': () => Socket.holdBlock()
    };

    // 用於儲存計時器ID，以便後續清除
    let activeIntervals = {};
    // 連續觸發的間隔時間 (毫秒)，數字越小，重複速度越快。你可以自行調整這個值。
    const REPEAT_DELAY = 120;

    for (const [btnId, action] of Object.entries(controls)) {
        const button = document.getElementById(btnId);
        if (button) {
            // 在這裡定義哪些按鈕需要支援長按連續觸發
            const continuousActions = ['btn-left', 'btn-right', 'btn-down', 'btn-rotate'];

            if (continuousActions.includes(btnId)) {
                // --- 處理需要「長按」的按鈕 (左, 右, 下, 旋轉) ---

                // 定義「開始動作」的函數
                const startAction = (e) => {
                    e.preventDefault();
                    if (activeIntervals[btnId]) return; // 防止重複啟動計時器

                    action(); // 1. 按下時，立刻執行一次
                    // 2. 啟動計時器，之後每隔 REPEAT_DELAY 毫秒重複執行
                    activeIntervals[btnId] = setInterval(action, REPEAT_DELAY);
                };

                // 定義「停止動作」的函數
                const stopAction = (e) => {
                    e.preventDefault();
                    // 3. 手指或滑鼠離開時，清除計時器
                    clearInterval(activeIntervals[btnId]);
                    delete activeIntervals[btnId]; // 從記錄中移除
                };

                // 為了兼容電腦和手機，我們監聽所有代表「開始」和「結束」的事件
                button.addEventListener('mousedown', startAction);   // 滑鼠按下
                button.addEventListener('touchstart', startAction);  // 手指按下

                button.addEventListener('mouseup', stopAction);      // 滑鼠鬆開
                button.addEventListener('mouseleave', stopAction);   // 滑鼠移出按鈕範圍
                button.addEventListener('touchend', stopAction);     // 手指離開螢幕
                button.addEventListener('touchcancel', stopAction);  // 觸控被系統取消

            } else {
                // --- 處理只需要「單次點擊」的按鈕 (瞬間下落, HOLD) ---
                const handleTap = (e) => {
                    e.preventDefault();
                    action();
                };
                button.addEventListener('click', handleTap);
                button.addEventListener('touchstart', handleTap);
            }
        } else {
            console.error(`❌ 警告：找不到 ID 為 "${btnId}" 的按鈕元素！`);
        }
    }
    console.log('📱 觸控按鈕已設定');
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
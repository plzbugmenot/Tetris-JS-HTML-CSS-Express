/**
 * Socket 連接管理模組
 * 負責 Socket.IO 連接和事件監聽
 */

import { GAME_STATES } from './config.js';
import * as UI from './ui.js';
import * as Keyboard from './keyboard.js';
import * as Render from './render.js';

// 全局變數
let socket = null;
let mySocketId = null;
let allPlayers = [];
let myPlayerData = null;
let maxPlayers = 999; // 顯示用的參考值 (實際已移除人數限制)
let gameState = GAME_STATES.READY;
let myPlayerType = 'CHALLENGER'; // 我的玩家類型
let spectatorTarget = null; // 觀戰者當前觀看的目標玩家ID

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
    console.log('Socket initialized: ', mySocketId || 'not yet connected');
}

/**
 * 設置 Socket 事件監聽器
 */
function setupSocketListeners() {
    if (!socket) return;

    // 連線成功
    socket.on('connect', () => {
        mySocketId = socket.id;
        console.log('✅ Socket 已連接: ', mySocketId);
    });

    // 新玩家加入響應
    socket.on('newUserResponse', (data) => {
        const userName = data.newUser?.userName || 'Unknown Agent';
        console.log(`👤 New agent joined: ${userName}`, data);
        maxPlayers = data.maxPlayers || 999; // 顯示用的參考值
        myPlayerType = data.playerType || 'CHALLENGER';
        // 暴露玩家類型到全域變數供UI模組使用
        window.currentPlayerType = myPlayerType;

        // 單人模式：第一位玩家，自動開始
        if (data.size === 1 && data.challengers === 1) {
            UI.updateRoomStatus(data.challengers, data.spectators, maxPlayers, 'single');
            UI.showMessage('SYSTEM: Standalone mode. Initiating...', 'success');
            // 隱藏開始按鈕（單機模式自動開始）
            UI.hideStartButton();
            UI.hideJoinChallengeButton(); // 單人模式也不需要加入挑戰按鈕
        }
        // 觀戰者模式：顯示觀戰提示和加入挑戰按鈕
        else if (myPlayerType === 'SPECTATOR') {
            UI.updateRoomStatus(data.challengers, data.spectators, maxPlayers, 'spectator');
            UI.showJoinChallengeButton();
            // 只在初次成為觀戰者或準備狀態時顯示提示
            if (gameState === GAME_STATES.READY) {
                UI.showMessage('SYSTEM: Spectator mode. Click on an agent in the status panel to observe.', 'info');
            }
        }
        // 多人挑戰模式：顯示房間狀態和開始按鈕
        else {
            UI.updateRoomStatus(data.challengers, data.spectators, maxPlayers, 'multi');
            UI.showStartButton();
            UI.hideJoinChallengeButton(); // 挑戰者不應該看到加入挑戰按鈕
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
        const userType = data.playerType === 'SPECTATOR' ? 'Observer' : 'Agent';
        UI.showMessage(`${userType} ${data.userName} has disconnected.`, 'info');

        // 根據剩餘人數更新UI
        const mode = data.remainingChallengers === 1 ? 'single' : 'multi';
        UI.updateRoomStatus(data.remainingChallengers, data.remainingSpectators, maxPlayers, mode);

        if (data.remainingChallengers < 2) {
            UI.hideStartButton();
        }
    });

    // 遊戲狀態更新
    socket.on('stateOfUsers', (data) => {
        allPlayers = data.users;
        gameState = data.gameState;

        // 找出我的玩家數據
        myPlayerData = allPlayers.find(p => p.socketID === mySocketId);

        // 更新所有玩家的統計數據顯示
        allPlayers.forEach(player => {
            Render.updatePlayerStats(player);
        });

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
        const userName = data.userName || 'Unknown Agent';
        const who = data.who || data.socketID || 'undefined';

        if (data.showEliminationOnly) {
            console.log(`� ELIMINATION EFFECT: ${userName} (${who})`);
        } else {
            console.log(`🚫 AGENT ELIMINATED: ${userName} (${who})`);
            // 只有在明確標記要顯示遊戲結束時才顯示訊息
            if (data.showGameOver !== false) {
                UI.showMessage(`Agent ${userName} has been compromised!`, 'error');
            }
        }

        // 總是觸發淘汰效果動畫
        if (onPlayerEliminated) {
            onPlayerEliminated(data);
        }

        // 更新計分板
        UI.updateScoreboard(allPlayers, gameState);
    });

    // 所有玩家都失敗
    socket.on('allPlayersGameOver', (data) => {
        console.log('🎮 Mission Over!', data);

        // 檢查當前玩家是否為觀戰者
        const myPlayer = getMyPlayerData();
        const isSpectator = myPlayer && myPlayer.playerType === 'SPECTATOR';

        if (!isSpectator) {
            // 只有非觀戰者才顯示遊戲結束畫面
            UI.showGameOverScreen(data);
        } else {
            console.log('👀 Spectator does not see the game over screen');
            // 觀戰者只顯示簡單訊息
            UI.showMessage('Mission failed. Awaiting new agents...', 'info');
        }

        // 觸發回調
        if (onGameOver) {
            onGameOver(data);
        }
    });

    // 詢問是否繼續遊玩
    socket.on('askContinueGame', (data) => {
        console.log('❓ Received continue game query:', data);
        UI.showContinueGameDialog(data);
    });

    // 確認繼續遊玩
    socket.on('continueGameConfirmed', (data) => {
        console.log('✅ Continue game confirmed:', data);
        UI.showMessage(data.message, 'success');
    });

    // 成為觀戲者
    socket.on('becomeSpectator', (data) => {
        console.log('👀 Becoming spectator:', data);

        // 更新玩家類型
        myPlayerType = 'SPECTATOR';
        window.currentPlayerType = myPlayerType;

        // 顯示訊息和觀戰模式
        UI.showMessage(data.message, 'info');
        UI.switchToSpectatorMode();

        // 顯示加入挑戰按鈕和觀戰提示
        UI.showJoinChallengeButton();
        UI.showMessage('SYSTEM: Spectator mode. Click on an agent in the status panel to observe.', 'info');

        // 請求更新房間狀態以正確顯示統計
        setTimeout(() => {
            socket.emit('requestRoomStatus');
        }, 100);
    });


    // 準備狀態 - 重置遊戲
    socket.on('readyStateEmit', () => {
        // V V V V V V V 在這裡加上日誌 V V V V V V V
        console.log('%c ✅✅✅ 遊戲重置事件 readyStateEmit 已觸發！✅✅✅', 'color: lightgreen; font-size: 20px;');
        // ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^
        console.log('🔄 接收到重置信號，正在重置遊戲狀態...');

        // 重置遊戲狀態
        gameState = GAME_STATES.READY;
        allPlayers = [];

        // 停用鍵盤控制
        Keyboard.setGameActive(false);

        // 隱藏遊戲結束畫面
        UI.hideGameOverScreen();

        // 清空遊戲棋盤
        Render?.clearGameContainer?.();

        // 隱藏計分板 (暫時註解掉，讓計分板保持顯示)
        // const scoreboard = document.getElementById('scoreboard');
        // if (scoreboard) {
        //     scoreboard.style.display = 'none';
        // }

        // 重新顯示玩家資訊區域
        const playersInfo = document.getElementById('players-info');
        if (playersInfo) {
            playersInfo.style.display = 'block';
        }
    });

    // 準備開始遊戲事件
    socket.on('readyToStart', () => {
        console.log('🎮 Ready to start game');
        UI.showMessage('System ready. Press SPACE to initiate.', 'success');
        // 可以在這裡添加一個開始按鈕或鍵盤監聽
    });

    // 消行動畫事件
    socket.on('lineCleared', (data) => {
        const comboText = data.combo > 1 ? ` (Combo x${data.combo})` : '';
        const expText = data.gainedExp ? `, Data Packets: +${data.gainedExp}` : '';
        console.log(`✨ BREACH SEALED: ${data.userName} sealed ${data.linesCleared} breaches${comboText}${expText}`);

        // 觸發自定義事件，通知渲染模組播放動畫
        window.dispatchEvent(new CustomEvent('playLineClearAnimation', {
            detail: data
        }));

        // 顯示 Combo 提示
        if (data.combo > 1) {
            UI.showComboNotification(data.socketID, data.combo);
        }

        // 顯示獲得經驗
        if (data.gainedExp) {
            UI.showExpGain(data.socketID, data.gainedExp);
        }
    });

    // 幸運事件
    socket.on('luckyEvent', (data) => {
        const userName = data.userName || 'Unknown Agent';
        const multiplier = data.multiplier || 1;
        const gainedExp = data.gainedExp || 0;
        console.log(`🎉 LUCKY EVENT! ${userName} got ${data.eventName}! Data Packets x${multiplier}`);

        // 顯示幸運事件特效
        UI.showLuckyEventNotification(data.socketID, data.eventName, data.eventColor, gainedExp);

        // 如果是自己，顯示特別提示
        if (data.socketID === mySocketId) {
            UI.showMessage(`🎉 ${data.eventName}! Data Packets x${multiplier}!`, 'success');
        }
    });

    // 玩家升級事件
    socket.on('playerLevelUp', (data) => {
        console.log(`🎊 ${data.userName} has reached Security Level ${data.newLevel}!`);

        // 顯示升級特效
        UI.showLevelUpNotification(data.socketID, data.newLevel);

        // 如果是自己，顯示特別提示
        if (data.socketID === mySocketId) {
            UI.showMessage(`🎊 Security Level UP! New Level: ${data.newLevel}`, 'success');
        }
    });

    // 玩家攻擊事件
    socket.on('playerAttacked', (data) => {
        console.log(`⚔️ ATTACK! ${data.attackerName} -> ${data.targetName}, Garbage Lines: ${data.attackPower}`);

        // 顯示攻擊提示
        const isMyAttack = data.attackerID === mySocketId;
        const isMyDefense = data.targetID === mySocketId;

        if (isMyAttack) {
            UI.showMessage(`⚔️ Attack successful! Sent ${data.attackPower} garbage lines to ${data.targetName}.`, 'success');
        } else if (isMyDefense) {
            UI.showMessage(`🛡️ Under attack! Received ${data.attackPower} garbage lines from ${data.attackerName}.`, 'error');
        }

        // 觸發攻擊動畫
        window.dispatchEvent(new CustomEvent('playAttackAnimation', {
            detail: data
        }));
    });

    // 玩家加入挑戰成功
    socket.on('joinChallengeSuccess', (data) => {
        console.log('✅ Successfully joined the attack!', data);
        myPlayerType = 'CHALLENGER';
        window.currentPlayerType = myPlayerType;
        UI.hideJoinChallengeButton();
        UI.showMessage(data.message, 'success');
        UI.showStartButton();
    });

    // 玩家加入挑戰失敗
    socket.on('joinChallengeFailed', (data) => {
        console.log('❌ Failed to join the attack:', data.reason);
        UI.showMessage(data.reason, 'error');
    });

    // 有觀戰者加入挑戰（通知所有人）
    socket.on('playerJoinedChallenge', (data) => {
        console.log(`👤 ${data.userName} has joined the attack!`);
        UI.showMessage(`${data.userName} has joined the attack!`, 'success');
        UI.updateRoomStatus(data.challengers, data.spectators, maxPlayers, 'multi');
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
 * 發送暫存方塊指令
 */
export function holdBlock() {
    if (!socket || !mySocketId) return;

    socket.emit('holdBlock', {
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

/**
 * 加入挑戰（觀戰者轉為挑戰者）
 */
export function joinChallenge() {
    if (!socket || !mySocketId) return;

    console.log('📤 發送加入挑戰請求...');
    socket.emit('joinChallenge');
}

/**
 * 獲取我的玩家類型
 */
export function getMyPlayerType() {
    return myPlayerType;
}

/**
 * 設置觀戰目標
 * @param {string} targetSocketId - 目標玩家的 Socket ID
 */
export function setSpectatorTarget(targetSocketId) {
    spectatorTarget = targetSocketId;
    window.currentSpectatorTarget = targetSocketId; // 暴露到全域變數
    console.log(`👀 切換觀戰目標到: ${targetSocketId}`);

    // 如果當前是遊戲中狀態，立即更新顯示
    if (gameState === GAME_STATES.GAME && onGameStateUpdate) {
        onGameStateUpdate({
            allPlayers,
            myPlayerData,
            gameState,
            mySocketId
        });
    }
}

/**
 * 獲取當前觀戰目標
 */
export function getSpectatorTarget() {
    return spectatorTarget;
}

/**
 * 發送繼續遊玩回應
 * @param {boolean} continueGame - 是否繼續遊玩
 */
export function sendContinueGameResponse(continueGame) {
    if (!socket) {
        console.error('❌ Socket 未初始化');
        return;
    }
    console.log(`📤 發送繼續遊玩回應: ${continueGame}`);
    socket.emit('continueGameResponse', { continue: continueGame });
}

export default {
    initSocket,
    registerPlayer,
    startGame,
    joinChallenge,
    moveBlock,
    rotateBlock,
    dropBlock,
    holdBlock,
    getMyPlayerData,
    getAllPlayers,
    getMySocketId,
    getGameState,
    getMyPlayerType,
    setSpectatorTarget,
    getSpectatorTarget,
};
/**
 * UI 更新模組
 * 負責所有 UI 元素的更新和顯示
 */

import { DOM_IDS, GAME_STATES } from './config.js';
import { renderAllPlayers } from './render.js'; // 導入渲染函數

// 防抖變數
let updateScoreboardTimer = null;
let messageTimeoutId = null;

/**
 * 處理計分板玩家點擊事件 (【偵錯版本】)
 * @param {string} socketId - 被點擊玩家的Socket ID
 * @param {string} userName - 被點擊玩家的名稱
 */

/**
 * 處理計分板玩家點擊事件 (【最終簡化版】)
 */
function handlePlayerClick(socketId, userName) {
    const playerType = window.currentPlayerType;
    const myId = window.socket.id;

    if (playerType === 'CHALLENGER') {
        // 如果點擊自己，或者點擊的對象已經是當前目標，則不執行任何操作
        if (socketId === myId || window.challengeSpectatorTarget === socketId) {
            return;
        }

        // 設定新目標
        console.log(`🎯 挑戰者切換觀察對手: ${userName} (${socketId})`);
        window.challengeSpectatorTarget = socketId;
        highlightSelectedPlayer(socketId);
        showMessage(`顯示對手: ${userName}`, 'info');

        // 立即觸發一次渲染，讓畫面更新
        const players = window.gameGlobalState.players;
        if (players) {
            renderAllPlayers(players, myId, false);
        }
    }
    // ... 觀戰者邏輯保持不變 ...
    else if (playerType === 'SPECTATOR') {
        if (window.currentSpectatorTarget === socketId) {
            return;
        }
        window.currentSpectatorTarget = socketId;
        highlightSelectedPlayer(socketId);
        import('./socket.js').then(Socket => {
            Socket.setSpectatorTarget(socketId);
            showMessage(`👀 切換觀戰目標到: ${userName}`, 'success');
        });
    }
}
/**
 * 檢查當前用戶是否為觀戰者
 * @returns {boolean}
 */
function checkIfSpectator() {
    // 通過全域變數檢查（在socket.js中設置）
    return window.currentPlayerType === 'SPECTATOR';
}

/**
 * 高亮選中的玩家項目
 * @param {string} selectedSocketId - 選中的玩家Socket ID
 */
function highlightSelectedPlayer(selectedSocketId) {
    // 檢查是否已經選中同一個玩家，避免重複設置
    const currentSelected = document.querySelector('.score-item.selected');
    if (currentSelected && currentSelected.dataset.playerId === selectedSocketId) {
        return; // 已經選中了，不需要重複操作
    }

    // 移除所有已選中的高亮
    document.querySelectorAll('.score-item.selected').forEach(item => {
        item.classList.remove('selected');
        item.style.borderLeft = '';
    });

    // 為選中的玩家添加高亮
    const selectedItem = document.querySelector(`[data-player-id="${selectedSocketId}"]`);
    if (selectedItem) {
        selectedItem.classList.add('selected');
        selectedItem.style.borderLeft = '4px solid #4CAF50';
    }
}

/**
 * 顯示訊息
 * @param {string} message - 訊息內容
 * @param {string} type - 訊息類型 ('info', 'error', 'success')
 */
export function showMessage(message, type = 'info') {
    const messageDisplay = document.getElementById(DOM_IDS.MESSAGE_DISPLAY);
    if (!messageDisplay) return;

    const typeClasses = ['message-banner--info', 'message-banner--success', 'message-banner--error'];
    const resolvedType = ['info', 'success', 'error'].includes(type) ? type : 'info';

    messageDisplay.classList.add('message-banner');
    typeClasses.forEach(cls => messageDisplay.classList.remove(cls));
    messageDisplay.classList.remove('is-hidden');
    messageDisplay.classList.add(`message-banner--${resolvedType}`);

    messageDisplay.textContent = message;

    if (messageTimeoutId) {
        clearTimeout(messageTimeoutId);
    }

    messageTimeoutId = setTimeout(() => {
        messageDisplay.classList.add('is-hidden');
    }, 3200);
}

/**
 * 更新房間狀態
 * @param {number} challengers - 挑戰者人數
 * @param {number} spectators - 觀戰者人數
 * @param {number} maxPlayers - 最大挑戰者數
 * @param {string} mode - 模式 ('single', 'spectator', 'multi')
 */
export function updateRoomStatus(challengers, spectators, maxPlayers, mode = 'multi') {
    const roomStatus = document.getElementById(DOM_IDS.ROOM_STATUS);
    const playersInfo = document.getElementById(DOM_IDS.PLAYERS_INFO);

    if (roomStatus) {
        const modeClassMap = {
            single: 'status-chip--single',
            spectator: 'status-chip--spectator',
            multi: 'status-chip--multi'
        };
        const labelMap = {
            single: '單機模式',
            spectator: '觀戰模式',
            multi: '多人挑戰'
        };

        const metaMap = {
            single: `最大挑戰者: ${maxPlayers}`,
            spectator: `挑戰者: ${challengers} | 觀戰者: ${spectators}`,
            multi: `挑戰者: ${challengers} | 觀戰者: ${spectators}`
        };

        roomStatus.className = `status-chip ${modeClassMap[mode] || modeClassMap.multi}`;
        const label = labelMap[mode] || labelMap.multi;
        const meta = metaMap[mode] || metaMap.multi;

        roomStatus.innerHTML = `
            <span class="status-chip__label">${label}</span>
            <span class="status-chip__meta">${meta}</span>
        `;
    }

    if (playersInfo) {
        playersInfo.style.display = 'block';
    }
}

/**
 * 顯示開始按鈕
 */
export function showStartButton() {
    const startButton = document.getElementById(DOM_IDS.START_BUTTON);
    if (startButton) {
        startButton.style.display = 'inline-block';
    }
}

/**
 * 隱藏開始按鈕
 */
export function hideStartButton() {
    const startButton = document.getElementById(DOM_IDS.START_BUTTON);
    if (startButton) {
        startButton.style.display = 'none';
    }
}

/**
 * 顯示加入挑戰按鈕
 */
export function showJoinChallengeButton() {
    const playersInfo = document.getElementById(DOM_IDS.PLAYERS_INFO);
    if (!playersInfo) return;

    // 檢查是否已經有按鈕
    let joinButton = document.getElementById('join-challenge-btn');
    if (!joinButton) {
        joinButton = document.createElement('button');
        joinButton.id = 'join-challenge-btn';
        joinButton.className = 'cyber-button cyber-button--primary';
        joinButton.textContent = '加入挑戰';
        joinButton.onclick = () => window.requestJoinChallenge();
        playersInfo.appendChild(joinButton);
    }
    joinButton.style.display = 'block';
}

/**
 * 隱藏加入挑戰按鈕
 */
export function hideJoinChallengeButton() {
    const joinButton = document.getElementById('join-challenge-btn');
    if (joinButton) {
        joinButton.style.display = 'none';
    }
}

/**
 * 更新計分板
 * @param {Array} players - 玩家列表
 * @param {string} gameState - 遊戲狀態
 */
export function updateScoreboard(players, gameState) {
    // 將玩家列表存到全域，方便點擊時調用
    window.gameGlobalState = { ...window.gameGlobalState, players };

    const scoreboard = document.getElementById(DOM_IDS.SCOREBOARD);
    const scoreList = document.getElementById(DOM_IDS.SCORE_LIST);

    if (!scoreboard || !scoreList) return;

    // 直接更新，移除防抖
    updateScoreboardInternal(players, gameState, scoreboard, scoreList);
}

/**
 * 內部計分板更新函數 (【真正最終修正版】 - 使用 classList)
 */
function updateScoreboardInternal(players, gameState, scoreboard, scoreList) {
    scoreboard.style.display = 'flex';
    scoreboard.classList.remove('is-hidden');

    const sortedPlayers = [...players].sort((a, b) => {
        const scoreDiff = (b.score || 0) - (a.score || 0);
        if (scoreDiff !== 0) return scoreDiff;
        return (b.level || 0) - (b.level || 0);
    });

    const myId = window.socket.id;
    const playerType = window.currentPlayerType;
    const currentPlayerIds = new Set();

    sortedPlayers.forEach((player, index) => {
        const rank = index + 1;
        currentPlayerIds.add(player.socketID);

        let scoreItem = document.getElementById(`score-item-${player.socketID}`);
        const isSelf = player.socketID === myId;

        if (!scoreItem) {
            scoreItem = document.createElement('div');
            scoreItem.id = `score-item-${player.socketID}`;

            // 只在創建時設定一次 innerHTML 骨架
            scoreItem.innerHTML = `
                <div class="player-rank"></div>
                <div class="mini-board-container">
                    <div class="mini-board"></div>
                    <div class="attack-bar">
                        <div class="attack-line"></div>
                    </div>
                </div>
                <div class="player-details">
                    <div class="player-name-score"></div>
                    <div class="player-stats-score">
                        <span class="player-level-value"></span>
                        <span class="player-score-value"></span>
                    </div>
                </div>
            `;
            scoreList.appendChild(scoreItem);
        }

        // =======================================================
        // V V V V V V V V V V V  核心修正區塊 V V V V V V V V V V V

        // 使用更安全的 classList 來管理樣式，而不是直接覆蓋 className

        // 1. 先重置基礎 class
        scoreItem.className = 'score-item';

        // 2. 逐步添加需要的 class
        scoreItem.classList.add(`rank-${rank}`);

        if (player.playerType === 'SPECTATOR') {
            scoreItem.classList.add('spectator');
        }

        if (player.playerType !== 'SPECTATOR' && (playerType === 'SPECTATOR' || !isSelf)) {
            scoreItem.classList.add('clickable-player');
            // 確保點擊事件存在 (如果元素是複用的)
            if (!scoreItem.onclick) {
                scoreItem.onclick = () => handlePlayerClick(player.socketID, player.userName);
            }
        }

        if (player.state === GAME_STATES.LOSE || player.state === GAME_STATES.ELIMINATED) {
            scoreItem.classList.add('eliminated');
        }

        // ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^
        // =======================================================


        if (scoreList.children[index] !== scoreItem) {
            scoreList.insertBefore(scoreItem, scoreList.children[index]);
        }

        const playerIcon = player.playerType === 'SPECTATOR' ? '👁️' : (isSelf ? '👑' : '🎮');
        const attackWidth = Math.min((player.attack || 0) * 10, 100);

        // 只更新具體元素的內容
        scoreItem.querySelector('.player-rank').textContent = rank;
        scoreItem.querySelector('.mini-board').innerHTML = renderMiniBoard(player);
        scoreItem.querySelector('.attack-line').style.width = `${attackWidth}%`;
        scoreItem.querySelector('.player-name-score').textContent = `${playerIcon} ${player.userName}`;
        scoreItem.querySelector('.player-level-value').textContent = `Lv ${player.level || 0}`;
        scoreItem.querySelector('.player-score-value').textContent = player.score || 0;
    });

    // 步驟 3: 移除已離開的玩家 (邏輯不變)
    for (let i = scoreList.children.length - 1; i >= 0; i--) {
        const item = scoreList.children[i];
        const playerId = item.id.replace('score-item-', '');
        if (!currentPlayerIds.has(playerId)) {
            scoreList.removeChild(item);
        }
    }

    const targetId = playerType === 'SPECTATOR' ? window.currentSpectatorTarget : window.challengeSpectatorTarget;
    if (targetId) {
        requestAnimationFrame(() => highlightSelectedPlayer(targetId));
    }
}

/**
 * 渲染迷你棋盤
 * @param {Object} player - 玩家數據
 * @returns {string} - 組成迷你棋盤的 HTML 字符串
 */
function renderMiniBoard(player) {
    let boardHtml = '';
    const ground = player.itemGroundBlock || [];
    // 為了效能，我們只渲染頂部 20 行
    for (let y = 1; y <= 20; y++) {
        for (let x = 1; x <= 10; x++) {
            const block = ground.find(b => b.x === x && b.y === y);
            if (block) {
                // 這裡我們不區分顏色，只用一個通用色塊表示，以提高渲染效率
                boardHtml += '<div class="mini-block" style="background-color: #555;"></div>';
            } else {
                boardHtml += '<div class="mini-block"></div>';
            }
        }
    }
    return boardHtml;
}

/**
 * 顯示遊戲結束畫面
 * @param {Object} data - 遊戲結束數據
 */
export function showGameOverScreen(data) {
    console.log('🎮 正在顯示遊戲結束畫面...', data);
    const overlay = document.getElementById(DOM_IDS.GAME_OVER_OVERLAY);
    const message = document.getElementById(DOM_IDS.GAME_OVER_MESSAGE);
    const finalScoreList = document.getElementById(DOM_IDS.FINAL_SCORE_LIST);

    if (!overlay || !message || !finalScoreList) {
        console.error('❌ 找不到遊戲結束畫面元素');
        return;
    }

    const variant = data.isSinglePlayer ? 'solo' : 'multi';
    const titleText = data.isSinglePlayer ? '單機模式結束' : '遊戲結束';
    const subtitleText = data.message || (data.isSinglePlayer ? '任務完成' : '挑戰已結束');

    message.innerHTML = `
        <div class="game-over-title game-over-title--${variant}">${titleText}</div>
        <p class="game-over-subtitle">${subtitleText}</p>
    `;

    // 清空最終分數列表
    finalScoreList.innerHTML = '';

    // 按分數排序顯示最終分數（分數相同則按等級）
    const sortedPlayers = [...data.players].sort((a, b) => {
        const scoreDiff = (b.score || 0) - (a.score || 0);
        if (scoreDiff !== 0) return scoreDiff;
        return (b.level || 0) - (a.level || 0);
    });

    sortedPlayers.forEach((player, index) => {
        const scoreItem = document.createElement('div');
        scoreItem.className = 'score-item';

        // 單機模式只顯示成績，不需要獎牌
        if (data.isSinglePlayer) {
            scoreItem.classList.add('score-item--solo');
            scoreItem.innerHTML = `
                <div class="score-item__label">${player.userName}</div>
                <div class="score-item__value">${player.score || 0}<span class="score-item__unit">分</span></div>
                <div class="score-item__meta">Level ${player.level || 0}</div>
            `;
        } else {
            // 多人模式顯示排名
            const medals = ['🥇', '🥈', '🥉'];
            const medal = medals[index] || '';
            scoreItem.classList.add('score-item--multi');
            scoreItem.innerHTML = `
                <div class="score-item__label">${medal ? `<span class="score-item__medal">${medal}</span>` : ''}${player.userName} (${player.who})</div>
                <div class="score-item__meta">Level ${player.level || 0} ｜ 分數 ${player.score || 0}</div>
            `;
        }

        finalScoreList.appendChild(scoreItem);
    });

    overlay.style.display = 'flex';
    overlay.style.visibility = 'visible';
    overlay.style.opacity = '1';
    console.log('✅ 遊戲結束畫面已顯示');

    // 單機模式：提示自動重新開始
    if (data.isSinglePlayer) {
        const autoRestartHint = document.createElement('p');
        autoRestartHint.className = 'game-over-hint';
        autoRestartHint.textContent = '3秒後自動重新開始...';
        finalScoreList.appendChild(autoRestartHint);
    }
}

/**
 * 隱藏遊戲結束畫面
 */
export function hideGameOverScreen() {
    console.log('🔄 正在隱藏遊戲結束畫面...');
    const overlay = document.getElementById(DOM_IDS.GAME_OVER_OVERLAY);
    if (overlay) {
        overlay.style.display = 'none';
        overlay.style.visibility = 'hidden';
        overlay.style.opacity = '0';
        // 強制移除 flex 顯示
        overlay.classList.remove('show');
        console.log('✅ 遊戲結束畫面已強制隱藏');
    } else {
        console.error('❌ 找不到遊戲結束畫面元素:', DOM_IDS.GAME_OVER_OVERLAY);
    }
}

/**
 * 顯示 Combo 提示
 * @param {string} socketID - 玩家 Socket ID
 * @param {number} combo - Combo 數
 */
export function showComboNotification(socketID, combo) {
    const playerContainer = document.getElementById(`player-${socketID}`);
    if (!playerContainer) return;

    // 創建 Combo 提示元素
    const comboNotif = document.createElement('div');
    comboNotif.className = 'combo-notification';
    comboNotif.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 3rem;
        font-weight: bold;
        color: #FFD700;
        text-shadow: 0 0 10px #FFD700, 0 0 20px #FFD700;
        z-index: 100;
        animation: comboPopup 1s ease-out;
        pointer-events: none;
    `;
    comboNotif.textContent = `COMBO x${combo}!`;

    playerContainer.style.position = 'relative';
    playerContainer.appendChild(comboNotif);

    // 1秒後移除
    setTimeout(() => {
        comboNotif.remove();
    }, 1000);
}

/**
 * 顯示獲得經驗
 * @param {string} socketID - 玩家 Socket ID
 * @param {number} exp - 獲得的經驗值
 */
export function showExpGain(socketID, exp) {
    const playerContainer = document.getElementById(`player-${socketID}`);
    if (!playerContainer) return;

    const expNotif = document.createElement('div');
    expNotif.style.cssText = `
        position: absolute;
        top: 20%;
        right: 10px;
        font-size: 1.2rem;
        font-weight: bold;
        color: #4CAF50;
        text-shadow: 0 0 5px #4CAF50;
        z-index: 99;
        animation: expFloat 1.5s ease-out;
        pointer-events: none;
    `;
    expNotif.textContent = `+${exp} EXP`;

    playerContainer.appendChild(expNotif);

    setTimeout(() => {
        expNotif.remove();
    }, 1500);
}

/**
 * 顯示幸運事件通知
 * @param {string} socketID - 玩家 Socket ID
 * @param {string} eventName - 事件名稱
 * @param {string} eventColor - 事件顏色
 * @param {number} gainedExp - 獲得的經驗
 */
export function showLuckyEventNotification(socketID, eventName, eventColor, gainedExp) {
    const playerContainer = document.getElementById(`player-${socketID}`);
    if (!playerContainer) return;

    const luckyNotif = document.createElement('div');
    luckyNotif.style.cssText = `
        position: absolute;
        top: 30%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 2.5rem;
        font-weight: bold;
        color: ${eventColor};
        text-shadow: 0 0 15px ${eventColor}, 0 0 30px ${eventColor};
        z-index: 101;
        animation: luckyEventPopup 2s ease-out;
        pointer-events: none;
        text-align: center;
    `;
    luckyNotif.innerHTML = `
        <div>${eventName}!</div>
        <div style="font-size: 1.5rem; margin-top: 0.5rem;">+${gainedExp || 0} EXP</div>
    `;

    playerContainer.appendChild(luckyNotif);

    setTimeout(() => {
        luckyNotif.remove();
    }, 2000);
}

/**
 * 顯示升級通知
 * @param {string} socketID - 玩家 Socket ID
 * @param {number} newLevel - 新等級
 */
export function showLevelUpNotification(socketID, newLevel) {
    const playerContainer = document.getElementById(`player-${socketID}`);
    if (!playerContainer) return;

    const levelUpNotif = document.createElement('div');
    levelUpNotif.style.cssText = `
        position: absolute;
        top: 40%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 4rem;
        font-weight: bold;
        color: #FFD700;
        text-shadow: 0 0 20px #FFD700, 0 0 40px #FFD700, 0 0 60px #FFD700;
        z-index: 102;
        animation: levelUpBurst 1.5s ease-out;
        pointer-events: none;
    `;
    levelUpNotif.textContent = `LEVEL UP!`;

    playerContainer.appendChild(levelUpNotif);

    setTimeout(() => {
        levelUpNotif.remove();
    }, 1500);
}

/**
 * 隱藏註冊表單
 */
export function hideRegisterForm() {
    const register = document.getElementById(DOM_IDS.REGISTER);
    if (register) {
        register.style.display = 'none';
    }
}

/**
 * 顯示註冊表單
 */
export function showRegisterForm() {
    const register = document.getElementById(DOM_IDS.REGISTER);
    if (register) {
        register.style.display = 'block';
    }
}

/**
 * 顯示繼續遊玩確認對話框
 * @param {Object} data - 包含詢問訊息和超時時間的資料
 */
export function showContinueGameDialog(data) {
    // 動態導入 Socket 模組以發送回應
    import('./socket.js').then(Socket => {
        // 創建對話框
        const dialog = document.createElement('div');
        dialog.className = 'continue-game-dialog';
        dialog.innerHTML = `
            <div class="dialog-overlay">
                <div class="dialog-card">
                    <div class="dialog-card__title">遊戲結束</div>
                    <p class="dialog-card__message">${data.message}</p>
                    <div class="dialog-card__buttons">
                        <button id="continue-yes" class="cyber-button cyber-button--primary">繼續遊玩</button>
                        <button id="continue-no" class="cyber-button cyber-button--ghost">觀戰模式</button>
                    </div>
                    <div class="dialog-card__countdown">
                        <span id="countdown-timer">10</span> 秒後自動選擇觀戰模式
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(dialog);

        // 設置按鈕事件
        const yesBtn = dialog.querySelector('#continue-yes');
        const noBtn = dialog.querySelector('#continue-no');
        const timerElement = dialog.querySelector('#countdown-timer');

        let timeLeft = 10;
        const countdownInterval = setInterval(() => {
            timeLeft--;
            timerElement.textContent = timeLeft;
            if (timeLeft <= 0) {
                clearInterval(countdownInterval);
                Socket.sendContinueGameResponse(false);
                dialog.remove();
            }
        }, 1000);

        yesBtn.addEventListener('click', () => {
            clearInterval(countdownInterval);
            Socket.sendContinueGameResponse(true);
            dialog.remove();
        });

        noBtn.addEventListener('click', () => {
            clearInterval(countdownInterval);
            Socket.sendContinueGameResponse(false);
            dialog.remove();
        });
    }).catch(err => {
        console.error('❌ 無法載入 Socket 模組:', err);
    });
}

/**
 * 切換到觀戲者模式
 */
export function switchToSpectatorMode() {
    console.log('👀 切換到觀戲者模式');
    // 隱藏遊戲控制相關的元素
    const gameControls = document.querySelector('.game-controls');
    if (gameControls) {
        gameControls.style.display = 'none';
    }

    // 顯示觀戲者提示
    showMessage('您現在是觀戲者，可以觀看其他玩家的遊戲', 'info');
}

export default {
    showMessage,
    updateRoomStatus,
    showStartButton,
    hideStartButton,
    updateScoreboard,
    showGameOverScreen,
    hideGameOverScreen,
    hideRegisterForm,
    showRegisterForm,
    showContinueGameDialog,
    switchToSpectatorMode,
};

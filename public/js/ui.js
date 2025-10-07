/**
 * UI 更新模組
 * 負責所有 UI 元素的更新和顯示
 */

import { DOM_IDS, GAME_STATES } from './config.js';

// 防抖變數
let updateScoreboardTimer = null;

/**
 * 處理計分板玩家點擊事件
 * @param {string} socketId - 被點擊玩家的Socket ID
 * @param {string} userName - 被點擊玩家的名稱
 */
function handlePlayerClick(socketId, userName) {
    // 檢查當前用戶是否為觀戰者
    if (window.currentPlayerType !== 'SPECTATOR') {
        console.log('⚠️ 非觀戰者無法切換觀戰目標');
        return; // 非觀戰者不處理點擊
    }

    // 檢查是否點擊的是當前已經觀戰的目標
    if (window.currentSpectatorTarget === socketId) {
        console.log('ℹ️ 已在觀戰此玩家，無需切換');
        return; // 已經在觀戰這個玩家了，不需要切換
    }

    console.log(`🎯 觀戰者點擊切換目標: ${userName} (${socketId})`);

    // 立即更新全域變數，防止重複點擊
    const previousTarget = window.currentSpectatorTarget;
    window.currentSpectatorTarget = socketId;

    // 立即高亮選中的玩家
    highlightSelectedPlayer(socketId);

    // 更新socket模組中的觀戰目標
    import('./socket.js').then(Socket => {
        Socket.setSpectatorTarget(socketId);

        // 顯示切換訊息
        showMessage(`👀 切換觀戰目標到: ${userName}`, 'success');

        console.log(`✅ 觀戰目標已切換: ${previousTarget} → ${socketId}`);
    }).catch(error => {
        console.error('❌ 切換觀戰目標失敗:', error);
        // 如果失敗，恢復之前的目標
        window.currentSpectatorTarget = previousTarget;
        highlightSelectedPlayer(previousTarget);
    });
}/**
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

    messageDisplay.textContent = message;
    messageDisplay.style.display = 'block';

    const bgColors = {
        error: 'rgba(244, 67, 54, 0.9)',
        success: 'rgba(76, 175, 80, 0.9)',
        info: 'rgba(255, 152, 0, 0.9)'
    };

    messageDisplay.style.background = bgColors[type] || bgColors.info;

    setTimeout(() => {
        messageDisplay.style.display = 'none';
    }, 3000);
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
        if (mode === 'single') {
            roomStatus.innerHTML = `🎮 <span style="color: #4CAF50;">單機模式</span>`;
            roomStatus.style.fontSize = '1.5rem';
        } else if (mode === 'spectator') {
            roomStatus.innerHTML = `
                👁️ <span style="color: #FF9800;">觀戰模式</span><br>
                <span style="font-size: 0.9rem;">挑戰者: ${challengers}/${maxPlayers} | 觀戰者: ${spectators}</span>
            `;
            roomStatus.style.fontSize = '1.2rem';
        } else {
            roomStatus.innerHTML = `
                🎮 <span style="color: #4CAF50;">多人挑戰</span><br>
                <span style="font-size: 0.9rem;">挑戰者: ${challengers}/${maxPlayers} | 觀戰者: ${spectators}</span>
            `;
            roomStatus.style.fontSize = '1.2rem';
        }
        roomStatus.style.color = '#eeeeee';
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
        joinButton.className = 'registerBtn';
        joinButton.textContent = '🎮 加入挑戰';
        joinButton.onclick = () => window.requestJoinChallenge();
        joinButton.style.marginTop = '1rem';
        joinButton.style.background = '#FF9800';
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
    const scoreboard = document.getElementById(DOM_IDS.SCOREBOARD);
    const scoreList = document.getElementById(DOM_IDS.SCORE_LIST);

    if (!scoreboard || !scoreList) return;

    // 使用防抖機制，避免過於頻繁的更新
    if (updateScoreboardTimer) {
        clearTimeout(updateScoreboardTimer);
    }

    updateScoreboardTimer = setTimeout(() => {
        updateScoreboardInternal(players, gameState, scoreboard, scoreList);
    }, 100); // 100ms 防抖延遲
}

/**
 * 內部計分板更新函數
 */
function updateScoreboardInternal(players, gameState, scoreboard, scoreList) {

    if (gameState === GAME_STATES.GAME && players.length > 0) {
        scoreboard.style.display = 'block';

        // 清空計分板
        scoreList.innerHTML = '';

        // 按分數排序玩家（分數相同則按等級）
        const sortedPlayers = [...players].sort((a, b) => {
            const scoreDiff = (b.score || 0) - (a.score || 0);
            if (scoreDiff !== 0) return scoreDiff;
            return (b.level || 0) - (a.level || 0);
        });

        sortedPlayers.forEach(player => {
            const scoreItem = document.createElement('div');
            scoreItem.className = 'score-item';

            // 觀戰者添加特殊樣式
            const isSpectator = player.playerType === 'SPECTATOR';
            if (isSpectator) {
                scoreItem.classList.add('spectator');
                scoreItem.style.opacity = '0.7';
                scoreItem.style.borderLeft = '3px solid #FF9800';
            } else {
                // 為挑戰者添加點擊功能（供觀戰者使用）
                scoreItem.classList.add('clickable-player');
                scoreItem.dataset.playerId = player.socketID;

                // 只有觀戰者才能點擊切換
                if (window.currentPlayerType === 'SPECTATOR') {
                    scoreItem.style.cursor = 'pointer';

                    // 使用單一事件處理器，避免重複綁定
                    scoreItem.onclick = function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        handlePlayerClick(player.socketID, player.userName);
                    };

                    // 添加hover效果
                    scoreItem.onmouseenter = function () {
                        this.style.backgroundColor = 'rgba(76, 175, 80, 0.2)';
                        this.style.transform = 'scale(1.02)';
                    };

                    scoreItem.onmouseleave = function () {
                        this.style.backgroundColor = '';
                        this.style.transform = '';
                    };
                }
            }

            // 如果玩家被淘汰，添加 eliminated 類
            if (player.state === GAME_STATES.LOSE || player.state === GAME_STATES.ELIMINATED) {
                scoreItem.classList.add('eliminated');
            }

            const playerIcon = isSpectator ? '👁️' : '🎮';
            const playerStatus = isSpectator ? '觀戰中' : player.who;

            scoreItem.innerHTML = `
        <div class="player-info">
          <div class="player-name-score">${playerIcon} ${player.userName}</div>
          <div class="player-status-score" style="color: ${isSpectator ? '#FF9800' : '#aaa'}">${playerStatus}</div>
        </div>
        <div class="player-stats">
          <div class="player-level-score">Lv ${player.level || 0}</div>
          <div class="player-score">分數: ${player.score || 0}</div>
        </div>
      `;

            scoreList.appendChild(scoreItem);
        });

        // 如果是觀戰者，高亮當前觀戰目標（延遲執行避免閃爍）
        if (window.currentPlayerType === 'SPECTATOR') {
            const currentTarget = window.currentSpectatorTarget;
            if (currentTarget) {
                // 使用 requestAnimationFrame 確保 DOM 更新完成後再設置高亮
                requestAnimationFrame(() => {
                    highlightSelectedPlayer(currentTarget);
                });
            }
        }
    } else {
        scoreboard.style.display = 'none';
    }
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

    // 單機模式顯示不同的訊息
    if (data.isSinglePlayer) {
        message.innerHTML = `
            <h2>🎮 遊戲結束</h2>
            <p style="color: #4CAF50; font-size: 1.2rem;">單機模式</p>
        `;
    } else {
        message.textContent = data.message || '遊戲結束！';
    }

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
            scoreItem.innerHTML = `
                <div style="text-align: center; padding: 1rem;">
                    <div style="font-size: 1.5rem; color: #4CAF50; margin-bottom: 0.5rem;">
                        ${player.userName}
                    </div>
                    <div style="font-size: 2rem; color: #ffd700; font-weight: bold;">
                        ${player.score || 0} 分
                    </div>
                    <div style="font-size: 1.2rem; color: #aaa; margin-top: 0.3rem;">
                        Level ${player.level || 0}
                    </div>
                </div>
            `;
        } else {
            // 多人模式顯示排名
            const medals = ['🥇', '🥈', '🥉'];
            const medal = medals[index] || '';
            scoreItem.innerHTML = `
                <span>${medal} ${player.userName} (${player.who})</span>
                <span style="color: #ffd700;">Level ${player.level || 0} | 分數: ${player.score || 0}</span>
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
        autoRestartHint.style.color = '#aaa';
        autoRestartHint.style.fontSize = '1rem';
        autoRestartHint.style.marginTop = '1rem';
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
                <div class="dialog-content">
                    <h3>🎮 遊戲結束</h3>
                    <p>${data.message}</p>
                    <div class="dialog-buttons">
                        <button id="continue-yes" class="btn btn-success">✅ 繼續遊玩</button>
                        <button id="continue-no" class="btn btn-secondary">❌ 觀戰模式</button>
                    </div>
                    <div class="countdown">
                        <span id="countdown-timer">10</span> 秒後自動選擇觀戰模式
                    </div>
                </div>
            </div>
        `;

        // 添加 CSS 樣式
        const style = document.createElement('style');
        style.textContent = `
            .continue-game-dialog {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10000;
            }
            .dialog-overlay {
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                justify-content: center;
                align-items: center;
                width: 100%;
                height: 100%;
            }
            .dialog-content {
                background: white;
                padding: 30px;
                border-radius: 10px;
                text-align: center;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                max-width: 400px;
                width: 90%;
            }
            .dialog-content h3 {
                margin-top: 0;
                color: #333;
            }
            .dialog-buttons {
                display: flex;
                gap: 15px;
                justify-content: center;
                margin: 20px 0;
            }
            .btn {
                padding: 10px 20px;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-size: 16px;
                transition: background-color 0.3s;
            }
            .btn-success {
                background: #4CAF50;
                color: white;
            }
            .btn-success:hover {
                background: #45a049;
            }
            .btn-secondary {
                background: #6c757d;
                color: white;
            }
            .btn-secondary:hover {
                background: #5a6268;
            }
            .countdown {
                color: #666;
                font-size: 14px;
                margin-top: 10px;
            }
            #countdown-timer {
                font-weight: bold;
                color: #ff6b6b;
            }
        `;

        document.head.appendChild(style);
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
                document.body.removeChild(dialog);
                document.head.removeChild(style);
            }
        }, 1000);

        yesBtn.addEventListener('click', () => {
            clearInterval(countdownInterval);
            Socket.sendContinueGameResponse(true);
            document.body.removeChild(dialog);
            document.head.removeChild(style);
        });

        noBtn.addEventListener('click', () => {
            clearInterval(countdownInterval);
            Socket.sendContinueGameResponse(false);
            document.body.removeChild(dialog);
            document.head.removeChild(style);
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

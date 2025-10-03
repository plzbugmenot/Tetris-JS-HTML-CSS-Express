/**
 * UI 更新模組
 * 負責所有 UI 元素的更新和顯示
 */

import { DOM_IDS, GAME_STATES } from './config.js';

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
    } else {
        scoreboard.style.display = 'none';
    }
}

/**
 * 顯示遊戲結束畫面
 * @param {Object} data - 遊戲結束數據
 */
export function showGameOverScreen(data) {
    const overlay = document.getElementById(DOM_IDS.GAME_OVER_OVERLAY);
    const message = document.getElementById(DOM_IDS.GAME_OVER_MESSAGE);
    const finalScoreList = document.getElementById(DOM_IDS.FINAL_SCORE_LIST);

    if (!overlay || !message || !finalScoreList) return;

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
    const overlay = document.getElementById(DOM_IDS.GAME_OVER_OVERLAY);
    if (overlay) {
        overlay.style.display = 'none';
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
        <div style="font-size: 1.5rem; margin-top: 0.5rem;">+${gainedExp} EXP</div>
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
};

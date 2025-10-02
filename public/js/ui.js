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
 * @param {number} currentPlayers - 當前玩家數
 * @param {number} maxPlayers - 最大玩家數
 */
export function updateRoomStatus(currentPlayers, maxPlayers) {
    const roomStatus = document.getElementById(DOM_IDS.ROOM_STATUS);
    const playersInfo = document.getElementById(DOM_IDS.PLAYERS_INFO);

    if (roomStatus) {
        roomStatus.textContent = `房間人數: ${currentPlayers}/${maxPlayers}`;
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

        // 按等級排序玩家
        const sortedPlayers = [...players].sort((a, b) => (b.level || 0) - (a.level || 0));

        sortedPlayers.forEach(player => {
            const scoreItem = document.createElement('div');
            scoreItem.className = 'score-item';

            // 如果玩家被淘汰，添加 eliminated 類
            if (player.state === GAME_STATES.LOSE || player.state === GAME_STATES.ELIMINATED) {
                scoreItem.classList.add('eliminated');
            }

            scoreItem.innerHTML = `
        <div class="player-info">
          <div class="player-name-score">${player.userName}</div>
          <div class="player-status-score">${player.who}</div>
        </div>
        <div class="player-level-score">Lv ${player.level || 0}</div>
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

    message.textContent = data.message || '遊戲結束！';

    // 清空最終分數列表
    finalScoreList.innerHTML = '';

    // 按等級排序顯示最終分數
    const sortedPlayers = [...data.players].sort((a, b) => (b.level || 0) - (a.level || 0));

    sortedPlayers.forEach((player, index) => {
        const medals = ['🥇', '🥈', '🥉'];
        const medal = medals[index] || '';

        const scoreItem = document.createElement('div');
        scoreItem.className = 'score-item';
        scoreItem.innerHTML = `
      <span>${medal} ${player.userName} (${player.who})</span>
      <span style="color: #ffd700;">Level ${player.level || 0}</span>
    `;
        finalScoreList.appendChild(scoreItem);
    });

    overlay.style.display = 'flex';
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

/**
 * 渲染模組
 * 負責遊戲畫面的渲染和更新
 */

import { GAME_CONFIG } from './config.js';

// 保存正在播放消行動畫的信息
const clearingAnimations = new Map(); // key: socketID, value: { lineNumbers: [], startTime: timestamp }

/**
 * 格式化時間顯示
 * @param {number} seconds - 秒數
 * @returns {string} 格式化的時間字符串
 */
function formatTime(seconds = 0) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**

/**
 * 渲染所有玩家的棋盤
 * @param {Array} players - 玩家列表
 * @param {string} mySocketId - 我的 Socket ID
 * @param {boolean} isSpectator - 是否為觀戰者
 */
export function renderAllPlayers(players, mySocketId, isSpectator = false) {
    const container = document.getElementById('game-container');
    if (!container) return;

    container.innerHTML = ''; // 清空容器

    // 只渲染挑戰者的棋盤
    const challengers = players.filter(p => p.playerType !== 'SPECTATOR');

    // ================== 觀戰者模式 (此邏輯不變) ==================
    if (isSpectator) {
        const spectatorTarget = window.currentSpectatorTarget;
        let targetPlayer = challengers.find(p => p.socketID === spectatorTarget);

        if (!targetPlayer && challengers.length > 0) {
            targetPlayer = challengers[0];
        }

        if (targetPlayer) {
            container.className = 'game-container spectator-view single-board';
            const playerContainer = createPlayerBoard(targetPlayer, mySocketId);
            playerContainer.classList.add('spectator-target');
            container.appendChild(playerContainer);
        }
        return;
    }

    // ================== 挑戰者雙畫面模式 (增加偵錯日誌) ==================
    console.log('[renderAllPlayers] A. 渲染函數已開始執行...');
    const targetIdFromState = window.challengeSpectatorTarget;
    console.log(`[renderAllPlayers] B. 讀取到的目標 ID 是: ${targetIdFromState}`);

    container.className = 'game-container challenge-view';
    const myPlayer = challengers.find(p => p.socketID === mySocketId);
    let opponent = null;

    // 1. 優先從「點擊選擇的目標」中尋找
    if (targetIdFromState) {
        console.log('[renderAllPlayers] C. 正在根據目標 ID 尋找對手...');
        opponent = challengers.find(p => p.socketID === targetIdFromState);
        if (opponent) {
            console.log(`[renderAllPlayers] D. 成功從目標 ID 中找到對手: "${opponent.userName}"`);
        } else {
            console.log(`[renderAllPlayers] D. 失敗！找不到 ID 為 ${targetIdFromState} 的玩家，將使用預設邏輯。`);
        }
    }

    // 2. 如果沒有指定目標，或目標不存在，則尋找分數最高的對手
    if (!opponent) {
        console.log('[renderAllPlayers] E. 沒有找到指定對手，切換到預設邏輯 (尋找最高分)。');
        const potentialOpponents = challengers.filter(p => p.socketID !== mySocketId);
        if (potentialOpponents.length > 0) {
            potentialOpponents.sort((a, b) => (b.score || 0) - (a.score || 0));
            opponent = potentialOpponents[0];
            console.log(`[renderAllPlayers] F. 預設對手被設定為 (最高分): "${opponent.userName}"`);
        }
    }

    // --- 開始渲染畫面 ---

    // 創建主玩家視圖 (自己)
    if (myPlayer) {
        const mainPlayerView = document.createElement('div');
        mainPlayerView.id = 'main-player-view';
        mainPlayerView.appendChild(createPlayerBoard(myPlayer, mySocketId));
        container.appendChild(mainPlayerView);
    }

    // 創建次要視圖 (對手)
    const secondaryView = document.createElement('div');
    secondaryView.id = 'secondary-view';

    if (opponent) {
        // 傳入第三個參數 true，表示這是次要視圖，不顯示 Hold 和 Next
        secondaryView.appendChild(createPlayerBoard(opponent, mySocketId, true));
    } else if (challengers.length > 1) {
        // 這種情況很少發生，除非對手數據有問題
        secondaryView.innerHTML = '<div class="player-container"><h3>正在尋找對手...</h3></div>';
    } else {
        // 只有自己一個人
        secondaryView.innerHTML = '<div class="player-container"><h3>正在等待對手加入...</h3></div>';
    }
    container.appendChild(secondaryView);
}

/**
 * 創建玩家棋盤容器
 * @param {Object} player - 玩家數據
 * @param {string} mySocketId - 我的 Socket ID
 * @param {boolean} isSecondaryView - 是否為次要視圖（觀戰對象），如果是則不顯示Hold和Next
 * @returns {HTMLElement} 玩家容器元素
 */
function createPlayerBoard(player, mySocketId, isSecondaryView = false) {
    const isMobile = window.innerWidth <= 768;
    const isMyPlayer = player.socketID === mySocketId;

    // 創建玩家容器
    const container = document.createElement('div');
    container.className = `player-container ${isMyPlayer ? 'my-player' : 'other-player'}`;
    container.id = `player-${player.socketID}`;

    if (player.state === 'LOSE' || player.state === 'ELIMINATED') {
        container.classList.add('eliminated');
    }

    // 玩家信息頭部
    const header = document.createElement('div');
    header.className = 'player-header';
    const myTag = isMyPlayer ? '<span style="color: #29D5FF;">(You)</span>' : '';
    const comboDisplay = (player.combo && player.combo > 1)
        ? `<div class="player-combo" style="color: #FFD700; font-weight: bold;">🔥 Chain Attack x${player.combo}</div>`
        : '';
    const currentExp = player.exp || 0;
    const maxExp = player.expToNextLevel || 500;
    const expPercent = Math.min((currentExp / maxExp) * 100, 100);

    if (isMobile) {
        header.innerHTML = `
            <div class="player-stats-mobile">
                <div class="stat-item">
                    <span class="stat-label">SCORE</span>
                    <span class="stat-value">${player.score || 0}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">LEVEL</span>
                    <span class="stat-value">${player.level || 0}</span>
                </div>
            </div>
        `;
    } else {
        header.innerHTML = `
            <div class="player-name">${isMyPlayer ? '💀' : '🤖'} ${player.userName} ${myTag}</div>
            <div class="player-status">${player.who}</div>
            <div class="player-stats">
                <div class="player-level">Security Level: ${player.level || 0}</div>
                <div class="player-score">Data Secured: ${player.score || 0}</div>
                ${comboDisplay}
            </div>
            <div class="exp-bar-container" style="width: 100%; height: 8px; background: #333; border-radius: 4px; margin-top: 0.5rem; overflow: hidden;">
                <div class="exp-bar" style="width: ${expPercent}%; height: 100%; background: linear-gradient(90deg, #39ff14, #20c997); transition: width 0.3s ease;"></div>
            </div>
            <div class="exp-text" style="font-size: 0.7rem; color: #aaa; margin-top: 0.2rem; text-align: center;">DATA PACKETS: ${currentExp} / ${maxExp}</div>
        `;
    }
    container.appendChild(header);

    // 遊戲主區域
    const gameArea = document.createElement('div');
    gameArea.className = 'game-area';

    const leftPanel = document.createElement('div');
    leftPanel.className = 'left-panel';
    leftPanel.innerHTML = `
        <div class="hold-container">
            <div class="panel-header">STASH</div>
            <div class="hold-board" id="hold-board-${player.socketID}"></div>
        </div>
        <button id="mobile-hold-btn" class="mobile-hold-btn-style">STASH</button>
        <div class="stats-container" id="stats-container-${player.socketID}">
             <p id="kos-${player.socketID}">K.O.s: ${player.stats ? player.stats.kos : 0}</p>
             <p id="pieces-${player.socketID}">PIECES: ${player.stats ? player.stats.pieces : 0}</p>
             <p id="attack-${player.socketID}">JUNK SENT: ${player.stats ? player.stats.attack : 0}</p>
             <p id="time-${player.socketID}">TIME: ${formatTime(player.stats ? player.stats.playTime : 0)}</p>
             <p id="droptime-${player.socketID}">DROP: ${player.stats && player.stats.avgDropTime ? (player.stats.avgDropTime / 1000).toFixed(1) + 's' : '0.0s'}</p>
             <p id="speed-${player.socketID}">SPEED: ${player.stats ? Math.round(1000 / (player.stats.currentSpeed * 20)) + '/s' : '3.3/s'}</p>
        </div>
    `;

    const rightPanel = document.createElement('div');
    rightPanel.className = 'right-panel';
    rightPanel.innerHTML = `
        <div class="next-container">
            <div class="panel-header">QUEUE</div>
            <div class="next-board" id="next-board-${player.socketID}"></div>
        </div>
    `;

    const centerPanel = document.createElement('div');
    centerPanel.className = 'center-panel';
    const gameBoard = document.createElement('div');
    gameBoard.className = 'game-board';
    gameBoard.id = `board-${player.socketID}`;
    centerPanel.appendChild(gameBoard);

    if (isMobile) {
        const topPanels = document.createElement('div');
        topPanels.className = 'mobile-top-panels';
        topPanels.appendChild(leftPanel);
        topPanels.appendChild(rightPanel);
        gameArea.appendChild(topPanels);
        gameArea.appendChild(centerPanel);
    } else {
        if (!isSecondaryView) gameArea.appendChild(leftPanel);
        gameArea.appendChild(centerPanel);
        if (!isSecondaryView) gameArea.appendChild(rightPanel);
    }

    container.appendChild(gameArea);

    return container;
}


/**
 * 更新所有玩家的棋盤
 * @param {Array} players - 玩家列表
 * @param {boolean} isSpectator - 是否為觀戰者
 */
export function updateAllBoards(players, isSpectator = false) {
    if (isSpectator) {
        // 觀戰者模式：只更新觀戰目標的棋盤
        const spectatorTarget = window.currentSpectatorTarget;
        const targetPlayer = players.find(p => p.socketID === spectatorTarget);

        if (targetPlayer && targetPlayer.playerType !== 'SPECTATOR') {
            updatePlayerBoard(targetPlayer);
            updateNextBoard(targetPlayer);
            updateHoldBoard(targetPlayer);
        }
        return;
    }

    // 挑戰者模式：更新所有挑戰者的棋盤
    players.forEach(player => {
        if (player.playerType === 'SPECTATOR') {
            return;
        }
        updatePlayerBoard(player);
        updateNextBoard(player); // 更新 "Next" 區塊
        updateHoldBoard(player); // 更新 "Hold" 區塊
    });
}

/**
 * 更新單個玩家的棋盤
 * @param {Object} player - 玩家數據
 */
function updatePlayerBoard(player) {
    const board = document.getElementById(`board-${player.socketID}`);
    if (!board) return;

    const animationInfo = clearingAnimations.get(player.socketID);
    const now = Date.now();
    let clearingLines = [];
    let animationProgress = 0;

    if (animationInfo) {
        const elapsed = now - animationInfo.startTime;
        if (elapsed < 1000) {
            clearingLines = animationInfo.lineNumbers;
            animationProgress = elapsed / 1000;
        } else {
            clearingAnimations.delete(player.socketID);
        }
    }

    board.innerHTML = '';

    // 檢查是否有 y=0 的方塊需要顯示
    const hasBlocksAtY0 = player.itemBlockBody?.some(b => b.y === 0);
    const startY = hasBlocksAtY0 ? 0 : 1;

    for (let y = startY; y <= GAME_CONFIG.BOARD_HEIGHT; y++) {
        for (let x = 1; x <= GAME_CONFIG.BOARD_WIDTH; x++) {
            const cell = document.createElement('div');
            cell.className = 'block';

            // 如果是 y=0 的行，只在有方塊的位置顯示
            if (y === 0) {
                const currentBlock = player.itemBlockBody?.find(b => b.x === x && b.y === y);
                if (!currentBlock) {
                    continue; // 跳過空格子
                }
                cell.style.position = 'absolute';
                cell.style.left = `${(x - 1) * 25}px`;
                cell.style.top = '-25px'; // 在棋盤上方
                cell.style.zIndex = '100';
                cell.classList.add(`block-${player.itemBlockType || 0}`);
                board.appendChild(cell);
                continue;
            }

            const currentBlock = player.itemBlockBody?.find(b => b.x === x && b.y === y);
            if (currentBlock) {
                cell.classList.add(`block-${player.itemBlockType || 0}`);
            }

            const groundBlock = player.itemGroundBlock?.find(b => b.x === x && b.y === y);
            if (groundBlock) {
                cell.classList.add('block-ground');
            }

            if (clearingLines.includes(y) && (groundBlock || currentBlock)) {
                const animationDelay = -(animationProgress * 1000);
                cell.style.animation = `clearLineFlash 1s ease-in-out ${animationDelay}ms forwards`;
                cell.style.position = 'relative';
                cell.style.zIndex = '10';
            }

            board.appendChild(cell);
        }
    }

    const levelDiv = document.querySelector(`#player-${player.socketID} .player-level`);
    if (levelDiv) levelDiv.textContent = `Level: ${player.level || 0}`;

    const scoreDiv = document.querySelector(`#player-${player.socketID} .player-score`);
    if (scoreDiv) scoreDiv.textContent = `分數: ${player.score || 0}`;

    const statsDiv = document.querySelector(`#player-${player.socketID} .player-stats`);
    if (statsDiv) {
        let comboDiv = document.querySelector(`#player-${player.socketID} .player-combo`);
        if (player.combo && player.combo > 1) {
            if (!comboDiv) {
                comboDiv = document.createElement('div');
                comboDiv.className = 'player-combo';
                comboDiv.style.cssText = 'color: #FFD700; font-weight: bold;';
                statsDiv.appendChild(comboDiv);
            }
            comboDiv.textContent = `🔥 Combo x${player.combo}`;
        } else {
            if (comboDiv) comboDiv.remove();
        }
    }

    const expBar = document.querySelector(`#player-${player.socketID} .exp-bar`);
    const expText = document.querySelector(`#player-${player.socketID} .exp-text`);
    if (expBar && expText) {
        const currentExp = player.exp || 0;
        const maxExp = player.expToNextLevel || 500;
        const expPercent = Math.min((currentExp / maxExp) * 100, 100);
        expBar.style.width = `${expPercent}%`;
        expText.textContent = `EXP: ${currentExp} / ${maxExp}`;
    }
}

/**
 * 更新 "Next" 預覽棋盤
 * @param {Object} player - 玩家數據
 */
function updateNextBoard(player) {
    const nextBoard = document.getElementById(`next-board-${player.socketID}`);
    if (!nextBoard) return;

    nextBoard.innerHTML = '';

    // 使用 nextBlocks 陣列顯示多個預覽方塊
    const nextPieces = player.nextBlocks || [];
    const maxPreviewCount = Math.min(3, nextPieces.length); // 最多顯示 3 個

    for (let i = 0; i < maxPreviewCount; i++) {
        const piece = nextPieces[i];
        if (!piece || !piece.blocks || piece.blocks.length === 0) continue;

        const previewContainer = document.createElement('div');
        previewContainer.className = 'next-piece-container';

        // 計算方塊邊界
        const minX = Math.min(...piece.blocks.map(b => b.x));
        const maxX = Math.max(...piece.blocks.map(b => b.x));
        const minY = Math.min(...piece.blocks.map(b => b.y));
        const maxY = Math.max(...piece.blocks.map(b => b.y));

        // 計算偏移量讓方塊居中顯示在 4x4 網格中
        const offsetX = Math.floor((4 - (maxX - minX + 1)) / 2) + 1 - minX;
        const offsetY = Math.floor((4 - (maxY - minY + 1)) / 2) + 1 - minY;

        // 渲染 4x4 網格
        for (let y = 1; y <= 4; y++) {
            for (let x = 1; x <= 4; x++) {
                const cell = document.createElement('div');
                cell.className = 'next-block';

                // 檢查原始方塊座標映射到網格位置
                const originalX = x - offsetX;
                const originalY = y - offsetY;
                const preBlock = piece.blocks.find(b => b.x === originalX && b.y === originalY);

                if (preBlock) {
                    cell.classList.add(`block-${piece.type || 0}`);
                }
                previewContainer.appendChild(cell);
            }
        }
        nextBoard.appendChild(previewContainer);
    }

    // 如果 nextBlocks 沒有資料，回退到舚的 itemPreBody 方式
    if (maxPreviewCount === 0 && player.itemPreBody && player.itemPreBody.length > 0) {
        const previewContainer = document.createElement('div');
        previewContainer.className = 'next-piece-container';

        const minX = Math.min(...player.itemPreBody.map(b => b.x));
        const maxX = Math.max(...player.itemPreBody.map(b => b.x));
        const minY = Math.min(...player.itemPreBody.map(b => b.y));
        const maxY = Math.max(...player.itemPreBody.map(b => b.y));

        const offsetX = Math.floor((4 - (maxX - minX + 1)) / 2) + 1 - minX;
        const offsetY = Math.floor((4 - (maxY - minY + 1)) / 2) + 1 - minY;

        for (let y = 1; y <= 4; y++) {
            for (let x = 1; x <= 4; x++) {
                const cell = document.createElement('div');
                cell.className = 'next-block';

                const originalX = x - offsetX;
                const originalY = y - offsetY;
                const preBlock = player.itemPreBody.find(b => b.x === originalX && b.y === originalY);

                if (preBlock) {
                    cell.classList.add(`block-${player.itemPreType || 0}`);
                }
                previewContainer.appendChild(cell);
            }
        }
        nextBoard.appendChild(previewContainer);
    }
}/**
 * 更新 "Hold" 預覽棋盤
 * @param {Object} player - 玩家數據
 */
function updateHoldBoard(player) {
    const holdBoard = document.getElementById(`hold-board-${player.socketID}`);
    if (!holdBoard) return;

    holdBoard.innerHTML = '';

    // 假設 player.holdBlock 包含鎖定的方塊信息
    const holdBlock = player.holdBlock; // e.g., { type: 2, body: [...] }

    if (holdBlock && (holdBlock.body || holdBlock.blocks)) {
        const blocks = holdBlock.body || holdBlock.blocks;

        // 計算方塊邊界
        const minX = Math.min(...blocks.map(b => b.x));
        const maxX = Math.max(...blocks.map(b => b.x));
        const minY = Math.min(...blocks.map(b => b.y));
        const maxY = Math.max(...blocks.map(b => b.y));

        // 計算偏移量讓方塊居中顯示在 4x4 網格中
        const offsetX = Math.floor((4 - (maxX - minX + 1)) / 2) + 1 - minX;
        const offsetY = Math.floor((4 - (maxY - minY + 1)) / 2) + 1 - minY;

        // 渲染 4x4 網格
        for (let y = 1; y <= 4; y++) {
            for (let x = 1; x <= 4; x++) {
                const cell = document.createElement('div');
                cell.className = 'hold-block';

                // 檢查原始方塊座標映射到網格位置
                const originalX = x - offsetX;
                const originalY = y - offsetY;
                const blockPart = blocks.find(b => b.x === originalX && b.y === originalY);

                if (blockPart) {
                    cell.classList.add(`block-${holdBlock.type || 0}`);
                }
                holdBoard.appendChild(cell);
            }
        }
    } else {
        // 沒有 hold 方塊時顯示空網格
        for (let y = 1; y <= 4; y++) {
            for (let x = 1; x <= 4; x++) {
                const cell = document.createElement('div');
                cell.className = 'hold-block';
                holdBoard.appendChild(cell);
            }
        }
    }
}


/**
 * 添加玩家淘汰效果
 * @param {string} socketID - 玩家 Socket ID
 */
export function addEliminationEffect(socketID) {
    const playerContainer = document.getElementById(`player-${socketID}`);
    if (!playerContainer) return;

    playerContainer.classList.add('crashed');

    setTimeout(() => {
        playerContainer.classList.remove('crashed');
        playerContainer.classList.add('eliminated');
    }, 500);
}

/**
 * 清空遊戲容器
 */
export function clearGameContainer() {
    const container = document.getElementById('game-container');
    if (container) {
        container.innerHTML = '';
    }
}

/**
 * 播放消行動畫
 * @param {string} socketID - 玩家 Socket ID
 * @param {Array} lineNumbers - 被消除的行號
 */
export function playLineClearAnimation(socketID, lineNumbers) {
    const startTime = Date.now();
    console.log(`🎨 開始播放消行動畫: 玩家 ${socketID}, 行號: ${lineNumbers.join(', ')}`);

    clearingAnimations.set(socketID, {
        lineNumbers: lineNumbers,
        startTime: startTime
    });

    setTimeout(() => {
        clearingAnimations.delete(socketID);
        console.log(`✅ 消行動畫結束: 玩家 ${socketID}`);
    }, 1050);
}

window.addEventListener('playLineClearAnimation', (event) => {
    const { socketID, lineNumbers } = event.detail || {};
    if (socketID && lineNumbers && lineNumbers.length > 0) {
        playLineClearAnimation(socketID, lineNumbers);
    }
});

window.addEventListener('playAttackAnimation', (event) => {
    const { attackerID, targetID } = event.detail;
    playAttackAnimation(attackerID, targetID);
});

/**
 * 播放攻擊動畫
 * @param {string} attackerID - 攻擊者 Socket ID
 * @param {string} targetID - 被攻擊者 Socket ID
 */
function playAttackAnimation(attackerID, targetID) {
    const attackerContainer = document.getElementById(`player-${attackerID}`);
    if (attackerContainer) {
        attackerContainer.classList.add('attack-flash');
        setTimeout(() => {
            attackerContainer.classList.remove('attack-flash');
        }, 500);
    }

    const targetContainer = document.getElementById(`player-${targetID}`);
    if (targetContainer) {
        targetContainer.classList.add('defend-flash');
        setTimeout(() => {
            targetContainer.classList.remove('defend-flash');
        }, 500);
    }
}

/**
 * 更新玩家統計數據顯示
 * @param {Object} player - 玩家對象
 */
export function updatePlayerStats(player) {
    if (!player.stats) return;

    const kosElement = document.getElementById(`kos-${player.socketID}`);
    const piecesElement = document.getElementById(`pieces-${player.socketID}`);
    const attackElement = document.getElementById(`attack-${player.socketID}`);
    const timeElement = document.getElementById(`time-${player.socketID}`);
    const dropTimeElement = document.getElementById(`droptime-${player.socketID}`);
    const speedElement = document.getElementById(`speed-${player.socketID}`);

    if (kosElement) kosElement.textContent = `KOS: ${player.stats.kos}`;
    if (piecesElement) piecesElement.textContent = `PIECES: ${player.stats.pieces}`;
    if (attackElement) attackElement.textContent = `ATTACK: ${player.stats.attack}`;
    if (timeElement) timeElement.textContent = `TIME: ${formatTime(player.stats.playTime)}`;
    if (dropTimeElement) dropTimeElement.textContent = `DROP: ${player.stats.avgDropTime ? (player.stats.avgDropTime / 1000).toFixed(1) + 's' : '0.0s'}`;
    if (speedElement) speedElement.textContent = `SPEED: ${Math.round(1000 / (player.stats.currentSpeed * 20)) + '/s'}`;
}

export default {
    renderAllPlayers,
    updateAllBoards,
    addEliminationEffect,
    clearGameContainer,
    playLineClearAnimation,
};

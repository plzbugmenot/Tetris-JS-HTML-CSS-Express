/**
 * 渲染模組
 * 負責遊戲畫面的渲染和更新
 */

import { GAME_CONFIG } from './config.js';

/**
 * 渲染所有玩家的棋盤
 * @param {Array} players - 玩家列表
 * @param {string} mySocketId - 我的 Socket ID
 */
export function renderAllPlayers(players, mySocketId) {
    const container = document.getElementById('game-container');
    if (!container) return;

    container.innerHTML = ''; // 清空容器

    // 設置網格佈局 class
    container.className = 'game-container';
    if (players.length > 0) {
        container.classList.add(`players-${players.length}`);
    }

    // 為每個玩家創建棋盤
    players.forEach(player => {
        const playerContainer = createPlayerBoard(player, mySocketId);
        container.appendChild(playerContainer);
    });
}

/**
 * 創建玩家棋盤容器
 * @param {Object} player - 玩家數據
 * @param {string} mySocketId - 我的 Socket ID
 * @returns {HTMLElement} 玩家容器元素
 */
function createPlayerBoard(player, mySocketId) {
    const isMyPlayer = player.socketID === mySocketId;

    // 創建玩家容器
    const container = document.createElement('div');
    container.className = `player-container ${isMyPlayer ? 'my-player' : 'other-player'}`;
    container.id = `player-${player.socketID}`;

    // 如果玩家被淘汰,添加 eliminated 類
    if (player.state === 'LOSE' || player.state === 'ELIMINATED') {
        container.classList.add('eliminated');
    }

    // 玩家信息頭部
    const header = document.createElement('div');
    header.className = 'player-header';
    header.innerHTML = `
    <div class="player-name">${player.userName} ${isMyPlayer ? '(你)' : ''}</div>
    <div class="player-status">${player.who}</div>
    <div class="player-level">Level: ${player.level || 0}</div>
  `;
    container.appendChild(header);

    // 預覽方塊區域
    const preBoard = document.createElement('div');
    preBoard.className = 'pre-game-board';
    preBoard.id = `pre-board-${player.socketID}`;
    container.appendChild(preBoard);

    // 主遊戲棋盤
    const gameBoard = document.createElement('div');
    gameBoard.className = 'game-board';
    gameBoard.id = `board-${player.socketID}`;
    container.appendChild(gameBoard);

    return container;
}

/**
 * 更新所有玩家的棋盤
 * @param {Array} players - 玩家列表
 */
export function updateAllBoards(players) {
    players.forEach(player => {
        updatePlayerBoard(player);
        updatePreviewBoard(player);
    });
}

/**
 * 更新單個玩家的棋盤
 * @param {Object} player - 玩家數據
 */
function updatePlayerBoard(player) {
    const board = document.getElementById(`board-${player.socketID}`);
    if (!board) return;

    board.innerHTML = ''; // 清空棋盤

    // 創建 21x10 的網格
    for (let y = 1; y <= GAME_CONFIG.BOARD_HEIGHT; y++) {
        for (let x = 1; x <= GAME_CONFIG.BOARD_WIDTH; x++) {
            const cell = document.createElement('div');
            cell.className = 'block';

            // 檢查當前方塊
            const currentBlock = player.itemBlockBody?.find(b => b.x === x && b.y === y);
            if (currentBlock) {
                cell.classList.add(`block-${player.itemBlockType || 0}`);
            }

            // 檢查地面方塊
            const groundBlock = player.itemGroundBlock?.find(b => b.x === x && b.y === y);
            if (groundBlock) {
                cell.classList.add('block-ground');
            }

            board.appendChild(cell);
        }
    }

    // 更新等級顯示
    const levelDiv = document.querySelector(`#player-${player.socketID} .player-level`);
    if (levelDiv) {
        levelDiv.textContent = `Level: ${player.level || 0}`;
    }
}

/**
 * 更新預覽棋盤
 * @param {Object} player - 玩家數據
 */
function updatePreviewBoard(player) {
    const preBoard = document.getElementById(`pre-board-${player.socketID}`);
    if (!preBoard) return;

    preBoard.innerHTML = ''; // 清空預覽區

    // 創建 5x5 的預覽網格
    for (let y = 1; y <= 5; y++) {
        for (let x = 1; x <= 5; x++) {
            const cell = document.createElement('div');
            cell.className = 'pre-block';

            // 檢查預覽方塊
            const preBlock = player.itemPreBody?.find(b => b.x === x && b.y === y);
            if (preBlock) {
                cell.classList.add(`block-${player.itemPreType || 0}`);
            }

            preBoard.appendChild(cell);
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

    // 添加崩潰動畫
    playerContainer.classList.add('crashed');

    // 500ms 後移除崩潰動畫,添加淘汰狀態
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

export default {
    renderAllPlayers,
    updateAllBoards,
    addEliminationEffect,
    clearGameContainer,
};

// ==================== 全局變量 ====================
// socket 由 index.html 提供，不在這裡聲明
let mySocketId = null;
let allPlayers = []; // 所有玩家數據
let myPlayerData = null; // 我的玩家數據
let maxPlayers = 4; // 最大玩家數
let gameState = 'READY';

const FRAME = 10;
const READY = 'READY';
const GAME = 'GAME';
const WIN = 'WIN';
const LOSE = 'LOSE';

// ==================== 初始化 ====================
function init() {
    console.log('Game initializing...');

    // 等待socket準備好
    if (typeof window.socket !== 'undefined' && window.socket) {
        mySocketId = window.socket.id;
        setupSocketListeners();
    } else {
        window.addEventListener('socketReady', () => {
            mySocketId = window.socket.id;
            setupSocketListeners();
        });
    }

    // 設置鍵盤監聽
    setupKeyboardListeners();
}

// ==================== Socket 事件監聽 ====================
function setupSocketListeners() {
    const socket = window.socket;
    if (!socket) return;

    // 連線成功
    socket.on('connect', () => {
        console.log('Socket connected:', socket.id);
        mySocketId = socket.id;
    });

    // 新玩家加入響應
    socket.on('newUserResponse', (data) => {
        console.log('New user response:', data);
        maxPlayers = data.maxPlayers || 4;
        updateRoomStatus(data.size, maxPlayers);

        // 如果達到最少人數，顯示開始按鈕
        if (data.size >= 2) {
            showStartButton();
        }
    });

    // 連線被拒絕
    socket.on('connectionRejected', (data) => {
        showMessage(data.reason, 'error');
        document.getElementById('register').style.display = 'block';
    });

    // 遊戲開始失敗
    socket.on('gameStartFailed', (data) => {
        showMessage(data.reason, 'error');
    });

    // 玩家離線
    socket.on('playerDisconnected', (data) => {
        showMessage(`${data.userName} 已離開遊戲`, 'info');
        updateRoomStatus(data.remainingPlayers, maxPlayers);

        // 如果人數不足，隱藏開始按鈕
        if (data.remainingPlayers < 2) {
            hideStartButton();
        }
    });

    // 遊戲狀態更新
    socket.on('stateOfUsers', (data) => {
        allPlayers = data.users;
        gameState = data.gameState;

        // 找出我的玩家數據
        myPlayerData = allPlayers.find(p => p.socketID === mySocketId);

        // 渲染所有玩家的棋盤
        renderAllPlayers();

        // 更新遊戲狀態
        if (gameState === GAME) {
            // 遊戲進行中
            updateAllBoards();
            updateScoreboard(); // 更新計分板
        }
    });

    // 玩家被淘汰
    socket.on('playerEliminated', (data) => {
        console.log(`玩家 ${data.userName} (${data.who}) 被淘汰`);
        showMessage(`${data.userName} 被淘汰！`, 'error');

        // 找到被淘汰的玩家容器並添加淘汰效果
        const playerContainer = document.getElementById(`player-${data.socketID}`);
        if (playerContainer) {
            playerContainer.classList.add('crashed');
            setTimeout(() => {
                playerContainer.classList.remove('crashed');
                playerContainer.classList.add('eliminated');
            }, 500);
        }

        // 更新計分板
        updateScoreboard();
    });

    // 所有玩家都遊戲結束
    socket.on('allPlayersGameOver', (data) => {
        console.log('所有玩家都失敗了！', data);
        showGameOverScreen(data);
    });

    // 準備狀態
    socket.on('readyStateEmit', () => {
        gameState = READY;
        hideGameOverScreen();
        showMessage('遊戲結束，準備開始新遊戲', 'info');

        // 隱藏計分板
        document.getElementById('scoreboard').style.display = 'none';

        // 顯示開始按鈕
        if (allPlayers.length >= 2) {
            showStartButton();
        }
    });
}

// ==================== UI 更新函數 ====================
function updateRoomStatus(currentPlayers, maxPlayers) {
    const roomStatus = document.getElementById('room-status');
    roomStatus.textContent = `房間人數: ${currentPlayers}/${maxPlayers}`;
    document.getElementById('players-info').style.display = 'block';
}

function showStartButton() {
    document.getElementById('start-game-btn').style.display = 'inline-block';
}

function hideStartButton() {
    document.getElementById('start-game-btn').style.display = 'none';
}

function showMessage(message, type = 'info') {
    const messageDisplay = document.getElementById('message-display');
    messageDisplay.textContent = message;
    messageDisplay.style.display = 'block';
    messageDisplay.style.background = type === 'error' ?
        'rgba(244, 67, 54, 0.9)' : 'rgba(255, 152, 0, 0.9)';

    setTimeout(() => {
        messageDisplay.style.display = 'none';
    }, 3000);
}

// 更新計分板
function updateScoreboard() {
    const scoreboard = document.getElementById('scoreboard');
    const scoreList = document.getElementById('score-list');

    if (gameState === GAME && allPlayers.length > 0) {
        scoreboard.style.display = 'block';

        // 清空計分板
        scoreList.innerHTML = '';

        // 按分數排序玩家
        const sortedPlayers = [...allPlayers].sort((a, b) => (b.score || 0) - (a.score || 0));

        sortedPlayers.forEach(player => {
            const scoreItem = document.createElement('div');
            scoreItem.className = 'score-item';

            // 如果玩家被淘汰，添加 eliminated 類
            if (player.state === 'LOSE' || player.state === 'ELIMINATED') {
                scoreItem.classList.add('eliminated');
            }

            scoreItem.innerHTML = `
                <div class="player-info">
                    <div class="player-name-score">${player.userName}</div>
                    <div class="player-status-score">${player.who}</div>
                </div>
                <div class="player-score-score">分數: ${player.score || 0}</div>
            `;

            scoreList.appendChild(scoreItem);
        });
    } else {
        scoreboard.style.display = 'none';
    }
}

function renderScoreboard() {
    const scoreboard = document.getElementById('scoreboard');
    const scoreList = document.getElementById('score-list');
    if (!scoreboard || !scoreList) return;

    scoreboard.style.display = 'block';
    scoreList.innerHTML = '';

    // 排序分數高到低
    const sortedPlayers = [...allPlayers].sort((a, b) => (b.score || 0) - (a.score || 0));
    sortedPlayers.forEach(player => {
        const item = document.createElement('div');
        item.className = 'score-item';
        item.textContent = `${player.userName}: ${player.score || 0}`;
        scoreList.appendChild(item);
    });
}

// 顯示遊戲結束畫面
function showGameOverScreen(data) {
    const overlay = document.getElementById('game-over-overlay');
    const message = document.getElementById('game-over-message');
    const finalScoreList = document.getElementById('final-score-list');

    message.textContent = data.message || '遊戲結束！';

    // 清空最終分數列表
    finalScoreList.innerHTML = '';

    // 補齊分數資料
    const playersWithScore = data.players.map(p => {
        // 如果有 score 直接用，否則根據 socketID 從 allPlayers 補齊
        if (typeof p.score !== 'undefined') return p;
        const found = allPlayers.find(ap => ap.socketID === p.socketID || ap.userName === p.userName);
        return { ...p, score: found ? found.score : 0 };
    });

    // 按分數排序顯示最終分數
    const sortedPlayers = [...playersWithScore].sort((a, b) => (b.score || 0) - (a.score || 0));

    sortedPlayers.forEach((player, index) => {
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';
        const scoreItem = document.createElement('div');
        scoreItem.className = 'score-item';
        scoreItem.innerHTML = `
            <span>${medal} ${player.userName} (${player.who})</span>
            <span style="color: #ffd700;">分數: ${player.score || 0}</span>
        `;
        finalScoreList.appendChild(scoreItem);
    });

    overlay.style.display = 'flex';
}

// 隱藏遊戲結束畫面
function hideGameOverScreen() {
    const overlay = document.getElementById('game-over-overlay');
    overlay.style.display = 'none';
}

// ==================== 玩家管理 ====================
function registerPlayer() {
    const socket = window.socket;
    if (!socket || !socket.connected) {
        alert('正在連接到伺服器，請稍後再試...');
        return;
    }

    const input = document.getElementById('name');
    const playerName = input.value.trim();

    if (!playerName) {
        alert('請輸入玩家名稱');
        return;
    }

    const data = {
        userName: playerName,
        socketID: socket.id,
    };

    socket.emit('newUser', data);

    // 隱藏註冊表單
    document.getElementById('register').style.display = 'none';
}

function requestStartGame() {
    const socket = window.socket;
    if (!socket) return;
    socket.emit('startGameWithCouplePlayer');
    hideStartButton();
    showMessage('遊戲開始！', 'info');
}

// ==================== 渲染函數 ====================
function renderAllPlayers() {
    const container = document.getElementById('game-container');
    container.innerHTML = ''; // 清空容器

    // 設置網格佈局class
    container.className = 'game-container';
    if (allPlayers.length > 0) {
        container.classList.add(`players-${allPlayers.length}`);
    }

    // 為每個玩家創建棋盤
    allPlayers.forEach(player => {
        const playerContainer = createPlayerBoard(player);
        container.appendChild(playerContainer);
    });

    renderScoreboard();
}

function createPlayerBoard(player) {
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
    <div class="player-score">分數: ${player.score || 0}</div>
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

function updateAllBoards() {
    allPlayers.forEach(player => {
        updatePlayerBoard(player);
        updatePreviewBoard(player);
    });
}

function updatePlayerBoard(player) {
    const board = document.getElementById(`board-${player.socketID}`);
    if (!board) return;

    board.innerHTML = ''; // 清空棋盤

    // 創建21x10的網格
    for (let y = 1; y <= 21; y++) {
        for (let x = 1; x <= 10; x++) {
            const cell = document.createElement('div');
            cell.className = 'block';

            // 檢查當前方塊
            const currentBlock = player.itemBlockBody?.find(b => b.x === x && b.y === y);
            if (currentBlock) {
                cell.classList.add(`block-${player.itemBlockType}`);
            }

            // 檢查地面方塊
            const groundBlock = player.itemGroundBlock?.find(b => b.x === x && b.y === y);
            if (groundBlock) {
                cell.classList.add('block-ground');
            }

            board.appendChild(cell);
        }
    }

    // 更新分數顯示
    const scoreDiv = document.querySelector(`#player-${player.socketID} .player-score`);
    if (scoreDiv) {
        scoreDiv.textContent = `分數: ${player.score || 0}`;
    }
}

function updatePreviewBoard(player) {
    const preBoard = document.getElementById(`pre-board-${player.socketID}`);
    if (!preBoard || !player.itemPreBody) return;

    preBoard.innerHTML = '';

    // 創建3x10的網格用於預覽
    for (let y = 1; y <= 3; y++) {
        for (let x = 1; x <= 10; x++) {
            const cell = document.createElement('div');
            cell.className = 'block';

            // 檢查預覽方塊
            const preBlock = player.itemPreBody.find(b => {
                // 調整y座標以適應預覽區域
                const adjustedY = b.y - 1;
                return b.x === x && adjustedY === y;
            });

            if (preBlock) {
                cell.classList.add(`block-${player.itemPreType}`);
            }

            preBoard.appendChild(cell);
        }
    }
}

// ==================== 鍵盤控制 ====================
function setupKeyboardListeners() {
    document.addEventListener('keydown', (e) => {
        const socket = window.socket;
        if (!socket || gameState !== GAME || !myPlayerData) return;

        switch (e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                socket.emit('moveBlock', {
                    socketID: mySocketId,
                    direction: 'LEFT'
                });
                break;
            case 'ArrowRight':
                e.preventDefault();
                socket.emit('moveBlock', {
                    socketID: mySocketId,
                    direction: 'RIGHT'
                });
                break;
            case 'ArrowDown':
                e.preventDefault();
                socket.emit('moveBlock', {
                    socketID: mySocketId,
                    direction: 'DOWN'
                });
                break;
            case 'ArrowUp':
            case ' ':
                e.preventDefault();
                socket.emit('changeDirection', {
                    socketID: mySocketId
                });
                break;
            case 'Enter':
                if (gameState === READY) {
                    requestStartGame();
                }
                break;
        }
    });
}

// ==================== 遊戲循環 ====================
let gameInterval = setInterval(() => {
    if (gameState === GAME && allPlayers.length > 0) {
        // 定期請求更新（實際更新由服務器的 stateOfUsers 事件驅動）
    }
}, FRAME);

// ==================== 頁面加載時初始化 ====================
window.addEventListener('DOMContentLoaded', init);

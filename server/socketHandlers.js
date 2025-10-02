/**
 * Socket 事件處理模組
 * 負責所有 Socket.IO 事件的處理邏輯
 */

const config = require('./config');
const gameState = require('./gameState');
const gameLogic = require('./gameLogic');

// 遊戲廣播計時器
let gameBroadcast = null;

/**
 * 設置 Socket.IO 事件監聽器
 * @param {SocketIO.Server} io - Socket.IO 伺服器實例
 */
function setupSocketHandlers(io) {
    io.on('connect', (socket) => {
        console.log('✅ 客戶端已連接:', socket.id);

        // 新玩家加入
        socket.on('newUser', (data) => {
            handleNewUser(io, socket, data);
        });

        // 測試連接
        socket.on('test', () => {
            console.log('🔧 測試連接正常');
        });

        // 方塊旋轉
        socket.on('changeDirection', (data) => {
            handleRotateBlock(io, data);
        });

        // 方塊移動 (左右下)
        socket.on('moveBlock', (data) => {
            handleMoveBlock(io, data);
        });

        // 方塊快速下落
        socket.on('dropBlock', (data) => {
            handleDropBlock(io, data);
        });

        // 遊戲失敗
        socket.on('loseStateGet', () => {
            handleGameOver(io, socket);
        });

        // 開始遊戲
        socket.on('startGameWithCouplePlayer', () => {
            handleStartGame(io, socket);
        });

        // 玩家斷線
        socket.on('disconnect', () => {
            handlePlayerDisconnect(io, socket);
        });
    });
}

/**
 * 處理新玩家加入
 */
function handleNewUser(io, socket, data) {
    const users = gameState.getAllUsers();

    if (users.find(u => u.socketID === data.socketID)) {
        console.log('⚠️ 玩家已存在:', data.socketID);
        return;
    }

    if (users.length >= config.MAX_PLAYERS) {
        console.log(`⚠️ 房間已滿 (${config.MAX_PLAYERS}/${config.MAX_PLAYERS})`);
        socket.emit('connectionRejected', {
            reason: `遊戲房間已滿 (${config.MAX_PLAYERS}/${config.MAX_PLAYERS})，請稍後再試`
        });
        return;
    }

    // 添加新玩家
    const playerNumber = users.length + 1;
    const playerId = `USER${playerNumber}`;
    const newUser = gameState.addUser(data.socketID, data.userName || `Player${playerNumber}`, playerId);

    console.log(`👤 ${newUser.userName} 已加入 (${playerId}) - ${users.length + 1}/${config.MAX_PLAYERS} 玩家`);

    const sendData = {
        newUser: newUser,
        size: users.length,
        maxPlayers: config.MAX_PLAYERS,
    };

    io.emit('newUserResponse', sendData);
}

/**
 * 處理方塊旋轉
 */
function handleRotateBlock(io, data) {
    const users = gameState.getAllUsers();
    const player = users.find(u => u.socketID === data.socketID);

    if (!player || player.state === config.LOSE || player.state === config.ELIMINATED) {
        return;
    }

    const rotatedPlayer = gameLogic.rotateBlock(player);

    // 更新玩家狀態
    gameState.updateUser(data.socketID, rotatedPlayer);

    // 立即廣播更新
    const allUsers = gameState.getAllUsers();
    io.emit('stateOfUsers', {
        users: allUsers,
        gameState: gameState.getGameState(),
    });
}

/**
 * 處理方塊移動
 */
function handleMoveBlock(io, data) {
    const users = gameState.getAllUsers();
    const player = users.find(u => u.socketID === data.socketID);

    if (!player || player.state === config.LOSE || player.state === config.ELIMINATED) {
        return;
    }

    let updatedPlayer = player;

    if (data.direction === config.DOWN) {
        // 快速下落
        updatedPlayer = { ...player, actionTime: 0 };
    } else if (data.direction === config.LEFT) {
        updatedPlayer = gameLogic.moveBlockLeft(player);
    } else if (data.direction === config.RIGHT) {
        updatedPlayer = gameLogic.moveBlockRight(player);
    }

    // 更新玩家狀態
    gameState.updateUser(data.socketID, updatedPlayer);

    // 立即廣播更新
    const allUsers = gameState.getAllUsers();
    io.emit('stateOfUsers', {
        users: allUsers,
        gameState: gameState.getGameState(),
    });
}

/**
 * 處理方塊快速下落
 */
function handleDropBlock(io, data) {
    const users = gameState.getAllUsers();
    const player = users.find(u => u.socketID === data.socketID);

    if (!player || player.state === config.LOSE || player.state === config.ELIMINATED) {
        return;
    }

    const droppedPlayer = gameLogic.dropBlock(player);

    // 更新玩家狀態
    gameState.updateUser(data.socketID, droppedPlayer);

    // 立即廣播更新
    const allUsers = gameState.getAllUsers();
    io.emit('stateOfUsers', {
        users: allUsers,
        gameState: gameState.getGameState(),
    });
}

/**
 * 處理遊戲結束
 */
function handleGameOver(io, socket) {
    console.log('🎮 遊戲結束');

    gameState.setGameState(config.READY);
    socket.emit('readyStateEmit');

    if (gameBroadcast) {
        clearInterval(gameBroadcast);
        gameBroadcast = null;
    }

    // 重置所有玩家
    gameState.resetAllPlayers();
}

/**
 * 處理開始遊戲
 */
function handleStartGame(io, socket) {
    const users = gameState.getAllUsers();

    if (users.length < 2) {
        console.log(`⚠️ 玩家不足 (${users.length}/2)，無法開始遊戲`);
        socket.emit('gameStartFailed', {
            reason: `需要至少 2 個玩家才能開始遊戲，目前有 ${users.length} 個玩家`
        });
        return;
    }

    if (users.length > config.MAX_PLAYERS) {
        console.log(`⚠️ 玩家過多 (${users.length}/${config.MAX_PLAYERS})`);
        socket.emit('gameStartFailed', {
            reason: `最多支援 ${config.MAX_PLAYERS} 個玩家，目前有 ${users.length} 個玩家`
        });
        return;
    }

    console.log(`🎮 遊戲開始！玩家數：${users.length}/${config.MAX_PLAYERS}`);

    gameState.setGameState(config.GAME);

    // 開始遊戲主循環
    if (gameBroadcast) {
        clearInterval(gameBroadcast);
    }

    gameBroadcast = setInterval(() => {
        const users = gameState.getAllUsers();

        // 處理每個玩家的遊戲邏輯
        const updatedUsers = users.map(player => {
            if (player.state === config.LOSE || player.state === config.ELIMINATED) {
                return player;
            }
            return gameLogic.processPlayerTick(player);
        });

        // 更新 gameState 中的玩家資料
        gameState.updateAllUsers(updatedUsers);

        // 檢查遊戲結束條件
        checkGameOver(io, updatedUsers);

        // 廣播遊戲狀態
        const data = {
            users: updatedUsers,
            gameState: gameState.getGameState(),
        };
        io.emit('stateOfUsers', data);
    }, config.FRAME);
}

/**
 * 檢查遊戲結束條件
 */
function checkGameOver(io, users) {
    const activePlayers = users.filter(u =>
        u.state !== config.ELIMINATED && u.state !== config.LOSE
    );

    const losePlayers = users.filter(u => {
        const gameOverState = gameLogic.isGameOver(u.itemGroundBlock);
        if (gameOverState === config.LOSE && u.state !== config.ELIMINATED) {
            return true;
        }
        return false;
    });

    // 標記失敗的玩家
    losePlayers.forEach(loser => {
        if (loser.state !== config.ELIMINATED) {
            loser.state = config.LOSE;
        }
    });

    // 如果所有活躍玩家都失敗了
    if (activePlayers.length > 0 && losePlayers.length === activePlayers.length) {
        console.log('🎮 所有玩家都失敗了，遊戲結束！');

        gameState.setGameState(config.READY);

        // 標記所有玩家為 ELIMINATED
        users.forEach(u => {
            u.state = config.ELIMINATED;
        });

        // 通知所有客戶端遊戲結束
        io.emit('allPlayersGameOver', {
            message: '遊戲結束！所有玩家都失敗了',
            players: users.map(u => ({
                userName: u.userName,
                who: u.who,
                level: u.level,
                score: u.score || 0
            }))
        });

        // 3秒後重置
        setTimeout(() => {
            io.emit('readyStateEmit');
            if (gameBroadcast) {
                clearInterval(gameBroadcast);
                gameBroadcast = null;
            }
        }, 3000);
    }
    // 如果只有部分玩家失敗
    else if (losePlayers.length > 0 && losePlayers.length < activePlayers.length) {
        losePlayers.forEach(loser => {
            console.log(`🚫 玩家 ${loser.userName} (${loser.who}) 被淘汰`);

            loser.state = config.ELIMINATED;

            // 通知客戶端該玩家被淘汰
            io.emit('playerEliminated', {
                socketID: loser.socketID,
                userName: loser.userName,
                who: loser.who,
                remainingPlayers: activePlayers.length - 1
            });
        });
    }
}

/**
 * 處理玩家斷線
 */
function handlePlayerDisconnect(io, socket) {
    const users = gameState.getAllUsers();
    const disconnectedUser = users.find(u => u.socketID === socket.id);

    if (disconnectedUser) {
        console.log(`👋 玩家離開：${disconnectedUser.userName} (${disconnectedUser.who})`);

        gameState.removeUser(socket.id);

        const remainingUsers = gameState.getAllUsers();
        console.log(`目前玩家數：${remainingUsers.length}/${config.MAX_PLAYERS}`);

        // 如果遊戲進行中且玩家不足,結束遊戲
        if (gameState.getGameState() === config.GAME && remainingUsers.length < 2) {
            console.log('⚠️ 玩家不足，遊戲結束');
            gameState.setGameState(config.READY);
            if (gameBroadcast) {
                clearInterval(gameBroadcast);
                gameBroadcast = null;
            }
            io.emit('readyStateEmit');
        }

        // 通知其他玩家有人離開
        io.emit('playerDisconnected', {
            socketID: socket.id,
            userName: disconnectedUser.userName,
            remainingPlayers: remainingUsers.length
        });
    }
}

module.exports = {
    setupSocketHandlers,
};

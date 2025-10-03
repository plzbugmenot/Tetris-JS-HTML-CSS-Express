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

        // 暫存方塊
        socket.on('holdBlock', (data) => {
            handleHoldBlock(io, data);
        });


        // 遊戲失敗
        socket.on('loseStateGet', () => {
            handleGameOver(io, socket);
        });

        // 開始遊戲
        socket.on('startGameWithCouplePlayer', () => {
            handleStartGame(io, socket);
        });

        // 觀戰者加入挑戰
        socket.on('joinChallenge', () => {
            handleJoinChallenge(io, socket);
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
    const allUsers = gameState.getAllUsers();
    const challengers = gameState.getChallengers();
    const spectators = gameState.getSpectators();

    if (allUsers.find(u => u.socketID === data.socketID)) {
        console.log('⚠️ 玩家已存在:', data.socketID);
        return;
    }

    let playerType = config.PLAYER_TYPE_SPECTATOR;
    let playerId = '';

    if (allUsers.length === 0) {
        playerType = config.PLAYER_TYPE_CHALLENGER;
        playerId = 'USER1';
    } else {
        playerType = config.PLAYER_TYPE_SPECTATOR;
        playerId = `SPECTATOR${spectators.length + 1}`;
    }

    const newUser = gameState.addUser(
        data.socketID,
        data.userName || (playerType === config.PLAYER_TYPE_CHALLENGER ? `Player${challengers.length + 1}` : `觀戰者${spectators.length + 1}`),
        playerId,
        playerType
    );

    const userTypeText = playerType === config.PLAYER_TYPE_CHALLENGER ? '挑戰者' : '觀戰者';
    console.log(`👤 ${newUser.userName} 以${userTypeText}身份加入 (${playerId})`);

    const sendData = {
        newUser: newUser,
        size: allUsers.length + 1,
        challengers: gameState.getChallengers().length,
        spectators: gameState.getSpectators().length,
        maxPlayers: config.MAX_PLAYERS,
        playerType: playerType,
    };

    io.emit('newUserResponse', sendData);

    if (playerType === config.PLAYER_TYPE_CHALLENGER && gameState.getChallengers().length === 1) {
        console.log(`🎮 第一位玩家加入，自動開始單機遊戲！`);
        setTimeout(() => {
            handleStartGame(io, socket);
        }, 500);
    }
}

/**
 * 處理觀戰者加入挑戰
 */
function handleJoinChallenge(io, socket) {
    const user = gameState.findUser(socket.id);

    if (!user) return;

    if (user.playerType === config.PLAYER_TYPE_CHALLENGER) {
        socket.emit('joinChallengeFailed', { reason: '你已經是挑戰者了' });
        return;
    }

    if (gameState.getChallengers().length >= config.MAX_PLAYERS) {
        socket.emit('joinChallengeFailed', { reason: `挑戰者已滿` });
        return;
    }

    if (gameState.convertToChallenger(socket.id)) {
        const updatedUser = gameState.findUser(socket.id);
        updatedUser.who = `USER${gameState.getChallengers().length}`;

        console.log(`✅ ${updatedUser.userName} 從觀戰者轉為挑戰者 (${updatedUser.who})`);

        io.emit('playerJoinedChallenge', {
            socketID: socket.id,
            userName: updatedUser.userName,
            who: updatedUser.who,
            challengers: gameState.getChallengers().length,
            spectators: gameState.getSpectators().length,
        });

        socket.emit('joinChallengeSuccess', {
            message: '成功加入挑戰！',
            user: updatedUser
        });
    }
}

/**
 * 處理方塊旋轉
 */
function handleRotateBlock(io, data) {
    const player = gameState.findUser(data.socketID);
    if (!player || player.state === config.LOSE || player.state === config.ELIMINATED) return;

    const rotatedPlayer = gameLogic.rotateBlock(player);
    gameState.updateUser(data.socketID, rotatedPlayer);

    io.emit('stateOfUsers', {
        users: gameState.getAllUsers(),
        gameState: gameState.getGameState(),
    });
}

/**
 * 處理方塊移動
 */
function handleMoveBlock(io, data) {
    const player = gameState.findUser(data.socketID);
    if (!player || player.state === config.LOSE || player.state === config.ELIMINATED) return;

    let updatedPlayer = player;
    if (data.direction === config.DOWN) {
        updatedPlayer = { ...player, actionTime: 0 };
    } else if (data.direction === config.LEFT) {
        updatedPlayer = gameLogic.moveBlockLeft(player);
    } else if (data.direction === config.RIGHT) {
        updatedPlayer = gameLogic.moveBlockRight(player);
    }

    gameState.updateUser(data.socketID, updatedPlayer);

    io.emit('stateOfUsers', {
        users: gameState.getAllUsers(),
        gameState: gameState.getGameState(),
    });
}

/**
 * 處理方塊快速下落
 */
function handleDropBlock(io, data) {
    const player = gameState.findUser(data.socketID);
    if (!player || player.state === config.LOSE || player.state === config.ELIMINATED) return;

    const droppedPlayer = gameLogic.dropBlock(player);
    gameState.updateUser(data.socketID, droppedPlayer);

    io.emit('stateOfUsers', {
        users: gameState.getAllUsers(),
        gameState: gameState.getGameState(),
    });
}

/**
 * 處理暫存方塊
 */
function handleHoldBlock(io, data) {
    const player = gameState.findUser(data.socketID);
    if (!player || player.state === config.LOSE || player.state === config.ELIMINATED) return;

    const heldPlayer = gameLogic.holdBlock(player);
    gameState.updateUser(data.socketID, heldPlayer);

    io.emit('stateOfUsers', {
        users: gameState.getAllUsers(),
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
    gameState.resetAllPlayers();
}

/**
 * 處理開始遊戲
 */
function handleStartGame(io, socket) {
    const challengers = gameState.getChallengers();
    if (challengers.length < 1) {
        socket.emit('gameStartFailed', { reason: `沒有挑戰者` });
        return;
    }

    console.log(`🎮 遊戲開始！模式: ${challengers.length === 1 ? '單機' : '多人'}`);
    gameState.setGameState(config.GAME);
    gameState.resetAllPlayers(challengers);


    if (gameBroadcast) clearInterval(gameBroadcast);

    gameBroadcast = setInterval(() => {
        const users = gameState.getAllUsers();
        let updatedUsers = users.map(player => {
            if (player.playerType === config.PLAYER_TYPE_CHALLENGER && player.state !== config.LOSE && player.state !== config.ELIMINATED) {
                return gameLogic.processPlayerTick(player);
            }
            return player;
        });

        // 處理攻擊和廣播
        processAttacksAndBroadcasts(io, updatedUsers);

        gameState.updateAllUsers(updatedUsers);
        checkGameOver(io);

        io.emit('stateOfUsers', {
            users: gameState.getAllUsers(),
            gameState: gameState.getGameState(),
        });
    }, config.FRAME);
}

/**
 * 處理攻擊和事件廣播
 */
function processAttacksAndBroadcasts(io, users) {
    const challengers = users.filter(u => u.playerType === config.PLAYER_TYPE_CHALLENGER);

    users.forEach(attacker => {
        if (!attacker.clearedLineNumbers) return;

        io.emit('lineCleared', {
            socketID: attacker.socketID,
            lineNumbers: attacker.clearedLineNumbers,
        });

        if (attacker.luckyEvent) {
            io.emit('luckyEvent', {
                socketID: attacker.socketID,
                eventName: attacker.luckyEvent.name,
            });
        }
        if (attacker.leveledUp) {
            io.emit('playerLevelUp', {
                socketID: attacker.socketID,
                newLevel: attacker.level,
            });
        }

        if (attacker.attackPower > 0 && challengers.length > 1) {
            const targets = challengers.filter(p => p.socketID !== attacker.socketID && p.state !== config.LOSE && p.state !== config.ELIMINATED);
            if (targets.length > 0) {
                const target = targets[Math.floor(Math.random() * targets.length)];
                target.itemGroundBlock = gameLogic.addGarbageLines(target.itemGroundBlock, attacker.attackPower);
                io.emit('playerAttacked', {
                    attackerID: attacker.socketID,
                    targetID: target.socketID,
                    attackPower: attacker.attackPower,
                });
            }
        }

        delete attacker.clearedLineNumbers;
        delete attacker.attackPower;
        delete attacker.luckyEvent;
        delete attacker.leveledUp;
    });
}


/**
 * 檢查遊戲結束條件
 */
function checkGameOver(io) {
    const challengers = gameState.getChallengers();
    if (challengers.length === 0) return;

    const activePlayers = challengers.filter(u => u.state !== config.ELIMINATED && u.state !== config.LOSE);
    let losers = [];

    activePlayers.forEach(player => {
        if (gameLogic.isGameOver(player.itemGroundBlock) === config.LOSE) {
            player.state = config.ELIMINATED;
            losers.push(player);
        }
    });

    losers.forEach(loser => {
        io.emit('playerEliminated', { socketID: loser.socketID });
    });

    const remainingPlayers = challengers.filter(p => p.state !== config.ELIMINATED);

    if (challengers.length > 1 && remainingPlayers.length <= 1) {
        endGame(io, remainingPlayers.length === 1 ? `${remainingPlayers[0].userName} 獲勝！` : '平手！');
    } else if (challengers.length === 1 && remainingPlayers.length === 0) {
        endGame(io, '遊戲結束！');
    }
}

/**
 * 結束遊戲並廣播結果
 */
function endGame(io, message) {
    console.log(`🏁 遊戲結束: ${message}`);
    gameState.setGameState(config.READY);
    if (gameBroadcast) {
        clearInterval(gameBroadcast);
        gameBroadcast = null;
    }

    io.emit('allPlayersGameOver', {
        message: message,
        players: gameState.getChallengers().map(u => ({ userName: u.userName, score: u.score || 0 }))
    });

    setTimeout(() => {
        io.emit('readyStateEmit');
        // 單人模式自動重啟
        if (gameState.getChallengers().length === 1) {
            const player = gameState.getChallengers()[0];
            const playerSocket = io.sockets.sockets.get(player.socketID);
            if(playerSocket) handleStartGame(io, playerSocket);
        }
    }, 5000);
}


/**
 * 處理玩家斷線
 */
function handlePlayerDisconnect(io, socket) {
    const disconnectedUser = gameState.findUser(socket.id);
    if (!disconnectedUser) return;

    console.log(`👋 ${disconnectedUser.playerType}離開：${disconnectedUser.userName}`);
    gameState.removeUser(socket.id);

    // 如果遊戲中挑戰者為空，結束遊戲
    if (gameState.getGameState() === config.GAME && gameState.getChallengers().length === 0) {
        endGame(io, '所有挑戰者都已離開，遊戲結束。');
    }

    io.emit('playerDisconnected', {
        socketID: socket.id,
        remainingChallengers: gameState.getChallengers().length,
        remainingSpectators: gameState.getSpectators().length
    });
}

module.exports = {
    setupSocketHandlers,
};
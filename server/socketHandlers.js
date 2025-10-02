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

    // 判斷新玩家的身份：第一位是挑戰者，其他默認為觀戰者
    let playerType = config.PLAYER_TYPE_SPECTATOR;
    let playerId = '';

    if (allUsers.length === 0) {
        // 第一位玩家 - 挑戰者
        playerType = config.PLAYER_TYPE_CHALLENGER;
        playerId = 'USER1';
    } else {
        // 第二位及以上 - 默認觀戰者
        playerType = config.PLAYER_TYPE_SPECTATOR;
        playerId = `SPECTATOR${spectators.length + 1}`;
    }

    // 添加新玩家
    const newUser = gameState.addUser(
        data.socketID,
        data.userName || (playerType === config.PLAYER_TYPE_CHALLENGER ? `Player${challengers.length + 1}` : `觀戰者${spectators.length + 1}`),
        playerId,
        playerType
    );

    const userTypeText = playerType === config.PLAYER_TYPE_CHALLENGER ? '挑戰者' : '觀戰者';
    console.log(`👤 ${newUser.userName} 以${userTypeText}身份加入 (${playerId})`);
    console.log(`   目前: ${challengers.length + (playerType === config.PLAYER_TYPE_CHALLENGER ? 1 : 0)} 挑戰者, ${spectators.length + (playerType === config.PLAYER_TYPE_SPECTATOR ? 1 : 0)} 觀戰者`);

    const sendData = {
        newUser: newUser,
        size: allUsers.length + 1,
        challengers: challengers.length + (playerType === config.PLAYER_TYPE_CHALLENGER ? 1 : 0),
        spectators: spectators.length + (playerType === config.PLAYER_TYPE_SPECTATOR ? 1 : 0),
        maxPlayers: config.MAX_PLAYERS,
        playerType: playerType,
    };

    io.emit('newUserResponse', sendData);

    // 🎮 如果是第一位玩家（挑戰者），自動開始單機遊戲
    if (playerType === config.PLAYER_TYPE_CHALLENGER && gameState.getChallengers().length === 1) {
        console.log(`🎮 第一位玩家加入，自動開始單機遊戲！`);

        // 延遲 500ms 後自動開始（讓前端準備好）
        setTimeout(() => {
            handleStartGame(io, socket);
        }, 500);
    }
}

/**
 * 處理觀戰者加入挑戰
 */
function handleJoinChallenge(io, socket) {
    const allUsers = gameState.getAllUsers();
    const challengers = gameState.getChallengers();
    const user = allUsers.find(u => u.socketID === socket.id);

    if (!user) {
        console.log('⚠️ 找不到該玩家');
        return;
    }

    if (user.playerType === config.PLAYER_TYPE_CHALLENGER) {
        console.log('⚠️ 玩家已經是挑戰者:', user.userName);
        socket.emit('joinChallengeFailed', {
            reason: '你已經是挑戰者了'
        });
        return;
    }

    // 檢查挑戰者人數是否已滿
    if (challengers.length >= config.MAX_PLAYERS) {
        console.log(`⚠️ 挑戰者已滿 (${challengers.length}/${config.MAX_PLAYERS})`);
        socket.emit('joinChallengeFailed', {
            reason: `挑戰者已滿 (${challengers.length}/${config.MAX_PLAYERS})，請等待有人離開`
        });
        return;
    }

    // 轉換為挑戰者
    const success = gameState.convertToChallenger(socket.id);

    if (success) {
        // 重新分配玩家 ID
        const newChallengers = gameState.getChallengers();
        user.who = `USER${newChallengers.length}`;

        console.log(`✅ ${user.userName} 從觀戰者轉為挑戰者 (${user.who})`);
        console.log(`   目前: ${newChallengers.length} 挑戰者, ${gameState.getSpectators().length} 觀戰者`);

        // 通知所有客戶端
        io.emit('playerJoinedChallenge', {
            socketID: socket.id,
            userName: user.userName,
            who: user.who,
            challengers: newChallengers.length,
            spectators: gameState.getSpectators().length,
        });

        // 通知該玩家成功加入挑戰
        socket.emit('joinChallengeSuccess', {
            message: '成功加入挑戰！',
            user: user
        });
    }
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

    if (users.length < 1) {
        console.log(`⚠️ 沒有玩家，無法開始遊戲`);
        socket.emit('gameStartFailed', {
            reason: `沒有玩家`
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

    const gameMode = users.length === 1 ? '單機模式' : `多人對戰 (${users.length}人)`;
    console.log(`🎮 遊戲開始！模式: ${gameMode}`);

    gameState.setGameState(config.GAME);

    // 開始遊戲主循環
    if (gameBroadcast) {
        clearInterval(gameBroadcast);
    }

    gameBroadcast = setInterval(() => {
        const users = gameState.getAllUsers();

        // 處理每個玩家的遊戲邏輯（只處理挑戰者）
        const updatedUsers = users.map(player => {
            // 觀戰者不參與遊戲邏輯
            if (player.playerType === config.PLAYER_TYPE_SPECTATOR) {
                return player;
            }

            // 已失敗或被淘汰的挑戰者也不處理
            if (player.state === config.LOSE || player.state === config.ELIMINATED) {
                return player;
            }

            return gameLogic.processPlayerTick(player);
        });

        // 處理攻擊和 Combo
        updatedUsers.forEach(attacker => {
            // 檢查是否有玩家消行
            if (attacker.clearedLineNumbers && attacker.clearedLineNumbers.length > 0) {
                // 發送消行動畫事件
                io.emit('lineCleared', {
                    socketID: attacker.socketID,
                    userName: attacker.userName,
                    lineNumbers: attacker.clearedLineNumbers,
                    linesCleared: attacker.linesCleared,
                    combo: attacker.combo || 0
                });

                // 如果有攻擊力且在多人模式，執行攻擊
                const challengers = gameState.getChallengers();
                if (attacker.attackPower > 0 && challengers.length > 1) {
                    // 選擇攻擊目標（隨機選擇一個其他挑戰者）
                    const targets = challengers.filter(p =>
                        p.socketID !== attacker.socketID &&
                        p.state !== config.LOSE &&
                        p.state !== config.ELIMINATED
                    );

                    if (targets.length > 0) {
                        // 隨機選擇一個目標
                        const target = targets[Math.floor(Math.random() * targets.length)];

                        // 添加垃圾行到目標
                        target.itemGroundBlock = gameLogic.addGarbageLines(
                            target.itemGroundBlock,
                            attacker.attackPower
                        );

                        console.log(`⚔️ ${attacker.userName} 攻擊 ${target.userName}，造成 ${attacker.attackPower} 行垃圾！`);

                        // 發送攻擊事件
                        io.emit('playerAttacked', {
                            attackerID: attacker.socketID,
                            attackerName: attacker.userName,
                            targetID: target.socketID,
                            targetName: target.userName,
                            attackPower: attacker.attackPower,
                            combo: attacker.combo
                        });
                    }
                }

                // 清除標記，避免重複處理
                delete attacker.clearedLineNumbers;
                delete attacker.attackPower;
                delete attacker.linesCleared;
            }
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
        const isSinglePlayer = users.length === 1;
        const message = isSinglePlayer ? '遊戲結束！' : '遊戲結束！所有玩家都失敗了';

        console.log(`🎮 ${message}`);

        gameState.setGameState(config.READY);

        // 標記所有玩家為 ELIMINATED
        users.forEach(u => {
            u.state = config.ELIMINATED;
        });

        // 通知所有客戶端遊戲結束
        io.emit('allPlayersGameOver', {
            message: message,
            isSinglePlayer: isSinglePlayer,
            players: users.map(u => ({
                userName: u.userName,
                who: u.who,
                level: u.level,
                score: u.score || 0
            }))
        });

        // 單機模式：3秒後自動重新開始
        // 多人模式：3秒後回到準備狀態
        setTimeout(() => {
            if (gameBroadcast) {
                clearInterval(gameBroadcast);
                gameBroadcast = null;
            }

            if (isSinglePlayer) {
                // 單機模式自動重新開始
                gameState.resetAllPlayers();
                io.emit('readyStateEmit');

                console.log(`🔄 單機模式自動重新開始...`);
                setTimeout(() => {
                    const currentUsers = gameState.getAllUsers();
                    if (currentUsers.length === 1) {
                        const firstUser = currentUsers[0];
                        const firstUserSocket = io.sockets.sockets.get(firstUser.socketID);
                        if (firstUserSocket) {
                            handleStartGame(io, firstUserSocket);
                        }
                    }
                }, 1000);
            } else {
                // 多人模式回到準備狀態
                io.emit('readyStateEmit');
            }
        }, 10000);
    }
    // 如果只有部分玩家失敗（多人模式）
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
        const userType = disconnectedUser.playerType === config.PLAYER_TYPE_CHALLENGER ? '挑戰者' : '觀戰者';
        console.log(`👋 ${userType}離開：${disconnectedUser.userName} (${disconnectedUser.who})`);

        gameState.removeUser(socket.id);

        const remainingUsers = gameState.getAllUsers();
        const remainingChallengers = gameState.getChallengers();
        const remainingSpectators = gameState.getSpectators();

        console.log(`目前: ${remainingChallengers.length} 挑戰者, ${remainingSpectators.length} 觀戰者`);

        // 如果遊戲進行中且挑戰者不足，結束遊戲
        if (gameState.getGameState() === config.GAME && remainingChallengers.length === 0) {
            console.log('⚠️ 沒有挑戰者了，遊戲結束');
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
            playerType: disconnectedUser.playerType,
            remainingChallengers: remainingChallengers.length,
            remainingSpectators: remainingSpectators.length
        });
    }
}

module.exports = {
    setupSocketHandlers,
};

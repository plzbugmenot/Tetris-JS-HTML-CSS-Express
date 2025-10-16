/**
 * Socket 事件處理模組
 * 負責所有 Socket.IO 事件的處理邏輯
 */

const config = require('./config');
const gameState = require('./gameState');
const gameLogic = require('./gameLogic');
const logger = require('./logger');

// 遊戲廣播計時器
let gameBroadcast = null;
let continueGameTimeouts = new Map(); // 用於追蹤玩家繼續遊玩的確認超時

/**
 * 設置 Socket.IO 事件監聽器
 * @param {SocketIO.Server} io - Socket.IO 伺服器實例
 */
function setupSocketHandlers(io) {
    io.on('connect', (socket) => {
        logger.event('SOCKET', '客戶端已連接', socket.id);

        // 新玩家加入
        socket.on('newUser', (data) => {
            handleNewUser(io, socket, data);
        });

        // 測試連接
        socket.on('test', () => {
            logger.event('SOCKET', '測試連接正常', socket.id);
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

        // 加入挑戰
        socket.on('joinChallenge', () => {
            handleJoinChallenge(io, socket);
        });

        // 處理繼續遊玩回應
        socket.on('continueGameResponse', (data) => {
            handleContinueGameResponse(io, socket, data);
        });

        // 請求房間狀態更新
        socket.on('requestRoomStatus', () => {
            const challengers = gameState.getChallengers();
            const spectators = gameState.getSpectators();
            const allUsers = gameState.getAllUsers();

            socket.emit('gameStateUpdate', {
                size: allUsers.length,
                challengers: challengers.length,
                spectators: spectators.length,
                maxPlayers: config.MAX_PLAYERS,
                gameState: gameState.getGameState()
            });
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

    if (allUsers.some(u => u.socketID === data.socketID)) {
        logger.warn('玩家已存在', data.socketID);
        return;
    }

    // 檢查遊戲狀態一致性：如果沒有挑戰者但遊戲狀態還是 GAME，重置為 READY
    if (gameState.getGameState() === config.GAME && challengers.length === 0) {
        logger.event('SYSTEM', '檢測到遊戲狀態不一致，重置為 READY');
        gameState.setGameState(config.READY);
    }

    let playerType;
    let playerId = '';

    // 如果沒有挑戰者，新玩家成為挑戰者；否則成為觀戰者
    if (challengers.length === 0) {
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
    logger.event('PLAYER', `${newUser.userName} 以${userTypeText}身份加入`, playerId);

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
        logger.event('GAME', '第一位玩家加入，自動開始單機遊戲！');
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

    // 已移除挑戰者人數上限限制，允許無限挑戰者

    if (gameState.convertToChallenger(socket.id)) {
        const updatedUser = gameState.findUser(socket.id);
        updatedUser.who = `USER${gameState.getChallengers().length}`;

        logger.success(`${updatedUser.userName} 從觀戰者轉為挑戰者`, updatedUser.who);

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

        // 如果這是第一位挑戰者且遊戲狀態為 READY，自動開始遊戲
        if (gameState.getChallengers().length === 1 && gameState.getGameState() === config.READY) {
            logger.event('GAME', '觀戰者轉為挑戰者，自動開始單機遊戲！');
            setTimeout(() => {
                handleStartGame(io, socket);
            }, 500);
        }
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
    logger.event('GAME', '遊戲結束');
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
let gameStartTime = null;
let autoRestartTimer = null; // 追蹤自動重啟定時器

function handleStartGame(io, socket) {
    const challengers = gameState.getChallengers();
    if (challengers.length < 1) {
        socket.emit('gameStartFailed', { reason: `沒有挑戰者` });
        return;
    }

    logger.event('GAME', `遊戲開始`, challengers.length === 1 ? '單機模式' : '多人模式');
    gameState.setGameState(config.GAME);
    gameState.resetAllPlayers(challengers);

    // 記錄遊戲開始時間，給玩家緩衝期
    gameStartTime = Date.now();

    if (gameBroadcast) clearInterval(gameBroadcast);

    gameBroadcast = setInterval(() => {
        const users = gameState.getAllUsers();
        let updatedUsers = users.map(player => {
            if (player.playerType === config.PLAYER_TYPE_CHALLENGER && player.state !== config.LOSE && player.state !== config.ELIMINATED) {
                const processedPlayer = gameLogic.processPlayerTick(player);
                // Update play time statistics
                if (processedPlayer.stats?.startTime) {
                    processedPlayer.stats.playTime = Math.floor((Date.now() - processedPlayer.stats.startTime) / 1000);
                }
                return processedPlayer;
            }
            return player;
        });

        // 處理攻擊和廣播
        processAttacksAndBroadcasts(io, updatedUsers);

        gameState.updateAllUsers(updatedUsers);

        // 給玩家 2 秒的緩衝期，避免立即檢查遊戲結束
        // 只有在沒有玩家等待確認時才檢查遊戲結束
        if (Date.now() - gameStartTime > 2000 && continueGameTimeouts.size === 0) {
            checkGameOver(io);
        }

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

    for (const attacker of users) {
        if (!attacker.clearedLineNumbers) {
            continue;
        }

        io.emit('lineCleared', {
            socketID: attacker.socketID,
            userName: attacker.userName,
            lineNumbers: attacker.clearedLineNumbers,
            linesCleared: attacker.clearedLineNumbers.length,
            combo: attacker.combo || 1,
            gainedExp: attacker.gainedExp || 0
        });

        if (attacker.luckyEvent) {
            io.emit('luckyEvent', {
                socketID: attacker.socketID,
                userName: attacker.userName,
                eventName: attacker.luckyEvent.name,
                eventColor: attacker.luckyEvent.color,
                multiplier: attacker.luckyEvent.multiplier,
                gainedExp: attacker.gainedExp || 0
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

                // Update attacker's attack statistics
                if (attacker.stats) {
                    attacker.stats.attack += attacker.attackPower;
                }

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
    }
}


/**
 * 檢查遊戲結束條件
 */
function checkGameOver(io) {
    const challengers = gameState.getChallengers();
    if (challengers.length === 0) return;

    const activePlayers = challengers.filter(u => u.state !== config.ELIMINATED && u.state !== config.LOSE);
    let losers = [];

    for (const player of activePlayers) {
        if (gameLogic.isGameOver(player.itemGroundBlock) === config.LOSE) {
            player.state = config.ELIMINATED;
            losers.push(player);
            // 發送繼續遊玩確認詢問，但不立即發送 playerEliminated
            askContinueGame(io, player);
        }
    }

    // 更新其他玩家的 KO 統計
    for (const loser of losers) {
        for (const player of challengers) {
            if (player.socketID !== loser.socketID && player.state !== config.ELIMINATED && player.state !== config.LOSE) {
                if (player.stats) {
                    player.stats.kos += 1;
                }
            }
        }
    }

    const remainingPlayers = challengers.filter(p => p.state !== config.ELIMINATED && p.state !== config.LOSE);

    // 檢查是否有玩家正在等待繼續遊玩確認
    const playersAwaitingConfirmation = continueGameTimeouts.size;

    // 只有在沒有玩家等待確認時才結束遊戲
    if (playersAwaitingConfirmation === 0) {
        if (challengers.length > 1 && remainingPlayers.length <= 1) {
            endGame(io, remainingPlayers.length === 1 ? `${remainingPlayers[0].userName} 獲勝！` : '平手！');
        } else if (challengers.length === 1 && remainingPlayers.length === 0) {
            endGame(io, '遊戲結束！');
        }
    }
    // 不輸出等待日誌，避免重複訊息
}

/**
 * 詢問被淘汰的玩家是否繼續遊玩
 */
function askContinueGame(io, player) {
    logger.event('GAME', `詢問是否繼續遊玩`, player.userName);

    // 暫停自動重啟定時器，避免衝突
    if (autoRestartTimer) {
        clearTimeout(autoRestartTimer);
        autoRestartTimer = null;
        logger.info('暫停自動重啟定時器，等待玩家回應');
    }

    // 先觸發棋盤淘汰效果
    io.emit('playerEliminated', {
        socketID: player.socketID,
        userName: player.userName,
        showGameOver: false, // 不顯示遊戲結束畫面
        showEliminationOnly: true // 只顯示淘汰效果
    });

    // 延遲1.5秒後再顯示確認對話框，讓淘汰效果有時間播放
    setTimeout(() => {
        // 向該玩家發送確認詢問
        io.to(player.socketID).emit('askContinueGame', {
            message: '遊戲結束！是否要繼續遊玩？',
            timeout: 10000 // 10秒超時
        });
    }, 1500);

    // 設置超時定時器（1.5秒淘汰效果 + 10秒倒數）
    const timeoutId = setTimeout(() => {
        logger.warn('玩家未在時限內回應，轉為觀戰者', player.userName);
        // 將玩家設為觀戰者
        player.playerType = config.PLAYER_TYPE_SPECTATOR;
        player.state = config.SPECTATOR;

        // 清理超時記錄
        continueGameTimeouts.delete(player.socketID);

        // 發送玩家被淘汰事件（不顯示遊戲結束畫面）
        io.emit('playerEliminated', {
            socketID: player.socketID,
            userName: player.userName,
            showGameOver: false // 不顯示遊戲結束畫面
        });

        // 通知客戶端更新狀態
        io.to(player.socketID).emit('becomeSpectator', {
            message: '未在時限內回應，已轉為觀戲模式'
        });

        // 更新所有玩家的遊戲狀態
        io.emit('gameStateUpdate', gameState.getAllUsers());

        // 檢查是否需要重新開始遊戲（如果沒有其他挑戰者）
        const remainingChallengers = gameState.getChallengers();
        if (remainingChallengers.length === 0) {
            logger.warn('沒有挑戰者，3秒後結束遊戲');
            // 延遲 3 秒結束遊戲，給新玩家時間加入
            setTimeout(() => {
                const currentChallengers = gameState.getChallengers();
                if (currentChallengers.length === 0) {
                    logger.warn('確認沒有挑戰者，遊戲結束');
                    endGame(io, '所有玩家都已退出');
                } else {
                    logger.success('有新挑戰者加入，繼續遊戲');
                }
            }, 3000);
        }
    }, 11500); // 11.5秒超時（1.5秒淘汰效果 + 10秒倒數）

    // 記錄超時定時器
    continueGameTimeouts.set(player.socketID, timeoutId);
}

/**
 * 結束遊戲並廣播結果
 */
function endGame(io, message) {
    logger.event('GAME', '遊戲結束', message);
    gameState.setGameState(config.READY);
    gameStartTime = null; // 重置遊戲開始時間

    // 清理之前的自動重啟定時器
    if (autoRestartTimer) {
        clearTimeout(autoRestartTimer);
        autoRestartTimer = null;
    }

    // 清理所有繼續遊玩確認的定時器
    for (const timeoutId of continueGameTimeouts.values()) {
        clearTimeout(timeoutId);
    }
    continueGameTimeouts.clear();

    if (gameBroadcast) {
        clearInterval(gameBroadcast);
        gameBroadcast = null;
    }

    io.emit('allPlayersGameOver', {
        message: message,
        players: gameState.getChallengers().map(u => ({
            userName: u.userName,
            score: u.score || 0,
            level: u.level || 0,
            who: u.who || u.playerId || 'USER1'
        }))
    });

    // 設置新的自動重啟定時器
    autoRestartTimer = setTimeout(() => {
        // 檢查是否還有玩家存在且遊戲狀態正確
        if (gameState.getChallengers().length === 1 && gameState.getGameState() === config.READY) {
            io.emit('readyStateEmit');
            const player = gameState.getChallengers()[0];
            const playerSocket = io.sockets.sockets.get(player.socketID);
            if (playerSocket) {
                logger.event('GAME', '自動重啟單人遊戲');
                handleStartGame(io, playerSocket);
            }
        }
        autoRestartTimer = null;
    }, 5000);
}


/**
 * 處理繼續遊玩回應
 */
function handleContinueGameResponse(io, socket, data) {
    const player = gameState.findUser(socket.id);
    if (!player) return;

    logger.event('GAME', `玩家回應繼續遊玩`, `${player.userName} › ${data.continue}`);

    // 清理該玩家的超時定時器
    const timeoutId = continueGameTimeouts.get(socket.id);
    if (timeoutId) {
        clearTimeout(timeoutId);
        continueGameTimeouts.delete(socket.id);
    }

    if (data.continue) {
        // 玩家選擇繼續遊玩，重置遊戲狀態
        gameState.resetAllPlayers([player]);
        player.state = config.READY;
        player.playerType = config.PLAYER_TYPE_CHALLENGER;

        io.to(socket.id).emit('continueGameConfirmed', {
            message: '歡迎回來！準備開始新遊戲'
        });

        // 立即開始新遊戲
        setTimeout(() => {
            if (gameState.getChallengers().length === 1) {
                logger.success('玩家選擇繼續，立即開始新遊戲');
                handleStartGame(io, socket);
            }
        }, 1000);
    } else {
        // 玩家選擇不繼續，設為觀戰者
        player.playerType = config.PLAYER_TYPE_SPECTATOR;
        player.state = config.SPECTATOR;

        // 發送玩家被淘汰事件（不顯示遊戲結束畫面）
        io.emit('playerEliminated', {
            socketID: socket.id,
            userName: player.userName,
            showGameOver: false
        });

        io.to(socket.id).emit('becomeSpectator', {
            message: '已轉為觀戰模式'
        });

        // 檢查是否需要結束遊戲（如果沒有其他挑戰者）
        const remainingChallengers = gameState.getChallengers();
        if (remainingChallengers.length === 0) {
            logger.warn('沒有挑戰者，3秒後結束遊戲');
            // 延遲 3 秒結束遊戲，給新玩家時間加入
            setTimeout(() => {
                const currentChallengers = gameState.getChallengers();
                if (currentChallengers.length === 0) {
                    logger.warn('確認沒有挑戰者，遊戲結束');
                    endGame(io, '所有玩家都已退出');
                } else {
                    logger.success('有新挑戰者加入，繼續遊戲');
                }
            }, 3000);
        }
    }

    // 更新所有玩家的遊戲狀態
    io.emit('gameStateUpdate', gameState.getAllUsers());
}

/**
 * 處理玩家斷線
 */
function handlePlayerDisconnect(io, socket) {
    const disconnectedUser = gameState.findUser(socket.id);
    if (!disconnectedUser) return;

    logger.event('PLAYER', '玩家離線', `${disconnectedUser.userName} ｜ ${disconnectedUser.playerType}`);

    // 清理該玩家的繼續遊玩確認定時器
    const timeoutId = continueGameTimeouts.get(socket.id);
    if (timeoutId) {
        clearTimeout(timeoutId);
        continueGameTimeouts.delete(socket.id);
    }

    gameState.removeUser(socket.id);

    // 清理可能存在的自動重啟定時器
    if (autoRestartTimer) {
        clearTimeout(autoRestartTimer);
        autoRestartTimer = null;
        logger.info('清理自動重啟定時器');
    }

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

/**
 * 清理所有定時器和資源
 */
function cleanup() {
    logger.event('SYSTEM', '清理服務器資源...');

    // 清理遊戲廣播定時器
    if (gameBroadcast) {
        clearInterval(gameBroadcast);
        gameBroadcast = null;
        logger.success('遊戲廣播定時器已清理');
    }

    // 清理自動重啟定時器
    if (autoRestartTimer) {
        clearTimeout(autoRestartTimer);
        autoRestartTimer = null;
        logger.success('自動重啟定時器已清理');
    }

    // 重置遊戲狀態
    gameState.setGameState(config.READY);
    gameStartTime = null;

    logger.success('所有資源已清理完成');
}

module.exports = {
    setupSocketHandlers,
    cleanup,
};
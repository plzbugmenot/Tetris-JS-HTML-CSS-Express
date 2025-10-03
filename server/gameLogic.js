/**
 * 遊戲邏輯模組
 * 負責所有遊戲核心邏輯：方塊移動、旋轉、碰撞檢測、消行等
 */

const config = require('./config');
const gameState = require('./gameState');

/**
 * 從玩家的方塊佇列中獲取下一個方塊，並補充佇列
 * @param {Object} player - 玩家對象
 * @returns {Object} 包含新方塊資訊和更新後佇列的對象
 */
function getNextBlock(player) {
    const newNextBlocks = [...player.nextBlocks];
    const nextBlock = newNextBlocks.shift(); // 取出下一個方塊
    newNextBlocks.push(gameState.getRandomDomino()); // 在佇列末尾添加一個新方塊

    // 計算方塊的最低 Y 座標
    const minY = Math.min(...nextBlock.blocks.map(b => b.y));
    // 將方塊往上移動，讓最低點從 y=0 開始（棋盤上方）
    const spawnBlocks = nextBlock.blocks.map(block => ({
        ...block,
        y: block.y - minY
    }));

    return {
        itemBlockBody: spawnBlocks,
        itemBlockType: nextBlock.type,
        itemPreBody: newNextBlocks[0].blocks, // 兼容舊的預覽邏輯
        itemPreType: newNextBlocks[0].type,
        nextBlocks: newNextBlocks,
        canHold: true // 每次出新塊時重置 hold 權限
    };
}


/**
 * 初始化地面方塊
 * @param {number} level - 玩家等級
 * @returns {Array} 初始地面方塊陣列
 */
function getInitialGroundBlocks(level) {
    const tmp = [];
    for (let line = 0; line < 2; line++) {
        let rand_1 = Math.floor(Date.now() * Math.random()) % config.BOARD_SIZE_WIDTH;
        let rand_2 = Math.floor(Date.now() * Math.random()) % config.BOARD_SIZE_WIDTH;
        if (rand_1 === rand_2) {
            rand_2 = Math.floor(Date.now() * Math.random()) % config.BOARD_SIZE_WIDTH;
        }
        for (let i = 0; i < config.BOARD_SIZE_WIDTH; i++) {
            if (i !== rand_1 && i !== rand_2) {
                tmp.push({
                    x: i,
                    y: config.BOARD_SIZE_HEIGHT - line,
                });
            }
        }
    }
    return tmp;
}

/**
 * 檢查遊戲是否結束
 * @param {Array} groundBlock - 地面方塊陣列
 * @returns {string} 遊戲狀態 (GAME 或 LOSE)
 */
function isGameOver(groundBlock) {
    let state = config.GAME;
    if (groundBlock) {
        for (let block of groundBlock) {
            if (block.y === 1) {
                state = config.LOSE;
                break;
            }
        }
    }
    return state;
}

/**
 * 檢查碰撞
 * @param {Array} blockBody - 當前方塊
 * @param {Array} groundBlock - 地面方塊
 * @returns {boolean} 是否發生碰撞
 */
function checkCollision(blockBody, groundBlock) {
    for (let block of blockBody) {
        // 允許 y=0（棋盤上方），但不能超出左右邊界和底部
        if (block.x < 1 || block.x > config.BOARD_SIZE_WIDTH ||
            block.y > config.BOARD_SIZE_HEIGHT) {
            return true;
        }
        // 只有在可見區域內才檢查與地面方塊的碰撞
        if (block.y >= 1) {
            for (let ground of groundBlock) {
                if (block.x === ground.x && block.y === ground.y) {
                    return true;
                }
            }
        }
    }
    return false;
}

/**
 * 方塊下移
 * @param {Object} player - 玩家對象
 * @returns {Object} 更新後的玩家對象
 */
function moveBlockDown(player) {
    const tmpBlockBody = player.itemBlockBody.map(block => ({
        x: block.x,
        y: block.y + 1
    }));

    if (checkCollision(tmpBlockBody, player.itemGroundBlock)) {
        const nextBlockData = getNextBlock(player);
        return {
            ...player,
            itemGroundBlock: [...player.itemGroundBlock, ...player.itemBlockBody],
            ...nextBlockData,
            actionTime: config.ACTION_INIT_TIME,
        };
    }

    return {
        ...player,
        itemBlockBody: tmpBlockBody,
        actionTime: config.ACTION_INIT_TIME,
    };
}

/**
 * 方塊左移
 * @param {Object} player - 玩家對象
 * @returns {Object} 更新後的玩家對象
 */
function moveBlockLeft(player) {
    const tmpBlockBody = player.itemBlockBody.map(block => ({
        x: block.x - 1,
        y: block.y
    }));

    if (!checkCollision(tmpBlockBody, player.itemGroundBlock)) {
        return { ...player, itemBlockBody: tmpBlockBody };
    }
    return player;
}

/**
 * 方塊右移
 * @param {Object} player - 玩家對象
 * @returns {Object} 更新後的玩家對象
 */
function moveBlockRight(player) {
    const tmpBlockBody = player.itemBlockBody.map(block => ({
        x: block.x + 1,
        y: block.y
    }));

    if (!checkCollision(tmpBlockBody, player.itemGroundBlock)) {
        return { ...player, itemBlockBody: tmpBlockBody };
    }
    return player;
}

/**
 * 方塊旋轉（支援 Wall Kick）
 * @param {Object} player - 玩家對象
 * @returns {Object} 更新後的玩家對象
 */
function rotateBlock(player) {
    if (!player.itemBlockBody || player.itemBlockBody.length === 0) {
        return player;
    }

    const center = player.itemBlockBody[0];
    const rotatedBlock = player.itemBlockBody.map(block => {
        const relativeX = block.x - center.x;
        const relativeY = block.y - center.y;
        return {
            x: center.x - relativeY,
            y: center.y + relativeX
        };
    });

    // Wall Kick 嘗試順序：原位 -> 右移 -> 左移 -> 上移 -> 右移+上移 -> 左移+上移
    const kickTests = [
        { dx: 0, dy: 0 },   // 原位
        { dx: 1, dy: 0 },   // 右移
        { dx: -1, dy: 0 },  // 左移
        { dx: 0, dy: -1 },  // 上移
        { dx: 1, dy: -1 },  // 右移+上移
        { dx: -1, dy: -1 }, // 左移+上移
        { dx: 2, dy: 0 },   // 右移2格（用於I方塊）
        { dx: -2, dy: 0 },  // 左移2格（用於I方塊）
    ];

    for (const kick of kickTests) {
        const testBlock = rotatedBlock.map(block => ({
            x: block.x + kick.dx,
            y: block.y + kick.dy
        }));

        if (!checkCollision(testBlock, player.itemGroundBlock)) {
            return { ...player, itemBlockBody: testBlock };
        }
    }

    // 所有 Wall Kick 都失敗，不旋轉
    return player;
}

/**
 * 暫存方塊 (Hold)
 * @param {Object} player - 玩家對象
 * @returns {Object} 更新後的玩家對象
 */
function holdBlock(player) {
    if (!player.canHold) {
        return player;
    }

    const originalShape = Object.values(gameState.DOMINO_SHAPES).find(shape => shape.type === player.itemBlockType);
    if (!originalShape) return player;

    const blockToHold = {
        type: player.itemBlockType,
        blocks: JSON.parse(JSON.stringify(originalShape.blocks))
    };

    if (player.holdBlock === null) {
        const nextBlockData = getNextBlock(player);
        return {
            ...player,
            ...nextBlockData,
            holdBlock: blockToHold,
            canHold: false
        };
    } else {
        const newCurrentBlock = player.holdBlock;
        // 確保從 hold 取出的方塊也從上方進入
        const minY = Math.min(...newCurrentBlock.blocks.map(b => b.y));
        const spawnBlocks = newCurrentBlock.blocks.map(block => ({
            ...block,
            y: block.y - minY
        }));

        return {
            ...player,
            itemBlockBody: spawnBlocks,
            itemBlockType: newCurrentBlock.type,
            holdBlock: blockToHold,
            canHold: false
        };
    }
}


/**
 * 消除完整的行並返回消除的行數
 * @param {Object} player - 玩家對象
 * @returns {Object} 包含更新後的 itemGroundBlock 和消除的行數
 */
function clearLines(player) {
    const tmpNumber = new Array(config.BOARD_SIZE_HEIGHT + 1).fill(0);
    const clearedLines = [];

    if (player.itemGroundBlock) {
        for (let block of player.itemGroundBlock) {
            tmpNumber[block.y]++;
        }
    }

    for (let i = 0; i < tmpNumber.length; i++) {
        if (tmpNumber[i] === config.BOARD_SIZE_WIDTH) {
            clearedLines.push(i);
        }
    }

    if (clearedLines.length === 0) {
        return { itemGroundBlock: player.itemGroundBlock, linesCleared: 0 };
    }

    let newBoard = player.itemGroundBlock.filter(block => !clearedLines.includes(block.y));

    for (let line of clearedLines) {
        newBoard = newBoard.map(block =>
            block.y < line ? { x: block.x, y: block.y + 1 } : block
        );
    }

    return {
        itemGroundBlock: newBoard,
        linesCleared: clearedLines.length,
        clearedLineNumbers: clearedLines
    };
}

/**
 * 方塊快速下落
 * @param {Object} player - 玩家對象
 * @returns {Object} 更新後的玩家對象
 */
function dropBlock(player) {
    let currentPlayer = { ...player };

    while (true) {
        const tmpBlockBody = currentPlayer.itemBlockBody.map(block => ({
            x: block.x,
            y: block.y + 1
        }));

        if (checkCollision(tmpBlockBody, currentPlayer.itemGroundBlock)) {
            const nextBlockData = getNextBlock(currentPlayer);
            return {
                ...currentPlayer,
                itemGroundBlock: [...currentPlayer.itemGroundBlock, ...currentPlayer.itemBlockBody],
                ...nextBlockData,
                actionTime: config.ACTION_INIT_TIME,
            };
        }

        currentPlayer = { ...currentPlayer, itemBlockBody: tmpBlockBody };
    }
}


/**
 * 插入方塊到地面
 * @param {Array} ground - 地面方塊陣列
 * @param {Array} block - 要插入的方塊
 * @returns {Array} 更新後的地面方塊陣列
 */
function insertBlockToGround(ground, block) {
    return [...ground, ...block];
}

/**
 * 生成垃圾行
 * @param {number} lineCount - 垃圾行數量
 * @param {number} startY - 開始的 Y 座標（底部）
 * @returns {Array} 垃圾方塊陣列
 */
function generateGarbageLines(lineCount, startY = config.BOARD_SIZE_HEIGHT) {
    const garbageBlocks = [];
    for (let line = 0; line < lineCount; line++) {
        const holePositions = [];
        for (let i = 0; i < config.GARBAGE_HOLE_COUNT; i++) {
            let hole = Math.floor(Math.random() * config.BOARD_SIZE_WIDTH) + 1;
            while (holePositions.includes(hole)) {
                hole = Math.floor(Math.random() * config.BOARD_SIZE_WIDTH) + 1;
            }
            holePositions.push(hole);
        }
        for (let x = 1; x <= config.BOARD_SIZE_WIDTH; x++) {
            if (!holePositions.includes(x)) {
                garbageBlocks.push({ x: x, y: startY - line });
            }
        }
    }
    return garbageBlocks;
}

/**
 * 添加垃圾行到玩家棋盤（從底部推上來）
 * @param {Array} groundBlock - 玩家的地面方塊
 * @param {number} garbageLineCount - 要添加的垃圾行數
 * @returns {Array} 更新後的地面方塊
 */
function addGarbageLines(groundBlock, garbageLineCount) {
    if (garbageLineCount <= 0) {
        return groundBlock;
    }
    const movedBlocks = groundBlock.map(block => ({
        x: block.x,
        y: block.y - garbageLineCount
    }));
    const garbageBlocks = generateGarbageLines(garbageLineCount);
    return [...movedBlocks, ...garbageBlocks];
}

/**
 * 計算攻擊力
 * @param {number} linesCleared - 消除的行數
 * @param {number} level - 玩家等級
 * @param {number} combo - 當前 Combo 數
 * @returns {number} 攻擊行數
 */
function calculateAttackPower(linesCleared, level, combo) {
    let baseAttack = Math.max(0, linesCleared - 1);
    const levelBonus = Math.floor(level / 3);
    let comboBonus = 0;
    if (combo >= 2) comboBonus = 1;
    if (combo >= 4) comboBonus = 2;
    if (combo >= 6) comboBonus = 3;
    if (combo >= 8) comboBonus = 4;
    return baseAttack + levelBonus + comboBonus;
}

/**
 * 更新 Combo
 * @param {Object} player - 玩家對象
 * @param {number} linesCleared - 消除的行數
 * @returns {number} 新的 Combo 數
 */
function updateCombo(player, linesCleared) {
    const now = Date.now();
    const lastClearTime = player.lastClearTime;
    if (lastClearTime && (now - lastClearTime) > config.COMBO_TIMEOUT) {
        return 1;
    }
    return (player.combo || 0) + 1;
}

/**
 * 檢測幸運事件
 * @returns {Object} { type: 事件類型, multiplier: 經驗倍數, name: 事件名稱 }
 */
function checkLuckyEvent() {
    const rand = Math.random();
    if (rand < config.LUCKY_EVENT_DIAMOND) {
        return { type: 'diamond', multiplier: 3.0, name: '💎 鑽石寶箱', color: '#00FFFF' };
    }
    if (rand < config.LUCKY_EVENT_STAR) {
        return { type: 'star', multiplier: 2.0, name: '⭐ 幸運星', color: '#FFD700' };
    }
    if (rand < config.LUCKY_EVENT_GIFT) {
        return { type: 'gift', multiplier: 1.5, name: '🎁 小驚喜', color: '#FF69B4' };
    }
    return null;
}

/**
 * 計算獲得的經驗值（帶隨機性）
 * @param {number} linesCleared - 消除的行數
 * @param {number} combo - Combo 數
 * @returns {Object} { exp: 經驗值, luckyEvent: 幸運事件 }
 */
function calculateExp(linesCleared, combo) {
    const baseExpMap = { 1: 100, 2: 200, 3: 300, 4: 400 };
    const baseExp = baseExpMap[linesCleared] || linesCleared * 100;
    const randomFactor = 0.5 + Math.random();
    let randomExp = Math.floor(baseExp * randomFactor);
    let comboMultiplier = 1.0;
    if (combo >= 2) comboMultiplier = 1.5;
    if (combo >= 4) comboMultiplier = 2.0;
    let finalExp = Math.floor(randomExp * comboMultiplier);
    const luckyEvent = checkLuckyEvent();
    if (luckyEvent) {
        finalExp = Math.floor(finalExp * luckyEvent.multiplier);
    }
    return { exp: finalExp, luckyEvent };
}

/**
 * 檢查並處理升級
 * @param {number} currentLevel - 當前等級
 * @param {number} currentExp - 當前經驗值
 * @returns {Object} { newLevel: 新等級, expToNextLevel: 升級所需經驗, leveledUp: 是否升級 }
 */
function checkLevelUp(currentLevel, currentExp) {
    let newLevel = currentLevel;
    let leveledUp = false;
    while (newLevel < config.EXP_LEVEL_THRESHOLDS.length && currentExp >= config.EXP_LEVEL_THRESHOLDS[newLevel]) {
        newLevel++;
        leveledUp = true;
    }
    const expToNextLevel = newLevel < config.EXP_LEVEL_THRESHOLDS.length ? config.EXP_LEVEL_THRESHOLDS[newLevel] : 999999;
    return { newLevel, expToNextLevel, leveledUp };
}

/**
 * 主遊戲循環處理單個玩家
 * @param {Object} player - 玩家對象
 * @returns {Object} 更新後的玩家對象
 */
function processPlayerTick(player) {
    if (player.state === config.LOSE || player.state === config.ELIMINATED) {
        return player;
    }

    if (player.actionTime > 0) {
        return { ...player, actionTime: player.actionTime - 1 };
    }

    const movedPlayer = moveBlockDown(player);
    const { itemGroundBlock, linesCleared, clearedLineNumbers } = clearLines(movedPlayer);

    if (linesCleared === 0) {
        return movedPlayer;
    }

    const newCombo = updateCombo(player, linesCleared);
    const now = Date.now();
    const { exp: gainedExp, luckyEvent } = calculateExp(linesCleared, newCombo);
    const newTotalExp = (movedPlayer.exp || 0) + gainedExp;
    const { newLevel, expToNextLevel, leveledUp } = checkLevelUp(movedPlayer.level, newTotalExp);
    const baseScore = linesCleared * 100;
    const comboBonus = newCombo > 1 ? (newCombo - 1) * 50 : 0;
    const newScore = (movedPlayer.score || 0) + baseScore + comboBonus;
    const attackPower = calculateAttackPower(linesCleared, newLevel, newCombo);

    return {
        ...movedPlayer,
        itemGroundBlock,
        level: newLevel,
        score: newScore,
        exp: newTotalExp,
        expToNextLevel,
        combo: newCombo,
        lastClearTime: now,
        clearedLineNumbers,
        attackPower,
        linesCleared,
        gainedExp,
        luckyEvent,
        leveledUp
    };
}

module.exports = {
    getInitialGroundBlocks,
    isGameOver,
    checkCollision,
    moveBlockDown,
    moveBlockLeft,
    moveBlockRight,
    rotateBlock,
    holdBlock,
    clearLines,
    dropBlock,
    insertBlockToGround,
    generateGarbageLines,
    addGarbageLines,
    calculateAttackPower,
    updateCombo,
    calculateExp,
    checkLevelUp,
    checkLuckyEvent,
    processPlayerTick,
};
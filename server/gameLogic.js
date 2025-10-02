/**
 * 遊戲邏輯模組
 * 負責所有遊戲核心邏輯：方塊移動、旋轉、碰撞檢測、消行等
 */

const config = require('./config');
const gameState = require('./gameState');

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
        // 檢查邊界
        if (block.x < 1 || block.x > config.BOARD_SIZE_WIDTH || block.y > config.BOARD_SIZE_HEIGHT) {
            return true;
        }
        // 檢查與地面方塊的碰撞
        for (let ground of groundBlock) {
            if (block.x === ground.x && block.y === ground.y) {
                return true;
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

    // 檢查是否碰撞
    if (checkCollision(tmpBlockBody, player.itemGroundBlock)) {
        // 碰撞了,需要固定方塊並生成新方塊
        return {
            ...player,
            itemGroundBlock: [...player.itemGroundBlock, ...player.itemBlockBody],
            itemBlockBody: player.itemPreBody,
            itemPreBody: gameState.getRandomDomino(),
            actionTime: config.ACTION_INIT_TIME,
        };
    }

    // 沒碰撞,繼續下移
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
        return {
            ...player,
            itemBlockBody: tmpBlockBody
        };
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
        return {
            ...player,
            itemBlockBody: tmpBlockBody
        };
    }
    return player;
}

/**
 * 方塊旋轉
 * @param {Object} player - 玩家對象
 * @returns {Object} 更新後的玩家對象
 */
function rotateBlock(player) {
    if (!player.itemBlockBody || player.itemBlockBody.length === 0) {
        return player;
    }

    // 計算旋轉中心點（第一個方塊）
    const center = player.itemBlockBody[0];

    // 旋轉其他方塊
    const rotatedBlock = player.itemBlockBody.map(block => {
        const relativeX = block.x - center.x;
        const relativeY = block.y - center.y;
        return {
            x: center.x - relativeY,
            y: center.y + relativeX
        };
    });

    // 檢查旋轉後是否碰撞
    if (!checkCollision(rotatedBlock, player.itemGroundBlock)) {
        return {
            ...player,
            itemBlockBody: rotatedBlock
        };
    }
    return player;
}

/**
 * 消除完整的行並返回消除的行數
 * @param {Object} player - 玩家對象
 * @returns {Object} 包含更新後的 itemGroundBlock 和消除的行數
 */
function clearLines(player) {
    const tmpNumber = new Array(config.BOARD_SIZE_HEIGHT + 1).fill(0);
    const clearedLines = [];

    // 計算每一行有多少個方塊
    if (player.itemGroundBlock) {
        for (let block of player.itemGroundBlock) {
            tmpNumber[block.y]++;
        }
    }

    // 找出完整的行
    for (let i = 0; i < tmpNumber.length; i++) {
        if (tmpNumber[i] === config.BOARD_SIZE_WIDTH) {
            clearedLines.push(i);
        }
    }

    if (clearedLines.length === 0) {
        return { itemGroundBlock: player.itemGroundBlock, linesCleared: 0 };
    }

    // 移除完整的行
    let newBoard = player.itemGroundBlock.filter(block => !clearedLines.includes(block.y));

    // 下移上方的方塊
    for (let line of clearedLines) {
        newBoard = newBoard.map(block =>
            block.y < line ? { x: block.x, y: block.y + 1 } : block
        );
    }

    return {
        itemGroundBlock: newBoard,
        linesCleared: clearedLines.length
    };
}

/**
 * 方塊快速下落
 * @param {Object} player - 玩家對象
 * @returns {Object} 更新後的玩家對象
 */
function dropBlock(player) {
    let currentPlayer = player;

    // 持續下移直到碰撞
    while (true) {
        const tmpBlockBody = currentPlayer.itemBlockBody.map(block => ({
            x: block.x,
            y: block.y + 1
        }));

        if (checkCollision(tmpBlockBody, currentPlayer.itemGroundBlock)) {
            // 固定方塊並生成新方塊
            return {
                ...currentPlayer,
                itemGroundBlock: [...currentPlayer.itemGroundBlock, ...currentPlayer.itemBlockBody],
                itemBlockBody: currentPlayer.itemPreBody,
                itemPreBody: gameState.getRandomDomino(),
                actionTime: config.ACTION_INIT_TIME,
            };
        }

        currentPlayer = {
            ...currentPlayer,
            itemBlockBody: tmpBlockBody
        };
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
 * 主遊戲循環處理單個玩家
 * @param {Object} player - 玩家對象
 * @returns {Object} 更新後的玩家對象
 */
function processPlayerTick(player) {
    // 如果玩家已經失敗或被淘汰,不處理
    if (player.state === config.LOSE || player.state === config.ELIMINATED) {
        return player;
    }

    // 減少動作時間
    if (player.actionTime > 0) {
        return {
            ...player,
            actionTime: player.actionTime - 1
        };
    }

    // 時間到了 (actionTime === 0),嘗試方塊自動下移
    const result = moveBlockDown(player);

    // moveBlockDown 已經處理了碰撞和新方塊生成
    // 所以直接返回結果即可
    return result;
}

module.exports = {
    getInitialGroundBlocks,
    isGameOver,
    checkCollision,
    moveBlockDown,
    moveBlockLeft,
    moveBlockRight,
    rotateBlock,
    clearLines,
    dropBlock,
    insertBlockToGround,
    processPlayerTick,
};

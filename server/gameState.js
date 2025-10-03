/**
 * 遊戲狀態管理模組
 * 負責管理玩家列表、遊戲狀態和方塊形狀定義
 */

const config = require('./config');

// 玩家列表
let users = [];

// 遊戲狀態
let GAME_STATE = config.READY;

// 方塊形狀定義（帶類型編號）
const DOMINO_SHAPES = {
    I: {  // 直線形 -.--
        type: 0,
        blocks: [
            { x: 4, y: 1 },
            { x: 6, y: 1 },
            { x: 5, y: 1 },
            { x: 7, y: 1 },
        ]
    },
    O: {  // 正方形
        type: 1,
        blocks: [
            { x: 5, y: 1 },
            { x: 6, y: 1 },
            { x: 5, y: 2 },
            { x: 6, y: 2 },
        ]
    },
    T: {  // T 字形
        type: 2,
        blocks: [
            { x: 5, y: 1 },
            { x: 7, y: 1 },
            { x: 6, y: 1 },
            { x: 6, y: 2 },
        ]
    },
    L: {  // L 字形
        type: 3,
        blocks: [
            { x: 5, y: 1 },
            { x: 7, y: 1 },
            { x: 6, y: 1 },
            { x: 7, y: 2 },
        ]
    },
    J: {  // 反 L 字形
        type: 4,
        blocks: [
            { x: 5, y: 2 },
            { x: 7, y: 2 },
            { x: 6, y: 2 },
            { x: 5, y: 1 },
        ]
    },
    S: {  // S 字形
        type: 5,
        blocks: [
            { x: 6, y: 1 },
            { x: 7, y: 1 },
            { x: 6, y: 2 },
            { x: 5, y: 2 },
        ]
    },
    Z: {  // Z 字形
        type: 6,
        blocks: [
            { x: 5, y: 1 },
            { x: 6, y: 1 },
            { x: 6, y: 2 },
            { x: 7, y: 2 },
        ]
    },
};

// 將形狀轉換為陣列以供隨機選擇
const DOMINOS = Object.values(DOMINO_SHAPES);

/**
 * 獲取隨機方塊形狀
 * @returns {Object} 包含 blocks 和 type 的對象
 */
function getRandomDomino() {
    const randomIndex = Math.floor(Math.random() * DOMINOS.length);
    const selectedDomino = DOMINOS[randomIndex];
    return {
        blocks: JSON.parse(JSON.stringify(selectedDomino.blocks)),
        type: selectedDomino.type
    };
}

/**
 * 添加新玩家
 * @param {string} socketID - Socket ID
 * @param {string} userName - 玩家名稱
 * @param {string} who - 玩家標識
 * @param {string} playerType - 玩家類型 (CHALLENGER/SPECTATOR)
 */
function addUser(socketID, userName, who, playerType = config.PLAYER_TYPE_CHALLENGER) {
    // 產生初始方塊佇列 (1個當前 + 4個預覽)
    const initialPieces = [];
    for (let i = 0; i < 5; i++) {
        initialPieces.push(getRandomDomino());
    }

    const firstDomino = initialPieces.shift();
    const secondDomino = initialPieces[0]; // The next block

    const newUser = {
        socketID,
        userName,
        who,
        playerType,
        state: playerType === config.PLAYER_TYPE_SPECTATOR ? config.SPECTATOR : config.READY,
        level: 0,
        score: 0,
        exp: 0,
        expToNextLevel: config.EXP_LEVEL_THRESHOLDS[0] || 500,

        // Current block
        itemBlockBody: firstDomino.blocks,
        itemBlockType: firstDomino.type,

        // Kept for potential compatibility, but nextBlocks is primary
        itemPreBody: secondDomino.blocks,
        itemPreType: secondDomino.type,

        itemGroundBlock: [],
        itemLastBlock: [],
        itemIsNeccessaryBlock: false,

        actionTime: config.ACTION_INIT_TIME,
        sendTime: 1,

        combo: 0,
        lastClearTime: null,
        pendingGarbageLines: 0,

        // New properties for Hold and multi-Next
        holdBlock: null,      // { type, blocks }
        canHold: true,        // Flag to allow holding once per drop
        nextBlocks: initialPieces, // Array of upcoming blocks { type, blocks }
    };
    users.push(newUser);
    return newUser;
}


/**
 * 移除玩家
 */
function removeUser(socketID) {
    users = users.filter(user => user.socketID !== socketID);
}

/**
 * 更新單個玩家
 */
function updateUser(socketID, updatedData) {
    const index = users.findIndex(user => user.socketID === socketID);
    if (index !== -1) {
        users[index] = { ...users[index], ...updatedData };
    }
}

/**
 * 批量更新所有玩家
 */
function updateAllUsers(updatedUsers) {
    updatedUsers.forEach(updatedUser => {
        const index = users.findIndex(u => u.socketID === updatedUser.socketID);
        if (index !== -1) {
            users[index] = updatedUser;
        }
    });
}

/**
 * 根據 socketID 查找玩家
 */
function findUser(socketID) {
    return users.find(user => user.socketID === socketID);
}

/**
 * 獲取所有玩家
 */
function getAllUsers() {
    return users;
}

/**
 * 獲取所有挑戰者（非觀戰者）
 */
function getChallengers() {
    return users.filter(u => u.playerType === config.PLAYER_TYPE_CHALLENGER);
}

/**
 * 獲取所有觀戰者
 */
function getSpectators() {
    return users.filter(u => u.playerType === config.PLAYER_TYPE_SPECTATOR);
}

/**
 * 將觀戰者轉換為挑戰者
 */
function convertToChallenger(socketID) {
    const user = users.find(u => u.socketID === socketID);
    if (user && user.playerType === config.PLAYER_TYPE_SPECTATOR) {
        user.playerType = config.PLAYER_TYPE_CHALLENGER;
        resetAllPlayers([user]); // Reset just this user
        return true;
    }
    return false;
}

/**
 * 獲取當前遊戲狀態
 */
function getGameState() {
    return GAME_STATE;
}

/**
 * 設置遊戲狀態
 */
function setGameState(state) {
    GAME_STATE = state;
}

/**
 * 重置指定或所有玩家的狀態
 * @param {Array} playersToReset - (Optional) An array of user objects to reset. If not provided, all users are reset.
 */
function resetAllPlayers(playersToReset = users) {
    playersToReset.forEach(user => {
        // Don't reset spectators unless they are being converted
        if (user.playerType === config.PLAYER_TYPE_SPECTATOR && user.state === config.SPECTATOR) {
            return;
        }

        const initialPieces = [];
        for (let i = 0; i < 5; i++) {
            initialPieces.push(getRandomDomino());
        }
        const firstDomino = initialPieces.shift();
        const secondDomino = initialPieces[0];

        user.state = config.READY;
        user.level = 0;
        user.score = 0;
        user.exp = 0;
        user.expToNextLevel = config.EXP_LEVEL_THRESHOLDS[0] || 500;
        user.itemBlockBody = firstDomino.blocks;
        user.itemBlockType = firstDomino.type;
        user.itemPreBody = secondDomino.blocks;
        user.itemPreType = secondDomino.type;
        user.itemGroundBlock = [];
        user.itemLastBlock = [];
        user.itemIsNeccessaryBlock = false;
        user.actionTime = config.ACTION_INIT_TIME;
        user.sendTime = 1;
        user.combo = 0;
        user.lastClearTime = null;
        user.pendingGarbageLines = 0;

        // Reset hold and next queue
        user.holdBlock = null;
        user.canHold = true;
        user.nextBlocks = initialPieces;
    });
}


module.exports = {
    addUser,
    removeUser,
    updateUser,
    updateAllUsers,
    findUser,
    getAllUsers,
    getChallengers,
    getSpectators,
    convertToChallenger,
    getGameState,
    setGameState,
    getRandomDomino,
    resetAllPlayers,
    DOMINOS,
    DOMINO_SHAPES,
};
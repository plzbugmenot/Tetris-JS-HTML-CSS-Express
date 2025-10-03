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
            { x: 5, y: 2 },
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
            { x: 6, y: 1 },
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
    const firstDomino = getRandomDomino();
    const secondDomino = getRandomDomino();

    const newUser = {
        socketID,
        userName,
        who,
        playerType,                              // 玩家類型（挑戰者/觀戰者）
        state: playerType === config.PLAYER_TYPE_SPECTATOR ? config.SPECTATOR : config.READY,
        level: 0,
        score: 0,
        exp: 0,                                  // 當前經驗值
        expToNextLevel: config.EXP_LEVEL_THRESHOLDS[0] || 500, // 升級所需經驗

        // 使用原始屬性名稱以匹配前端
        itemBlockBody: firstDomino.blocks,       // 當前方塊
        itemBlockType: firstDomino.type,         // 當前方塊類型
        itemPreBody: secondDomino.blocks,        // 下一個方塊
        itemPreType: secondDomino.type,          // 下一個方塊類型
        itemGroundBlock: [],                     // 已放置的方塊
        itemLastBlock: [],                       // 最後消除的方塊

        itemIsNeccessaryBlock: false,            // 是否需要生成新方塊

        actionTime: config.ACTION_INIT_TIME,
        sendTime: 1,

        // Combo 和攻擊系統
        combo: 0,                                // 當前 Combo 數
        lastClearTime: null,                     // 上次消行時間
        pendingGarbageLines: 0,                  // 待接收的垃圾行數
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
        user.state = config.READY;

        // 重新初始化遊戲數據
        const firstDomino = getRandomDomino();
        const secondDomino = getRandomDomino();
        user.itemBlockBody = firstDomino.blocks;
        user.itemBlockType = firstDomino.type;
        user.itemPreBody = secondDomino.blocks;
        user.itemPreType = secondDomino.type;
        user.itemGroundBlock = [];
        user.level = 0;
        user.score = 0;

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
 * 重置所有玩家狀態
 */
function resetAllPlayers() {
    users.forEach(user => {
        const firstDomino = getRandomDomino();
        const secondDomino = getRandomDomino();

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

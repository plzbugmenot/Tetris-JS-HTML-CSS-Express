/**
 * 遊戲狀態管理模組
 * 負責管理玩家列表、遊戲狀態和方塊形狀定義
 */

const config = require('./config');

// 玩家列表
let users = [];

// 遊戲狀態
let GAME_STATE = config.READY;

// 方塊形狀定義
const DOMINO_SHAPES = {
    I: [  // 直線形 -.--
        { x: 4, y: 1 },
        { x: 6, y: 1 },
        { x: 5, y: 1 },
        { x: 7, y: 1 },
    ],
    O: [  // 正方形
        { x: 5, y: 1 },
        { x: 6, y: 1 },
        { x: 5, y: 2 },
        { x: 6, y: 2 },
    ],
    T: [  // T 字形
        { x: 5, y: 1 },
        { x: 7, y: 1 },
        { x: 6, y: 1 },
        { x: 5, y: 2 },
    ],
    L: [  // L 字形
        { x: 5, y: 1 },
        { x: 7, y: 1 },
        { x: 6, y: 1 },
        { x: 7, y: 2 },
    ],
    J: [  // 反 L 字形
        { x: 5, y: 2 },
        { x: 7, y: 2 },
        { x: 6, y: 2 },
        { x: 6, y: 1 },
    ],
    S: [  // S 字形
        { x: 6, y: 1 },
        { x: 7, y: 1 },
        { x: 6, y: 2 },
        { x: 5, y: 2 },
    ],
    Z: [  // Z 字形
        { x: 5, y: 1 },
        { x: 6, y: 1 },
        { x: 6, y: 2 },
        { x: 7, y: 2 },
    ],
};

// 將形狀轉換為陣列以供隨機選擇
const DOMINOS = Object.values(DOMINO_SHAPES);

/**
 * 獲取隨機方塊形狀
 */
function getRandomDomino() {
    const randomIndex = Math.floor(Math.random() * DOMINOS.length);
    return JSON.parse(JSON.stringify(DOMINOS[randomIndex]));
}

/**
 * 添加新玩家
 */
function addUser(socketID, userName, who) {
    const firstDomino = getRandomDomino();
    const secondDomino = getRandomDomino();

    const newUser = {
        socketID,
        userName,
        who,
        state: config.READY,
        level: 0,
        score: 0,

        // 使用原始屬性名稱以匹配前端
        itemBlockBody: firstDomino,       // 當前方塊
        itemBlockType: 0,                 // 當前方塊類型 (需要根據形狀設置)
        itemPreBody: secondDomino,        // 下一個方塊
        itemPreType: 0,                   // 下一個方塊類型
        itemGroundBlock: [],              // 已放置的方塊
        itemLastBlock: [],                // 最後消除的方塊

        itemIsNeccessaryBlock: false,     // 是否需要生成新方塊

        actionTime: config.ACTION_INIT_TIME,
        sendTime: 1,
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
        user.itemBlockBody = firstDomino;
        user.itemBlockType = 0;
        user.itemPreBody = secondDomino;
        user.itemPreType = 0;
        user.itemGroundBlock = [];
        user.itemLastBlock = [];
        user.itemIsNeccessaryBlock = false;
        user.actionTime = config.ACTION_INIT_TIME;
        user.sendTime = 1;
    });
}

module.exports = {
    addUser,
    removeUser,
    updateUser,
    updateAllUsers,
    findUser,
    getAllUsers,
    getGameState,
    setGameState,
    getRandomDomino,
    resetAllPlayers,
    DOMINOS,
    DOMINO_SHAPES,
};

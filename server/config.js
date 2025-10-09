/**
 * 伺服器配置模組
 * 集中管理所有環境變數和配置常數
 */

module.exports = {
    // 伺服器配置（整合服務器）
    PORT: process.env.REACT_APP_SERVER_PORT || 3500,
    HOST: process.env.REACT_APP_SERVER_HOST || "localhost",

    // 遊戲常數
    BOARD_SIZE_HEIGHT: 21,
    BOARD_SIZE_WIDTH: 10,
    FRAME: 20, // 每 20ms 渲染一次 (遊戲主循環頻率)
    ACTION_INIT_TIME: 15, // 方塊自動下落的初始時間 (數值越小下落越快)
    LOCK_DELAY: 10, // 鎖定延遲時間 (10 * 20ms = 200ms)
    MAX_PLAYERS: 999, // 顯示用的最大玩家數參考值 (實際已移除人數限制)
    TIME_PER_SECOND: 50,

    // 攻擊系統配置
    COMBO_TIMEOUT: 3000, // Combo 超時時間（3秒內沒消行則重置）
    GARBAGE_HOLE_COUNT: 1, // 垃圾行的缺口數量

    // 經驗值和升級系統
    EXP_LEVEL_THRESHOLDS: [500, 800, 1200, 1700, 2300, 3000, 3800, 4700, 5700, 7000], // 各等級所需經驗

    // 幸運事件機率
    LUCKY_EVENT_DIAMOND: 0.01,   // 💎 鑽石寶箱 (1%)
    LUCKY_EVENT_STAR: 0.05,      // ⭐ 幸運星 (5%)
    LUCKY_EVENT_GIFT: 0.10,      // 🎁 小驚喜 (10%)

    // 方向常數
    DOWN: "DOWN",
    LEFT: "LEFT",
    RIGHT: "RIGHT",

    // 隊伍常數
    TEAM1: "TEAM1",
    TEAM2: "TEAM2",

    // 遊戲狀態常數
    READY: "READY",
    GAME: "GAME",
    WIN: "WIN",
    LOSE: "LOSE",
    ELIMINATED: "ELIMINATED",
    SPECTATOR: "SPECTATOR",  // 觀戰者狀態

    // 玩家類型
    PLAYER_TYPE_CHALLENGER: "CHALLENGER",  // 挑戰者
    PLAYER_TYPE_SPECTATOR: "SPECTATOR",    // 觀戰者
};

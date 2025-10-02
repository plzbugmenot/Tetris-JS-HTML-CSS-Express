/**
 * 伺服器配置模組
 * 集中管理所有環境變數和配置常數
 */

module.exports = {
    // 伺服器配置
    PORT: process.env.REACT_APP_SERVER_PORT || 8800,
    F_PORT: process.env.REACT_APP_CLIENT_PORT || 3500,
    HOST: process.env.REACT_APP_SERVER_HOST || "localhost",

    // 客戶端連接地址
    get CLIENT_HOST() {
        const host = this.HOST;
        return process.env.REACT_APP_CLIENT_CONNECT_HOST || (host === "0.0.0.0" ? "localhost" : host);
    },

    // 遊戲常數
    BOARD_SIZE_HEIGHT: 21,
    BOARD_SIZE_WIDTH: 10,
    FRAME: 20, // 每 20ms 渲染一次 (遊戲主循環頻率)
    ACTION_INIT_TIME: 15, // 方塊自動下落的初始時間 (數值越小下落越快)
    MAX_PLAYERS: 4, // 最大玩家數 (建議 2-8 人)
    TIME_PER_SECOND: 50,

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
};
